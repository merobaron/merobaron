import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";
import { readChanges } from "./check-one-source.mjs";

const [base, out = "screenshots"] = process.argv.slice(2);
if (!base) {
  console.error("Uso: node scripts/screenshot-sources.mjs <base-ref> [carpeta]");
  process.exit(2);
}

const warn = (message) => console.log(`::warning title=Captura de fuente::${message}`);
const entries = readChanges(base).entries.filter((entry) => !new URL(entry.fuente).hostname.endsWith("ejemplo.com"));
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();

for (const entry of entries) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const file = `${out}/${entry.id}.png`;
  try {
    const response = await page.goto(entry.fuente, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(3_000);
    await page
      .locator("button, [role=button], a")
      .filter({ hasText: /^\s*rechazar( todo| todas)?\s*$/i, visible: true })
      .first()
      .click({ timeout: 5_000 })
      .catch(() => {});
    await page.evaluate(() => {
      for (const node of document.querySelectorAll("body *")) {
        const { position } = getComputedStyle(node);
        if ((position === "fixed" || position === "sticky") && /cookie/i.test(node.textContent ?? "")) {
          node.style.display = "none";
        }
      }
    });
    for (const toggle of await page
      .locator('[aria-expanded="false"], summary, button:has(h2, h3, h4)')
      .filter({ hasText: /robo|p[ée]rdida/i, visible: true })
      .all()) {
      await toggle.click({ timeout: 2_000 }).catch(() => {});
    }
    if (!response || response.status() >= 400) {
      warn(`${entry.id}: la fuente respondió ${response?.status() ?? "sin respuesta"}. Verifícala a mano.`);
    } else if (!entry.cita) {
      warn(`${entry.id}: no tiene cita; la captura muestra solo el inicio de la página.`);
    } else {
      const quote = page.getByText(entry.cita).filter({ visible: true }).first();
      if ((await quote.count()) === 0) {
        const hidden = await page.getByText(entry.cita).count();
        warn(`${entry.id}: ${hidden ? "la cita está oculta (¿acordeón cerrado?)" : "la cita no aparece en la fuente. ¿Cambió la página?"}`);
      } else {
        await quote.scrollIntoViewIfNeeded();
        await quote.evaluate((node) => {
          node.style.outline = "4px solid #e00";
          node.style.outlineOffset = "4px";
        });
        console.log(`${entry.id}: cita encontrada.`);
      }
    }
    await page.evaluate((stamp) => {
      const bar = document.createElement("div");
      bar.textContent = stamp;
      bar.style.cssText =
        "position:fixed;left:0;right:0;bottom:0;z-index:2147483647;padding:6px 10px;background:#000;color:#fff;font:13px monospace";
      document.body.append(bar);
    }, `${entry.fuente} · ${new Date().toISOString()}`);
    await page.screenshot({ path: file });
  } catch (error) {
    warn(`${entry.id}: no se pudo abrir la fuente (${error.message.split("\n")[0]}).`);
  } finally {
    await page.close();
  }
}

await browser.close();
