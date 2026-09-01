/**
 * host-demo.spec.ts
 *
 * Real-browser E2E suite for the Mermaid Host Demo page (Task #209).
 *
 * What this proves (beyond the happy-dom integration test):
 *   - bpmn-beta diagrams render correctly through mermaid.registerExternalDiagrams()
 *     and mermaid.render() in real Chromium, Firefox, and WebKit browser DOMs.
 *   - Default securityLevel ('strict') is used — no securityLevel:'loose' workaround.
 *   - All five required coverage areas pass: flat flow, gateway, pool/lane,
 *     cross-pool message flow, and graceful error handling.
 *
 * Evidence tier: browser-verified across all three major browser engines
 * (replaces "source-verified" for the plugin integration claim in
 * docs/capability-ledger.md).
 */

import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Navigate to the demo page and wait until the render phase is complete. */
async function loadDemoPage(page: Page) {
  await page.goto('mermaid-host-demo');
  // The version-metadata panel is always rendered, regardless of diagram state.
  await expect(page.locator('[data-testid="version-metadata"]')).toBeVisible({ timeout: 15_000 });
}

/**
 * Wait for a specific diagram's SVG output to appear.
 * Uses a generous timeout because mermaid.registerExternalDiagrams() +
 * mermaid.render() is async and depends on the browser's script parse time.
 */
async function expectSvgRendered(page: Page, diagramId: string) {
  const locator = page.locator(`[data-testid="svg-output-${diagramId}"] svg`);
  await expect(locator).toBeVisible({ timeout: 30_000 });
  // SVG must be non-trivial — confirm it has a viewBox or width attribute.
  const el = locator.first();
  const viewBox = await el.getAttribute('viewBox');
  const width   = await el.getAttribute('width');
  expect(viewBox || width, `SVG for ${diagramId} has no viewBox or width`).toBeTruthy();
}

/** Assert an error panel appears for the given diagram ID. */
async function expectErrorPanel(page: Page, diagramId: string) {
  await expect(
    page.locator(`[data-testid="error-${diagramId}"]`),
  ).toBeVisible({ timeout: 30_000 });
}

// ── Metadata panel ────────────────────────────────────────────────────────────

test.describe('Host demo — metadata panel', () => {
  test.beforeEach(async ({ page }) => { await loadDemoPage(page); });

  test('version-metadata panel is visible', async ({ page }) => {
    await expect(page.locator('[data-testid="version-metadata"]')).toBeVisible();
  });

  test('security level badge shows strict (default) — not loose', async ({ page }) => {
    const metadata = page.locator('[data-testid="version-metadata"]');
    await expect(metadata).toContainText('strict');
    await expect(metadata).not.toContainText("loose");
  });

  test('environment badge shows real browser DOM', async ({ page }) => {
    await expect(page.locator('[data-testid="version-metadata"]')).toContainText('real browser DOM');
  });

  test('plugin target badge shows the Mermaid version', async ({ page }) => {
    // Format: "mermaid@11.x.x"
    const metadata = page.locator('[data-testid="version-metadata"]');
    await expect(metadata).toContainText(/mermaid@\d+\.\d+\.\d+/);
  });
});

// ── Flat flow (01-linear-process) ─────────────────────────────────────────────

test.describe('Host demo — flat flow diagram (01-linear-process.mmd)', () => {
  test.beforeEach(async ({ page }) => { await loadDemoPage(page); });

  test('renders without error', async ({ page }) => {
    await expectSvgRendered(page, 'demo-linear');
    // Error panel must NOT be present
    await expect(page.locator('[data-testid="error-demo-linear"]')).not.toBeVisible();
  });

  test('SVG contains bpmn-* CSS classes — shape elements are present', async ({ page }) => {
    await expectSvgRendered(page, 'demo-linear');
    const svg = page.locator('[data-testid="svg-output-demo-linear"] svg');
    // bpmn-* classes are added by bpmn-plugin's draw() function
    const hasBpmnClass = await svg.evaluate((el) =>
      el.querySelector('[class*="bpmn-"]') !== null,
    );
    expect(hasBpmnClass, 'SVG should contain elements with bpmn-* CSS classes').toBe(true);
  });
});

// ── Intermediate event export ─────────────────────────────────────────────────

