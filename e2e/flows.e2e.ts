import {
  STORAGE_KEY,
  choose,
  expect,
  expectAccessible,
  expectNoHorizontalScroll,
  expectScreen,
  openHome,
  storageKeys,
  test,
} from "./support";

test.describe("A. main flow", () => {
  test("goes from what was taken to a complete plan", async ({ page }) => {
    await openHome(page);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    await expectAccessible(page);
    await expectNoHorizontalScroll(page);

    await page.getByRole("button", { name: "Empezar" }).click();
    await expectScreen(page, "#/selector", "¿QUÉ SE LLEVARON?");
    await expectAccessible(page);
    await expectNoHorizontalScroll(page);

    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByRole("alert")).toHaveText("Selecciona al menos una opción.");

    await choose(page, /CELULAR/, /TARJETA DE CRÉDITO/);
    await expectScreen(page, "#/detalles", "DETALLES");
    await page.getByLabel("Claro", { exact: true }).check();
    await page.getByLabel("Bancolombia", { exact: true }).check();
    await expectAccessible(page);
    await expectNoHorizontalScroll(page);
    await page.getByRole("button", { name: "Ver mi plan" }).click();

    await expectScreen(page, "#/plan", "TU PLAN");
    const titles = page.locator(".item__title");
    await expect(titles).toHaveText(["Bloquea tu SIM", "Bloquea tu tarjeta de Bancolombia", "Cambia tus claves", "Pon la denuncia"]);
    await expect(page.locator(".summary__label")).toHaveText("0 de 4 hechas");
    // Only the current step is open, with its official data.
    await expect(page.locator(".item__body")).toHaveCount(1);
    const current = page.locator(".item--current");
    await expect(current.getByRole("heading", { name: "Datos oficiales" })).toBeVisible();
    await expect(current.getByText("311 200 0000")).toBeVisible();
    await expect(current.getByRole("link", { name: "Llamar a Claro: 311 200 0000" })).toHaveAttribute("href", "tel:3112000000");
    const screenshot = current.getByRole("img", { name: /Captura de la fuente de Claro/ });
    await expect(screenshot).toHaveCount(0);
    await current.getByRole("button", { name: "Ver captura de la fuente" }).click();
    await expect(screenshot).toBeVisible();
    await expectAccessible(page);
    await expectNoHorizontalScroll(page);

    await current.getByRole("button", { name: "Marcar como hecho" }).click();
    await expect(page.locator(".summary__label")).toHaveText("1 de 4 hechas");
    await expect(page.locator(".item--current .item__title")).toHaveText("Bloquea tu tarjeta de Bancolombia");
    await expect(page.locator(".item--current .item__title")).toBeFocused();

    await page.getByRole("button", { name: "Ver paso: Cambia tus claves" }).click();
    await expectScreen(page, "#/paso/passwords", "CAMBIA TUS CLAVES");
    await expectAccessible(page);
    await page.getByRole("button", { name: "Marcar como hecho" }).click();
    await expectScreen(page, "#/plan", "TU PLAN");

    await page.locator(".item--current").getByRole("button", { name: "Marcar como hecho" }).click();
    await page.locator(".item--current").getByRole("button", { name: "Ver paso", exact: true }).click();
    await expectScreen(page, "#/paso/report", "PON LA DENUNCIA");
    await page.getByRole("button", { name: "Ya la puse" }).click();
    await expectScreen(page, "#/completo", "PLAN COMPLETO");
    await expectAccessible(page);

    // The back button walks the screen history.
    await page.goBack();
    await expectScreen(page, "#/paso/report", "PON LA DENUNCIA");
    expect(await storageKeys(page)).toEqual([STORAGE_KEY]);
  });

  test("warns about expired data instead of showing it as current", async ({ page }) => {
    // Every entry has expired by then; real data is never expired on purpose.
    await page.clock.setFixedTime(new Date("2027-03-01T12:00:00"));
    await openHome(page);
    await page.getByRole("button", { name: "Empezar" }).click();
    await choose(page, /CELULAR/);
    await page.getByLabel(/^Claro/).check();
    await page.getByRole("button", { name: "Ver mi plan" }).click();
    const current = page.locator(".item--current");
    await expect(current.getByText("Dato vencido.")).toBeVisible();
    await expect(current.getByText("Vencido", { exact: true })).toBeVisible();
    await expect(current.getByText(/Busca el IMEI de tu celular/)).toBeVisible();
  });
});

test("B. stolen phone shortcut continues into the main flow", async ({ page }) => {
  await openHome(page);
  await page.getByRole("button", { name: "Bloquear mi línea" }).click();
  await expectScreen(page, "#/emergencia", "BLOQUEA TU LÍNEA");
  await page.getByLabel("Tigo", { exact: true }).check();
  await expect(page.getByRole("heading", { name: "Llama a Tigo" })).toBeVisible();
  await expect(page.getByText("01 8000 422 222")).toBeVisible();
  await expectAccessible(page);
  await expectNoHorizontalScroll(page);

  await page.getByRole("button", { name: "Ya bloqueé mi línea" }).click();
  await expectScreen(page, "#/selector", "¿QUÉ SE LLEVARON?");
  await expect(page.getByText("Ya bloqueaste tu línea.")).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "CELULAR" })).toBeChecked();

  await choose(page, /CORREO Y REDES/);
  await expect(page.getByLabel("Tigo", { exact: true })).toBeChecked();
  await page.getByRole("button", { name: "Ver mi plan" }).click();
  await expect(page.locator(".summary__label")).toHaveText("1 de 3 hechas");
  await expect(page.locator(".item--current .item__title")).toHaveText("Cambia tus claves");
});

