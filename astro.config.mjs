import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";

export default defineConfig({
  site: "https://merobaron.github.io",
  base: "/merobaron",
  integrations: [vue()],
});
