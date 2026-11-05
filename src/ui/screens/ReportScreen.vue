<script setup lang="ts">
import { computed, ref } from "vue";
import type { AssetId } from "../../domain/plan";
import { REPORT_FIELD_MAX_LENGTH, buildReportSummary, type ReportDraft } from "../../domain/report";
import ScreenShell from "../ScreenShell.vue";
import UiButton from "../UiButton.vue";

const props = defineProps<{ draft: ReportDraft; assets: AssetId[] }>();
const emit = defineEmits<{ update: [draft: ReportDraft]; finish: [filed: boolean]; back: [] }>();

const summary = computed(() => buildReportSummary(props.draft, props.assets));
const copyStatus = ref("");
const summaryBox = ref<HTMLElement | null>(null);

function update<K extends keyof ReportDraft>(key: K, value: ReportDraft[K]): void {
  emit("update", { ...props.draft, [key]: value });
}

function selectSummary(): void {
  const box = summaryBox.value;
  const selection = window.getSelection();
  if (!box || !selection) return;
  const range = document.createRange();
  range.selectNodeContents(box);
  selection.removeAllRanges();
  selection.addRange(range);
}

async function copySummary(): Promise<void> {
  try {
    await navigator.clipboard.writeText(summary.value);
    copyStatus.value = "Resumen copiado. Pégalo en el portal de denuncias.";
  } catch {
    selectSummary();
    copyStatus.value =
      "No pudimos copiar solos. Seleccionamos el texto: cópialo con tu teclado o el menú del navegador.";
  }
}

function printSummary(): void {
  window.print();
}
</script>

<template>
  <ScreenShell
    title="PREPARA TU DENUNCIA"
    lead="Escribe lo que recuerdes. Armamos un resumen para que lo copies en el portal. Nada sale de este dispositivo."
  >
    <form class="form no-print" novalidate @submit.prevent>
      <label class="field">
        <span class="field__label">¿Cuándo pasó?</span>
        <span class="field__hint">Ej.: hoy, 2 de noviembre, hacia las 7 p. m.</span>
        <input
          class="field__input"
          type="text"
          :maxlength="REPORT_FIELD_MAX_LENGTH"
          :value="draft.when"
          @input="update('when', ($event.target as HTMLInputElement).value)"
        />
      </label>
      <label class="field">
        <span class="field__label">¿Dónde pasó?</span>
        <span class="field__hint">Ciudad, barrio o dirección aproximada.</span>
        <input
          class="field__input"
          type="text"
          :maxlength="REPORT_FIELD_MAX_LENGTH"
          :value="draft.where"
          @input="update('where', ($event.target as HTMLInputElement).value)"
        />
      </label>
      <label class="field">
        <span class="field__label">¿Qué pasó?</span>
        <span class="field__hint">Cuéntalo en pocas frases.</span>
        <textarea
          class="field__input"
          rows="4"
          :maxlength="REPORT_FIELD_MAX_LENGTH"
          :value="draft.what"
          @input="update('what', ($event.target as HTMLTextAreaElement).value)"
        ></textarea>
      </label>
    </form>

    <section class="summary" aria-labelledby="report-summary-title">
      <h2 id="report-summary-title" class="summary__title">Tu resumen</h2>
      <pre ref="summaryBox" class="summary__text" tabindex="0" aria-label="Resumen para la denuncia">{{ summary }}</pre>
      <div class="actions no-print">
        <UiButton @click="copySummary">Copiar resumen</UiButton>
        <UiButton variant="secondary" @click="printSummary">Imprimir</UiButton>
      </div>
      <p class="copy-status no-print" role="status">{{ copyStatus }}</p>
    </section>

    <p class="portal no-print">
      Entra al portal de denuncias (dato de ejemplo) y pega este resumen. Solo tú puedes ponerla.
    </p>

    <fieldset class="filed no-print">
      <legend class="filed__legend">¿Ya la pusiste?</legend>
      <label class="choice">
        <input
          type="radio"
          name="filed"
          value="yes"
          :checked="draft.filed === 'yes'"
          @change="update('filed', 'yes')"
        />
        <span>Sí, ya la puse</span>
      </label>
      <label class="choice">
        <input type="radio" name="filed" value="no" :checked="draft.filed === 'no'" @change="update('filed', 'no')" />
        <span>Todavía no</span>
      </label>
      <label v-if="draft.filed === 'yes'" class="field">
        <span class="field__label">Número de la denuncia (opcional)</span>
        <span class="field__hint">Ej.: DEN-0000. Guárdalo: te lo pueden pedir el banco o el operador.</span>
        <input
          class="field__input"
          type="text"
          :maxlength="REPORT_FIELD_MAX_LENGTH"
          :value="draft.number"
          @input="update('number', ($event.target as HTMLInputElement).value)"
        />
      </label>
    </fieldset>

    <div class="actions no-print">
      <UiButton v-if="draft.filed === 'yes'" @click="$emit('finish', true)"
        >Marcar como hecha y volver al plan</UiButton
      >
      <UiButton variant="secondary" @click="$emit('back')">Volver al plan</UiButton>
    </div>
  </ScreenShell>
</template>

<style scoped>
.form,
.filed {
  display: grid;
  gap: var(--space-lg);
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.field {
  display: grid;
  gap: var(--space-2xs);
}

.field__label,
.filed__legend {
  padding: 0;
  font-size: 18px;
  font-weight: 700;
}

.filed__legend {
  margin-bottom: var(--space-xs);
  font-size: 20px;
}

.field__hint {
  color: var(--color-ink-soft);
  font-size: 14px;
}

.field__input {
  width: 100%;
  min-height: 48px;
  padding: var(--space-sm);
  border: var(--border-thin) solid var(--color-ink);
  border-radius: var(--radius-none);
  background: var(--color-paper);
  color: var(--color-ink);
  font: 400 16px/1.5 var(--font-text);
}

.field__input:focus-visible {
  outline: var(--border-thick) solid var(--color-info);
  outline-offset: var(--space-3xs);
}

.summary {
  display: grid;
  gap: var(--space-sm);
  padding: var(--space-md);
  border: var(--border-thick) solid var(--color-ink);
}

.summary__title {
  margin: 0;
  font-size: 22px;
}

.summary__text {
  margin: 0;
  padding: var(--space-md);
  background: var(--color-surface);
  font: 400 16px/1.5 var(--font-text);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.summary__text:focus-visible {
  outline: var(--border-thick) solid var(--color-info);
}

.copy-status {
  margin: 0;
  font-weight: 600;
}

.copy-status:empty {
  display: none;
}

.portal {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
}

.choice {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-height: 56px;
  padding: var(--space-sm) var(--space-md);
  border: var(--border-thin) solid var(--color-ink);
  font-size: 18px;
  cursor: pointer;
}

.choice:has(input:checked) {
  background: var(--color-accent-main);
}

.choice:focus-within {
  outline: var(--border-thick) solid var(--color-info);
  outline-offset: var(--space-3xs);
}

.choice input {
  width: 20px;
  height: 20px;
  margin: 0;
  accent-color: var(--color-ink);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

@media print {
  .no-print {
    display: none !important;
  }

  .summary {
    border: 0;
    padding: 0;
  }

  .summary__text {
    background: none;
  }
}
</style>
