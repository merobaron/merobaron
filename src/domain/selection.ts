import type { AssetId } from "./plan";

export function selectionLabel(count: number): string {
  if (count === 0) return "Nada seleccionado";
  if (count === 1) return "1 seleccionado";
  return `${count} seleccionados`;
}

/** Message shown when "Continuar" cannot move on yet. Empty when the selection is valid. */
export function continueMessage(count: number): string {
  return count === 0 ? "Selecciona al menos una opción." : "";
}

export const URGENCY_LABELS = {
  ahora: "Ahora",
  hoy: "Hoy",
  "esta-semana": "Esta semana",
} as const;

export const ASSET_LABELS: Record<AssetId, string> = {
  phone: "Celular",
  card: "Tarjeta de crédito o débito",
  "id-card": "Cédula",
  email: "Correo y redes",
  documents: "Otros documentos",
};
