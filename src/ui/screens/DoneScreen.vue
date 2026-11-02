<script setup lang="ts">
import type { PlanStep } from "../../domain/plan";
import ScreenShell from "../ScreenShell.vue";
import UiButton from "../UiButton.vue";

defineProps<{ pendingOptional: PlanStep[] }>();
defineEmits<{ back: []; open: [id: PlanStep["id"]] }>();
</script>

<template>
  <ScreenShell title="PLAN COMPLETO" lead="Hiciste lo más urgente. Guarda los números de referencia que te dieron.">
    <div v-if="pendingOptional.length > 0" class="optional">
      <h2 class="optional__title">Te recomendamos también</h2>
      <ul class="optional__list">
        <li v-for="step in pendingOptional" :key="step.id">
          <UiButton variant="secondary" @click="$emit('open', step.id)">{{ step.title }}</UiButton>
        </li>
      </ul>
    </div>
    <slot />
    <div class="actions">
      <UiButton variant="secondary" @click="$emit('back')">Volver al plan</UiButton>
    </div>
  </ScreenShell>
</template>

<style scoped>
.optional {
  display: grid;
  gap: var(--space-sm);
}

.optional__title {
  margin: 0;
  font-size: 22px;
}

.optional__list {
  display: grid;
  gap: var(--space-xs);
  margin: 0;
  padding: 0;
  list-style: none;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
</style>
