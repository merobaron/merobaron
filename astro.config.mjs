import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import precache from "./scripts/precache-integration.mjs";

export default defineConfig({
  site: "https://merobaron.github.io",
  base: "/merobaron",
  integrations: [vue(), precache()],
});
