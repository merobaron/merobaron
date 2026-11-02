<script setup lang="ts">
import type { PlanStep } from "../domain/plan";
import ExampleData from "./ExampleData.vue";

defineProps<{ step: PlanStep; today: string }>();
</script>

<template>
  <div class="detail">
    <p v-if="step.expired" class="detail__expired" role="note">
      <strong>Dato vencido.</strong> Esta información pasó su fecha de revisión y puede no estar vigente. Confírmala en
      los canales oficiales antes de seguirla.
    </p>
    <ol class="detail__steps">
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
