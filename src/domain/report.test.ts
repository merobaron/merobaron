import { describe, expect, it } from "vitest";
import { REPORT_FIELD_MAX_LENGTH, buildReportSummary, emptyReport, parseReport } from "./report";

describe("buildReportSummary", () => {
  it("lists what happened and what was taken", () => {
    const summary = buildReportSummary(
      { ...emptyReport(), when: "Hoy, 7 p. m.", where: "Parque central", what: "Me quitaron el bolso." },
      ["phone", "debit-card"],
    );
    expect(summary).toBe(
      [
        "RESUMEN PARA LA DENUNCIA",
        "",
        "Cuándo pasó: Hoy, 7 p. m.",
        "Dónde pasó: Parque central",
        "Qué pasó: Me quitaron el bolso.",
        "",
        "Qué me robaron:",
        "- Celular",
        "- Tarjeta débito",
      ].join("\n"),
    );
  });

  it("marks empty fields instead of leaving blanks", () => {
    expect(buildReportSummary(emptyReport(), [])).toContain("Cuándo pasó: (sin completar)");
  });

  it("adds the report number only once the person says it was filed", () => {
    const draft = { ...emptyReport(), number: "DEN-0000" };
    expect(buildReportSummary({ ...draft, filed: "no" }, ["phone"])).not.toContain("DEN-0000");
    expect(buildReportSummary({ ...draft, filed: "yes" }, ["phone"])).toContain("Número de la denuncia: DEN-0000");
  });

  it("never claims the report was sent", () => {
    const summary = buildReportSummary({ ...emptyReport(), filed: "yes", number: "DEN-0000" }, ["phone"]);
    expect(summary.toLowerCase()).not.toContain("enviada");
  });
});

describe("parseReport", () => {
  it("drops invalid values and truncates long text", () => {
    const parsed = parseReport({ when: 3, where: "x".repeat(REPORT_FIELD_MAX_LENGTH + 10), filed: "maybe" });
    expect(parsed).toEqual({
      when: "",
      where: "x".repeat(REPORT_FIELD_MAX_LENGTH),
      what: "",
      filed: null,
      number: "",
    });
  });

  it("ignores values that are not objects", () => {
    expect(parseReport("text")).toBeUndefined();
    expect(parseReport(null)).toBeUndefined();
  });
});
