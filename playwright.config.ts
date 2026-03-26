import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,          // allow time for the GitHub API calls
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
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
