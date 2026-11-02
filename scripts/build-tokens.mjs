import { readFile, writeFile } from "node:fs/promises";

const tokensUrl = new URL("../tokens/tokens.json", import.meta.url);
const outputUrl = new URL("../src/ui/tokens.css", import.meta.url);

const tokens = JSON.parse(await readFile(tokensUrl, "utf8"));

function toCssValue(name, value) {
  if (name.startsWith("font-")) return `"${value}", sans-serif`;
  if (name.startsWith("motion-")) return `${value}ms`;
  if (typeof value === "number") return `${value}px`;
  return value;
}

const declarations = Object.entries(tokens)
  .map(([name, value]) => `  --${name}: ${toCssValue(name, value)};`)
  .join("\n");

await writeFile(outputUrl, `:root {\n${declarations}\n}\n`);
