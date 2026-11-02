<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onErrorCaptured, onMounted, ref, watch } from "vue";
import { todayIso, type Content } from "../domain/content";
import { START, parseHash, resolveRoute, sameRoute, toHash, type Route, type Screen } from "../domain/navigation";
import {
  buildPlan,
  entitiesOfKind,
  needsBank,
  needsDetails,
  needsOperator,
  type AssetId,
  type Details,
  type Selection,
  type StepId,
} from "../domain/plan";
import { isPlanComplete, markDone, markPending, progressLabel } from "../domain/progress";
import { emptyReport, type ReportDraft } from "../domain/report";
import { clearPlan, loadPlan, savePlan } from "../domain/storage";
import DataNotice from "./DataNotice.vue";
import ErrorState from "./ErrorState.vue";
import OfflineBanner from "./OfflineBanner.vue";
import DeleteScreen from "./screens/DeleteScreen.vue";
import ReportScreen from "./screens/ReportScreen.vue";
import DetailsScreen from "./screens/DetailsScreen.vue";
import DoneScreen from "./screens/DoneScreen.vue";
import EmergencyScreen from "./screens/EmergencyScreen.vue";
import PlanScreen from "./screens/PlanScreen.vue";
import SelectorScreen from "./screens/SelectorScreen.vue";
import StartScreen from "./screens/StartScreen.vue";
import StepScreen from "./screens/StepScreen.vue";
import UiButton from "./UiButton.vue";

const props = defineProps<{ content: Content; buildDate: string }>();

const SCREEN_TITLES: Record<Screen, string> = {
  inicio: "Inicio",
  emergencia: "Bloquea tu línea",
  selector: "Qué se llevaron",
  detalles: "Detalles",
  plan: "Tu plan",
  paso: "Paso del plan",
  denuncia: "Prepara tu denuncia",
  borrar: "Borrar mis datos",
  completo: "Plan completo",
};

// The server renders with the build date; the browser switches to the real date after hydration.
const today = ref(props.buildDate);
const ready = ref(false);
const route = ref<Route>(START);
const selection = ref<Selection | null>(null);
const details = ref<Details>({});
const done = ref<StepId[]>([]);
const report = ref<ReportDraft>(emptyReport());
/** Whether the last write to localStorage worked. */
const saved = ref(false);
const flash = ref("");
const online = ref(true);
/** Flow G: a screen failed to render. Show the basic steps and a retry instead of a blank page. */
const failed = ref(false);
const announcement = ref("");
const root = ref<HTMLElement | null>(null);

const steps = computed(() => (selection.value ? buildPlan(selection.value, details.value, props.content, today.value) : []));
const stepIds = computed(() => steps.value.map((step) => step.id));
const activeStep = computed(() => steps.value.find((step) => step.id === route.value.stepId));
const emergencyStep = computed(() =>
  details.value.operatorId
    ? buildPlan({ assets: ["phone"], unknown: false }, { operatorId: details.value.operatorId }, props.content, today.value)[0]
    : undefined,
);
const lineBlocked = computed(() => done.value.includes("phone") && (selection.value?.assets.includes("phone") ?? false));
/** Flow E: a plan saved on this device can be continued from the start screen. */
const savedProgress = computed(() =>
  saved.value && selection.value ? progressLabel(steps.value, done.value) : undefined,
);
const pendingOptional = computed(() => steps.value.filter((step) => step.optional && !done.value.includes(step.id)));

function resolve(target: Route): Route {
  return resolveRoute(target, selection.value !== null, stepIds.value);
}

/** Focuses the first element matching one of the selectors, in order of preference. */
async function focusAfterRender(...selectors: string[]): Promise<void> {
  await nextTick();
  const target = selectors.map((selector) => root.value?.querySelector<HTMLElement>(selector)).find(Boolean);
  if (!target) return;
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: "start" });
}

