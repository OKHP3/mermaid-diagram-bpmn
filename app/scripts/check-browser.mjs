import { chromium } from '@playwright/test';

/**
 * Minimal browser preflight for contributors. This deliberately launches
 * Chromium without starting Vite or running any test files so missing native
 * libraries are reported before E2E failures are mistaken for test failures.
 */
try {
  const browser = await chromium.launch({ headless: true });
  await browser.close();
  console.log('[check:browser] OK — Chromium launched and closed successfully');
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  console.error('[check:browser] FAIL — Chromium could not launch');
  console.error(detail);
  console.error('');
  console.error('Check the local browser-library declaration in .replit under [nix].');
  console.error(
    'In CI or another Linux environment, install the browser and native dependencies with:',
  );
  console.error(
    '  pnpm --filter @workspace/mermaid-diagram-bpmn exec playwright install --with-deps chromium',
  );
  process.exitCode = 1;
}