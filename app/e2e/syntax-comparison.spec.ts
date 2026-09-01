/**
 * Public comparison evidence regression.
 *
 * This runs against the production build served by playwright.config.ts and
 * checks only the evidence visitors need to see on the comparison route. It
 * intentionally does not cover keyboard navigation, scrolling, or responsive
 * layout behavior.
 */
import { expect, test } from '@playwright/test';

const PUBLIC_SYNTAX_LABELS = [
  'bpmn-beta',
  'DFKI #7699',
  '@derari',
  'PlantUML',
  'Mermaid flowchart',
];

const DERARI_CATEGORY_HEADINGS = [
  '# linear flow',
  '# gateway split',
  '# pool / lane structure',
  '# message flow',
];

test.describe('Syntax comparison public evidence', () => {
  test('keeps syntax labels, @derari categories, and review dates visible', async ({ page }) => {
    await page.goto('comparison');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Syntax Comparison' }),
    ).toBeVisible();

    for (const label of PUBLIC_SYNTAX_LABELS) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }

    const derariCode = page.locator('pre').filter({ hasText: '# linear flow' });
    await expect(derariCode).toBeVisible();
    for (const heading of DERARI_CATEGORY_HEADINGS) {
      await expect(derariCode).toContainText(heading);
    }

    await expect(
      page.getByText('DFKI #7699 example source', { exact: true }).locator('..'),
    ).toContainText('reviewed 2026-08-22');
    await expect(
      page.getByText('@derari live prototype', { exact: true }).locator('..'),
    ).toContainText('checked 2026-08-21');
  });
});