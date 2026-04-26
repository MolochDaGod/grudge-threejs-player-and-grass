// playwright.config.js
//
// Smoke-test configuration for the Grudge Warlords sandbox page. Boots
// `npx serve .` on a known port and points the test runner at the
// `src/` working directory (mirrors the manual `http://localhost:3000/src/`
// flow documented in the README).
import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  // Headless Chromium can take 40-60s to spin up WebGL + the grass
  // scene's first chunks on cold boot. Give the smoke test enough
  // headroom for both that and the assertion windows after it.
  timeout: 180_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npx --yes serve . -p ${PORT} -L`,
    url: `${BASE_URL}/src/index.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
