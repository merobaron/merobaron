<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "danger" | "inverse";
    type?: "button" | "submit";
    arrow?: boolean;
  }>(),
  { variant: "primary", type: "button", arrow: false },
);
</script>

<template>
  <button class="button" :class="`button--${variant}`" :type="type">
    <slot />
    <svg v-if="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
  </button>
</template>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  min-height: 56px;
  padding: var(--space-md) var(--space-lg);
  border: var(--border-thin) solid transparent;
  border-radius: var(--radius-none);
  font: 700 16px/1.5 var(--font-text);
  text-align: center;
  cursor: pointer;
  transition: background-color var(--motion-fast);
}

.button:focus-visible {
  outline: var(--border-thick) solid var(--color-info);
  outline-offset: var(--space-3xs);
}

.button--primary {
  background: var(--color-accent-main);
  color: var(--color-ink);
}

.button--primary:hover {
  background: var(--color-accent-light);
}

.button--secondary {
  border-color: var(--color-ink);
  background: var(--color-paper);
  color: var(--color-ink);
}

.button--secondary:hover {
  background: var(--color-surface);
}

.button--danger {
  background: var(--color-error);
  color: var(--color-paper);
}

.button--danger:hover {
  background: var(--color-brand-dark);
}

.button--inverse {
  border-color: var(--color-paper);
  background: transparent;
  color: var(--color-paper);
}

.button--inverse:hover {
  background: var(--color-brand-dark);
}

.button--inverse:focus-visible {
  outline-color: var(--color-accent-light);
}

svg {
  flex: none;
  width: 24px;
  height: 24px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none;
  }
}
</style>
