import { defineConfig, devices } from "@playwright/test";

// CLAUDE.md rule 9 / runbook R5: one video of the critical journeys per version (pnpm e2e:record).
// Runs against a production fixture build with the archive on: run `pnpm build` first.
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e/record",
  testMatch: "*.record.ts",
  workers: 1,
  reporter: "list",
  outputDir: "test-results/record",
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width: 1280, height: 800 },
    baseURL: `http://localhost:${PORT}`,
    video: { mode: "on", size: { width: 1280, height: 800 } },
    launchOptions: { slowMo: 250 },
  },
  webServer: {
    command: `pnpm start --port ${PORT}`,
    url: `http://localhost:${PORT}/fr`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
