<script setup lang="ts">
import ScreenShell from "../ScreenShell.vue";
import UiButton from "../UiButton.vue";

defineEmits<{ confirm: []; cancel: [] }>();
</script>

<template>
  <ScreenShell
    title="BORRAR MIS DATOS"
    lead="Borra de este dispositivo lo que elegiste, tus avances y el resumen de la denuncia. Hazlo si usas un teléfono prestado o compartido."
  >
    <p class="warning" role="note">Esto no se puede deshacer. MeRobaron no guarda copias en ninguna parte.</p>
    <div class="actions">
      <UiButton variant="danger" @click="$emit('confirm')">Sí, borrar todo</UiButton>
      <UiButton variant="secondary" @click="$emit('cancel')">Cancelar</UiButton>
    </div>
  </ScreenShell>
</template>

<style scoped>
.warning {
  margin: 0;
  padding: var(--space-sm) var(--space-md);
  border-left: var(--border-thick) solid var(--color-error);
  background: var(--color-error-faded);
  font-size: 16px;
  line-height: 1.5;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
</style>
