/**
 * Cross-browser keyboard coverage for the Vendor Onboarding worked example.
 *
 * The Chromium event checks remain in vendor-onboarding-diagram.spec.ts as the
 * fast regression gate. These checks are selected by the Firefox and WebKit
 * jobs in the Playwright browser matrix.
 */

import { test, expect, type Page } from '@playwright/test';

const ROUTE = 'walkthrough/vendor-onboarding';
const DIAGRAM_STEP_ID = 'step-okhp3-visual-process-modeling';
const NODE_START_LABEL = 'Vendor Nominated';
const NODE_START_ROUTE = '/skills/okhp3-process-intake-and-scope';
const NODE_END_LABEL = 'Vendor Active';
const NODE_END_ROUTE = '/skills/okhp3-publication-handoff-packaging';

async function loadVendorOnboardingPage(page: Page) {
  await page.goto(ROUTE);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { level: 1, name: 'Vendor Onboarding' }))
    .toBeVisible({ timeout: 20_000 });
}

async function scrollToDiagramStep(page: Page) {
  const stepCard = page.locator(`#${DIAGRAM_STEP_ID}`);
  await expect(stepCard).toBeAttached({ timeout: 15_000 });
  await stepCard.scrollIntoViewIfNeeded();
  await expect(stepCard.locator('svg').first()).toBeVisible({ timeout: 20_000 });
  return stepCard;
}

function eventButton(
  stepCard: ReturnType<Page['locator']>,
  position: 'start' | 'end',
  label: string,
) {
  return stepCard.locator(
    `[role="button"][aria-label="Open ${position === 'start' ? 'Start' : 'End'} event: ${label}"]`,
  );
}

test.describe('Vendor Onboarding — event node keyboard navigation (Firefox/WebKit)', () => {
  test('pressing Enter on Vendor Nominated navigates to Intake & Scope', async ({ page, browserName }) => {
    test.skip(browserName === 'chromium', 'The Chromium fast gate covers this event path.');
    await loadVendorOnboardingPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const button = eventButton(stepCard, 'start', NODE_START_LABEL);
    await expect(button).toBeVisible({ timeout: 15_000 });

    await button.focus();
    await expect(button).toBeFocused();
    await Promise.all([
      page.waitForURL(`**${NODE_START_ROUTE}`, { timeout: 15_000 }),
      button.press('Enter'),
    ]);

    expect(page.url()).toContain(NODE_START_ROUTE);
  });

  test('pressing Space on Vendor Active navigates to Publication & Handoff', async ({ page, browserName }) => {
    test.skip(browserName === 'chromium', 'The Chromium fast gate covers this event path.');
    await loadVendorOnboardingPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const button = eventButton(stepCard, 'end', NODE_END_LABEL);
    await expect(button).toBeVisible({ timeout: 15_000 });

    await button.focus();
    await expect(button).toBeFocused();
    await Promise.all([
      page.waitForURL(`**${NODE_END_ROUTE}`, { timeout: 15_000 }),
      button.press('Space'),
    ]);

    expect(page.url()).toContain(NODE_END_ROUTE);
  });
});