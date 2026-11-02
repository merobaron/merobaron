<script setup lang="ts">
import UiButton from "../UiButton.vue";

defineEmits<{ start: [] }>();
</script>

<template>
  <section class="hero" aria-labelledby="start-title">
    <div class="container hero__inner">
      <h1 id="start-title" class="hero__title" tabindex="-1" data-screen-heading>TE ROBARON.<br />ACTÚA YA.</h1>
      <div class="first-action">
        <div class="first-action__text">
          <p class="first-action__eyebrow">ARMA TU PLAN EN 3 PASOS</p>
          <p class="first-action__title">Dinos qué se llevaron y te decimos qué hacer primero</p>
        </div>
        <UiButton arrow @click="$emit('start')">Empezar</UiButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: var(--color-brand-main);
}

.hero__inner {
  display: grid;
  gap: var(--space-xl);
  padding-block: var(--space-xl) var(--space-4xl);
}

.hero__title {
  margin: 0;
  color: var(--color-paper);
  font-family: var(--font-display);
  font-size: clamp(48px, 11vw, 160px);
  font-weight: 400;
  line-height: 1;
}

.hero__title:focus {
  outline: none;
}

.first-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--color-ink);
}

.first-action__text {
  display: grid;
  gap: var(--space-2xs);
  min-width: 0;
}

.first-action__eyebrow {
  margin: 0;
  color: var(--color-accent-main);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}

.first-action__title {
  margin: 0;
  color: var(--color-paper);
  font-size: 32px;
  font-weight: 700;
  line-height: 1.25;
}

@media (max-width: 639px) {
  .hero__title {
    font-size: clamp(48px, 16vw, 96px);
  }

  .first-action {
    flex-direction: column;
    align-items: stretch;
    padding: var(--space-md);
  }

  .first-action__title {
    font-size: 24px;
  }
}
</style>
