import { describe, expect, it } from "vitest";
import { parseDocument } from "yaml";
import entitiesSource from "../../content/co/entidades.yaml?raw";
import guidesSource from "../../content/co/guias.yaml?raw";
import { entitySchema, guideSchema, isOfficial, toEntity, toGuide } from "./schema";

// Same parser options Astro's file() loader uses, so dates arrive as Date objects.
function parseYaml(source: string): Record<string, unknown>[] {
  return parseDocument(source, { customTags: ["timestamp"], merge: true, schema: "core" }).toJS();
}

const entities = parseYaml(entitiesSource);
const guides = parseYaml(guidesSource);

const validEntity = {
  id: "operador-a",
  nombre: "Operador A",
  tipo: "operador",
  linea_robo: "000 000 0000",
  fuente: "https://ejemplo.com/soporte",
  verificado: new Date("2026-11-01"),
  vence: new Date("2027-02-01"),
};

describe("content files", () => {
  it.each(entities.map((entry) => [entry.id, entry]))("entity %s matches the schema", (_, entry) => {
    expect(entitySchema.safeParse(entry).success).toBe(true);
  });

  it.each(guides.map((entry) => [entry.id, entry]))("guide %s matches the schema", (_, entry) => {
    expect(guideSchema.safeParse(entry).success).toBe(true);
  });

  it("has a guide for every plan step", () => {
    const ids = guides.map((guide) => guide.id);
    expect(ids).toEqual(
      expect.arrayContaining(["phone", "card", "passwords", "report", "id-card", "documents", "general"]),
    );
  });

  it("only contains example data", () => {
    for (const entry of [...entities, ...guides]) {
      for (const key of ["fuente", "enlace"]) {
        if (entry[key] !== undefined) expect(new URL(String(entry[key])).hostname).toBe("ejemplo.com");
      }
      if (entry.linea_robo !== undefined) expect(entry.linea_robo).toMatch(/^000 000 000\d$/);
    }
  });
});

describe("entitySchema", () => {
  it.each(["fuente", "verificado", "vence"])("rejects an entry without %s", (field) => {
    const entry: Record<string, unknown> = { ...validEntity };
    delete entry[field];
    expect(entitySchema.safeParse(entry).success).toBe(false);
  });

  it("rejects a source that is not https", () => {
    expect(entitySchema.safeParse({ ...validEntity, fuente: "http://ejemplo.com" }).success).toBe(false);
  });

  it.each(["fuente", "enlace"])("rejects %s outside the official domains", (field) => {
    const entry = { ...validEntity, [field]: "https://ejemplo.com.estafa.co/soporte" };
    expect(entitySchema.safeParse(entry).success).toBe(false);
  });

  it("rejects an expiry date that is not after the verification date", () => {
    const entry = { ...validEntity, vence: new Date("2026-10-01") };
    expect(entitySchema.safeParse(entry).success).toBe(false);
  });

  it("accepts quoted ISO dates", () => {
    const entry = { ...validEntity, verificado: "2026-11-01", vence: "2027-02-01" };
    expect(entitySchema.safeParse(entry).success).toBe(true);
  });

  it("maps to a serializable entity with ISO dates", () => {
    expect(toEntity(entitySchema.parse(validEntity))).toEqual({
      id: "operador-a",
      name: "Operador A",
      kind: "operador",
      theftLine: "000 000 0000",
      link: undefined,
      source: "https://ejemplo.com/soporte",
      verifiedOn: "2026-11-01",
      expiresOn: "2027-02-01",
    });
  });
});

describe("isOfficial", () => {
  it("accepts the domain and its subdomains, not lookalikes", () => {
    expect(isOfficial("https://gov.co/a", ["gov.co"])).toBe(true);
    expect(isOfficial("https://www.policia.gov.co/a", ["gov.co"])).toBe(true);
    expect(isOfficial("https://falsogov.co/a", ["gov.co"])).toBe(false);
    expect(isOfficial("https://gov.co.estafa.com/a", ["gov.co"])).toBe(false);
  });
});

describe("guideSchema", () => {
  it("rejects a guide with a source outside the official domains", () => {
    expect(guideSchema.safeParse({ ...guides[0], fuente: "https://blog.com/robo" }).success).toBe(false);
  });


  it("rejects a guide without steps", () => {
    const guide = { ...guides[0], pasos: [] };
    expect(guideSchema.safeParse(guide).success).toBe(false);
  });

  it("maps to a guide with English keys", () => {
    const guide = toGuide(guideSchema.parse(guides[0]));
    expect(guide).toMatchObject({ id: "phone", urgency: "ahora", entityKind: "operador" });
    expect(guide.steps.length).toBeGreaterThan(0);
  });
});
