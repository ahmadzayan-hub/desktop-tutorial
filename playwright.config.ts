import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// E2E against the public (no-auth) surface. The app degrades gracefully without
// a backend, so public pages render without Supabase/Stripe env.
const PORT = process.env.PORT ?? "3000";
const BASE_URL = `http://localhost:${PORT}`;

// Prefer an explicitly-provided or pre-installed Chromium when it exists (fast,
// no download). In CI, leave it undefined so Playwright uses the browser it
// installs via `npx playwright install chromium`.
const PREINSTALLED = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const envPath = process.env.PLAYWRIGHT_CHROMIUM_PATH;
const executablePath = envPath || (existsSync(PREINSTALLED) ? PREINSTALLED : undefined);

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    navigationTimeout: 60_000,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: executablePath ? { executablePath } : {},
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
