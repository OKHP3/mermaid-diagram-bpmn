/**
 * purchase-approval-diagram.spec.ts
 *
 * End-to-end coverage for the Purchase Approval worked example (Task #270).
 *
 * What this proves beyond the unit tests:
 *   - The bpmn-beta diagram in Step 06 (Visual Process Modeling) renders to a
 *     real SVG in Chromium.
 *   - Linked nodes carry role="button" and are therefore interactive.
 *   - Clicking or keyboard-activating a linked task node or gateway navigates
 *     the SPA to the correct
 *     /skills/<skill-id> page, confirming the onClick → wouter.navigate()
 *     wiring is live end-to-end.
 *   - Back navigation from a skill page still shows a renderable diagram.
 *
 * Evidence tier: browser-verified (Chromium, production build).
 */

import { test, expect, type Page } from '@playwright/test';

// ── Constants ─────────────────────────────────────────────────────────────────

/** SPA route under test. */
const ROUTE = 'walkthrough/purchase-approval';

/**
 * Step 06 hosts the BPMN diagram (hasDiagram: true).
 * ExampleStepTimeline gives each step card id="step-<skillId>".
 */
const DIAGRAM_STEP_ID = 'step-okhp3-visual-process-modeling';

// Linked task and gateway nodes receive role="button" when a nodeLinks entry is
// present. Events are also in nodeLinks but are covered by separate task work.
// t1 = user task, t2 = service task, t3 = user task (different subtype from t1)
const NODE_T1_LABEL = 'Review Request';
const NODE_T1_ROUTE = '/skills/okhp3-as-is-process-capture';

const NODE_T2_LABEL = 'Issue Purchase Order';
const NODE_T2_ROUTE = '/skills/okhp3-visual-process-modeling';

const NODE_T3_LABEL = 'Notify Rejection';
const NODE_T3_ROUTE = '/skills/okhp3-process-gap-exception-analysis';

const NODE_G1_LABEL = 'Approved?';
const NODE_G1_ROUTE = '/skills/okhp3-process-gap-exception-analysis';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Navigate to the Purchase Approval page and wait for the h1 to settle. */
async function loadPage(page: Page) {
  await page.goto(ROUTE);
  await page.waitForLoadState('networkidle');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Purchase Approval' }),
  ).toBeVisible({ timeout: 20_000 });
}

/**
 * Scroll the Step 06 card into view and wait for the SVG diagram to appear.
 * Returns the locator for the step card element.
 */
async function scrollToDiagramStep(page: Page) {
  const stepCard = page.locator(`#${DIAGRAM_STEP_ID}`);
  await expect(stepCard).toBeAttached({ timeout: 15_000 });
  await stepCard.scrollIntoViewIfNeeded();
  const svg = stepCard.locator('svg').first();
  await expect(svg).toBeVisible({ timeout: 20_000 });
  return stepCard;
}

/**
 * Locate a linked BPMN node by its label.
 * BpmnRenderer renders linked nodes with role="button" and an aria-label of
 * "Open <node.label>" (for example, "Open Review Request").
 */
function nodeButton(stepCard: ReturnType<Page['locator']>, label: string) {
  return stepCard.locator(`[role="button"][aria-label="Open ${label}"]`);
}

// ── Page load ─────────────────────────────────────────────────────────────────

test.describe('Purchase Approval — page load', () => {
  test('page title and h1 are correct', async ({ page }) => {
    await loadPage(page);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Purchase Approval' }),
    ).toBeVisible();
    await expect(page).toHaveTitle(/Purchase Approval/);
  });

  test('15-step timeline is rendered', async ({ page }) => {
    await loadPage(page);
    const steps = page.locator('[id^="step-"]');
    await expect(steps).toHaveCount(15);
    await expect(steps.first()).toBeVisible();
  });
});

// ── Diagram rendering ─────────────────────────────────────────────────────────

test.describe('Purchase Approval — Step 06 BPMN diagram renders', () => {
  test('Step 06 card is present in the DOM', async ({ page }) => {
    await loadPage(page);
    await expect(page.locator(`#${DIAGRAM_STEP_ID}`)).toBeAttached();
  });

  test('SVG is visible after scrolling Step 06 into view', async ({ page }) => {
    await loadPage(page);
    const stepCard = await scrollToDiagramStep(page);
    await expect(stepCard.locator('svg').first()).toBeVisible();
  });

  test('SVG has a viewBox — confirms layout was computed', async ({ page }) => {
    await loadPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const svg = stepCard.locator('svg').first();
    const viewBox = await svg.getAttribute('viewBox');
    expect(viewBox, 'SVG must have a viewBox once layout is complete').toBeTruthy();
  });

  test('diagram title matches the accTitle declaration', async ({ page }) => {
    await loadPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const titleEl = stepCard.locator('svg title').first();
    await expect(titleEl).toHaveText(/Purchase Request Approval/);
  });

  test('interactivity hint is visible', async ({ page }) => {
    await loadPage(page);
    await expect(
      page.getByText(/Click any node to open its skill detail page/i),
    ).toBeVisible();
  });
});

// ── Node interactivity ────────────────────────────────────────────────────────

