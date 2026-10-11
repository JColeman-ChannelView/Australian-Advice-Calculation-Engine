import { defineConfig, devices } from '@playwright/test';

const PORT = 8788;

export default defineConfig({
  testDir: 'smoke',
  timeout: 30_000,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    // Uses the locally installed Microsoft Edge so no browser download is needed.
    // Set PW_CHANNEL=chromium (after `npx playwright install chromium`) or chrome to override.
    channel: process.env.PW_CHANNEL ?? 'msedge',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Edge'], channel: process.env.PW_CHANNEL ?? 'msedge' } },
  ],
  webServer: {
    command: 'npx tsx src/api/server.ts',
    url: `http://127.0.0.1:${PORT}/api/v1/health`,
    env: { PORT: String(PORT), HOST: '127.0.0.1' },
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
