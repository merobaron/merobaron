import { z } from "astro/zod";
import type { Entity, Guide } from "../domain/content";
import official from "../../content/co/fuentes-oficiales.json";

const isoDate = z
  .union([z.date(), z.iso.date()], {
    error: "Usa una fecha con formato AAAA-MM-DD.",
  })
  .transform((value) => (typeof value === "string" ? value : value.toISOString().slice(0, 10)));

const httpsUrl = z.url({ protocol: /^https$/, error: "Usa un enlace https." });

export function isOfficial(url: string, domains: readonly string[] = official.dominios): boolean {
  const host = new URL(url).hostname;
  return domains.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

const officialUrl = httpsUrl.refine(isOfficial, {
  error: "Usa un enlace de un dominio oficial listado en content/co/fuentes-oficiales.json.",
});

const digits = (value: string): string => value.replace(/\D/g, "");

export function isArchiveOf(archive: string, source: string): boolean {
  const match = /^https:\/\/web\.archive\.org\/web\/\d{14}\/(.+)$/.exec(archive);
  const bare = (url: string) => url.replace(/^https?:\/\//, "");
  return match !== null && bare(match[1]) === bare(source);
}

const entityKind = z.enum(["operador", "banco", "autoridad", "identificacion"]);

const verification = {
  fuente: officialUrl,
  verificado: isoDate,
  vence: isoDate,
  publicado: isoDate.optional(),
};

function checkDates(
  data: { verificado: string; vence: string; publicado?: string },
  ctx: z.RefinementCtx,
): void {
  if (data.publicado && data.publicado > data.verificado) {
    ctx.addIssue({
      code: "custom",
      path: ["publicado"],
      message: "La fecha de publicación no puede ser posterior a la de verificación.",
    });
  }
  if (data.vence <= data.verificado) {
    ctx.addIssue({
      code: "custom",
      path: ["vence"],
      message: "La fecha de vencimiento debe ser posterior a la de verificación.",
    });
  }
}

export const entitySchema = z
  .object({
    id: z.string().min(1),
    nombre: z.string().min(1),
    tipo: entityKind,
    linea_robo: z.string().min(1).optional(),
    enlace: officialUrl.optional(),
    cita: z.string().min(1).optional(),
    archivo: httpsUrl.optional(),
    captura: z
      .string()
      .regex(/^evidencia\/[a-z0-9-]+\.png$/, "Usa una ruta como evidencia/<id>.png.")
      .optional(),
    ...verification,
  })
  .superRefine(checkDates)
  .superRefine((data, ctx) => {
    if (data.cita && data.linea_robo && !digits(data.cita).includes(digits(data.linea_robo))) {
      ctx.addIssue({ code: "custom", path: ["cita"], message: "La cita debe contener la línea de robo." });
    }
    if (data.archivo && !isArchiveOf(data.archivo, data.fuente)) {
      ctx.addIssue({
        code: "custom",
        path: ["archivo"],
        message: "Usa una captura de web.archive.org de la misma fuente.",
      });
    }
  });

export const guideSchema = z
  .object({
    id: z.string().min(1),
    titulo: z.string().min(1),
    urgencia: z.enum(["ahora", "hoy", "esta-semana"]),
    entidad_tipo: entityKind.optional(),
    pasos: z.array(z.string().min(1)).min(1),
    que_decir: z.string().min(1).optional(),
    aviso: z.string().min(1).optional(),
    sin_entidad: z.string().min(1).optional(),
    sin_imei: z.string().min(1).optional(),
    referencia_ejemplo: z.string().min(1).optional(),
    ...verification,
  })
  .superRefine(checkDates);

export type EntityData = z.output<typeof entitySchema>;
export type GuideData = z.output<typeof guideSchema>;

export function toEntity(data: EntityData): Entity {
  return {
    id: data.id,
    name: data.nombre,
    kind: data.tipo,
    theftLine: data.linea_robo,
    link: data.enlace,
    quote: data.cita,
    archive: data.archivo,
    evidence: data.captura && `content/co/${data.captura}`,
    source: data.fuente,
    verifiedOn: data.verificado,
    expiresOn: data.vence,
  };
}

export function toGuide(data: GuideData): Guide {
  return {
    id: data.id,
    title: data.titulo,
    urgency: data.urgencia,
    entityKind: data.entidad_tipo,
    steps: data.pasos,
    whatToSay: data.que_decir,
    notice: data.aviso,
    ifEntityUnknown: data.sin_entidad,
    ifImeiUnknown: data.sin_imei,
    sampleReference: data.referencia_ejemplo,
    source: data.fuente,
    verifiedOn: data.verificado,
    expiresOn: data.vence,
  };
}
