/**
 * visual-regression.spec.ts
 *
 * Visual and mobile regression checks — Task #213.
 *
 * Two check layers:
 *
 * 1. PROGRAMMATIC LAYOUT ASSERTIONS (always run, no image baseline required)
 *    - No horizontal overflow at mobile (375 px)
 *    - Primary CTAs / interactive controls meet minimum tap-target height (≥ 36 px)
 *    - Key headings and structural elements are visible
 *    These are the merge-blocking CI gates.
 *
 * 2. VISUAL SNAPSHOTS (pixel comparison against committed baselines)
 *    - Home, Playground, and AgentSkills at 1280×800 (desktop) and 375×812 (mobile)
 *    - maxDiffPixelRatio: 0.02 (2 %) for content pages; 0.03 for the Playground
 *      (diagram rendering has minor sub-pixel variance)
 *    - Baselines are Linux/Chromium PNGs stored in app/e2e/__snapshots__/.
 *      The CI visual-regression job regenerates and commits them on every push
 *      to main; PRs compare against the committed baselines.
 *
 * To update baselines locally (if Playwright + Chromium are available):
 *   pnpm --filter @workspace/mermaid-diagram-bpmn run test:e2e:update-snapshots
 */

import { test, expect, type Page } from '@playwright/test';

// ── Viewport definitions ──────────────────────────────────────────────────────

const DESKTOP = { width: 1280, height: 800 };
const MOBILE  = { width: 375,  height: 812 };

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Navigate to a route and wait for the page and its lazy-loaded chunk to settle.
 * The `networkidle` state covers the chunk download; `visibleSelector` confirms
 * the Suspense boundary has resolved and content is actually painted.
 */
async function loadPage(page: Page, path: string, visibleSelector: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await expect(page.locator(visibleSelector).first()).toBeVisible({ timeout: 20_000 });
}

/**
 * Assert there is no horizontal scrollbar / content overflow.
 * Returns the overflow amount in pixels (0 = no overflow).
 */
async function assertNoHorizontalOverflow(page: Page, label: string) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, `${label}: horizontal overflow = ${overflow}px`).toBe(0);
}

// ── Home — desktop ────────────────────────────────────────────────────────────

test.describe('Home — desktop 1280×800', () => {
  test.use({ viewport: DESKTOP });

  test('no horizontal overflow', async ({ page }) => {
    await loadPage(page, '/', '[data-testid="heading-hero"]');
    await assertNoHorizontalOverflow(page, 'Home/desktop');
  });

  test('hero heading is visible', async ({ page }) => {
    await loadPage(page, '/', '[data-testid="heading-hero"]');
    await expect(page.locator('[data-testid="heading-hero"]')).toBeVisible();
  });

  test('3 path cards are rendered', async ({ page }) => {
    await loadPage(page, '/', '[data-testid="path-chooser"]');
    await expect(page.locator('[data-testid^="path-card-"]')).toHaveCount(3);
  });

  test('primary CTA meets minimum height (36 px)', async ({ page }) => {
    await loadPage(page, '/', '[data-testid="button-open-playground"]');
    const box = await page.locator('[data-testid="button-open-playground"]').boundingBox();
    expect(box, 'CTA bounding box must exist').toBeTruthy();
    expect(box!.height, 'CTA height ≥ 36 px').toBeGreaterThanOrEqual(36);
  });

  test('visual snapshot', async ({ page }) => {
    await loadPage(page, '/', '[data-testid="heading-hero"]');
    await expect(page).toHaveScreenshot('home-desktop.png', { maxDiffPixelRatio: 0.02 });
  });
});

// ── Home — mobile ─────────────────────────────────────────────────────────────

test.describe('Home — mobile 375×812', () => {
  test.use({ viewport: MOBILE });

  test('no horizontal overflow', async ({ page }) => {
    await loadPage(page, '/', '[data-testid="heading-hero"]');
    await assertNoHorizontalOverflow(page, 'Home/mobile');
  });

  test('hero heading is visible at mobile viewport', async ({ page }) => {
    await loadPage(page, '/', '[data-testid="heading-hero"]');
    await expect(page.locator('[data-testid="heading-hero"]')).toBeVisible();
  });

  test('path cards are visible (stacked single column)', async ({ page }) => {
    await loadPage(page, '/', '[data-testid="path-chooser"]');
    const cards = page.locator('[data-testid^="path-card-"]');
    await expect(cards).toHaveCount(3);
    await expect(cards.first()).toBeVisible();
  });

  test('navigation is present', async ({ page }) => {
    await loadPage(page, '/', 'nav');
    // Either the full nav or mobile nav container is in the DOM
    await expect(page.locator('nav').first()).toBeAttached();
  });

  test('primary CTA tap-target height ≥ 36 px', async ({ page }) => {
    await loadPage(page, '/', '[data-testid="button-open-playground"]');
    const box = await page.locator('[data-testid="button-open-playground"]').boundingBox();
    expect(box, 'CTA bounding box must exist').toBeTruthy();
    expect(box!.height, 'CTA touch-target height ≥ 36 px').toBeGreaterThanOrEqual(36);
  });

  test('visual snapshot', async ({ page }) => {
    await loadPage(page, '/', '[data-testid="heading-hero"]');
    await expect(page).toHaveScreenshot('home-mobile.png', { maxDiffPixelRatio: 0.02 });
  });
});

