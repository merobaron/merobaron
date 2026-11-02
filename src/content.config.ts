import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { entitySchema, guideSchema } from "./data/schema";

const entidades = defineCollection({
  loader: file("content/co/entidades.yaml"),
  schema: entitySchema,
});

const guias = defineCollection({
  loader: file("content/co/guias.yaml"),
  schema: guideSchema,
});

export const collections = { entidades, guias };
