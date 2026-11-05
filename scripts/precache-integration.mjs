import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SERVICE_WORKER = "sw.js";

/** Normalizes Astro's base ("/merobaron" or "/merobaron/") to "/merobaron/". */
export function normalizeBase(base) {
  return `/${base.replace(/^\/+|\/+$/g, "")}/`.replace("//", "/");
}

/**
 * URLs the service worker precaches: the page itself plus every built file,
 * except the service worker, source maps and evidence screenshots (heavy, rarely opened offline).
 */
export function buildManifest(files, base) {
  const root = normalizeBase(base);
  const urls = files
    .filter((file) => file !== SERVICE_WORKER && !file.endsWith(".map") && !file.endsWith(".png"))
    .map((file) => (file === "index.html" ? root : `${root}${file}`));
  return [...new Set(urls)].sort();
}

/** Fills the manifest and cache version placeholders in the hand-written public/sw.js. */
export function fillServiceWorker(source, manifest) {
  const version = createHash("sha256").update(JSON.stringify(manifest)).digest("hex").slice(0, 12);
  return source
    .replace('"__PRECACHE_MANIFEST__"', JSON.stringify(manifest))
    .replace("__CACHE_VERSION__", version);
}

async function listFiles(dir, root = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? listFiles(path, root) : [relative(root, path).split(sep).join("/")];
    }),
  );
  return nested.flat();
}

/** Astro integration: writes the precache manifest into dist/sw.js after the build. */
export default function precache() {
  let base = "/";
  return {
    name: "merobaron-precache",
    hooks: {
      "astro:config:done": ({ config }) => {
        base = config.base;
      },
      "astro:build:done": async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const manifest = buildManifest(await listFiles(outDir), base);
        const swPath = join(outDir, SERVICE_WORKER);
        await writeFile(swPath, fillServiceWorker(await readFile(swPath, "utf8"), manifest));
        logger.info(`Precache manifest with ${manifest.length} URLs written to ${SERVICE_WORKER}`);
      },
    },
  };
}
