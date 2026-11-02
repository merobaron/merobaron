<script setup lang="ts">
import { useId } from "vue";
import ProgressSteps from "./ProgressSteps.vue";

defineProps<{ title: string; progress?: 0 | 1 | 2; lead?: string }>();

const headingId = useId();
</script>

<template>
  <section class="screen" :aria-labelledby="headingId">
    <div class="container screen__inner">
      <ProgressSteps v-if="progress !== undefined" :current="progress" />
      <slot name="before-title" />
      <h1 :id="headingId" class="screen__title" tabindex="-1" data-screen-heading>{{ title }}</h1>
      <p v-if="lead" class="screen__lead">{{ lead }}</p>
      <slot />
    </div>
  </section>
</template>

<style scoped>
.screen__inner {
  display: grid;
  gap: var(--space-lg);
  max-width: calc(800px + 2 * var(--space-lg));
  padding-block: var(--space-2xl) var(--space-4xl);
}

.screen__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 64px;
  font-weight: 400;
  line-height: 1.125;
  overflow-wrap: anywhere;
}

.screen__title:focus {
  outline: none;
}

.screen__lead {
  margin: 0;
  font-size: 18px;
  line-height: 1.5;
}

@media (max-width: 639px) {
  .screen__inner {
    padding-block: var(--space-xl) var(--space-3xl);
  }

  .screen__title {
    font-size: 44px;
  }
}
</style>
