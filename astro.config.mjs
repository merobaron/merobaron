import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import precache from "./scripts/precache-integration.mjs";

export default defineConfig({
  site: "https://merobaron.co",
  integrations: [vue(), precache()],
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
      ],
    },
  },
});
