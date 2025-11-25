import { test, expect } from '@playwright/test';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
test.beforeAll(async ({ request }) => {
  console.log("🧹 Limpiando base de datos en QA antes de tests E2E...");

  const listResponse = await request.get(`${BACKEND_URL}/api/products`);
  if (!listResponse.ok()) return;

  const products = await listResponse.json();

  for (const product of products) {
    if (product._id) {
      await request.delete(`${BACKEND_URL}/api/products/${product._id}`);
    }
  }

  console.log(`🧼 Base limpia — ${products.length} elementos eliminados`);
});

test.describe('Integración Frontend-Backend', () => {

  test('Debe sincronizar correctamente con la API', async ({ page, request }) => {
    // 1. Crear café directamente en la API
    const newCoffee = {
      name: 'Café API Test',
      origin: 'Etiopía',
      type: 'Arábica',
      price: 28.50,
      rating: 4.8,
      roast: 'Light',
      description: 'Creado via API para test E2E'
    };

    const createResponse = await request.post(`${BACKEND_URL}/api/productss`, {
      data: newCoffee
    });
    expect(createResponse.ok()).toBeTruthy();
    const createdCoffee = await createResponse.json();

    // 2. Verificar que aparece en el frontend
    await page.goto('/');
    await page.waitForSelector('.coffee-card');
    
    const coffeeCard = page.locator('.coffee-card').filter({ hasText: 'Café API Test' });
    await expect(coffeeCard).toBeVisible();
    await expect(coffeeCard).toContainText('Etiopía');
    await expect(coffeeCard).toContainText('$28.5');

    // 3. Eliminar desde el frontend
    page.once('dialog', dialog => dialog.accept());
    await coffeeCard.locator('button:has-text("🗑️ Eliminar")').click();
    
    page.once('dialog', dialog => dialog.accept());

    // 4. Verificar que se eliminó en la API
    await page.waitForTimeout(1000);
    const getResponse = await request.get(`${BACKEND_URL}/api/products/${createdCoffee._id}`);
    expect(getResponse.status()).toBe(404);
  });

  test('Debe manejar errores de conexión con la API', async ({ page, context }) => {
    // Bloquear requests a la API
    await context.route('**/api/products', route => route.abort());

    await page.goto('/');

    // Debería mostrar mensaje de error o estado de carga
    const grid = page.locator('#coffee-grid');
    await expect(grid).toContainText(/Error|Cargando/i);
  });

  test('Debe validar datos antes de enviar al backend', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("➕ Agregar Café")');

    // Intentar enviar formulario vacío
    await page.click('button:has-text("✅ Agregar Café")');

    // El formulario HTML5 debería prevenir el envío
    const nameInput = page.locator('#name');
    const isInvalid = await nameInput.evaluate(el => 
      (el as HTMLInputElement).validity.valid === false
    );
    expect(isInvalid).toBeTruthy();
  });
});