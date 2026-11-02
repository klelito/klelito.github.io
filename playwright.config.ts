import { defineConfig, devices } from '@playwright/test';

// Dedicated port: never reuse `npm run dev` (4321), which has no sitemap/404 page and serves unbuilt code.
export const TEST_PORT = 4329;
export const TEST_ORIGIN = `http://localhost:${TEST_PORT}`;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: TEST_ORIGIN,
  },
  webServer: {
    command: `npm run preview -- --port ${TEST_PORT}`,
    url: `${TEST_ORIGIN}/`,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true },
    },
  ],
});
