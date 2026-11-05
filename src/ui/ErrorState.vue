<script setup lang="ts">
import type { Guide } from "../domain/content";
import ScreenShell from "./ScreenShell.vue";
import UiButton from "./UiButton.vue";

defineProps<{ guide?: Guide }>();
defineEmits<{ retry: [] }>();
</script>

<template>
  <ScreenShell
    title="ALGO FALLÓ"
    lead="No pudimos mostrar esta pantalla. Mientras tanto, esto sirve para cualquier robo:"
  >
    <ol v-if="guide" class="steps">
      <li v-for="step in guide.steps" :key="step">{{ step }}</li>
    </ol>
    <div>
      <UiButton @click="$emit('retry')">Reintentar</UiButton>
    </div>
  </ScreenShell>
</template>

<style scoped>
.steps {
  display: grid;
  gap: var(--space-xs);
  margin: 0;
  padding-left: var(--space-lg);
  font-size: 18px;
  line-height: 1.5;
}
</style>
