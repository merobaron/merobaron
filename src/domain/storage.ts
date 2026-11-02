import { isAssetId, isStepId, type Details, type Selection, type StepId } from "./plan";

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
  done: StepId[];
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
  const bankId = optionalString(value.bankId);
  if (operatorId) details.operatorId = operatorId;
  if (bankId) details.bankId = bankId;
  if (value.imei === "yes" || value.imei === "no") details.imei = value.imei;
  return details;
}

/** Validates data read from storage. Anything unexpected is dropped instead of trusted. */
export function parseSavedPlan(value: unknown): SavedPlan | null {
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.selection)) return null;
  const assets = Array.isArray(value.selection.assets) ? value.selection.assets.filter(isAssetId) : [];
  const unknown = value.selection.unknown === true;
  if (assets.length === 0 && !unknown) return null;
  const done = Array.isArray(value.done) ? value.done.filter(isStepId) : [];
  return {
    version: 1,
    selection: { assets: [...new Set(assets)], unknown },
    details: parseDetails(value.details),
    done: [...new Set(done)],
  };
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
