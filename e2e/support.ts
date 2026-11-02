import AxeBuilder from "@axe-core/playwright";
import { expect, test as base, type Page } from "@playwright/test";

export const STORAGE_KEY = "merobaron:plan:v1";

/** Fails a test if the page requests anything outside the site. */
export const test = base.extend<{ externalRequests: string[] }>({
  externalRequests: [
    async ({ page, baseURL }, use) => {
      const origin = new URL(baseURL ?? "").origin;
      const external: string[] = [];
      page.on("request", (request) => {
        if (!request.url().startsWith(origin) && !request.url().startsWith("data:")) external.push(request.url());
      });
      await use(external);
      expect(external, "external requests").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export async function openHome(page: Page): Promise<void> {
  await page.goto("./");
  await expect(page.locator("[data-ready]")).toBeAttached();
}

export async function expectAccessible(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
}

export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

export async function expectScreen(page: Page, hash: string, heading: string | RegExp): Promise<void> {
  await expect(page).toHaveURL(new RegExp(`${hash.replace(/[/#]/g, "\\$&")}$`));
  const title = page.locator("[data-screen-heading]");
  await expect(title).toHaveText(heading);
  await expect(title).toBeFocused();
}

export async function storageKeys(page: Page): Promise<string[]> {
  return page.evaluate(() => Object.keys(window.localStorage));
}

export async function choose(page: Page, ...assets: RegExp[]): Promise<void> {
  for (const asset of assets) await page.locator("label.option").filter({ hasText: asset }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
}
