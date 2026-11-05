import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { parse } from "yaml";

export function changedEntries(before, after) {
  const byId = (entries) => new Map(entries.map((entry) => [entry.id, entry]));
  const old = byId(before);
  const now = byId(after);
  const changed = [];
  for (const id of new Set([...old.keys(), ...now.keys()])) {
    const a = old.get(id);
    const b = now.get(id);
    if (JSON.stringify(a) !== JSON.stringify(b)) changed.push(b ?? a);
  }
  return changed;
}

export function changedSources(before, after) {
  return new Set(changedEntries(before, after).map((entry) => entry.fuente));
}

export function checkPr(sources, addedDomains) {
  const errors = [];
  if (sources.size > 1) {
    errors.push(
      `Este PR cambia datos de ${sources.size} fuentes. Abre un PR por fuente:\n  ${[...sources].join("\n  ")}`,
    );
  }
  const [source] = sources;
  const host = source ? new URL(source).hostname : undefined;
  for (const domain of addedDomains) {
    if (!host || !(host === domain || host.endsWith(`.${domain}`))) {
      errors.push(`El dominio ${domain} debe agregarse en el mismo PR que la fuente que lo usa.`);
    }
  }
  return errors;
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}

function atBase(base, path) {
  try {
    return git("show", `${base}:${path}`);
  } catch {
    return undefined; // the file is new in this PR
  }
}

export function readChanges(base) {
  const changed = git("diff", "--name-only", base, "--", "content").split("\n").filter(Boolean);
  const entries = [];
  const addedDomains = [];
  for (const path of changed) {
    const before = atBase(base, path);
    const after = existsSync(path) ? readFileSync(path, "utf8") : undefined;
    if (path.endsWith("fuentes-oficiales.json")) {
      const old = new Set(before ? JSON.parse(before).dominios : []);
      addedDomains.push(...(after ? JSON.parse(after).dominios : []).filter((domain) => !old.has(domain)));
    } else if (path.endsWith(".yaml")) {
      entries.push(...changedEntries(parse(before ?? "[]") ?? [], parse(after ?? "[]") ?? []));
    }
  }
  return { entries, addedDomains };
}

function main(base) {
  const { entries, addedDomains } = readChanges(base);
  const sources = new Set(entries.map((entry) => entry.fuente));
  const errors = checkPr(sources, addedDomains);
  for (const error of errors) console.error(error);
  if (errors.length > 0) process.exit(1);
  console.log(sources.size === 0 ? "Sin cambios en datos publicados." : `Fuente del PR: ${[...sources][0]}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2]) {
    console.error("Uso: node scripts/check-one-source.mjs <base-ref>");
    process.exit(2);
  }
  main(process.argv[2]);
}
