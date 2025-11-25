import { test, expect } from '@playwright/test';

test.describe('☕ CoffeeHub - CRUD de cafés', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ================================================================
  // 🟢 CREAR
  // ================================================================
  test('Debe crear un nuevo café exitosamente', async ({ page }) => {
    const uniqueName = `Café Test E2E ${Date.now()}`;

    await page.click('button:has-text("➕ Agregar Café")');
    await page.waitForSelector('#name', { state: 'visible' });

    await page.fill('#name', uniqueName);
    await page.fill('#origin', 'Colombia');
    await page.fill('#type', 'Arábica');
    await page.fill('#price', '25.99');
    await page.fill('#rating', '4.5');
    await page.fill('#roast', 'Medium');

    await page.click('button:has-text("✅ Agregar Café")');

    await expect(
      page.locator('.coffee-card').filter({ hasText: uniqueName })
    ).toBeVisible({ timeout: 10000 });
  });

  // ================================================================
  // 🟡 EDITAR
  // ================================================================
  test('Debe editar un café existente', async ({ page }) => {
    const uniqueName = `Café Edición ${Date.now()}`;

    // Crear uno para editar
    await page.click('button:has-text("➕ Agregar Café")');
    await page.waitForSelector('#name', { state: 'visible' });
    await page.fill('#name', uniqueName);
    await page.fill('#origin', 'Brasil');
    await page.fill('#type', 'Robusta');
    await page.fill('#price', '19.99');
    await page.fill('#rating', '3.8');
    await page.fill('#roast', 'Dark');
    await page.click('button:has-text("✅ Agregar Café")');
    await page.waitForSelector('.coffee-card', { timeout: 5000 });

    const card = page.locator('.coffee-card').filter({ hasText: uniqueName });
    await card.first().locator('button:has-text("Editar")').click();

    // Esperar a que el formulario esté visible y estable
    await page.waitForSelector('button:has-text("💾 Guardar Cambios")', {
      state: 'visible',
      timeout: 10000
    });
    await page.waitForTimeout(500); // 🕐 pequeño delay por animación

    const updatedName = `${uniqueName} Modificado`;
    await page.fill('#name', updatedName);
    await page.click('button:has-text("💾 Guardar Cambios")', { timeout: 10000 });

    await expect(page.locator('.coffee-card').filter({ hasText: updatedName }))
      .toBeVisible({ timeout: 10000 });
  });

  // ================================================================
  // 🔴 ELIMINAR
  // ================================================================
  test('Debe eliminar un café', async ({ page }) => {
    const uniqueName = `Café Eliminar ${Date.now()}`;

    await page.click('button:has-text("➕ Agregar Café")');
    await page.waitForSelector('#name', { state: 'visible' });
    await page.fill('#name', uniqueName);
    await page.fill('#origin', 'Perú');
    await page.fill('#type', 'Blend');
    await page.fill('#price', '22.50');
    await page.fill('#rating', '4.2');
    await page.fill('#roast', 'Light');
    await page.click('button:has-text("✅ Agregar Café")');
    await page.waitForSelector('.coffee-card', { timeout: 5000 });

    const targetCard = page.locator('.coffee-card').filter({ hasText: uniqueName });
    await expect(targetCard).toHaveCount(1);

    // Confirmar diálogo
    page.once('dialog', dialog => dialog.accept());
    await targetCard.first().locator('button:has-text("Eliminar")').click();

    await expect(targetCard).toHaveCount(0);
  });

  // ================================================================
  // 🔵 CANCELAR
  // ================================================================
  test('Debe cancelar una edición sin guardar cambios', async ({ page }) => {
    const uniqueName = `Café Cancelar ${Date.now()}`;

    // Crear un café único
    await page.click('button:has-text("➕ Agregar Café")');
    await page.waitForSelector('#name', { state: 'visible' });
    await page.fill('#name', uniqueName);
    await page.fill('#origin', 'Chile');
    await page.fill('#type', 'Blend');
    await page.fill('#price', '20.00');
    await page.fill('#rating', '4.0');
    await page.fill('#roast', 'Medium');
    await page.click('button:has-text("✅ Agregar Café")');
    await page.waitForSelector('.coffee-card', { timeout: 5000 });

    const card = page.locator('.coffee-card').filter({ hasText: uniqueName }).first();
    await card.locator('button:has-text("Editar")').click();

    // Esperar que aparezca el botón Cancelar
    await page.waitForSelector('button:has-text("Cancelar")', { state: 'visible' });
    await page.waitForTimeout(500);

    const modifiedName = `${uniqueName} Editado`;
    await page.fill('#name', modifiedName);
    await page.click('button:has-text("Cancelar")');

    // Confirmar que el nombre original se mantiene
    await expect(card).toContainText(uniqueName, { timeout: 10000 });
  });
});
