import { defineConfig } from '@playwright/test';

// 127.0.0.1, not localhost: on Windows localhost resolves to ::1 first and the dev server binds
// IPv4, so the whole suite times out on a name-resolution detail.
const BASE_URL = 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  use: { baseURL: BASE_URL },
  webServer: {
    command: 'npm run dev',
    url: `${BASE_URL}/login`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
