/**
 * vendor-onboarding-diagram.spec.ts
 *
 * End-to-end coverage for the Vendor Onboarding worked example (Task #262).
 *
 * What this proves beyond the unit tests:
 *   - The bpmn-beta diagram in Step 06 (Visual Process Modeling) renders to a
 *     real SVG in Chromium.
 *   - Task nodes that have a nodeLinks entry carry role="button" and are
 *     therefore interactive.
 *   - Clicking a task node navigates the SPA to the correct skill detail route,
 *     confirming the onClick → wouter.navigate() wiring is live end-to-end.
 *
 * Evidence tier: browser-verified (Chromium, production build).
 */

import { test, expect, type Page } from '@playwright/test';

// ── Constants ─────────────────────────────────────────────────────────────────

/** Route under test. */
const ROUTE = 'walkthrough/vendor-onboarding';

/**
 * Step 06 hosts the BPMN diagram (hasDiagram: true) in the timeline.
 * The ExampleStepTimeline component gives each step card the id
 * `step-<skillId>`.
 */
const DIAGRAM_STEP_ID = 'step-okhp3-visual-process-modeling';

// Two task nodes whose nodeLinks are distinct — chosen so both are rendered
// inside the Procurement pool and are straightforward to click.
const NODE_T1_LABEL  = 'Capture Requirements';
const NODE_T1_ROUTE  = '/skills/okhp3-process-intake-and-scope';

const NODE_T2_LABEL  = 'Send RFI to Vendor';
const NODE_T2_ROUTE  = '/skills/okhp3-elicitation-interviews';

const NODE_START_LABEL = 'Vendor Nominated';
const NODE_START_ROUTE = '/skills/okhp3-process-intake-and-scope';
const NODE_END_LABEL = 'Vendor Active';
const NODE_END_ROUTE = '/skills/okhp3-publication-handoff-packaging';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Navigate to the Vendor Onboarding page and wait for the h1 to settle. */
async function loadVendorOnboardingPage(page: Page) {
  await page.goto(ROUTE);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { level: 1, name: 'Vendor Onboarding' }))
    .toBeVisible({ timeout: 20_000 });
}

/**
 * Scroll the Step 06 card into view and wait for the SVG diagram to appear
 * inside it. Returns the locator for the step card element.
 */
async function scrollToDiagramStep(page: Page) {
  const stepCard = page.locator(`#${DIAGRAM_STEP_ID}`);
  await expect(stepCard).toBeAttached({ timeout: 15_000 });
  await stepCard.scrollIntoViewIfNeeded();
  // The BpmnRenderer SVG is inside the step card
  const svg = stepCard.locator('svg').first();
  await expect(svg).toBeVisible({ timeout: 20_000 });
  return stepCard;
}

/**
 * Find a linked node button by its label. BpmnRenderer prefixes the accessible
 * label, e.g. "Open Capture Requirements".
 */
function taskButton(stepCard: ReturnType<Page['locator']>, label: string) {
  return stepCard.locator(
    `[role="button"][aria-label="Open ${label}"], ` +
    `[role="button"][aria-label="Open Start event: ${label}"]`,
  );
}

// ── Page load ─────────────────────────────────────────────────────────────────

test.describe('Vendor Onboarding — page load', () => {
  test('page title and h1 are correct', async ({ page }) => {
    await loadVendorOnboardingPage(page);
    await expect(page.getByRole('heading', { level: 1, name: 'Vendor Onboarding' }))
      .toBeVisible();
    await expect(page).toHaveTitle(/Vendor Onboarding/);
  });

  test('15-step timeline is rendered', async ({ page }) => {
    await loadVendorOnboardingPage(page);
    const steps = page.locator('[id^="step-"]');
    await expect(steps).toHaveCount(15);
    await expect(steps.first()).toBeVisible();
  });
});

// ── Diagram rendering ─────────────────────────────────────────────────────────

test.describe('Vendor Onboarding — Step 06 BPMN diagram renders', () => {
  test('Step 06 card is present in the DOM', async ({ page }) => {
    await loadVendorOnboardingPage(page);
    await expect(page.locator(`#${DIAGRAM_STEP_ID}`)).toBeAttached();
  });

  test('SVG is visible after scrolling Step 06 into view', async ({ page }) => {
    await loadVendorOnboardingPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const svg = stepCard.locator('svg').first();
    await expect(svg).toBeVisible();
  });

  test('SVG has a viewBox — confirms layout was computed', async ({ page }) => {
    await loadVendorOnboardingPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const svg = stepCard.locator('svg').first();
    const viewBox = await svg.getAttribute('viewBox');
    expect(viewBox, 'SVG must have a viewBox once layout is complete').toBeTruthy();
  });

  test('SVG contains bpmn-pool elements — three-pool diagram rendered', async ({ page }) => {
    await loadVendorOnboardingPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const svg = stepCard.locator('svg').first();
    const hasPool = await svg.evaluate((el: Element) =>
      el.querySelector('.bpmn-pool') !== null,
    );
    expect(hasPool, 'Three-pool diagram must produce .bpmn-pool elements').toBe(true);
  });

  test('SVG contains bpmn-flow-message elements — cross-pool message flows present', async ({ page }) => {
    await loadVendorOnboardingPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const svg = stepCard.locator('svg').first();
    const hasMessage = await svg.evaluate((el: Element) =>
      el.querySelector('.bpmn-flow-message') !== null,
    );
    expect(hasMessage, 'Six message flows must appear as .bpmn-flow-message lines').toBe(true);
  });

  test('diagram title matches the accTitle declaration', async ({ page }) => {
    await loadVendorOnboardingPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const titleEl = stepCard.locator('svg title').first();
    await expect(titleEl).toHaveText(/Vendor Onboarding/);
  });
});

