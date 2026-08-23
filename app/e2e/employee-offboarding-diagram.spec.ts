/**
 * employee-offboarding-diagram.spec.ts
 *
 * Browser coverage for the Employee Offboarding worked example. This verifies
 * the pool/lane BPMN diagram renders in Chromium and that linked task nodes
 * navigate through the live SPA wiring.
 *
 * Evidence tier: browser-verified (Chromium, production build).
 */

import { test, expect, type Page } from '@playwright/test';

const ROUTE = '/walkthrough/employee-offboarding';
const DIAGRAM_STEP_ID = 'step-okhp3-visual-process-modeling';

const NODE_T1_LABEL = 'Open Offboarding Case';
const NODE_T1_ROUTE = '/skills/okhp3-process-intake-and-scope';

const NODE_T2_LABEL = 'Set Last Working Day';
const NODE_T2_ROUTE = '/skills/okhp3-stakeholder-and-role-mapping';

async function loadPage(page: Page) {
  await page.goto(ROUTE);
  await page.waitForLoadState('networkidle');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Employee Offboarding' }),
  ).toBeVisible({ timeout: 20_000 });
}

async function scrollToDiagramStep(page: Page) {
  const stepCard = page.locator(`#${DIAGRAM_STEP_ID}`);
  await expect(stepCard).toBeAttached({ timeout: 15_000 });
  await stepCard.scrollIntoViewIfNeeded();
  await expect(stepCard.locator('svg').first()).toBeVisible({ timeout: 20_000 });
  return stepCard;
}

function taskButton(stepCard: ReturnType<Page['locator']>, label: string) {
  return stepCard.locator(`[role="button"][aria-label$=": ${label}"]`);
}

test.describe('Employee Offboarding — Step 06 BPMN diagram', () => {
  test('Step 06 SVG is visible with a computed viewBox', async ({ page }) => {
    await loadPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const svg = stepCard.locator('svg').first();
    await expect(svg).toBeVisible();
    await expect(svg).toHaveAttribute('viewBox', /.+/);
  });

  test('linked task nodes carry role="button"', async ({ page }) => {
    await loadPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const buttons = stepCard.locator('[role="button"]');
    await expect(buttons).toHaveCount(9);
  });
});

test.describe('Employee Offboarding — diagram node click navigation', () => {
  test('clicking Open Offboarding Case navigates to Intake & Scope', async ({ page }) => {
    await loadPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const button = taskButton(stepCard, NODE_T1_LABEL);
    await expect(button).toBeVisible({ timeout: 15_000 });

    await Promise.all([
      page.waitForURL(`**${NODE_T1_ROUTE}`, { timeout: 15_000 }),
      button.click(),
    ]);

    expect(page.url()).toContain(NODE_T1_ROUTE);
  });

  test('clicking Set Last Working Day navigates to Stakeholder & Role Mapping', async ({ page }) => {
    await loadPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const button = taskButton(stepCard, NODE_T2_LABEL);
    await expect(button).toBeVisible({ timeout: 15_000 });

    await Promise.all([
      page.waitForURL(`**${NODE_T2_ROUTE}`, { timeout: 15_000 }),
      button.click(),
    ]);

    expect(page.url()).toContain(NODE_T2_ROUTE);
  });
});