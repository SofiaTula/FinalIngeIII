import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  reporter: [
    ['html', { outputFolder: 'reports' }],
    ['junit', { outputFile: 'reports/results.xml' }],
    ['list']
  ],

  use: {
    // 👉 En QA usar URL de Render automáticamente
    baseURL: process.env.FRONTEND_URL || (
      process.env.CI
        ? "https://coffehub-frontend-qa.onrender.com"
        : "http://localhost:8080"
    ),

    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // ======================================================
  // 🔧 Servidores locales (SOLO en desarrollo local)
  // ======================================================
  webServer: process.env.CI
    ? undefined
    : [
        {
          command: 'cd ../coffehub/backend && npm start',
          url: 'http://localhost:4000',
          reuseExistingServer: true,
          timeout: 120000,
        },
        {
          command: 'cd ../coffehub/frontend && npm start',
          url: 'http://localhost:8080',
          reuseExistingServer: true,
          timeout: 120000,
        },
      ],
});
