<script setup lang="ts">
import { ref, watch } from "vue";
import { isExpired, type Entity } from "../../domain/content";
import { UNKNOWN, type PlanStep } from "../../domain/plan";
import ScreenShell from "../ScreenShell.vue";
import StepDetail from "../StepDetail.vue";
import UiButton from "../UiButton.vue";

const props = defineProps<{ operators: Entity[]; operatorId?: string; step?: PlanStep; today: string }>();
const emit = defineEmits<{ chooseOperator: [id: string]; blocked: []; back: [] }>();

const choice = ref(props.operatorId ?? "");
watch(choice, (id) => {
  if (id) emit("chooseOperator", id);
});
</script>

<template>
  <ScreenShell
    title="BLOQUEA TU LÍNEA"
    lead="Hazlo desde otro teléfono. Así nadie puede usar tu número para recibir códigos o entrar a tus cuentas."
  >
    <fieldset class="group">
      <legend class="group__legend">¿Cuál es tu operador?</legend>
      <label v-for="operator in operators" :key="operator.id" class="choice">
        <input v-model="choice" type="radio" name="emergency-operator" :value="operator.id" />
        <span>{{ operator.name }}</span>
        <span v-if="isExpired(operator, today)" class="choice__flag">dato vencido</span>
      </label>
      <label class="choice">
        <input v-model="choice" type="radio" name="emergency-operator" :value="UNKNOWN" />
        <span>No lo sé</span>
      </label>
    </fieldset>

    <section v-if="step" class="guide" aria-labelledby="emergency-guide-title" aria-live="polite">
      <h2 id="emergency-guide-title" class="guide__title">
        {{ step.entity ? `Llama a ${step.entity.name}` : "Llama a tu operador" }}
      </h2>
      <StepDetail :step="step" :today="today" :cta="false" />
    </section>

    <div class="actions">
      <UiButton v-if="step" @click="$emit('blocked')">Ya bloqueé mi línea</UiButton>
      <UiButton variant="secondary" @click="$emit('back')">Volver</UiButton>
    </div>
  </ScreenShell>
</template>

<style scoped>
.group {
  display: grid;
  gap: var(--space-xs);
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.group__legend {
  margin-bottom: var(--space-xs);
  padding: 0;
  font-size: 20px;
  font-weight: 700;
}

.choice {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-sm);
  min-height: 56px;
  padding: var(--space-sm) var(--space-md);
  border: var(--border-thin) solid var(--color-ink);
  font-size: 18px;
  cursor: pointer;
}

.choice:has(input:checked) {
  background: var(--color-accent-main);
}

.choice:focus-within {
  outline: var(--border-thick) solid var(--color-info);
  outline-offset: var(--space-3xs);
}

.choice input {
  width: 20px;
  height: 20px;
  margin: 0;
  accent-color: var(--color-ink);
}

.choice__flag {
  padding: 0 var(--space-2xs);
  background: var(--color-warning-faded);
  color: var(--color-warning);
  font-size: 14px;
  font-weight: 700;
}

.guide {
  display: grid;
  gap: var(--space-md);
  padding: var(--space-md);
  border: var(--border-thick) solid var(--color-ink);
}

.guide__title {
  margin: 0;
  font-size: 22px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
</style>
