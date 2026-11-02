<script setup lang="ts">
import { computed } from "vue";
import type { PlanStep, StepId } from "../../domain/plan";
import { countDone, currentStep, progressLabel } from "../../domain/progress";
import { URGENCY_LABELS } from "../../domain/selection";
import ScreenShell from "../ScreenShell.vue";
import StepDetail from "../StepDetail.vue";
import UiButton from "../UiButton.vue";

const props = defineProps<{ steps: PlanStep[]; done: StepId[]; today: string; general: boolean }>();
defineEmits<{ open: [id: StepId]; markDone: [id: StepId]; changeSelection: []; report: [] }>();

const current = computed(() => currentStep(props.steps, props.done));
const percent = computed(() => (props.steps.length === 0 ? 0 : (countDone(props.steps, props.done) / props.steps.length) * 100));

function status(step: PlanStep): string {
  if (props.done.includes(step.id)) return "Hecho";
  if (step.optional) return "Recomendado";
  return "Pendiente";
}
</script>

<template>
  <ScreenShell
    title="TU PLAN"
    :progress="2"
    :lead="general ? 'No pasa nada si no lo sabes. Empieza por lo básico.' : 'Hazlo en este orden. Lo más urgente va primero.'"
  >
    <div class="summary">
      <p class="summary__label">{{ progressLabel(steps, done) }}</p>
      <div class="summary__bar" aria-hidden="true"><span :style="{ width: `${percent}%` }"></span></div>
    </div>

    <ol class="plan">
      <li
        v-for="(step, index) in steps"
        :key="step.id"
        class="item"
        :class="{ 'item--current': current?.id === step.id, 'item--done': done.includes(step.id) }"
      >
        <div class="item__head">
          <span class="item__number" aria-hidden="true">{{ index + 1 }}</span>
          <div class="item__titles">
            <h2 class="item__title" tabindex="-1">{{ step.title }}</h2>
            <p class="item__meta">
              <span class="badge" :class="`badge--${step.urgency}`">{{ URGENCY_LABELS[step.urgency] }}</span>
              <span class="item__status">{{ status(step) }}</span>
              <span v-if="step.expired" class="badge badge--expired">Dato vencido</span>
            </p>
          </div>
        </div>

        <div v-if="current?.id === step.id" class="item__body">
          <StepDetail :step="step" :today="today" />
          <div class="actions">
            <UiButton v-if="step.id === 'report'" arrow @click="$emit('report')">Preparar el resumen</UiButton>
            <UiButton v-else @click="$emit('markDone', step.id)">Marcar como hecho</UiButton>
            <UiButton variant="secondary" @click="$emit('open', step.id)">Ver paso</UiButton>
          </div>
        </div>
        <div v-else class="item__collapsed">
          <UiButton variant="secondary" :aria-label="`Ver paso: ${step.title}`" @click="$emit('open', step.id)">
            Ver paso
          </UiButton>
        </div>
      </li>
    </ol>

    <slot />

    <div v-if="general" class="general">
      <p>¿Ya sabes qué te robaron? Arma un plan a tu medida.</p>
      <UiButton variant="secondary" @click="$emit('changeSelection')">Elegir qué se llevaron</UiButton>
    </div>
  </ScreenShell>
</template>

<style scoped>
.summary {
  display: grid;
  gap: var(--space-xs);
}

.summary__label {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.summary__bar {
  height: 8px;
  background: var(--color-line);
}

.summary__bar span {
  display: block;
  height: 100%;
  background: var(--color-success);
  transition: width var(--motion-base);
}

.plan {
  display: grid;
  gap: var(--space-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  display: grid;
  gap: var(--space-md);
  padding: var(--space-md);
  border: var(--border-thin) solid var(--color-line);
  background: var(--color-paper);
}

.item--current {
  border: var(--border-thick) solid var(--color-ink);
}

.item--done {
  background: var(--color-success-faded);
}

.item__head {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
}

.item__number {
  display: grid;
  flex: none;
  place-items: center;
  width: 40px;
  height: 40px;
  background: var(--color-ink);
  color: var(--color-paper);
  font-family: var(--font-display);
  font-size: 24px;
}

.item__titles {
  display: grid;
  gap: var(--space-2xs);
  min-width: 0;
}

.item__title {
  margin: 0;
  font-size: 22px;
  line-height: 1.25;
}

.item__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-xs);
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.item__status {
  color: var(--color-ink-soft);
}

.badge {
  padding: 0 var(--space-xs);
  font-weight: 700;
}

.badge--ahora {
  background: var(--color-brand-main);
  color: var(--color-paper);
}

.badge--hoy {
  background: var(--color-accent-main);
  color: var(--color-ink);
}

.badge--esta-semana {
  background: var(--color-surface);
  color: var(--color-ink);
}

.badge--expired {
  background: var(--color-warning-faded);
  color: var(--color-warning);
}

.item__body {
  display: grid;
  gap: var(--space-md);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.general {
  display: grid;
  gap: var(--space-xs);
  justify-items: start;
}

.general p {
  margin: 0;
  font-size: 16px;
}

@media (prefers-reduced-motion: reduce) {
  .summary__bar span {
    transition: none;
  }
}
</style>