function show(target: Route, moveFocus: boolean): void {
  if (target.screen !== "inicio") flash.value = "";
  route.value = target;
  announcement.value = SCREEN_TITLES[target.screen];
  if (moveFocus) void focusAfterRender("[data-screen-heading]");
}

function navigate(target: Route, { replace = false } = {}): void {
  const resolved = resolve(target);
  const hash = toHash(resolved);
  if (window.location.hash !== hash) {
    if (replace) window.history.replaceState(null, "", hash);
    else window.history.pushState(null, "", hash);
  }
  show(resolved, true);
}

function syncFromLocation(moveFocus: boolean): void {
  const requested = parseHash(window.location.hash);
  const resolved = resolve(requested);
  if (!sameRoute(requested, resolved) || window.location.hash === "") {
    window.history.replaceState(null, "", toHash(resolved));
  }
  if (!sameRoute(route.value, resolved)) show(resolved, moveFocus);
}

function updateOnline(): void {
  online.value = navigator.onLine;
}

function retry(): void {
  window.location.reload();
}

onErrorCaptured(() => {
  failed.value = true;
  return false;
});

function onPopState(): void {
  syncFromLocation(true);
}

function persist(): void {
  if (!selection.value) return;
  saved.value = savePlan({
    version: 1,
    selection: selection.value,
    details: details.value,
    done: done.value,
    report: report.value,
  });
}

function restore(): void {
  const plan = loadPlan();
  if (!plan) return;
  selection.value = plan.selection;
  details.value = plan.details;
  done.value = plan.done;
  report.value = plan.report ?? emptyReport();
  saved.value = true;
}

/** Flow F: forget everything on this device and start clean. */
function deleteData(): void {
  clearPlan();
  selection.value = null;
  details.value = {};
  done.value = [];
  report.value = emptyReport();
  saved.value = false;
  navigate(START, { replace: true });
  flash.value = "Borramos tus datos de este dispositivo.";
  announcement.value = flash.value;
}

function cancelDelete(): void {
  navigate({ screen: selection.value ? "plan" : "inicio" });
}

function finishReport(): void {
  completeStep("report", "paso");
}

function chooseAssets(assets: AssetId[]): void {
  selection.value = { assets, unknown: false };
  navigate({ screen: needsDetails(selection.value) ? "detalles" : "plan" });
}

function chooseEmergencyOperator(operatorId: string): void {
  details.value = { ...details.value, operatorId };
  announcement.value = "Mostramos cómo bloquear tu línea.";
}

/** Flow B: the line is blocked, so the phone step is done and the main flow continues. */
function confirmLineBlocked(): void {
  const assets = selection.value?.assets ?? [];
  selection.value = { assets: assets.includes("phone") ? assets : ["phone", ...assets], unknown: false };
  done.value = markDone(done.value, "phone");
  navigate({ screen: "selector" });
}

function chooseUnknown(): void {
  selection.value = { assets: [], unknown: true };
  navigate({ screen: "plan" });
}

function saveDetails(value: Details): void {
  details.value = value;
  navigate({ screen: "plan" });
}

function completeStep(id: StepId, from: "plan" | "paso"): void {
  const wasComplete = isPlanComplete(steps.value, done.value);
  done.value = markDone(done.value, id);
  if (!wasComplete && isPlanComplete(steps.value, done.value)) {
    navigate({ screen: "completo" });
    return;
  }
  if (from === "paso") {
    navigate({ screen: "plan" });
    return;
  }
  announcement.value = `Paso hecho. ${progressLabel(steps.value, done.value)}.`;
  void focusAfterRender(".item--current .item__title", "[data-screen-heading]");
}

function reopenStep(id: StepId): void {
  done.value = markPending(done.value, id);
}

watch([selection, details, done, report], persist, { deep: true });

onMounted(() => {
  today.value = todayIso();
  restore();
  window.addEventListener("popstate", onPopState);
  window.addEventListener("online", updateOnline);
  window.addEventListener("offline", updateOnline);
  updateOnline();
  syncFromLocation(false);
  ready.value = true;
});

