export type Urgency = "ahora" | "hoy" | "esta-semana";

export type EntityKind = "operador" | "banco" | "autoridad" | "identificacion";

/** A verifiable record: every phone, link or procedure carries its source and dates. */
export interface Verifiable {
  source: string;
  /** ISO date (YYYY-MM-DD) when a person checked the data. */
  verifiedOn: string;
  /** ISO date (YYYY-MM-DD) by which the data must be checked again. */
  expiresOn: string;
}

export interface Entity extends Verifiable {
  id: string;
  name: string;
  kind: EntityKind;
  theftLine?: string;
  link?: string;
  quote?: string;
  archive?: string;
  evidence?: string;
}

export interface Guide extends Verifiable {
  id: string;
  title: string;
  urgency: Urgency;
  entityKind?: EntityKind;
  steps: string[];
  notice?: string;
  /** Instruction shown when the person does not know which entity to call. */
  ifEntityUnknown?: string;
  /** Instruction shown when the person does not have the phone IMEI. */
  ifImeiUnknown?: string;
  sampleReference?: string;
}

export interface Content {
  entities: Entity[];
  guides: Guide[];
}

/** Returns today's date as YYYY-MM-DD in local time. */
export function todayIso(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Data whose `vence` date has passed must never be shown as current. */
export function isExpired(record: Pick<Verifiable, "expiresOn">, today: string): boolean {
  return record.expiresOn < today;
}

export function quoteUrl(source: string, quote?: string): string {
  if (!quote) return source;
  // "-", "," and "&" delimit text fragments, so they must be escaped too.
  const text = encodeURIComponent(quote).replace(/-/g, "%2D");
  return `${source.split("#")[0]}#:~:text=${text}`;
}