test.describe('Host demo — intermediate event SVG export', () => {
  test.beforeEach(async ({ page }) => { await loadDemoPage(page); });

  test('downloaded SVG retains the plain double-ring circles and label', async ({ page }) => {
    const panel = page.locator('[data-testid="diagram-panel-demo-intermediate-event"]');
    const svg = panel.locator('[data-testid="svg-output-demo-intermediate-event"] svg');
    await expect(svg).toBeVisible({ timeout: 30_000 });

    const intermediateGroup = svg.locator('g').filter({ hasText: 'Validated' }).first();
    await expect(intermediateGroup.locator('circle')).toHaveCount(2);
    await expect(intermediateGroup.locator('circle').nth(0)).toHaveAttribute('r', '18');
    await expect(intermediateGroup.locator('circle').nth(1)).toHaveAttribute('r', '13');
    await expect(intermediateGroup).toContainText('Validated');

    const downloadPromise = page.waitForEvent('download');
    await panel.getByTestId('button-export-svg-demo-intermediate-event').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('intermediate-event.svg');

    const exportedPath = await download.path();
    expect(exportedPath, 'intermediate-event SVG download should be readable').toBeTruthy();
    const exportedSvg = readFileSync(exportedPath!, 'utf8');

    expect(exportedSvg).toContain('Validated');
    expect(exportedSvg.match(/r="18" class="bpmn-event"/g)).toHaveLength(2);
    expect(exportedSvg).toContain('r="13" class="bpmn-event"');
  });
});

// ── Collapsed subprocess export ───────────────────────────────────────────────

test.describe('Host demo — collapsed subprocess SVG export', () => {
  test.beforeEach(async ({ page }) => { await loadDemoPage(page); });

  test('downloaded SVG retains the task-sized box, centered plus marker, and label', async ({ page }) => {
    const panel = page.locator('[data-testid="diagram-panel-demo-collapsed-subprocess"]');
    const svg = panel.locator('[data-testid="svg-output-demo-collapsed-subprocess"] svg');
    await expect(svg).toBeVisible({ timeout: 30_000 });
    await expect(svg).toContainText('Process Order');

    const downloadPromise = page.waitForEvent('download');
    await panel.getByTestId('button-export-svg-demo-collapsed-subprocess').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('collapsed-subprocess.svg');

    const exportedPath = await download.path();
    expect(exportedPath, 'collapsed-subprocess SVG download should be readable').toBeTruthy();
    const exportedSvg = readFileSync(exportedPath!, 'utf8');
    const rect = /<rect x="(-?\d+(?:\.\d+)?)" y="(-?\d+(?:\.\d+)?)" width="120" height="60" rx="6" class="bpmn-task"/.exec(exportedSvg);

    expect(rect, 'exported subprocess should retain its task-sized rounded rectangle').not.toBeNull();
    expect(exportedSvg).toContain('Process Order');
    expect(exportedSvg.match(/class="bpmn-subprocess-marker"/g)).toHaveLength(2);

    const left = Number(rect![1]);
    const top = Number(rect![2]);
    const centerX = left + 60;
    const markerY = top + 51;
    expect(exportedSvg).toContain(
      `x1="${centerX - 5}" y1="${markerY}" x2="${centerX + 5}" y2="${markerY}" class="bpmn-subprocess-marker"`,
    );
    expect(exportedSvg).toContain(
      `x1="${centerX}" y1="${markerY - 5}" x2="${centerX}" y2="${markerY + 5}" class="bpmn-subprocess-marker"`,
    );
  });
});

// ── Gateway decision (02-gateway-decision) ────────────────────────────────────

test.describe('Host demo — gateway diagram (02-gateway-decision.mmd)', () => {
  test.beforeEach(async ({ page }) => { await loadDemoPage(page); });

  test('gateway diagram renders without error', async ({ page }) => {
    await expectSvgRendered(page, 'demo-gateway');
    await expect(page.locator('[data-testid="error-demo-gateway"]')).not.toBeVisible();
  });

  test('gateway SVG contains bpmn-* classes', async ({ page }) => {
    await expectSvgRendered(page, 'demo-gateway');
    const svg = page.locator('[data-testid="svg-output-demo-gateway"] svg');
    const hasBpmnClass = await svg.evaluate((el) =>
      el.querySelector('[class*="bpmn-"]') !== null,
    );
    expect(hasBpmnClass).toBe(true);
  });
});

