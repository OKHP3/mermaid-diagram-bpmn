import { chromium, firefox, webkit } from '@playwright/test';

const browserName = process.argv.find((argument) => ['chromium', 'firefox', 'webkit'].includes(argument)) ?? 'chromium';
const browserTypes = { chromium, firefox, webkit };
const browserType = browserTypes[browserName];

if (!browserType) {
  throw new Error(`Unsupported browser: ${browserName}`);
}

/**
 * Minimal browser preflight for contributors. This deliberately launches
 * the selected browser without starting Vite or running any test files so missing native
 * libraries are reported before E2E failures are mistaken for test failures.
 */
try {
  const browser = await browserType.launch({ headless: true });
  await browser.close();
  console.log(`[check:browser] OK — ${browserName} launched and closed successfully`);
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`[check:browser] FAIL — ${browserName} could not launch`);
  console.error(detail);
  console.error('');
  console.error('Check the local browser-library declaration in .replit under [nix].');
  console.error(
    'In CI or another Linux environment, install the browser and native dependencies with:',
  );
  console.error(
    `  pnpm --filter @workspace/mermaid-diagram-bpmn exec playwright install --with-deps ${browserName}`,
  );
  process.exitCode = 1;
}
