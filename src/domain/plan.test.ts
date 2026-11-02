import { describe, expect, it } from "vitest";
import { exampleContent } from "./fixtures";
import { buildPlan, needsDetails, type AssetId, type Details } from "./plan";

const TODAY = "2026-11-02";

function plan(assets: AssetId[], details: Details = {}, unknown = false) {
  return buildPlan({ assets, unknown }, details, exampleContent(), TODAY);
}

describe("buildPlan", () => {
  it("orders steps by urgency with the phone first", () => {
    const ids = plan(["documents", "id-card", "email", "credit-card", "phone"]).map((step) => step.id);
    expect(ids).toEqual(["phone", "card", "passwords", "report", "id-card", "documents"]);
  });

  it("keeps the phone first even if its guide is less urgent", () => {
    const content = exampleContent();
    content.guides = content.guides.map((guide) => (guide.id === "phone" ? { ...guide, urgency: "hoy" } : guide));
    const ids = buildPlan({ assets: ["credit-card", "phone"], unknown: false }, {}, content, TODAY).map((s) => s.id);
    expect(ids[0]).toBe("phone");
  });

  it("merges credit and debit cards into one card step", () => {
    const ids = plan(["credit-card", "debit-card"]).map((step) => step.id);
    expect(ids).toEqual(["card", "report"]);
  });

  it("adds a passwords step when the phone was taken", () => {
    expect(plan(["phone"]).map((step) => step.id)).toContain("passwords");
  });

  it("maps 'No lo sé' to the general guide", () => {
    expect(plan([], {}, true).map((step) => step.id)).toEqual(["general"]);
  });

  it("maps an empty selection to the general guide", () => {
    expect(plan([]).map((step) => step.id)).toEqual(["general"]);
  });

  it("suggests the report without requiring it when only the ID card was taken", () => {
    const report = plan(["id-card"]).find((step) => step.id === "report");
    expect(report?.optional).toBe(true);
  });

  it("requires the report when the phone or a card was taken", () => {
    expect(plan(["phone", "id-card"]).find((step) => step.id === "report")?.optional).toBe(false);
    expect(plan(["debit-card"]).find((step) => step.id === "report")?.optional).toBe(false);
  });

  it("uses the chosen operator", () => {
    const phone = plan(["phone"], { operatorId: "operador-a" })[0];
    expect(phone.entity?.id).toBe("operador-a");
    expect(phone.expired).toBe(false);
  });

  it("flags a step whose entity has expired", () => {
    const phone = plan(["phone"], { operatorId: "operador-c" })[0];
    expect(phone.entity?.id).toBe("operador-c");
    expect(phone.expired).toBe(true);
  });

  it("flags a step whose guide has expired", () => {
    const content = exampleContent();
    content.guides = content.guides.map((guide) =>
      guide.id === "passwords" ? { ...guide, verifiedOn: "2026-01-01", expiresOn: "2026-06-01" } : guide,
    );
    const steps = buildPlan({ assets: ["email"], unknown: false }, {}, content, TODAY);
    expect(steps.find((step) => step.id === "passwords")?.expired).toBe(true);
  });

  it("explains what to do when the operator is unknown", () => {
    const phone = plan(["phone"], { operatorId: "unknown" })[0];
    expect(phone.entity).toBeUndefined();
    expect(phone.instructions[0]).toBe("Busca tu operador.");
  });

  it("explains where to find the IMEI when the person does not have it", () => {
    const phone = plan(["phone"], { operatorId: "operador-a", imei: "no" })[0];
    expect(phone.instructions.at(-1)).toBe("Busca el IMEI en la caja.");
    expect(plan(["phone"], { operatorId: "operador-a", imei: "yes" })[0].instructions).not.toContain(
      "Busca el IMEI en la caja.",
    );
  });

  it("links the report to the authority without asking for it", () => {
    const report = plan(["phone"]).find((step) => step.id === "report");
    expect(report?.entity?.id).toBe("portal-denuncias");
    expect(report?.sampleReference).toBe("DEN-0000");
  });
});

describe("needsDetails", () => {
  it("asks for details only for the phone and cards", () => {
    expect(needsDetails({ assets: ["phone"], unknown: false })).toBe(true);
    expect(needsDetails({ assets: ["debit-card"], unknown: false })).toBe(true);
    expect(needsDetails({ assets: ["email", "id-card"], unknown: false })).toBe(false);
    expect(needsDetails({ assets: [], unknown: true })).toBe(false);
  });
});
