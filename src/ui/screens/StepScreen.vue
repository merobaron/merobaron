<script setup lang="ts">
import type { PlanStep } from "../../domain/plan";
import { URGENCY_LABELS } from "../../domain/selection";
import ScreenShell from "../ScreenShell.vue";
import StepDetail from "../StepDetail.vue";
import UiButton from "../UiButton.vue";

defineProps<{ step: PlanStep; done: boolean; today: string }>();
defineEmits<{ markDone: []; markPending: []; back: [] }>();
</script>

<template>
  <ScreenShell :title="step.title.toLocaleUpperCase('es')">
    <template #before-title>
      <p class="meta">
        {{ URGENCY_LABELS[step.urgency] }}<template v-if="step.optional"> · Recomendado, no obligatorio</template>
        <template v-if="done"> · Hecho</template>
      </p>
    </template>
    <StepDetail :step="step" :today="today" />
    <slot />
    <div class="actions">
      <UiButton v-if="!done" @click="$emit('markDone')">Marcar como hecho</UiButton>
      <UiButton v-else variant="secondary" @click="$emit('markPending')">Marcar como pendiente</UiButton>
      <UiButton variant="secondary" @click="$emit('back')">Volver al plan</UiButton>
    </div>
  </ScreenShell>
</template>

<style scoped>
.meta {
  margin: 0;
  color: var(--color-ink-soft);
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
</style>
