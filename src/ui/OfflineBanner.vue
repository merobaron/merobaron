<template>
  <div class="offline no-print" role="status">
    <p class="container offline__text">
      <strong>Sin conexión.</strong> Tu plan sigue disponible en este dispositivo. Para llamar al banco o al operador,
      usa otro teléfono.
    </p>
  </div>
</template>

<style scoped>
.offline {
  background: var(--color-info-faded);
  color: var(--color-ink);
}

.offline__text {
  margin-block: 0;
  padding-block: var(--space-sm);
  font-size: 16px;
  line-height: 1.5;
}
</style>
