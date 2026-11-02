import { describe, expect, it } from "vitest";
import { continueMessage, selectionLabel } from "./selection";

describe("selectionLabel", () => {
  it.each([
    [0, "Nada seleccionado"],
    [1, "1 seleccionado"],
    [2, "2 seleccionados"],
    [6, "6 seleccionados"],
  ])("describes %i selected items", (count, expected) => {
    expect(selectionLabel(count)).toBe(expected);
  });
});

describe("continueMessage", () => {
  it("asks for a selection when nothing is selected", () => {
    expect(continueMessage(0)).toBe("Selecciona al menos una opción.");
  });

  it("has nothing to say when the selection is valid", () => {
    expect(continueMessage(2)).toBe("");
  });
});
