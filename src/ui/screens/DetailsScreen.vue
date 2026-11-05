<script setup lang="ts">
import { reactive } from "vue";
import { isExpired, type Entity } from "../../domain/content";
import { UNKNOWN, type Details } from "../../domain/plan";
import ScreenShell from "../ScreenShell.vue";
import UiButton from "../UiButton.vue";

const props = defineProps<{
  initial: Details;
  operators: Entity[];
  banks: Entity[];
  askOperator: boolean;
  askBank: boolean;
  today: string;
}>();
const emit = defineEmits<{ submit: [details: Details]; back: [] }>();

const form = reactive<Details>({ ...props.initial });

function submit() {
  const details: Details = {};
  if (props.askOperator) details.operatorId = form.operatorId ?? UNKNOWN;
  if (props.askBank) details.bankIds = form.bankIds?.length ? form.bankIds : [UNKNOWN];
  emit("submit", details);
}

/** Several banks can be chosen; «No lo sé» excludes them. */
function toggleBank(id: string, checked: boolean) {
  const others = (form.bankIds ?? []).filter((bankId) => bankId !== id && bankId !== UNKNOWN);
  if (id === UNKNOWN) form.bankIds = checked ? [UNKNOWN] : [];
  else form.bankIds = checked ? [...others, id] : others;
}
</script>

<template>
  <ScreenShell title="DETALLES" :progress="1" lead="Con esto te mostramos a quién llamar. Si no sabes algo, elige «No lo sé».">
    <form class="details" novalidate @submit.prevent="submit">
      <fieldset v-if="askOperator" class="group">
        <legend class="group__legend">¿Cuál es tu operador de celular?</legend>
        <label v-for="operator in operators" :key="operator.id" class="choice">
          <input v-model="form.operatorId" type="radio" name="operator" :value="operator.id" />
          <img v-if="operator.logo" class="choice__logo" :src="operator.logo" alt="" width="28" height="28" />
          <span>{{ operator.name }}</span>
          <span v-if="isExpired(operator, today)" class="choice__flag">dato vencido</span>
        </label>
        <label class="choice">
          <input v-model="form.operatorId" type="radio" name="operator" :value="UNKNOWN" />
          <span>No lo sé</span>
        </label>
      </fieldset>

      <fieldset v-if="askBank" class="group">
        <legend class="group__legend">¿De qué banco son tus tarjetas?</legend>
        <p class="group__hint">Elige todos los que apliquen.</p>
        <label v-for="bank in banks" :key="bank.id" class="choice">
          <input
            type="checkbox"
            name="bank"
            :checked="form.bankIds?.includes(bank.id)"
            @change="toggleBank(bank.id, ($event.target as HTMLInputElement).checked)"
          />
          <img v-if="bank.logo" class="choice__logo" :src="bank.logo" alt="" width="28" height="28" />
          <span>{{ bank.name }}</span>
          <span v-if="isExpired(bank, today)" class="choice__flag">dato vencido</span>
        </label>
        <label class="choice">
          <input
            type="checkbox"
            name="bank"
            :checked="form.bankIds?.includes(UNKNOWN)"
            @change="toggleBank(UNKNOWN, ($event.target as HTMLInputElement).checked)"
          />
          <span>No lo sé</span>
        </label>
      </fieldset>

      <div class="actions">
        <UiButton type="submit" arrow>Ver mi plan</UiButton>
        <UiButton variant="secondary" @click="$emit('back')">Volver</UiButton>
      </div>
    </form>
  </ScreenShell>
</template>

<style scoped>
.details {
  display: grid;
  gap: var(--space-xl);
}

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
  line-height: 1.25;
}

.group__hint {
  margin: 0 0 var(--space-xs);
  color: var(--color-ink-soft);
  font-size: 16px;
  line-height: 1.5;
}

.choice {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-sm);
  min-height: 56px;
  padding: var(--space-sm) var(--space-md);
  border: var(--border-thin) solid var(--color-ink);
  background: var(--color-paper);
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

.choice__logo {
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-ink);
  object-fit: contain;
}

.choice__flag {
  padding: 0 var(--space-2xs);
  background: var(--color-warning-faded);
  color: var(--color-warning);
  font-size: 14px;
  font-weight: 700;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
</style>