test.describe('Purchase Approval — diagram node click navigation', () => {
  test('linked task and gateway nodes carry role="button" — interactive in the DOM', async ({ page }) => {
    await loadPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const buttons = stepCard.locator('[role="button"]');
    const count = await buttons.count();
    // Three task nodes, one gateway, one start event, and two end events
    // receive role="button".
    expect(count, 'Expected exactly 7 interactive linked nodes').toBe(7);
  });

  test('clicking t1 (Review Request) navigates to As-Is Process Capture skill', async ({ page }) => {
    await loadPage(page);
    const stepCard = await scrollToDiagramStep(page);

    const btn = nodeButton(stepCard, NODE_T1_LABEL);
    await expect(btn).toBeVisible({ timeout: 15_000 });

    await Promise.all([
      page.waitForURL(`**${NODE_T1_ROUTE}`, { timeout: 15_000 }),
      btn.click(),
    ]);

    expect(page.url()).toContain(NODE_T1_ROUTE);
  });

  test('skill detail page shows a heading after clicking t1', async ({ page }) => {
    await loadPage(page);
    const stepCard = await scrollToDiagramStep(page);

    await nodeButton(stepCard, NODE_T1_LABEL).click();
    await page.waitForURL(`**${NODE_T1_ROUTE}`, { timeout: 15_000 });

    // SkillDetail renders the skill displayName as h1
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });
  });

  test('clicking t2 (Issue Purchase Order) navigates to Visual Process Modeling skill', async ({ page }) => {
    await loadPage(page);
    const stepCard = await scrollToDiagramStep(page);

    const btn = nodeButton(stepCard, NODE_T2_LABEL);
    await expect(btn).toBeVisible({ timeout: 15_000 });

    await Promise.all([
      page.waitForURL(`**${NODE_T2_ROUTE}`, { timeout: 15_000 }),
      btn.click(),
    ]);

    expect(page.url()).toContain(NODE_T2_ROUTE);
  });

  test('clicking t3 (Notify Rejection) navigates to Gap & Exception Analysis skill', async ({ page }) => {
    await loadPage(page);
    const stepCard = await scrollToDiagramStep(page);

    const btn = nodeButton(stepCard, NODE_T3_LABEL);
    await expect(btn).toBeVisible({ timeout: 15_000 });

    await Promise.all([
      page.waitForURL(`**${NODE_T3_ROUTE}`, { timeout: 15_000 }),
      btn.click(),
    ]);

    expect(page.url()).toContain(NODE_T3_ROUTE);
  });

  test('clicking g1 (Approved?) navigates to Gap & Exception Analysis skill', async ({ page }) => {
    await loadPage(page);
    const stepCard = await scrollToDiagramStep(page);

    const btn = nodeButton(stepCard, NODE_G1_LABEL);
    await expect(btn).toBeVisible({ timeout: 15_000 });

    await Promise.all([
      page.waitForURL(`**${NODE_G1_ROUTE}`, { timeout: 15_000 }),
      btn.click(),
    ]);

    expect(page.url()).toContain(NODE_G1_ROUTE);
  });

  test('after clicking t1, navigating back still shows the diagram', async ({ page }) => {
    await loadPage(page);
    const stepCard = await scrollToDiagramStep(page);

    await nodeButton(stepCard, NODE_T1_LABEL).click();
    await page.waitForURL(`**${NODE_T1_ROUTE}`, { timeout: 15_000 });

    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Diagram must still render after SPA back-navigation
    const stepCard2 = await scrollToDiagramStep(page);
    await expect(stepCard2.locator('svg').first()).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Purchase Approval — diagram node keyboard navigation', () => {
  test('pressing Space on Review Request navigates to As-Is Process Capture', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Keyboard worked-example coverage runs in Chromium.');
    await loadPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const button = nodeButton(stepCard, NODE_T1_LABEL);
    await expect(button).toBeVisible({ timeout: 15_000 });

    await button.focus();
    await expect(button).toBeFocused();
    await Promise.all([
      page.waitForURL(`**${NODE_T1_ROUTE}`, { timeout: 15_000 }),
      button.press('Space'),
    ]);

    expect(page.url()).toContain(NODE_T1_ROUTE);
  });

  test('pressing Enter on Approved? navigates to Gap & Exception Analysis', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Keyboard worked-example coverage runs in Chromium.');
    await loadPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const button = nodeButton(stepCard, NODE_G1_LABEL);
    await expect(button).toBeVisible({ timeout: 15_000 });

    await button.focus();
    await expect(button).toBeFocused();
    await Promise.all([
      page.waitForURL(`**${NODE_G1_ROUTE}`, { timeout: 15_000 }),
      button.press('Enter'),
    ]);

    expect(page.url()).toContain(NODE_G1_ROUTE);
  });

  test('pressing Space on Approved? navigates to Gap & Exception Analysis', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Keyboard worked-example coverage runs in Chromium.');
    await loadPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const button = nodeButton(stepCard, NODE_G1_LABEL);
    await expect(button).toBeVisible({ timeout: 15_000 });

    await button.focus();
    await expect(button).toBeFocused();
    await Promise.all([
      page.waitForURL(`**${NODE_G1_ROUTE}`, { timeout: 15_000 }),
      button.press('Space'),
    ]);

    expect(page.url()).toContain(NODE_G1_ROUTE);
  });
});