test("C. 'No lo sé' shows the general guide", async ({ page }) => {
  await openHome(page);
  await page.getByRole("button", { name: "Empezar" }).click();
  await page.getByRole("button", { name: "No lo sé, muéstrame lo básico" }).click();
  await expectScreen(page, "#/plan", "TU PLAN");
  await expect(page.locator(".item__title")).toHaveText(["Guía general"]);
  await expectAccessible(page);
  await page.getByRole("button", { name: "Elegir qué se llevaron" }).click();
  await expectScreen(page, "#/selector", "¿QUÉ SE LLEVARON?");
});

test("D. report summary is copied, never claimed as sent", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openHome(page);
  await page.getByRole("button", { name: "Empezar" }).click();
  await choose(page, /CÉDULA/);
  await expect(page.locator(".item--current .item__title")).toHaveText("Pon la denuncia");
  await expect(page.locator(".item--current").getByText("Recomendado")).toBeVisible();
  await page.getByRole("button", { name: "Preparar el resumen" }).click();
  await expectScreen(page, "#/denuncia", "PREPARA TU DENUNCIA");

  await page.getByLabel("¿Cuándo pasó?").fill("Hoy, 7 p. m.");
  await page.getByLabel("¿Dónde pasó?").fill("Parque central");
  await page.getByLabel("¿Qué pasó?").fill("Me quitaron el bolso.");
  const summary = page.getByLabel("Resumen para la denuncia");
  await expect(summary).toContainText("Qué me robaron:\n- Cédula");
  await page.getByRole("button", { name: "Copiar resumen" }).click();
  await expect(page.getByText("Resumen copiado.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("Dónde pasó: Parque central");
  await expectAccessible(page);
  await expectNoHorizontalScroll(page);

  await expect(page.getByRole("group", { name: "¿Ya la pusiste?" })).toBeVisible();
  await page.getByLabel("Sí, ya la puse").check();
  await page.getByLabel(/Número de la denuncia/).fill("DEN-0000");
  await page.getByRole("button", { name: "Marcar como hecha y volver al plan" }).click();
  await expectScreen(page, "#/plan", "TU PLAN");
  await expect(page.getByText(/enviada/i)).toHaveCount(0);
});

test("E. a saved plan resumes after reload", async ({ page }) => {
  await openHome(page);
  await page.getByRole("button", { name: "Empezar" }).click();
  await choose(page, /CORREO Y REDES/, /CÉDULA/);
  await page.locator(".item--current").getByRole("button", { name: "Marcar como hecho" }).click();
  await expect(page.locator(".summary__label")).toHaveText("1 de 3 hechas");

  await page.reload();
  await expect(page.locator("[data-ready]")).toBeAttached();
  await expect(page).toHaveURL(/#\/plan$/);
  await expect(page.locator(".summary__label")).toHaveText("1 de 3 hechas");

  await page.goto("./");
  await expect(page.locator("[data-ready]")).toBeAttached();
  await expect(page.getByText("TIENES UN PLAN GUARDADO EN ESTE DISPOSITIVO")).toBeVisible();
  await expectAccessible(page);
  await page.getByRole("button", { name: "Continuar mi plan" }).click();
  await expectScreen(page, "#/plan", "TU PLAN");
});

test("F. delete removes everything from the device", async ({ page }) => {
  await openHome(page);
  await page.getByRole("button", { name: "Empezar" }).click();
  await choose(page, /OTROS DOCUMENTOS/);
  expect(await storageKeys(page)).toEqual([STORAGE_KEY]);

  await page.getByRole("button", { name: "Borrar mis datos" }).click();
  await expectScreen(page, "#/borrar", "BORRAR MIS DATOS");
  await expect(page.getByText(/teléfono prestado/)).toBeVisible();
  await expectAccessible(page);
  await page.getByRole("button", { name: "Sí, borrar todo" }).click();

  await expect(page.locator(".flash")).toHaveText("Borramos tus datos de este dispositivo.");
  expect(await storageKeys(page)).toEqual([]);
  await expect(page.getByText("TIENES UN PLAN GUARDADO EN ESTE DISPOSITIVO")).toHaveCount(0);
  await page.goto("./#/plan");
  await expect(page.locator("[data-ready]")).toBeAttached();
  await expect(page).toHaveURL(/#\/selector$/);
});

test.describe("G. errors and offline", () => {
  test("works when storage is blocked", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new Error("SecurityError");
        },
      });
    });
    await openHome(page);
    await page.getByRole("button", { name: "Empezar" }).click();
    await choose(page, /CELULAR/);
    await page.getByRole("button", { name: "Ver mi plan" }).click();
    await expect(page.getByText("No pudimos guardar tu plan en este dispositivo.")).toBeVisible();
  });

  test("shows the basic steps when the app cannot load", async ({ page }) => {
    await page.route(/\/_astro\/.*\.js/, (route) => route.abort());
    await page.goto("./");
    await expect(page.locator("#app-fallback")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("#app-fallback li").first()).toBeVisible();
    await expect(page.locator("#app-fallback").getByRole("link", { name: "Reintentar" })).toBeVisible();
  });

  test.describe("with the service worker", () => {
    test.use({ serviceWorkers: "allow" });

    test("reopens the saved plan offline", async ({ page, context }) => {
      await openHome(page);
      await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
      });
      await page.getByRole("button", { name: "Empezar" }).click();
      await choose(page, /CORREO Y REDES/);

      await context.setOffline(true);
      await expect(page.getByText("Sin conexión.")).toBeVisible();
      await page.reload();
      await expect(page.locator("[data-ready]")).toBeAttached();
      await expect(page).toHaveURL(/#\/plan$/);
      await expect(page.locator("[data-screen-heading]")).toHaveText("TU PLAN");
      await expect(page.getByText("Sin conexión.")).toBeVisible();
      await context.setOffline(false);
    });
  });
});
