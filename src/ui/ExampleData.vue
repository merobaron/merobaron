<script setup lang="ts">
import { computed, useId } from "vue";
import { isExpired, quoteUrl } from "../domain/content";
import type { PlanStep } from "../domain/plan";

const props = defineProps<{ step: PlanStep; today: string }>();

const headingId = useId();
const entityExpired = computed(() => props.step.entity !== undefined && isExpired(props.step.entity, props.today));
const isExample = computed(() => new URL(props.step.entity?.source ?? props.step.source).hostname === "ejemplo.com");
</script>

<template>
  <section class="example" :aria-labelledby="headingId">
    <h3 :id="headingId" class="example__title">{{ isExample ? "Datos de ejemplo" : "Datos oficiales" }}</h3>
    <p class="example__note">
      {{ isExample ? "Estos datos no son reales. Confirma siempre en los canales oficiales." : "Tomados de la fuente oficial. Si algo no coincide, sigue lo que diga la fuente." }}
    </p>
    <dl class="example__list">
      <template v-if="step.entity">
        <div>
          <dt>Entidad</dt>
          <dd>{{ step.entity.name }}</dd>
        </div>
        <div v-if="step.entity.theftLine">
          <dt>Línea de robo</dt>
          <dd>
            <span :class="{ 'example__stale': entityExpired }">{{ step.entity.theftLine }}</span>
            <strong v-if="entityExpired" class="example__badge">Vencido</strong>
          </dd>
        </div>
        <div v-if="step.entity.link">
          <dt>Canal oficial</dt>
          <dd class="example__mono">{{ step.entity.link }}</dd>
        </div>
      </template>
      <div v-if="step.sampleReference">
        <dt>{{ step.id === "passwords" ? "Correo" : "Referencia" }}</dt>
        <dd class="example__mono">{{ step.sampleReference }}</dd>
      </div>
      <div>
        <dt>Fuente</dt>
        <dd class="example__mono">
          <a :href="quoteUrl(step.entity?.source ?? step.source, step.entity?.quote)" rel="noreferrer">{{
            step.entity?.source ?? step.source
          }}</a>
        </dd>
      </div>
      <div v-if="step.entity?.archive">
        <dt>Copia archivada</dt>
        <dd class="example__mono">
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
    </dl>
    <figure v-if="step.entity?.evidence" class="example__evidence">
      <a :href="step.entity.evidence">
        <img
          :src="step.entity.evidence"
          :alt="`Captura de la fuente de ${step.entity.name} con el dato resaltado`"
          width="1280"
          height="900"
          loading="lazy"
        />
      </a>
      <figcaption>Captura de la fuente, con el dato resaltado. Ábrela para verla completa.</figcaption>
    </figure>
  </section>
</template>

<style scoped>
.example {
  display: grid;
  gap: var(--space-xs);
  padding: var(--space-md);
  border: var(--border-thin) dashed var(--color-ink-soft);
  background: var(--color-surface);
}

.example__title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.example__note {
  margin: 0;
  color: var(--color-ink-soft);
  font-size: 14px;
  line-height: 1.5;
}

.example__list {
  display: grid;
  gap: var(--space-xs);
  margin: 0;
}

.example__list div {
  display: grid;
  gap: var(--space-3xs);
}

@media (min-width: 480px) {
  .example__list div {
    grid-template-columns: minmax(0, 8rem) minmax(0, 1fr);
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

.example__mono {
  font-family: ui-monospace, monospace;
  font-size: 14px;
  overflow-wrap: anywhere;
}

.example__evidence {
  margin: 0;
}

.example__evidence img {
  display: block;
  width: 100%;
  height: auto;
  border: var(--border-thin) solid var(--color-ink-soft);
}

.example__evidence figcaption {
  margin-top: var(--space-xs);
  color: var(--color-ink-soft);
  font-size: 14px;
}

.example__stale {
  text-decoration: line-through;
}

.example__badge {
  display: inline-block;
  white-space: nowrap;
  margin-left: var(--space-xs);
  padding: 0 var(--space-2xs);
  background: var(--color-warning-faded);
  color: var(--color-warning);
  font-size: 14px;
}
</style>
