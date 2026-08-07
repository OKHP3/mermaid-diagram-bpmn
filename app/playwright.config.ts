/**
 * playwright.config.ts
 *
 * Playwright configuration for the real-browser E2E suite (Task #209).
 *
 * Tests navigate to the /mermaid-host-demo route, which runs
 * mermaid.registerExternalDiagrams() + mermaid.render() with default
 * securityLevel ('strict') — no securityLevel:'loose' workaround.
 *
 * Prerequisites: the app must be built before this suite runs.
 *   pnpm --filter @workspace/mermaid-diagram-bpmn run build
 *   pnpm --filter @workspace/mermaid-diagram-bpmn run test:e2e
 *
 * The webServer block starts `vite preview` (serving the built dist) and
 * waits for it to be healthy before launching tests.
 */

import { defineConfig, devices } from '@playwright/test';

const PREVIEW_PORT = 4174; // avoid clashing with dev server on 3000

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // single-worker to avoid Mermaid registration races
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['json', { outputFile: 'e2e-results.json' }]] : 'list',
  timeout: 60_000,

  use: {
    baseURL: `http://localhost:${PREVIEW_PORT}`,
    headless: true,
    actionTimeout: 30_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    // Serves the production build from app/dist/public/.
    // Build must run before test:e2e (handled by CI job ordering).
    command: `PORT=${PREVIEW_PORT} pnpm --filter @workspace/mermaid-diagram-bpmn run serve`,
    url: `http://localhost:${PREVIEW_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
