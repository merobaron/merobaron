<script setup lang="ts">
import UiButton from "../UiButton.vue";

defineProps<{ savedProgress?: string; flash?: string }>();
defineEmits<{ start: []; emergency: []; resume: []; startOver: [] }>();
</script>

<template>
  <section class="hero" aria-labelledby="start-title">
    <div class="container hero__inner">
      <p v-if="flash" class="flash" role="status">{{ flash }}</p>
      <h1 id="start-title" class="hero__title" tabindex="-1" data-screen-heading>TE ROBARON.<br />ACTÚA YA.</h1>
      <div v-if="savedProgress" class="resume">
        <div class="resume__text">
          <p class="resume__eyebrow">TIENES UN PLAN GUARDADO EN ESTE DISPOSITIVO</p>
          <p class="resume__progress">{{ savedProgress }}</p>
        </div>
        <div class="resume__actions">
          <UiButton arrow @click="$emit('resume')">Continuar mi plan</UiButton>
          <UiButton variant="secondary" @click="$emit('startOver')">Empezar de nuevo</UiButton>
        </div>
      </div>
      <div class="first-action">
        <div class="first-action__text">
          <p class="first-action__eyebrow">SI SE LLEVARON TU CELULAR, EMPIEZA AQUÍ</p>
          <p class="first-action__title">Bloquea tu línea desde otro teléfono</p>
        </div>
        <UiButton arrow @click="$emit('emergency')">Bloquear mi línea</UiButton>
      </div>
      <div class="main-action">
        <p class="main-action__text">¿Te robaron otras cosas? Dinos qué se llevaron y te decimos qué hacer primero.</p>
        <UiButton variant="inverse" arrow @click="$emit('start')">Empezar</UiButton>
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

.flash {
  margin: 0;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-success-faded);
  color: var(--color-ink);
  font-size: 16px;
  font-weight: 600;
}

.resume {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--color-paper);
}

.resume__text {
  display: grid;
  gap: var(--space-2xs);
  min-width: 0;
}

.resume__eyebrow {
  margin: 0;
  color: var(--color-ink-soft);
  font-size: 14px;
  font-weight: 700;
}

.resume__progress {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.resume__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
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

.main-action {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.main-action__text {
  flex: 1 1 20rem;
  margin: 0;
  color: var(--color-paper);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
}

@media (max-width: 639px) {
  .main-action {
    flex-direction: column;
    align-items: stretch;
  }

  .main-action__text {
    flex: none;
  }

  .resume {
    padding: var(--space-md);
  }

  .resume__actions {
    display: grid;
    width: 100%;
  }

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
