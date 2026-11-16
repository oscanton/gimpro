import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("completa una sesión rápida", async ({ page }) => {
  await page.goto("/#/home");
  await expect(page.getByRole("heading", { name: "¿Entrenamos?" })).toBeVisible();

  await page.getByRole("button", { name: "5 min" }).click();
  await page.getByRole("button", { name: "Entréname" }).click();
  await expect(page.getByRole("heading", { name: "Preparar sesión" })).toBeVisible();
  await page.getByRole("button", { name: "Crear sesión" }).click();

  await expect(page.getByRole("button", { name: "Iniciar" })).toBeVisible();
  await page.getByRole("button", { name: "Iniciar" }).click();
  await expect(page.getByLabel("Tiempo restante")).toBeVisible();
  await page.getByRole("button", { name: "Terminar" }).click();

  await expect(page.getByRole("heading", { name: /./ })).toBeVisible();
  await page.getByRole("button", { name: "Saltar" }).click();
  await page.getByRole("button", { name: "Continuar sesión" }).click();
  await expect(page.getByText("Sesión completada")).toBeVisible();
});

test("la página inicial no tiene infracciones graves de accesibilidad", async ({ page }) => {
  await page.goto("/#/home");
  await expect(page.getByRole("heading", { name: "¿Entrenamos?" })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  const serious = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact)
  );
  expect(serious).toEqual([]);
});

test("la página inicial vuelve a cargar sin conexión", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "La prueba de Service Worker se ejecuta en Chromium.");
  await page.goto("/#/home");
  await expect(page.getByRole("heading", { name: "¿Entrenamos?" })).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)))) {
    await page.reload();
    await expect(page.getByRole("heading", { name: "¿Entrenamos?" })).toBeVisible();
  }
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "¿Entrenamos?" })).toBeVisible();
});

test("genera motores y ofrece ayuda en un ejercicio compatible", async ({ page }) => {
  await page.goto("/#/home");
  await page.getByRole("button", { name: "Motores" }).click();
  await expect(page.getByRole("heading", { name: "Motores" })).toBeVisible();

  const result = page.locator(".motor-result p").first();
  const firstText = await result.textContent();
  await page.getByRole("button", { name: "Otro" }).click();
  await expect(result).not.toHaveText(firstText);

  await page.getByLabel("Tipo").selectOption("place");
  await page.getByLabel(/Rareza:/).fill("4");
  await page.getByRole("button", { name: "Generar" }).click();
  const results = page.getByRole("region", { name: "Motores generados" });
  await expect(results.getByText("Lugar", { exact: true })).toBeVisible();
  await expect(results.getByText("Rareza 4", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Explorar" }).click();
  const exercise = page.locator("article", { hasText: "Rebote instantáneo" });
  await exercise.getByRole("button", { name: /Entrenar/ }).click();
  await expect(page.getByLabel("Motor opcional")).toBeVisible();
  await expect(page.getByRole("button", { name: "Otro motor" })).toBeVisible();
});
