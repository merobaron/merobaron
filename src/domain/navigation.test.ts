import { describe, expect, it } from "vitest";
import { parseHash, resolveRoute, sameRoute, toHash } from "./navigation";

describe("parseHash", () => {
  it.each([
    ["", { screen: "inicio" }],
    ["#/", { screen: "inicio" }],
    ["#/plan", { screen: "plan" }],
    ["#/paso/phone", { screen: "paso", stepId: "phone" }],
    ["#/paso/unknown-step", { screen: "plan" }],
    ["#/nope", { screen: "inicio" }],
    ["#que-se-llevaron", { screen: "inicio" }],
  ])("parses %s", (hash, route) => {
    expect(parseHash(hash)).toEqual(route);
  });
});

describe("toHash", () => {
  it("round-trips routes", () => {
    for (const hash of ["#/", "#/emergencia", "#/selector", "#/detalles", "#/plan", "#/paso/card", "#/denuncia", "#/borrar", "#/completo"]) {
      expect(toHash(parseHash(hash))).toBe(hash);
    }
  });
});

describe("resolveRoute", () => {
  it("sends the person to the selector when there is no selection", () => {
    expect(resolveRoute({ screen: "plan" }, false, [])).toEqual({ screen: "selector" });
    expect(resolveRoute({ screen: "denuncia" }, false, [])).toEqual({ screen: "selector" });
  });

  it("keeps screens that need no selection", () => {
    expect(resolveRoute({ screen: "selector" }, false, [])).toEqual({ screen: "selector" });
    expect(resolveRoute({ screen: "emergencia" }, false, [])).toEqual({ screen: "emergencia" });
    expect(resolveRoute({ screen: "borrar" }, false, [])).toEqual({ screen: "borrar" });
  });

  it("sends a step that is not in the plan back to the plan", () => {
    expect(resolveRoute({ screen: "paso", stepId: "card" }, true, ["phone"])).toEqual({ screen: "plan" });
  });

  it("keeps a valid step", () => {
    expect(resolveRoute({ screen: "paso", stepId: "phone" }, true, ["phone"])).toEqual({
      screen: "paso",
      stepId: "phone",
    });
  });
});

describe("sameRoute", () => {
  it("compares screen and step", () => {
    expect(sameRoute({ screen: "paso", stepId: "phone" }, { screen: "paso", stepId: "phone" })).toBe(true);
    expect(sameRoute({ screen: "paso", stepId: "phone" }, { screen: "paso", stepId: "card" })).toBe(false);
  });
});
