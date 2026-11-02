<script setup lang="ts">
import type { AssetId } from "../../domain/plan";
import AssetSelector from "../AssetSelector.vue";
import ScreenShell from "../ScreenShell.vue";
import UiButton from "../UiButton.vue";

defineProps<{ initial: AssetId[]; lead?: string }>();
defineEmits<{ submit: [assets: AssetId[]]; unknown: [] }>();
</script>

<template>
  <ScreenShell title="¿QUÉ SE LLEVARON?" :progress="0" :lead="lead">
    <AssetSelector :initial="initial" @submit="$emit('submit', $event)" />
    <div class="unknown">
      <p class="unknown__text">¿No sabes bien qué se llevaron?</p>
      <UiButton variant="secondary" @click="$emit('unknown')">No lo sé, muéstrame lo básico</UiButton>
    </div>
  </ScreenShell>
</template>

<style scoped>
.unknown {
  display: grid;
  gap: var(--space-xs);
  justify-items: start;
  padding-top: var(--space-md);
  border-top: var(--border-thin) solid var(--color-line);
}

.unknown__text {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
</style>
