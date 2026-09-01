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
 *    - Home, Playground, AgentSkills, Walkthrough hub, and worked examples at
 *      1280×800 (desktop) and 375×812 (mobile); Mermaid Host Demo at desktop;
 *      Home and AgentSkills at desktop and 375×812 mobile in dark mode
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

/** Resolve SPA routes relative to the configured Vite base path. */
function routePath(path: string) {
  return path.replace(/^\/+/, '');
}

/**
 * Navigate to a route and wait for the page and its lazy-loaded chunk to settle.
 * The `networkidle` state covers the chunk download; `visibleSelector` confirms
 * the Suspense boundary has resolved and content is actually painted.
 */
async function loadPage(page: Page, path: string, visibleSelector: string) {
  await page.goto(routePath(path));
  await page.waitForLoadState('networkidle');
  await expect(page.locator(visibleSelector).first()).toBeVisible({ timeout: 20_000 });
}

/**
 * Emulate the browser's dark preference and seed the app's persisted theme
 * before navigating, so class-based dark variants are included in snapshots.
 */
async function loadDarkPage(page: Page, path: string, visibleSelector: string) {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await loadPage(page, path, visibleSelector);
  await expect(page.locator('html')).toHaveClass(/dark/);
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

/** Load a worked example and verify its complete 15-step process timeline. */
async function loadWalkthroughExample(page: Page, path: string, heading: string) {
  await loadPage(page, path, 'h1');
  await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();

  const steps = page.locator('[id^="step-"]');
  await expect(steps).toHaveCount(15);
  await expect(steps.first()).toBeVisible();
}

/** Load the Walkthrough hub and wait for its pipeline and handoff table. */
async function loadWalkthroughHub(page: Page) {
  await loadPage(page, 'walkthrough', '[data-testid="walkthrough-pipeline-diagram"]');
  await expect(page.getByRole('heading', { level: 1, name: 'BP-SKILL Suite Walkthrough' })).toBeVisible();
  await expect(page.locator('[data-testid="walkthrough-pipeline-diagram"] svg')).toBeVisible();
  await expect(page.locator('[data-testid="walkthrough-table"]')).toBeVisible();
  await expect(page.locator('[id^="row-"][id$="-lg"]')).toHaveCount(15);
  await expect(page.locator('[id^="row-"][id$="-sm"]')).toHaveCount(15);
}

/** Load the lazy Mermaid demo and wait for every documented terminal panel state. */
async function loadMermaidHostDemo(page: Page) {
  await loadPage(page, 'mermaid-host-demo', '[data-testid="version-metadata"]');
  await expect(page.getByRole('heading', { level: 1, name: 'Mermaid Host Demo' })).toBeVisible();
  await Promise.all(
    ['demo-linear', 'demo-gateway', 'demo-purchase-order', 'demo-cross-pool'].map((diagramId) =>
      expect(page.locator(`[data-testid="svg-output-${diagramId}"] svg`)).toBeVisible({ timeout: 30_000 }),
    ),
  );
  await expect(page.locator('[data-testid="error-demo-error-case"]')).toBeVisible({ timeout: 30_000 });
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

// ── Home — dark-mode desktop ───────────────────────────────────────────────────

test.describe('Home — dark-mode desktop 1280×800', () => {
  test.use({ viewport: DESKTOP });

  test('visual snapshot', async ({ page }) => {
    await loadDarkPage(page, '/', '[data-testid="heading-hero"]');
    await expect(page).toHaveScreenshot('home-desktop-dark.png', { maxDiffPixelRatio: 0.02 });
  });
});

// ── Home — dark-mode mobile ─────────────────────────────────────────────────────

test.describe('Home — dark-mode mobile 375×812', () => {
  test.use({ viewport: MOBILE });

  test('visual snapshot', async ({ page }) => {
    await loadDarkPage(page, '/', '[data-testid="heading-hero"]');
    await expect(page).toHaveScreenshot('home-mobile-dark.png', { maxDiffPixelRatio: 0.02 });
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

  test('navigation is present in the DOM', async ({ page }) => {
    await loadPage(page, '/', '[data-testid="heading-hero"]');
    // The nav element is always in the DOM (CSS controls visibility at breakpoints)
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

  test('search input is accessible on mobile (height ≥ 28 px)', async ({ page }) => {
    await loadPage(page, '/skills', '[aria-label="Search skills"]');
    const search = page.locator('[aria-label="Search skills"]');
    await expect(search).toBeVisible();
    const box = await search.boundingBox();
    expect(box, 'Search input bounding box must exist').toBeTruthy();
    // WCAG 2.5.8 (AA) minimum touch target is 24 px; 28 px gives a comfortable margin.
    // The input renders at 30 px on mobile — this threshold guards against regressing below WCAG AA.
    expect(box!.height, 'Search input height ≥ 28 px on mobile').toBeGreaterThanOrEqual(28);
  });

  test('conditional N/A guidance remains readable when a PNS section is opened', async ({ page }) => {
    await loadPage(page, '/skills', 'h1');

    await page.getByRole('button', {
      name: /The Process Narrative Specification — The Handoff Artifact/i,
    }).click();

    const section = page.getByRole('button', { name: /Evidence & Sources/i });
    await section.scrollIntoViewIfNeeded();
    await section.click();

    const guidance = page.getByText(
      'May be marked N/A only for processes documented entirely from pre-existing formal SOPs with no elicitation required.',
      { exact: true },
    );
    await expect(guidance).toBeVisible();

    const box = await guidance.boundingBox();
    expect(box, 'Conditional N/A guidance must have a rendered bounding box').toBeTruthy();
    expect(box!.width, 'Conditional N/A guidance must have readable width').toBeGreaterThan(0);
    expect(box!.height, 'Conditional N/A guidance must have readable height').toBeGreaterThan(0);
    expect(
      box!.x + box!.width,
      'Conditional N/A guidance must remain within the mobile viewport',
    ).toBeLessThanOrEqual(375);
  });

  test('visual snapshot', async ({ page }) => {
    await loadPage(page, '/skills', '[aria-label="Search skills"]');
    await expect(page).toHaveScreenshot('skills-mobile.png', { maxDiffPixelRatio: 0.02 });
  });
});

// ── Walkthrough hub ────────────────────────────────────────────────────────────

test.describe('AgentSkills — dark-mode desktop 1280×800', () => {
  test.use({ viewport: DESKTOP });

  test('visual snapshot', async ({ page }) => {
    await loadDarkPage(page, '/skills', '[aria-label="Search skills"]');
    await expect(page).toHaveScreenshot('skills-desktop-dark.png', { maxDiffPixelRatio: 0.02 });
  });
});

test.describe('AgentSkills — dark-mode mobile 375×812', () => {
  test.use({ viewport: MOBILE });

  test('visual snapshot', async ({ page }) => {
    await loadDarkPage(page, '/skills', '[aria-label="Search skills"]');
    await expect(page).toHaveScreenshot('skills-mobile-dark.png', { maxDiffPixelRatio: 0.02 });
  });
});

test.describe('Walkthrough hub — desktop 1280×800', () => {
  test.use({ viewport: DESKTOP });

  test('no horizontal overflow', async ({ page }) => {
    await loadWalkthroughHub(page);
    await assertNoHorizontalOverflow(page, 'Walkthrough hub/desktop');
  });

  test('heading, pipeline diagram, and handoff table are present', async ({ page }) => {
    await loadWalkthroughHub(page);
  });

  test('visual snapshot', async ({ page }) => {
    await loadWalkthroughHub(page);
    await page.locator('[data-testid="walkthrough-pipeline-diagram"]').scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot('walkthrough-desktop.png', { maxDiffPixelRatio: 0.03 });
  });
});

test.describe('Walkthrough hub — mobile 375×812', () => {
  test.use({ viewport: MOBILE });

  test('no horizontal overflow', async ({ page }) => {
    await loadWalkthroughHub(page);
    await assertNoHorizontalOverflow(page, 'Walkthrough hub/mobile');
  });

  test('heading, pipeline diagram, and handoff table are present', async ({ page }) => {
    await loadWalkthroughHub(page);
  });

  test('visual snapshot', async ({ page }) => {
    await loadWalkthroughHub(page);
    await page.locator('[data-testid="walkthrough-pipeline-diagram"]').scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot('walkthrough-mobile.png', { maxDiffPixelRatio: 0.03 });
  });
});

// ── Purchase Approval worked example ───────────────────────────────────────────

test.describe('Purchase Approval walkthrough — desktop 1280×800', () => {
  test.use({ viewport: DESKTOP });

  test('no horizontal overflow', async ({ page }) => {
    await loadWalkthroughExample(page, '/walkthrough/purchase-approval', 'Purchase Approval');
    await assertNoHorizontalOverflow(page, 'Purchase Approval/desktop');
  });

  test('heading and 15-step timeline are present', async ({ page }) => {
    await loadWalkthroughExample(page, '/walkthrough/purchase-approval', 'Purchase Approval');
  });

  test('visual snapshot', async ({ page }) => {
    await loadWalkthroughExample(page, '/walkthrough/purchase-approval', 'Purchase Approval');
    await page.locator('[id^="step-"]').first().scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot('purchase-approval-desktop.png', { maxDiffPixelRatio: 0.02 });
  });
});

test.describe('Purchase Approval walkthrough — mobile 375×812', () => {
  test.use({ viewport: MOBILE });

  test('no horizontal overflow', async ({ page }) => {
    await loadWalkthroughExample(page, '/walkthrough/purchase-approval', 'Purchase Approval');
    await assertNoHorizontalOverflow(page, 'Purchase Approval/mobile');
  });

  test('heading and 15-step timeline are present', async ({ page }) => {
    await loadWalkthroughExample(page, '/walkthrough/purchase-approval', 'Purchase Approval');
  });

  test('visual snapshot', async ({ page }) => {
    await loadWalkthroughExample(page, '/walkthrough/purchase-approval', 'Purchase Approval');
    await page.locator('[id^="step-"]').first().scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot('purchase-approval-mobile.png', { maxDiffPixelRatio: 0.02 });
  });
});

// ── Employee Offboarding worked example ────────────────────────────────────────

test.describe('Employee Offboarding walkthrough — desktop 1280×800', () => {
  test.use({ viewport: DESKTOP });

  test('no horizontal overflow', async ({ page }) => {
    await loadWalkthroughExample(page, '/walkthrough/employee-offboarding', 'Employee Offboarding');
    await assertNoHorizontalOverflow(page, 'Employee Offboarding/desktop');
  });

  test('heading and 15-step timeline are present', async ({ page }) => {
    await loadWalkthroughExample(page, '/walkthrough/employee-offboarding', 'Employee Offboarding');
  });

  test('visual snapshot', async ({ page }) => {
    await loadWalkthroughExample(page, '/walkthrough/employee-offboarding', 'Employee Offboarding');
    await page.locator('[id^="step-"]').first().scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot('employee-offboarding-desktop.png', { maxDiffPixelRatio: 0.02 });
  });
});

test.describe('Employee Offboarding walkthrough — mobile 375×812', () => {
  test.use({ viewport: MOBILE });

  test('no horizontal overflow', async ({ page }) => {
    await loadWalkthroughExample(page, '/walkthrough/employee-offboarding', 'Employee Offboarding');
    await assertNoHorizontalOverflow(page, 'Employee Offboarding/mobile');
  });

  test('heading and 15-step timeline are present', async ({ page }) => {
    await loadWalkthroughExample(page, '/walkthrough/employee-offboarding', 'Employee Offboarding');
  });

  test('visual snapshot', async ({ page }) => {
    await loadWalkthroughExample(page, '/walkthrough/employee-offboarding', 'Employee Offboarding');
    await page.locator('[id^="step-"]').first().scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot('employee-offboarding-mobile.png', { maxDiffPixelRatio: 0.02 });
  });
});

// ── Vendor Onboarding worked example ───────────────────────────────────────────

test.describe('Vendor Onboarding walkthrough — desktop 1280×800', () => {
  test.use({ viewport: DESKTOP });

  test('no horizontal overflow', async ({ page }) => {
    await loadWalkthroughExample(page, '/walkthrough/vendor-onboarding', 'Vendor Onboarding');
    await assertNoHorizontalOverflow(page, 'Vendor Onboarding/desktop');
  });

  test('heading and 15-step timeline are present', async ({ page }) => {
    await loadWalkthroughExample(page, '/walkthrough/vendor-onboarding', 'Vendor Onboarding');
  });

  test('visual snapshot', async ({ page }) => {
    await loadWalkthroughExample(page, '/walkthrough/vendor-onboarding', 'Vendor Onboarding');
    await page.locator('[id^="step-"]').first().scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot('vendor-onboarding-desktop.png', { maxDiffPixelRatio: 0.02 });
  });
});

test.describe('Vendor Onboarding walkthrough — mobile 375×812', () => {
  test.use({ viewport: MOBILE });

  test('no horizontal overflow', async ({ page }) => {
    await loadWalkthroughExample(page, '/walkthrough/vendor-onboarding', 'Vendor Onboarding');
    await assertNoHorizontalOverflow(page, 'Vendor Onboarding/mobile');
  });

  test('heading and 15-step timeline are present', async ({ page }) => {
    await loadWalkthroughExample(page, '/walkthrough/vendor-onboarding', 'Vendor Onboarding');
  });

  test('visual snapshot', async ({ page }) => {
    await loadWalkthroughExample(page, '/walkthrough/vendor-onboarding', 'Vendor Onboarding');
    await page.locator('[id^="step-"]').first().scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot('vendor-onboarding-mobile.png', { maxDiffPixelRatio: 0.02 });
  });
});

// ── Mermaid Host Demo — desktop ────────────────────────────────────────────────

test.describe('Mermaid Host Demo — desktop 1280×800', () => {
  test.use({ viewport: DESKTOP });

  test('no horizontal overflow', async ({ page }) => {
    await loadMermaidHostDemo(page);
    await assertNoHorizontalOverflow(page, 'Mermaid Host Demo/desktop');
  });

  test('heading and rendered diagram panels are present', async ({ page }) => {
    await loadMermaidHostDemo(page);
    await expect(page.locator('[data-testid^="diagram-panel-"]')).toHaveCount(10);
  });

  test('visual snapshot', async ({ page }) => {
    await loadMermaidHostDemo(page);
    await page.locator('[data-testid="diagram-panel-demo-linear"]').scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot('mermaid-host-demo-desktop.png', { maxDiffPixelRatio: 0.03 });
  });
});

// ── Header dropdown keyboard focus — desktop ───────────────────────────────────

test.describe('Header dropdown keyboard focus — desktop', () => {
  test.use({ viewport: DESKTOP });

  test('Arrow-key navigation shows a distinct focus ring in light and dark themes', async ({ page }) => {
    await loadPage(page, '/playground', '[data-testid="heading-playground"]');
    const trigger = page.locator('[data-testid="nav-plugin-dropdown"]');

    async function assertFocusRing() {
      await trigger.focus();
      await page.keyboard.press('ArrowDown');

      const menuItems = page.locator('[role="menuitem"]');
      const focusedItem = menuItems.first();
      await expect(focusedItem).toBeFocused();
      const focusStyle = await focusedItem.evaluate(element => {
        const style = getComputedStyle(element);
        return {
          outlineStyle: style.outlineStyle,
          outlineWidth: style.outlineWidth,
          outlineOffset: style.outlineOffset,
        };
      });
      expect(focusStyle.outlineStyle).toBe('solid');
      expect(parseFloat(focusStyle.outlineWidth)).toBeGreaterThanOrEqual(2);
      expect(parseFloat(focusStyle.outlineOffset)).toBeGreaterThanOrEqual(1);

      // A hovered non-focused item retains the hover treatment without the
      // keyboard-only outline, so the focused item remains unambiguous.
      const hoveredItem = menuItems.nth(1);
      await hoveredItem.hover();
      const hoverOutlineStyle = await hoveredItem.evaluate(
        element => getComputedStyle(element).outlineStyle,
      );
      expect(hoverOutlineStyle).toBe('none');

      await page.keyboard.press('Escape');
      await expect(page.locator('[role="menu"]')).toHaveCount(0);
    }

    await assertFocusRing();
    await page.locator('[data-testid="button-toggle-theme"]').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await assertFocusRing();
  });
});
