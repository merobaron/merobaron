<script setup lang="ts">
import { computed, ref } from "vue";
import type { AssetId } from "../domain/plan";
import { ASSET_LABELS, continueMessage, selectionLabel } from "../domain/selection";

const props = withDefaults(defineProps<{ initial?: AssetId[] }>(), { initial: () => [] });
const emit = defineEmits<{ submit: [assets: AssetId[]] }>();

const assets: { id: AssetId; icon: string }[] = [
  { id: "phone", icon: '<rect x="9" y="3" width="14" height="26"/><path d="M14 25h4"/>' },
  { id: "credit-card", icon: '<rect x="3" y="7" width="26" height="18"/><path d="M3 13h26M8 20h6"/>' },
  { id: "debit-card", icon: '<path d="M5 9h20v4M5 9v16h22V13H5"/><path d="M21 19h2"/>' },
  {
    id: "id-card",
    icon: '<rect x="3" y="7" width="26" height="18"/><circle cx="11" cy="14" r="3"/><path d="M6 21c1-3 9-3 10 0M20 13h5M20 18h5"/>',
  },
  { id: "email", icon: '<rect x="3" y="7" width="26" height="18"/><path d="m3 9 13 9 13-9"/>' },
  { id: "documents", icon: '<path d="M7 3h12l6 6v20H7zM19 3v6h6M11 16h10M11 22h10"/>' },
];

const selected = ref<AssetId[]>([...props.initial]);
const message = ref("");
const count = computed(() => selected.value.length);

function handleContinue() {
  message.value = continueMessage(count.value);
  if (count.value > 0) emit("submit", [...selected.value]);
}
</script>

<template>
  <form class="selector" novalidate @submit.prevent="handleContinue">
    <fieldset class="options">
      <legend class="sr-only">Selecciona lo que te robaron</legend>
      <label
        v-for="asset in assets"
        :key="asset.id"
        class="option"
        :class="{ 'option--selected': selected.includes(asset.id) }"
      >
        <input v-model="selected" class="sr-only input" type="checkbox" :value="asset.id" />
        <svg class="icon" viewBox="0 0 32 32" aria-hidden="true" v-html="asset.icon"></svg>
        <span class="label">{{ ASSET_LABELS[asset.id].toLocaleUpperCase("es") }}</span>
        <span class="check" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10" /></svg>
        </span>
      </label>
    </fieldset>
    <div class="actions">
      <p class="count" aria-live="polite">{{ selectionLabel(count) }}</p>
      <button class="button" type="submit">
        Continuar
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
      </button>
    </div>
    <p class="message" role="alert">{{ message }}</p>
  </form>
</template>

<style scoped>
.selector {
  display: grid;
  gap: var(--space-lg);
}

.options {
  display: grid;
  gap: var(--space-xs);
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.option {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  min-height: 72px;
  padding: var(--space-md);
  border: var(--border-thin) solid var(--color-ink);
  border-radius: var(--radius-none);
  background: var(--color-paper);
  cursor: pointer;
  transition: background-color var(--motion-fast);
}

.option:hover {
  background: var(--color-accent-faded);
}

.option--selected,
.option--selected:hover {
  background: var(--color-accent-main);
}

.option:focus-within {
  outline: var(--border-thick) solid var(--color-info);
  outline-offset: var(--space-3xs);
}

.icon {
  flex: none;
  width: 32px;
  height: 32px;
  fill: none;
  stroke: var(--color-ink);
  stroke-width: 2;
}

.label {
  flex: 1;
  min-width: 0;
  font-family: var(--font-display);
  font-size: 32px;
  line-height: 1.25;
  color: var(--color-ink);
  overflow-wrap: anywhere;
}

.check {
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  border: var(--border-thin) solid var(--color-ink);
  background: var(--color-paper);
}

.check svg {
  visibility: hidden;
  width: 24px;
  height: 24px;
  fill: none;
  stroke: var(--color-accent-main);
  stroke-width: 3;
}

.option--selected .check {
  background: var(--color-ink);
}

.option--selected .check svg {
  visibility: visible;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.count {
  margin: 0;
  font-size: 16px;
  color: var(--color-ink-soft);
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  min-height: 56px;
  padding: var(--space-md) var(--space-lg);
  border: 0;
  border-radius: var(--radius-none);
  background: var(--color-accent-main);
  color: var(--color-ink);
  font: 700 16px/1.5 var(--font-text);
  cursor: pointer;
  transition: background-color var(--motion-fast);
}

.button:hover {
  background: var(--color-accent-light);
}

.button:focus-visible {
  outline: var(--border-thick) solid var(--color-info);
  outline-offset: var(--space-3xs);
}

.button svg {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

.message {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  color: var(--color-error);
}

.message:empty {
  display: none;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 639px) {
  .label {
    font-size: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .option,
  .button {
    transition: none;
  }
}
</style>
