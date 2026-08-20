/**
 * Playground lint warnings — real-browser coverage.
 *
 * Confirms advisory diagnostics remain visibly distinct from parse errors and
 * never block rendering of a valid bpmn-beta diagram.
 */

import { expect, test } from '@playwright/test';

const SOURCE_WITH_WARNING = [
  'bpmn-beta',
  'accTitle: Browser lint warning',
  'task:user t1 "Review request"',
  'end e1 "Complete"',
  't1 --> e1',
].join('\n');

const LEADING_COMMENTS = Array.from(
  { length: 40 },
  (_, index) => `%% Context note ${index + 1}`,
);
const SOURCE_WITH_DISTANT_GATEWAY_WARNING = [
  'bpmn-beta',
  ...LEADING_COMMENTS,
  'start s1 "Start"',
  'xor g1 "Route?"',
  'end e1 "Done"',
  's1 --> g1',
  'g1 --> e1',
].join('\n');
const GATEWAY_WARNING_LINE = 43;

test('shows an amber in-viewport warning panel while the diagram still renders', async ({ page }) => {
  await page.goto('/playground');

  await page.locator('[data-testid="textarea-bpmn-source"]').fill(SOURCE_WITH_WARNING);

  const warningPanel = page.locator('[data-testid="div-lint-warnings"]');
  const warningBadge = page.locator('[data-testid="badge-lint-warnings"]');
  const diagram = page.locator('[data-testid="div-diagram-preview"] svg');

  await expect(warningPanel).toBeVisible();
  await expect(warningPanel).toHaveClass(/bg-amber-50\/80/);
  await expect(warningPanel).toContainText('Warning');
  await expect(warningPanel).toContainText('diagram still renders');
  await expect(warningBadge).toHaveText('1 warning');
  await expect(page.locator('[data-testid="text-parse-error"]')).toHaveCount(0);
  await expect(diagram).toBeVisible();
  await expect(diagram).toContainText('Review request');

  await expect.poll(() => warningPanel.evaluate((panel) => {
    const rect = panel.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  })).toBe(true);
});

test('shows a lint warning line and takes the author to the flagged source row', async ({ page }) => {
  await page.goto('/playground');

  const textarea = page.locator('[data-testid="textarea-bpmn-source"]');
  await textarea.fill(SOURCE_WITH_DISTANT_GATEWAY_WARNING);

  const lineButton = page.getByRole('button', {
    name: `Go to line ${GATEWAY_WARNING_LINE} for GATEWAY_SINGLE_OUTFLOW`,
  });
  await expect(lineButton).toHaveText(`Line ${GATEWAY_WARNING_LINE}`);
  await textarea.evaluate((editor) => {
    editor.scrollTop = 0;
    editor.dispatchEvent(new Event('scroll', { bubbles: true }));
  });
  await lineButton.click();

  const highlight = page.locator('[data-testid="editor-lint-warning-line-highlight"]');
  await expect(highlight).toHaveAttribute('data-lint-warning-line', String(GATEWAY_WARNING_LINE));
  await expect(textarea).toBeFocused();
  await expect.poll(() => textarea.evaluate((editor) => editor.scrollTop)).toBeGreaterThan(0);
});