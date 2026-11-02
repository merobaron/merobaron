<script setup lang="ts">
defineProps<{ current: 0 | 1 | 2 }>();

const steps = ["1. Qué tenías", "2. Detalles", "3. Tu plan"];
</script>

<template>
  <ol class="progress no-print" aria-label="Progreso">
    <li
      v-for="(step, index) in steps"
      :key="step"
      class="progress__step"
      :class="{ 'progress__step--current': index === current, 'progress__step--done': index < current }"
      :aria-current="index === current ? 'step' : undefined"
    >
      {{ step }}
    </li>
  </ol>
</template>

<style scoped>
.progress {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2xs);
  margin: 0;
  padding: 0;
  list-style: none;
}

.progress__step {
  padding-top: calc(8px + var(--space-xs));
  background: linear-gradient(var(--color-line), var(--color-line)) top / 100% 8px no-repeat;
  color: var(--color-ink-soft);
  font-size: 14px;
  font-weight: 700;
}

.progress__step--done {
  background-image: linear-gradient(var(--color-ink), var(--color-ink));
}

.progress__step--current {
  background-image: linear-gradient(var(--color-brand-main), var(--color-brand-main));
  color: var(--color-ink);
}
</style>
