import { describe, expect, it } from "vitest";
import {
  STORAGE_KEY,
  clearPlan,
  loadPlan,
  parseSavedPlan,
  savePlan,
  type SavedPlan,
  type StorageLike,
} from "./storage";

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

const throwingStorage: StorageLike = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
  removeItem: () => {
    throw new Error("SecurityError");
  },
};

const plan: SavedPlan = {
  version: 1,
  selection: { assets: ["phone"], unknown: false },
  details: { operatorId: "operador-a" },
  done: ["phone"],
};

describe("storage", () => {
  it("uses the versioned key", () => {
    expect(STORAGE_KEY).toBe("merobaron:plan:v1");
  });

  it("saves and loads a plan", () => {
    const storage = memoryStorage();
    expect(savePlan(plan, storage)).toBe(true);
    expect([...storage.data.keys()]).toEqual([STORAGE_KEY]);
    expect(loadPlan(storage)).toEqual(plan);
  });

  it("clears the plan", () => {
    const storage = memoryStorage();
    savePlan(plan, storage);
    expect(clearPlan(storage)).toBe(true);
    expect(loadPlan(storage)).toBeNull();
  });

  it("works without storage", () => {
    expect(loadPlan(null)).toBeNull();
    expect(savePlan(plan, null)).toBe(false);
    expect(clearPlan(null)).toBe(false);
  });

  it("never throws when storage is blocked", () => {
    expect(loadPlan(throwingStorage)).toBeNull();
    expect(savePlan(plan, throwingStorage)).toBe(false);
    expect(clearPlan(throwingStorage)).toBe(false);
  });

  it("ignores corrupted data", () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, "{not json");
    expect(loadPlan(storage)).toBeNull();
  });
});

describe("parseSavedPlan", () => {
  it("rejects other versions", () => {
    expect(parseSavedPlan({ ...plan, version: 2 })).toBeNull();
  });

  it("rejects a plan without a selection", () => {
    expect(parseSavedPlan({ ...plan, selection: { assets: [], unknown: false } })).toBeNull();
  });

  it("drops unknown assets, steps and details", () => {
    const parsed = parseSavedPlan({
      version: 1,
      selection: { assets: ["phone", "car", "phone"], unknown: false },
      details: { operatorId: "operador-a", imei: "maybe", extra: true },
      done: ["phone", "hack", 3],
    });
    expect(parsed).toEqual({
      version: 1,
      selection: { assets: ["phone"], unknown: false },
      details: { operatorId: "operador-a" },
      done: ["phone"],
    });
  });

  it("merges the old credit and debit card assets into one", () => {
    const parsed = parseSavedPlan({ ...plan, selection: { assets: ["credit-card", "debit-card"], unknown: false } });
    expect(parsed?.selection.assets).toEqual(["card"]);
  });

  it("reads plans saved with a single bank", () => {
    const parsed = parseSavedPlan({ ...plan, details: { bankId: "banco-a" }, done: ["card", "report"] });
    expect(parsed?.details).toEqual({ bankIds: ["banco-a"] });
    expect(parsed?.done).toEqual(["card:banco-a", "report"]);
  });

  it("keeps the chosen banks, without duplicates or junk", () => {
    const parsed = parseSavedPlan({ ...plan, details: { bankIds: ["banco-a", 3, "", "banco-b", "banco-a"] } });
    expect(parsed?.details).toEqual({ bankIds: ["banco-a", "banco-b"] });
  });

  it("keeps a valid report draft", () => {
    const report = { when: "Hoy", where: "Calle 1", what: "", filed: "yes", number: "DEN-0000" };
    expect(parseSavedPlan({ ...plan, report })?.report).toEqual(report);
  });

  it("keeps a 'No lo sé' plan", () => {
    expect(parseSavedPlan({ version: 1, selection: { assets: [], unknown: true }, done: [] })?.selection.unknown).toBe(
      true,
    );
  });
});