// ── Pool / lane (08-purchase-order-approval) ──────────────────────────────────

test.describe('Host demo — pool/lane diagram (08-purchase-order-approval.mmd)', () => {
  test.beforeEach(async ({ page }) => { await loadDemoPage(page); });

  test('pool/lane diagram renders without error', async ({ page }) => {
    await expectSvgRendered(page, 'demo-purchase-order');
    await expect(page.locator('[data-testid="error-demo-purchase-order"]')).not.toBeVisible();
  });

  test('pool/lane SVG contains pool-related bpmn-* classes', async ({ page }) => {
    await expectSvgRendered(page, 'demo-purchase-order');
    const svg = page.locator('[data-testid="svg-output-demo-purchase-order"] svg');
    const hasPoolClass = await svg.evaluate((el) =>
      el.querySelector('.bpmn-pool, .bpmn-lane, [class*="bpmn-pool"], [class*="bpmn-lane"]') !== null,
    );
    expect(hasPoolClass, 'Pool/lane SVG should contain pool or lane elements').toBe(true);
  });
});

// ── Cross-pool / message flow (06-cross-pool-collaboration) ───────────────────

test.describe('Host demo — cross-pool message flow (06-cross-pool-collaboration.mmd)', () => {
  test.beforeEach(async ({ page }) => { await loadDemoPage(page); });

  test('cross-pool diagram renders without error', async ({ page }) => {
    await expectSvgRendered(page, 'demo-cross-pool');
    await expect(page.locator('[data-testid="error-demo-cross-pool"]')).not.toBeVisible();
  });

  test('cross-pool SVG is non-empty and contains bpmn-* classes', async ({ page }) => {
    await expectSvgRendered(page, 'demo-cross-pool');
    const svg = page.locator('[data-testid="svg-output-demo-cross-pool"] svg');
    const hasBpmnClass = await svg.evaluate((el) =>
      el.querySelector('[class*="bpmn-"]') !== null,
    );
    expect(hasBpmnClass).toBe(true);
  });
});

test.describe('Host demo — non-purchase process corpus', () => {
  test.beforeEach(async ({ page }) => { await loadDemoPage(page); });

  for (const [diagramId, title] of [
    ['demo-employee-onboarding', 'Employee onboarding'],
    ['demo-quote-to-order', 'Quote to order'],
    ['demo-support-ticket', 'Support ticket triage'],
  ]) {
    test(`${title} renders as a non-empty Mermaid SVG`, async ({ page }) => {
      await expectSvgRendered(page, diagramId);
      await expect(page.locator(`[data-testid="error-${diagramId}"]`)).not.toBeVisible();
      const shapeCount = await page
        .locator(`[data-testid="svg-output-${diagramId}"] svg [class*="bpmn-"]`)
        .count();
      expect(shapeCount, `${title} SVG should contain BPMN shapes`).toBeGreaterThan(0);
    });
  }
});

// ── Error case — invalid source ───────────────────────────────────────────────

test.describe('Host demo — error case (invalid bpmn-beta source)', () => {
  test.beforeEach(async ({ page }) => { await loadDemoPage(page); });

  test('error panel appears for invalid source — no crash', async ({ page }) => {
    // The demo page renders an intentionally invalid source as the last entry.
    await expectErrorPanel(page, 'demo-error-case');
  });

  test('error panel does not crash the page — other diagrams still render', async ({ page }) => {
    // The flat flow diagram should still render even when the error-case entry fails.
    await expectSvgRendered(page, 'demo-linear');
  });

  test('no top-level registration error — only the per-diagram error panel shows', async ({ page }) => {
    // The registration-error testid appears only when registerExternalDiagrams() itself throws.
    await expect(page.locator('[data-testid="registration-error"]')).not.toBeVisible();
  });
});

// ── Render-status badge ───────────────────────────────────────────────────────

test.describe('Host demo — render-status badge', () => {
  test.beforeEach(async ({ page }) => { await loadDemoPage(page); });

  test('render-status badge eventually appears after loading', async ({ page }) => {
    // Wait for at least one diagram output — confirms the page is no longer in 'loading' phase.
    await expectSvgRendered(page, 'demo-linear');
    // The metadata panel now shows a render-status badge
    await expect(page.locator('[data-testid="version-metadata"]')).toContainText(/rendered|error/i);
  });
});
