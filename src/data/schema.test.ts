import { describe, expect, it } from "vitest";
import { parseDocument } from "yaml";
import entitiesSource from "../../content/co/entidades.yaml?raw";
import guidesSource from "../../content/co/guias.yaml?raw";
import { entitySchema, guideSchema, isArchiveOf, isOfficial, toEntity, toGuide } from "./schema";

// Same parser options Astro's file() loader uses, so dates arrive as Date objects.
function parseYaml(source: string): Record<string, unknown>[] {
  return parseDocument(source, { customTags: ["timestamp"], merge: true, schema: "core" }).toJS();
}

const entities = parseYaml(entitiesSource);
const screenshots = Object.keys(import.meta.glob("../../content/co/evidencia/*.png"));
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

  it("only links screenshots that exist in the repository", () => {
    for (const entry of entities) {
      if (entry.captura !== undefined) expect(screenshots).toContain(`../../content/co/${entry.captura}`);
    }
  });

  it("has a guide for every plan step", () => {
    const ids = guides.map((guide) => guide.id);
    expect(ids).toEqual(
      expect.arrayContaining(["phone", "card", "passwords", "report", "id-card", "documents", "general"]),
    );
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

  it("accepts a publication date on or before the verification date", () => {
    expect(entitySchema.safeParse({ ...validEntity, publicado: new Date("2024-02-08") }).success).toBe(true);
    expect(entitySchema.safeParse({ ...validEntity, publicado: new Date("2026-11-01") }).success).toBe(true);
  });

  it("rejects a publication date after the verification date", () => {
    expect(entitySchema.safeParse({ ...validEntity, publicado: new Date("2026-11-02") }).success).toBe(false);
  });

  it("accepts a quote that contains the theft line, whatever its spacing", () => {
    const entry = { ...validEntity, cita: "Llama a la línea (+57) 000 0000000 opción 3" };
    expect(entitySchema.safeParse(entry).success).toBe(true);
  });

  it("rejects a quote without the theft line", () => {
    expect(entitySchema.safeParse({ ...validEntity, cita: "Llama a la línea 000 000 0001" }).success).toBe(false);
  });

  it("accepts a Wayback Machine capture of the same source only", () => {
    const capture = "https://web.archive.org/web/20261104120000/https://ejemplo.com/soporte";
    expect(entitySchema.safeParse({ ...validEntity, archivo: capture }).success).toBe(true);
    const other = "https://web.archive.org/web/20261104120000/https://ejemplo.com/otra";
    expect(entitySchema.safeParse({ ...validEntity, archivo: other }).success).toBe(false);
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

describe("isArchiveOf", () => {
  it("matches the capture regardless of http or https in the archived URL", () => {
    const source = "https://www.claro.com.co/robo/";
    expect(isArchiveOf("https://web.archive.org/web/20261104120000/http://www.claro.com.co/robo/", source)).toBe(true);
    expect(isArchiveOf("https://web.archive.org/web/2026/https://www.claro.com.co/robo/", source)).toBe(false);
    expect(isArchiveOf("https://archive.ph/web/20261104120000/https://www.claro.com.co/robo/", source)).toBe(false);
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
