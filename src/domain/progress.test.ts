import { describe, expect, it } from "vitest";
import { exampleContent } from "./fixtures";
import { buildPlan } from "./plan";
import { countDone, currentStep, isPlanComplete, markDone, markPending, progressLabel } from "./progress";

const steps = buildPlan({ assets: ["phone", "id-card"], unknown: false }, {}, exampleContent(), "2026-11-02");

describe("progress", () => {
  it("marks a step as done once", () => {
    expect(markDone(markDone([], "phone"), "phone")).toEqual(["phone"]);
  });

  it("marks a step as pending again", () => {
    expect(markPending(["phone", "report"], "phone")).toEqual(["report"]);
  });

  it("describes progress as N de M hechas", () => {
    expect(progressLabel(steps, [])).toBe("0 de 4 hechas");
    expect(progressLabel(steps, ["phone", "passwords"])).toBe("2 de 4 hechas");
  });

  it("ignores done ids that are not in the plan", () => {
    expect(countDone(steps, ["phone", "card"])).toBe(1);
  });

  it("keeps the first pending step as the current one", () => {
    expect(currentStep(steps, [])?.id).toBe("phone");
    expect(currentStep(steps, ["phone"])?.id).toBe("passwords");
    expect(currentStep(steps, ["phone", "passwords", "report", "id-card"])).toBeUndefined();
  });

  it("is complete when every required step is done", () => {
    expect(isPlanComplete(steps, ["phone", "passwords", "report"])).toBe(false);
    expect(isPlanComplete(steps, ["phone", "passwords", "report", "id-card"])).toBe(true);
  });

  it("does not wait for optional steps", () => {
    const idOnly = buildPlan({ assets: ["id-card"], unknown: false }, {}, exampleContent(), "2026-11-02");
    expect(isPlanComplete(idOnly, ["id-card"])).toBe(true);
  });

  it("is never complete without steps", () => {
    expect(isPlanComplete([], [])).toBe(false);
  });
});
