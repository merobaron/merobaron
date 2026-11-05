<script setup lang="ts">
import { computed } from "vue";
import type { PlanStep } from "../domain/plan";
import ExampleData from "./ExampleData.vue";

const props = withDefaults(defineProps<{ step: PlanStep; today: string; cta?: boolean }>(), { cta: true });

const callToAction = computed(
  () => `Llama a ${props.step.entity?.name ?? (props.step.id === "card" ? "tu banco" : "tu operador")}, ya.`,
);
</script>

<template>
  <div class="detail">
    <p v-if="step.expired" class="detail__expired" role="note">
      <strong>Dato vencido.</strong> Esta información pasó su fecha de revisión y puede no estar vigente. Confírmala en
      los canales oficiales antes de seguirla.
    </p>
    <template v-if="step.whatToSay">
      <p v-if="cta" class="detail__cta">{{ callToAction }}</p>
      <p v-for="hint in step.instructions" :key="hint" class="detail__hint">{{ hint }}</p>
    </template>
    <ol v-else class="detail__steps">
      <li v-for="instruction in step.instructions" :key="instruction">{{ instruction }}</li>
    </ol>
    <p v-if="step.notice" class="detail__notice">{{ step.notice }}</p>
    <ExampleData :step="step" :today="today" />
  </div>
</template>

<style scoped>
.detail {
  display: grid;
  gap: var(--space-md);
}

.detail__steps {
  display: grid;
  gap: var(--space-xs);
  margin: 0;
  padding-left: var(--space-lg);
  font-size: 18px;
  line-height: 1.5;
}

.detail__cta {
  margin: 0;
  font-family: var(--font-display);
  font-size: 32px;
  line-height: 1.1;
  text-transform: uppercase;
}

.detail__hint {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
}

.detail__notice {
  margin: 0;
  padding: var(--space-sm) var(--space-md);
  border-left: var(--border-thick) solid var(--color-info);
  background: var(--color-info-faded);
  font-size: 16px;
  line-height: 1.5;
}

.detail__expired {
  margin: 0;
  padding: var(--space-sm) var(--space-md);
  border-left: var(--border-thick) solid var(--color-warning);
  background: var(--color-warning-faded);
  font-size: 16px;
  line-height: 1.5;
}
</style>
