import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 180_000,         // allow time for multi-batch GitHub API calls
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4321',
    headless: false,        // show the browser so you can watch it run
    viewport: { width: 1400, height: 900 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    env: {
      PLAYWRIGHT: '1',
    },
    url: 'http://localhost:4321',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
