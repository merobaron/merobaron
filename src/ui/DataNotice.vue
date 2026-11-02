<script setup lang="ts">
import UiButton from "./UiButton.vue";

defineProps<{ saved: boolean }>();
defineEmits<{ delete: [] }>();
</script>

<template>
  <aside class="data no-print" aria-label="Tus datos">
    <p class="data__text">
      <template v-if="saved">Tu plan se guarda solo en este dispositivo. ¿Teléfono prestado? Bórralo al terminar.</template>
      <template v-else>No pudimos guardar tu plan en este dispositivo. Si cierras la página, se pierde.</template>
    </p>
    <UiButton variant="danger" @click="$emit('delete')">Borrar mis datos</UiButton>
  </aside>
</template>

<style scoped>
.data {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm) var(--space-md);
  padding: var(--space-md);
  border: var(--border-thin) solid var(--color-error);
  background: var(--color-error-faded);
}

.data__text {
  flex: 1 1 16rem;
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
}

@media print {
  .data {
    display: none;
  }
}
</style>
