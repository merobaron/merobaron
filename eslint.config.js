import js from "@eslint/js";
import tseslint from "typescript-eslint";
import vue from "eslint-plugin-vue";
import astro from "eslint-plugin-astro";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist/", ".astro/", "src/ui/tokens.css"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  vue.configs["flat/recommended"],
  astro.configs.recommended,
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  // TypeScript already checks undefined names (incl. Astro ambient types like ImageMetadata).
  { files: ["**/*.ts", "**/*.vue", "**/*.astro"], rules: { "no-undef": "off" } },
  prettier,
);