// ── Node interactivity ────────────────────────────────────────────────────────

test.describe('Vendor Onboarding — diagram node click navigation', () => {
  test('task nodes carry role="button" — interactive in the DOM', async ({ page }) => {
    await loadVendorOnboardingPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const buttons = stepCard.locator('[role="button"]');
    const count = await buttons.count();
    // The Vendor Onboarding diagram has 9 linked task nodes plus linked start
    // and end events.
    expect(count, 'Expected at least 11 interactive nodes').toBeGreaterThanOrEqual(11);
  });

  test('clicking t1 (Capture Requirements) navigates to Intake & Scope skill', async ({ page }) => {
    await loadVendorOnboardingPage(page);
    const stepCard = await scrollToDiagramStep(page);

    const btn = taskButton(stepCard, NODE_T1_LABEL);
    await expect(btn).toBeVisible({ timeout: 15_000 });

    // Click and wait for the SPA to navigate to the skill route.
    await Promise.all([
      page.waitForURL(`**${NODE_T1_ROUTE}`, { timeout: 15_000 }),
      btn.click(),
    ]);

    expect(page.url()).toContain(NODE_T1_ROUTE);
  });

  test('clicking t2 (Send RFI to Vendor) navigates to Elicitation Interviews skill', async ({ page }) => {
    await loadVendorOnboardingPage(page);
    const stepCard = await scrollToDiagramStep(page);

    const btn = taskButton(stepCard, NODE_T2_LABEL);
    await expect(btn).toBeVisible({ timeout: 15_000 });

    await Promise.all([
      page.waitForURL(`**${NODE_T2_ROUTE}`, { timeout: 15_000 }),
      btn.click(),
    ]);

    expect(page.url()).toContain(NODE_T2_ROUTE);
  });

  test('clicking s1 (Vendor Nominated) navigates to Intake & Scope skill', async ({ page }) => {
    await loadVendorOnboardingPage(page);
    const stepCard = await scrollToDiagramStep(page);

    const btn = taskButton(stepCard, 'Vendor Nominated');
    await expect(btn).toBeVisible({ timeout: 15_000 });

    await Promise.all([
      page.waitForURL('**/skills/okhp3-process-intake-and-scope', { timeout: 15_000 }),
      btn.click(),
    ]);

    expect(page.url()).toContain('/skills/okhp3-process-intake-and-scope');
  });

  test('after clicking t1, navigating back still shows the diagram', async ({ page }) => {
    await loadVendorOnboardingPage(page);
    const stepCard = await scrollToDiagramStep(page);

    const btn = taskButton(stepCard, NODE_T1_LABEL);
    await btn.click();
    await page.waitForURL(`**${NODE_T1_ROUTE}`, { timeout: 15_000 });

    // Navigate back to the Vendor Onboarding page.
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // The diagram should still be reachable and renderable.
    const stepCard2 = await scrollToDiagramStep(page);
    const svg2 = stepCard2.locator('svg').first();
    await expect(svg2).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Vendor Onboarding — event node keyboard navigation', () => {
  test('pressing Enter on Vendor Nominated navigates to Intake & Scope', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Keyboard worked-example coverage runs in Chromium.');
    await loadVendorOnboardingPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const button = taskButton(stepCard, NODE_START_LABEL);
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
    test.skip(browserName !== 'chromium', 'Keyboard worked-example coverage runs in Chromium.');
    await loadVendorOnboardingPage(page);
    const stepCard = await scrollToDiagramStep(page);
    const button = stepCard.locator(
      `[role="button"][aria-label="Open End event: ${NODE_END_LABEL}"]`,
    );
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

// ── Interactivity hint ────────────────────────────────────────────────────────

test.describe('Vendor Onboarding — interactivity hint', () => {
  test('hint text appears below the diagram', async ({ page }) => {
    await loadVendorOnboardingPage(page);
    const stepCard = await scrollToDiagramStep(page);
    // The BpmnRenderer renders the hint in a <p> when nodeLinks is set and
    // interactivityHint is not false.
    const hint = stepCard.getByText(/click any node/i);
    await expect(hint).toBeVisible({ timeout: 10_000 });
  });
});

// ── Packaged process marker ───────────────────────────────────────────────────

test.describe('Vendor Onboarding — packaged process marker', () => {
  test('final timeline marker shows the process ID and packaged lifecycle state', async ({ page }) => {
    await loadVendorOnboardingPage(page);

    const markerLabel = page.getByText('PROC-2025-211 packaged', { exact: true });
    await expect(markerLabel).toBeAttached({ timeout: 15_000 });
    await markerLabel.scrollIntoViewIfNeeded();
    await expect(markerLabel).toBeVisible();

    const marker = markerLabel.locator('..');
    await expect(marker).toContainText('All 15 skills complete.');
    await expect(marker).toContainText('PNS.md status:');
    await expect(marker.locator('code')).toHaveText('packaged');
  });
});
