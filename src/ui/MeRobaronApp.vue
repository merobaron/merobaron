<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
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
import DetailsScreen from "./screens/DetailsScreen.vue";
import DoneScreen from "./screens/DoneScreen.vue";
import EmergencyScreen from "./screens/EmergencyScreen.vue";
import PlanScreen from "./screens/PlanScreen.vue";
import SelectorScreen from "./screens/SelectorScreen.vue";
import StartScreen from "./screens/StartScreen.vue";
import StepScreen from "./screens/StepScreen.vue";

const props = defineProps<{ content: Content; buildDate: string }>();

const SCREEN_TITLES: Record<Screen, string> = {
  inicio: "Inicio",
  emergencia: "Bloquea tu línea",
  selector: "Qué se llevaron",
  detalles: "Detalles",
  plan: "Tu plan",
  paso: "Paso del plan",
  completo: "Plan completo",
};

// The server renders with the build date; the browser switches to the real date after hydration.
const today = ref(props.buildDate);
const ready = ref(false);
const route = ref<Route>(START);
const selection = ref<Selection | null>(null);
const details = ref<Details>({});
const done = ref<StepId[]>([]);
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

function onPopState(): void {
  syncFromLocation(true);
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

onMounted(() => {
  today.value = todayIso();
  window.addEventListener("popstate", onPopState);
  syncFromLocation(false);
  ready.value = true;
});

onBeforeUnmount(() => {
  window.removeEventListener("popstate", onPopState);
});
</script>

<template>
  <div ref="root" class="app" :data-ready="ready ? 'true' : undefined">
    <p class="sr-only" aria-live="polite" aria-atomic="true">{{ announcement }}</p>

    <StartScreen
      v-if="route.screen === 'inicio'"
      @start="navigate({ screen: 'selector' })"
      @emergency="navigate({ screen: 'emergencia' })"
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
    />

    <StepScreen
      v-else-if="route.screen === 'paso' && activeStep"
      :step="activeStep"
      :done="done.includes(activeStep.id)"
      :today="today"
      @mark-done="completeStep(activeStep.id, 'paso')"
      @mark-pending="reopenStep(activeStep.id)"
      @back="navigate({ screen: 'plan' })"
    />

    <DoneScreen
      v-else-if="route.screen === 'completo'"
      :pending-optional="pendingOptional"
      @open="navigate({ screen: 'paso', stepId: $event })"
      @back="navigate({ screen: 'plan' })"
    />
  </div>
</template>
