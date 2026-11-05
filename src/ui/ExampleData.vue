<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { isExpired, quoteUrl } from "../domain/content";
import type { PlanStep } from "../domain/plan";

const props = defineProps<{ step: PlanStep; today: string }>();

const headingId = useId();
const showEvidence = ref(false);
const entityExpired = computed(() => props.step.entity !== undefined && isExpired(props.step.entity, props.today));
const isExample = computed(() => new URL(props.step.entity?.source ?? props.step.source).hostname === "ejemplo.com");
const callHref = computed(() => `tel:${props.step.entity?.theftLine?.replace(/\D/g, "") ?? ""}`);
</script>

<template>
  <section class="data" :aria-labelledby="headingId">
    <h3 :id="headingId" class="data__title">{{ isExample ? "Datos de ejemplo" : "Datos oficiales" }}</h3>
    <p v-if="isExample" class="data__note">Estos datos no son reales. Confirma siempre en los canales oficiales.</p>

    <div v-if="step.entity" class="data__action">
      <p v-if="step.entity.theftLine" class="data__call-label">Línea de robo</p>
      <p class="data__row">
        <span class="data__entity">
          <img v-if="step.entity.logo" class="data__logo" :src="step.entity.logo" alt="" width="24" height="24" />
          {{ step.entity.name }}
        </span>
        <a
          v-if="step.entity.theftLine"
          class="data__call"
          :class="{ 'data__call--stale': entityExpired }"
          :href="callHref"
          :aria-label="`Llamar a ${step.entity.name}: ${step.entity.theftLine}`"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"
            />
          </svg>
          {{ step.entity.theftLine }}
        </a>
        <strong v-if="entityExpired" class="data__badge">Vencido</strong>
      </p>
      <a v-if="step.entity.link" class="data__link" :href="step.entity.link" rel="noreferrer">Ir al canal oficial</a>
    </div>

    <div class="data__meta">
      <h4 class="data__subtitle">Fuente y verificación</h4>
      <p v-if="!isExample" class="data__note">Tomados de la fuente oficial. Si algo no coincide, sigue lo que diga la fuente.</p>
      <dl class="data__list">
        <div>
          <dt>Fuente</dt>
          <dd class="data__mono">
            <a :href="quoteUrl(step.entity?.source ?? step.source, step.entity?.quote)" rel="noreferrer">{{
              step.entity?.source ?? step.source
            }}</a>
          </dd>
        </div>
        <div v-if="step.entity?.archive">
          <dt>Copia archivada</dt>
          <dd class="data__mono">
            <a :href="step.entity.archive" rel="noreferrer">Wayback Machine</a>
          </dd>
        </div>
        <div>
          <dt>Verificado</dt>
          <dd>{{ step.entity?.verifiedOn ?? step.verifiedOn }}</dd>
        </div>
        <div>
          <dt>Vence</dt>
          <dd>{{ step.entity?.expiresOn ?? step.expiresOn }}</dd>
        </div>
        <div v-if="step.sampleReference">
          <dt>{{ step.id === "passwords" ? "Correo de ejemplo" : "Referencia de ejemplo" }}</dt>
          <dd class="data__mono">{{ step.sampleReference }}</dd>
        </div>
      </dl>
      <template v-if="step.entity?.evidence">
        <button type="button" class="data__toggle" :aria-expanded="showEvidence" @click="showEvidence = !showEvidence">
          {{ showEvidence ? "Ocultar captura" : "Ver captura de la fuente" }}
        </button>
        <figure v-if="showEvidence" class="data__evidence">
          <a :href="step.entity.evidence">
            <img
              :src="step.entity.evidence"
              :alt="`Captura de la fuente de ${step.entity.name} con el dato resaltado`"
              width="1280"
              height="900"
            />
          </a>
          <figcaption>El dato está resaltado. Ábrela para verla completa.</figcaption>
        </figure>
      </template>
    </div>
  </section>
</template>

<style scoped>
.data {
  display: grid;
  gap: var(--space-sm);
  padding: var(--space-md);
  border: var(--border-thin) dashed var(--color-ink-soft);
  background: var(--color-surface);
}

.data__title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.data__note {
  margin: 0;
  color: var(--color-ink-soft);
  font-size: 14px;
  line-height: 1.5;
}

.data__action {
  display: grid;
  gap: var(--space-2xs);
}

.data__call-label {
  margin: 0;
  color: var(--color-ink-soft);
  font-size: 14px;
  font-weight: 600;
}

.data__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2xs) var(--space-sm);
  margin: 0;
}

.data__entity {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 20px;
  font-weight: 700;
}

.data__logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.data__call {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-height: 44px;
  padding: var(--space-2xs) var(--space-sm);
  border: var(--border-thin) solid var(--color-ink);
  background: var(--color-accent-main);
  color: var(--color-ink);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
  text-decoration: none;
}

.data__call:hover,
.data__call:focus-visible {
  background: var(--color-accent-light);
}

.data__call svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.data__call--stale {
  text-decoration: line-through;
}

.data__badge {
  padding: 0 var(--space-2xs);
  background: var(--color-warning-faded);
  color: var(--color-warning);
  font-size: 14px;
}

.data__link {
  font-size: 16px;
  font-weight: 600;
}

.data__meta {
  display: grid;
  justify-items: start;
  gap: var(--space-sm);
  border-top: var(--border-thin) solid var(--color-line);
  padding-top: var(--space-sm);
}

.data__subtitle {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.data__toggle {
  min-height: 36px;
  padding: var(--space-2xs) var(--space-sm);
  border: var(--border-thin) solid var(--color-ink);
  background: var(--color-paper);
  color: var(--color-ink);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.data__toggle:hover,
.data__toggle:focus-visible {
  background: var(--color-accent-faded);
}

.data__list {
  justify-self: stretch;
  display: grid;
  gap: var(--space-xs);
  margin: 0;
}

.data__list div {
  display: grid;
  gap: var(--space-3xs);
}

@media (min-width: 480px) {
  .data__list div {
    grid-template-columns: minmax(0, 10rem) minmax(0, 1fr);
    gap: var(--space-sm);
  }
}

dt {
  color: var(--color-ink-soft);
  font-size: 14px;
  font-weight: 600;
}

dd {
  margin: 0;
  font-size: 16px;
  overflow-wrap: anywhere;
}

.data__mono {
  font-family: ui-monospace, monospace;
  font-size: 14px;
  overflow-wrap: anywhere;
}

.data__evidence {
  justify-self: stretch;
  margin: 0;
}

.data__evidence img {
  display: block;
  width: 100%;
  height: auto;
  border: var(--border-thin) solid var(--color-ink-soft);
}

.data__evidence figcaption {
  margin-top: var(--space-xs);
  color: var(--color-ink-soft);
  font-size: 14px;
}
</style>
