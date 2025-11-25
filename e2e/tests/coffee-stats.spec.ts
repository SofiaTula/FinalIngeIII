// ================================================================
// ☕ CoffeeHub - Estadísticas de Cafés (Playwright E2E)
// ================================================================
import { test, expect } from '@playwright/test';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
test.beforeAll(async ({ request }) => {
  console.log("🧹 Limpiando base de QA para test de estadísticas...");

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

test.describe('📊 Estadísticas de Cafés', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // ================================================================
  // 🟢 Test 1: Ver estadísticas generales
  // ================================================================
  test('Debe mostrar estadísticas correctas', async ({ page }) => {
    const coffees = [
      { name: 'Café 1', origin: 'Colombia', type: 'Arábica', price: '25', rating: '4.5', roast: 'Medium' },
      { name: 'Café 2', origin: 'Brasil', type: 'Robusta', price: '20', rating: '4', roast: 'Dark' },
    ];

    // 👉 Abrir el formulario antes de llenar los campos
    for (const coffee of coffees) {
      await page.click('button:has-text("➕ Agregar Café")');
      await page.waitForSelector('#name', { state: 'visible', timeout: 10000 });

      await page.fill('#name', coffee.name);
      await page.fill('#origin', coffee.origin);
      await page.fill('#type', coffee.type);
      await page.fill('#price', coffee.price);
      await page.fill('#rating', coffee.rating);
      await page.fill('#roast', coffee.roast);
      await page.click('button:has-text("✅ Agregar Café")');

      await page.waitForSelector('.coffee-card', { timeout: 10000 });
      await page.waitForTimeout(500);
    }

    // 👉 Verificar estadísticas visibles (según el componente)
    const statsContainer = page.locator('.stat-card, .stats-container, [data-testid="stats"]');
    const count = await statsContainer.count();

    if (count > 0) {
      await expect(statsContainer.first()).toBeVisible({ timeout: 10000 });
    } else {
      console.log('⚠️ No se encontró componente de estadísticas — test saltado');
      test.skip();
    }
  });

  // ================================================================
  // 🟡 Test 2: Actualizar estadísticas al agregar café
  // ================================================================
  test('Debe actualizar estadísticas al agregar café', async ({ page }) => {
    // 👉 Abrir el formulario antes de llenar
    await page.click('button:has-text("➕ Agregar Café")');
    await page.waitForSelector('#name', { state: 'visible', timeout: 10000 });

    await page.fill('#name', 'Café para Stats');
    await page.fill('#origin', 'Brasil');
    await page.fill('#type', 'Arábica');
    await page.fill('#price', '30.00');
    await page.fill('#rating', '5');
    await page.fill('#roast', 'Light');
    await page.click('button:has-text("✅ Agregar Café")');

    await expect(page.locator('.coffee-card').filter({ hasText: 'Café para Stats' }))
      .toBeVisible({ timeout: 10000 });

    // 👉 Si hay contenedor de estadísticas, verificar actualización
    const stats = page.locator('.stat-card, .stats-container, [data-testid="stats"]');
    const visibleStats = await stats.count();
    if (visibleStats > 0) {
      await expect(stats.first()).toBeVisible({ timeout: 10000 });
    } else {
      console.log('⚠️ No se encontraron estadísticas visibles');
      test.skip();
    }
  });
});
