import type { AssetId } from "./plan";
import { ASSET_LABELS } from "./selection";

export const REPORT_FIELD_MAX_LENGTH = 2000;

export interface ReportDraft {
  when: string;
  where: string;
  what: string;
  /** Answer to "¿Ya la pusiste?". The site never files the report itself. */
  filed: "yes" | "no" | null;
  number: string;
}

export function emptyReport(): ReportDraft {
  return { when: "", where: "", what: "", filed: null, number: "" };
}

function line(label: string, value: string): string {
  const text = value.trim();
  return `${label}: ${text.length > 0 ? text : "(sin completar)"}`;
}

/** Plain text the person copies into the report portal. Nothing is sent anywhere. */
export function buildReportSummary(draft: ReportDraft, assets: readonly AssetId[]): string {
  const items = assets.length > 0 ? assets.map((asset) => `- ${ASSET_LABELS[asset]}`) : ["- (sin completar)"];
  const lines = [
    "RESUMEN PARA LA DENUNCIA",
    "",
    line("Cuándo pasó", draft.when),
    line("Dónde pasó", draft.where),
    line("Qué pasó", draft.what),
    "",
    "Qué me robaron:",
    ...items,
  ];
  if (draft.filed === "yes" && draft.number.trim()) lines.push("", line("Número de la denuncia", draft.number));
  return lines.join("\n");
}

function text(value: unknown): string {
  return typeof value === "string" ? value.slice(0, REPORT_FIELD_MAX_LENGTH) : "";
}

export function parseReport(value: unknown): ReportDraft | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  return {
    when: text(record.when),
    where: text(record.where),
    what: text(record.what),
    filed: record.filed === "yes" || record.filed === "no" ? record.filed : null,
    number: text(record.number),
  };
}
