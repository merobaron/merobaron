import { describe, expect, it } from "vitest";
import { changedSources, checkPr } from "./check-one-source.mjs";

const a = { id: "claro", fuente: "https://www.claro.com.co/robo", linea_robo: "1" };
const b = { id: "tigo", fuente: "https://ayuda.tigo.com.co/robo", linea_robo: "2" };

describe("changedSources", () => {
  it("ignores untouched entries", () => {
    expect(changedSources([a, b], [a, b])).toEqual(new Set());
  });

  it("collects the source of added, modified and removed entries", () => {
    expect(changedSources([], [a])).toEqual(new Set([a.fuente]));
    expect(changedSources([a], [{ ...a, linea_robo: "3" }])).toEqual(new Set([a.fuente]));
    expect(changedSources([a, b], [a])).toEqual(new Set([b.fuente]));
  });

  it("counts only the new source when an entry switches source", () => {
    expect(changedSources([a], [{ ...a, fuente: b.fuente }])).toEqual(new Set([b.fuente]));
  });
});

describe("checkPr", () => {
  it("accepts one source and its own domain", () => {
    expect(checkPr(new Set([b.fuente]), ["tigo.com.co"])).toEqual([]);
  });

  it("rejects more than one source", () => {
    expect(checkPr(new Set([a.fuente, b.fuente]), [])).toHaveLength(1);
  });

  it("rejects a domain that does not belong to the source", () => {
    expect(checkPr(new Set([a.fuente]), ["tigo.com.co"])).toHaveLength(1);
    expect(checkPr(new Set(), ["tigo.com.co"])).toHaveLength(1);
  });
});
