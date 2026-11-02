import type { Content, Entity, Guide } from "./content";

const verified = {
  source: "https://ejemplo.com/fuente",
  verifiedOn: "2026-11-01",
  expiresOn: "2027-02-01",
};

function entity(id: string, kind: Entity["kind"], overrides: Partial<Entity> = {}): Entity {
  return { id, name: id, kind, theftLine: "000 000 0000", ...verified, ...overrides };
}

function guide(id: string, urgency: Guide["urgency"], overrides: Partial<Guide> = {}): Guide {
  return { id, title: id, urgency, steps: [`Paso de ${id}`], ...verified, ...overrides };
}

/** Example content for tests. Mirrors the shape of content/co/*.yaml. */
export function exampleContent(): Content {
  return {
    entities: [
      entity("operador-a", "operador"),
      entity("operador-c", "operador", { verifiedOn: "2026-05-01", expiresOn: "2026-08-01" }),
      entity("banco-a", "banco"),
      entity("portal-denuncias", "autoridad"),
      entity("entidad-identificacion", "identificacion"),
    ],
    guides: [
      guide("documents", "esta-semana"),
      guide("id-card", "esta-semana", { entityKind: "identificacion" }),
      guide("report", "hoy", { entityKind: "autoridad", sampleReference: "DEN-0000" }),
      guide("passwords", "hoy"),
      guide("card", "ahora", { entityKind: "banco", ifEntityUnknown: "Busca tu banco." }),
      guide("phone", "ahora", {
        entityKind: "operador",
        ifEntityUnknown: "Busca tu operador.",
        ifImeiUnknown: "Busca el IMEI en la caja.",
      }),
      guide("general", "ahora"),
    ],
  };
}
