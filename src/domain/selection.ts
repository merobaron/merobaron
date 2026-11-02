export function selectionLabel(count: number): string {
  if (count === 0) return "Nada seleccionado";
  if (count === 1) return "1 seleccionado";
  return `${count} seleccionados`;
}

export function continueMessage(count: number): string {
  if (count === 0) return "Selecciona al menos una opción.";
  return "Tu selección no se guardó ni se envió. Los siguientes pasos todavía no están disponibles.";
}