// ── Playground — desktop ──────────────────────────────────────────────────────

test.describe('Playground — desktop 1280×800', () => {
  test.use({ viewport: DESKTOP });

  test('no horizontal overflow', async ({ page }) => {
    await loadPage(page, '/playground', '[data-testid="heading-playground"]');
    await assertNoHorizontalOverflow(page, 'Playground/desktop');
  });

  test('heading is visible', async ({ page }) => {
    await loadPage(page, '/playground', '[data-testid="heading-playground"]');
    await expect(page.locator('[data-testid="heading-playground"]')).toBeVisible();
  });

  test('source textarea is visible', async ({ page }) => {
    await loadPage(page, '/playground', '[data-testid="textarea-bpmn-source"]');
    await expect(page.locator('[data-testid="textarea-bpmn-source"]')).toBeVisible();
  });

  test('at least one example tab is rendered', async ({ page }) => {
    await loadPage(page, '/playground', '[data-testid^="button-example-"]');
    const count = await page.locator('[data-testid^="button-example-"]').count();
    expect(count, 'At least one example tab button').toBeGreaterThan(0);
  });

  test('visual snapshot', async ({ page }) => {
    await loadPage(page, '/playground', '[data-testid="textarea-bpmn-source"]');
    // Brief pause for the initial diagram render to complete
    await page.waitForTimeout(800);
    await expect(page).toHaveScreenshot('playground-desktop.png', { maxDiffPixelRatio: 0.03 });
  });
});

// ── Playground — mobile ───────────────────────────────────────────────────────

test.describe('Playground — mobile 375×812', () => {
  test.use({ viewport: MOBILE });

  test('no horizontal overflow', async ({ page }) => {
    await loadPage(page, '/playground', '[data-testid="heading-playground"]');
    await assertNoHorizontalOverflow(page, 'Playground/mobile');
  });

  test('heading is visible', async ({ page }) => {
    await loadPage(page, '/playground', '[data-testid="heading-playground"]');
    await expect(page.locator('[data-testid="heading-playground"]')).toBeVisible();
  });

  test('source textarea is accessible at 375 px (width ≥ 300 px)', async ({ page }) => {
    await loadPage(page, '/playground', '[data-testid="textarea-bpmn-source"]');
    const textarea = page.locator('[data-testid="textarea-bpmn-source"]');
    await expect(textarea).toBeVisible();
    const box = await textarea.boundingBox();
    expect(box, 'Textarea bounding box must exist').toBeTruthy();
    expect(box!.width, 'Textarea width ≥ 300 px on 375 px viewport').toBeGreaterThanOrEqual(300);
  });

  test('visual snapshot', async ({ page }) => {
    await loadPage(page, '/playground', '[data-testid="textarea-bpmn-source"]');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('playground-mobile.png', { maxDiffPixelRatio: 0.03 });
  });
});

// ── AgentSkills — desktop ─────────────────────────────────────────────────────

test.describe('AgentSkills — desktop 1280×800', () => {
  test.use({ viewport: DESKTOP });

  test('no horizontal overflow', async ({ page }) => {
    await loadPage(page, '/skills', 'h1');
    await assertNoHorizontalOverflow(page, 'AgentSkills/desktop');
  });

  test('page heading is visible', async ({ page }) => {
    await loadPage(page, '/skills', 'h1');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('search input is visible and labelled', async ({ page }) => {
    await loadPage(page, '/skills', '[aria-label="Search skills"]');
    await expect(page.locator('[aria-label="Search skills"]')).toBeVisible();
  });

  test('at least one skill card is rendered', async ({ page }) => {
    await loadPage(page, '/skills', 'h1');
    // Skills cards use the .forge-card class from the design system
    const firstCard = page.locator('.forge-card').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });
  });

  test('visual snapshot', async ({ page }) => {
    await loadPage(page, '/skills', '[aria-label="Search skills"]');
    await expect(page).toHaveScreenshot('skills-desktop.png', { maxDiffPixelRatio: 0.02 });
  });
});

// ── AgentSkills — mobile ──────────────────────────────────────────────────────

test.describe('AgentSkills — mobile 375×812', () => {
  test.use({ viewport: MOBILE });

  test('no horizontal overflow', async ({ page }) => {
    await loadPage(page, '/skills', 'h1');
    await assertNoHorizontalOverflow(page, 'AgentSkills/mobile');
  });

  test('page heading is visible at 375 px', async ({ page }) => {
    await loadPage(page, '/skills', 'h1');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('search input is accessible on mobile (height ≥ 36 px)', async ({ page }) => {
    await loadPage(page, '/skills', '[aria-label="Search skills"]');
    const search = page.locator('[aria-label="Search skills"]');
    await expect(search).toBeVisible();
    const box = await search.boundingBox();
    expect(box, 'Search input bounding box must exist').toBeTruthy();
    expect(box!.height, 'Search input height ≥ 36 px on mobile').toBeGreaterThanOrEqual(36);
  });

  test('visual snapshot', async ({ page }) => {
    await loadPage(page, '/skills', '[aria-label="Search skills"]');
    await expect(page).toHaveScreenshot('skills-mobile.png', { maxDiffPixelRatio: 0.02 });
  });
});
