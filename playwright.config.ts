import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const uiBaseURL = process.env.UI_BASE_URL ?? 'https://www.saucedemo.com';
const apiBaseURL = process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com';

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], baseURL: uiBaseURL, testIdAttribute: 'data-test' },
    },
    {
      name: 'ui-firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'], baseURL: uiBaseURL, testIdAttribute: 'data-test' },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: apiBaseURL, extraHTTPHeaders: { Accept: 'application/json' } },
    },
  ],
});
