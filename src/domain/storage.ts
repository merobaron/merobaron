import { cardKey, isAssetId, isStepKey, type Details, type Selection } from "./plan";
import { parseReport, type ReportDraft } from "./report";

/** The only key the site writes. Bump the version suffix on breaking changes. */
export const STORAGE_KEY = "merobaron:plan:v1";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SavedPlan {
  version: 1;
  selection: Selection;
  details: Details;
  done: string[];
  report?: ReportDraft;
}

/** Returns localStorage when it is usable, or null (private mode, blocked site data, SSR). */
export function getStorage(): StorageLike | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function parseDetails(value: unknown): Details {
  if (!isRecord(value)) return {};
  const details: Details = {};
  const operatorId = optionalString(value.operatorId);
  // Plans saved before multiple banks have a single `bankId`.
  const bankIds = Array.isArray(value.bankIds) ? value.bankIds.map(optionalString) : [optionalString(value.bankId)];
  const validBankIds = [...new Set(bankIds.filter((id) => id !== undefined))];
  if (operatorId) details.operatorId = operatorId;
  if (validBankIds.length > 0) details.bankIds = validBankIds;
  return details;
}

/** Validates data read from storage. Anything unexpected is dropped instead of trusted. */
export function parseSavedPlan(value: unknown): SavedPlan | null {
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.selection)) return null;
  const assets = Array.isArray(value.selection.assets) ? value.selection.assets.filter(isAssetId) : [];
  const unknown = value.selection.unknown === true;
  if (assets.length === 0 && !unknown) return null;
  const details = parseDetails(value.details);
  // Before multiple banks, the card step was always "card"; point it at the saved bank.
  const legacyCard = details.bankIds?.length === 1 ? cardKey(details.bankIds[0]) : "card";
  const done = Array.isArray(value.done) ? value.done.filter(isStepKey).map((key) => (key === "card" ? legacyCard : key)) : [];
  const plan: SavedPlan = {
    version: 1,
    selection: { assets: [...new Set(assets)], unknown },
    details,
    done: [...new Set(done)],
  };
  const report = parseReport(value.report);
  if (report) plan.report = report;
  return plan;
}

export function loadPlan(storage: StorageLike | null = getStorage()): SavedPlan | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw === null ? null : parseSavedPlan(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function savePlan(plan: SavedPlan, storage: StorageLike | null = getStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(plan));
    return true;
  } catch {
    return false;
  }
}

export function clearPlan(storage: StorageLike | null = getStorage()): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