onBeforeUnmount(() => {
  window.removeEventListener("popstate", onPopState);
  window.removeEventListener("online", updateOnline);
  window.removeEventListener("offline", updateOnline);
});
</script>

<template>
  <div ref="root" class="app" :data-ready="ready ? 'true' : undefined">
    <p class="sr-only" aria-live="polite" aria-atomic="true">{{ announcement }}</p>

    <OfflineBanner v-if="!online" />

    <ErrorState v-if="failed" :guide="content.guides.find((guide) => guide.id === 'general')" @retry="retry" />

    <StartScreen
      v-else-if="route.screen === 'inicio'"
      :saved-progress="savedProgress"
      :flash="flash"
      @start="navigate({ screen: 'selector' })"
      @emergency="navigate({ screen: 'emergencia' })"
      @resume="navigate({ screen: 'plan' })"
      @start-over="navigate({ screen: 'borrar' })"
    />

    <EmergencyScreen
      v-else-if="route.screen === 'emergencia'"
      :operators="entitiesOfKind(content, 'operador')"
      :operator-id="details.operatorId"
      :step="emergencyStep"
      :today="today"
      @choose-operator="chooseEmergencyOperator"
      @blocked="confirmLineBlocked"
      @back="navigate({ screen: 'inicio' })"
    />

    <SelectorScreen
      v-else-if="route.screen === 'selector'"
      :initial="selection?.assets ?? []"
      :lead="lineBlocked ? 'Ya bloqueaste tu línea. ¿Se llevaron algo más? Marca todo lo que te falte.' : undefined"
      @submit="chooseAssets"
      @unknown="chooseUnknown"
    />

    <DetailsScreen
      v-else-if="route.screen === 'detalles' && selection"
      :initial="details"
      :operators="entitiesOfKind(content, 'operador')"
      :banks="entitiesOfKind(content, 'banco')"
      :ask-operator="needsOperator(selection)"
      :ask-bank="needsBank(selection)"
      :today="today"
      @submit="saveDetails"
      @back="navigate({ screen: 'selector' })"
    />

    <PlanScreen
      v-else-if="route.screen === 'plan'"
      :steps="steps"
      :done="done"
      :today="today"
      :general="selection?.unknown ?? false"
      @open="navigate({ screen: 'paso', stepId: $event })"
      @mark-done="completeStep($event, 'plan')"
      @change-selection="navigate({ screen: 'selector' })"
      @report="navigate({ screen: 'denuncia' })"
    >
      <DataNotice :saved="saved" @delete="navigate({ screen: 'borrar' })" />
    </PlanScreen>

    <StepScreen
      v-else-if="route.screen === 'paso' && activeStep"
      :step="activeStep"
      :done="done.includes(activeStep.id)"
      :today="today"
      @mark-done="completeStep(activeStep.id, 'paso')"
      @mark-pending="reopenStep(activeStep.id)"
      @back="navigate({ screen: 'plan' })"
    >
      <UiButton v-if="activeStep.id === 'report'" arrow @click="navigate({ screen: 'denuncia' })">
        Preparar el resumen
      </UiButton>
    </StepScreen>

    <ReportScreen
      v-else-if="route.screen === 'denuncia' && selection"
      :draft="report"
      :assets="selection.assets"
      @update="report = $event"
      @finish="finishReport"
      @back="navigate({ screen: 'plan' })"
    />

    <DeleteScreen v-else-if="route.screen === 'borrar'" @confirm="deleteData" @cancel="cancelDelete" />

    <DoneScreen
      v-else-if="route.screen === 'completo'"
      :pending-optional="pendingOptional"
      @open="navigate({ screen: 'paso', stepId: $event })"
      @back="navigate({ screen: 'plan' })"
    >
      <DataNotice :saved="saved" @delete="navigate({ screen: 'borrar' })" />
    </DoneScreen>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex: 1;
  flex-direction: column;
}
</style>
