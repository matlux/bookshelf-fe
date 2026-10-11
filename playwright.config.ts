import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: process.env.FRONTEND_URL || 'http://127.0.0.1:5173',
    viewport: { width: 1360, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  reporter: 'list',
});
