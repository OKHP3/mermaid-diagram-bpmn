/**
 * Playground parse-error line highlight — real-browser validation.
 *
 * Verifies that physical source lines (including comments and blanks) are used
 * for the error stripe, that the editor auto-scrolls to a distant error, and
 * that the stripe remains clipped to the editor viewport after the user scrolls
 * away from it.
 */

import { test, expect } from '@playwright/test';

const leadingComments = Array.from(
  { length: 40 },
  (_, index) => `%% Context note ${index + 1}`,
);
const INVALID_SOURCE = [
  'bpmn-beta',
  ...leadingComments,
  '',
  'pool p1 "Outer" {',
  '',
  '  pool p2 "Inner" {',
  '  }',
  '}',
].join('\n');
const ERROR_LINE = 45;

test('highlights and scrolls to the physical error line without painting outside the editor', async ({ page }) => {
  const encodedSource = Buffer.from(INVALID_SOURCE).toString('base64url');
  await page.goto(`/playground?src=${encodedSource}`);

  const textarea = page.locator('[data-testid="textarea-bpmn-source"]');
  const highlight = page.locator('[data-testid="editor-error-line-highlight"]');
  const errorDetail = page.locator('[data-testid="text-parse-error-detail"]');
  const viewport = page.locator('[data-testid="source-editor-viewport"]');

  await expect(errorDetail).toHaveAttribute('data-parse-error-line', String(ERROR_LINE));
  await expect(highlight).toHaveAttribute('data-error-line', String(ERROR_LINE));
  await expect.poll(() => textarea.evaluate((editor) => editor.scrollTop)).toBeGreaterThan(0);

  await textarea.evaluate((editor) => {
    editor.scrollTop = 0;
    editor.dispatchEvent(new Event('scroll', { bubbles: true }));
  });

  await expect.poll(() => viewport.evaluate((editorViewport) => {
    const stripe = editorViewport.querySelector('[data-testid="editor-error-line-highlight"]');
    if (!stripe) return { overflow: '', belowViewport: false };
    const viewportRect = editorViewport.getBoundingClientRect();
    const stripeRect = stripe.getBoundingClientRect();
    return {
      overflow: getComputedStyle(editorViewport).overflow,
      belowViewport: stripeRect.top >= viewportRect.bottom,
    };
  })).toEqual({ overflow: 'hidden', belowViewport: true });
});