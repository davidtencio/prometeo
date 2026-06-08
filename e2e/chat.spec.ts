import { expect, test } from "@playwright/test";

// Smoke test del flujo principal. En CI la autenticación está deshabilitada
// (sin APP_PASSWORD/AUTH_SECRET), así que la home carga directo.
test("envía un mensaje y recibe respuesta del asistente", async ({ page }) => {
  await page.goto("/");

  const input = page.getByPlaceholder(/Escribe tu mensaje/);
  await expect(input).toBeVisible();

  await input.fill("hola");
  await input.press("Enter");

  await expect(page.getByText(/Respuesta simulada/)).toBeVisible({ timeout: 20_000 });
});
