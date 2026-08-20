/**
 * Playground parse-error line highlight — real-browser validation.
 *
 * Verifies that physical source lines (including comments and blanks) are used
 * for the error stripe, that the editor auto-scrolls to a distant error, and
 * that the stripe remains clipped to the editor viewport after the user scrolls
 * away from it.
 */

import { test, expect } from '@playwright/test';
import { deflateRawSync } from 'node:zlib';

const leadingComments = Array.from(
  { length: 40 },
  (index) => index === 20
    ? `%% ${'A deliberately long editor comment. '.repeat(16)}`
    : `%% Context note ${index + 1}`,
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

const COMPRESSED_SHARED_SOURCE = [
  'bpmn-beta',
  'accTitle: Compressed Browser Round Trip',
  'start s1 "Receive request"',
  'task:user t1 "Review request"',
  'end e1 "Complete"',
  's1 --> t1',
  't1 --> e1',
].join('\n');
const OVERSIZED_COMPRESSED_SOURCE = 'x'.repeat(18_001);

function encodeCompressedSource(source: string): string {
  const compressed = deflateRawSync(Buffer.from(source, 'utf8'));
  return Buffer.concat([Buffer.from([0x01]), compressed]).toString('base64url');
}

test('loads a versioned compressed shared source in a real browser', async ({ page }) => {
  await page.goto(`/playground?src=${encodeCompressedSource(COMPRESSED_SHARED_SOURCE)}`);

  const textarea = page.locator('[data-testid="textarea-bpmn-source"]');
  await expect(textarea).toHaveValue(COMPRESSED_SHARED_SOURCE);
});

test('falls back safely when a compressed shared source exceeds the limit', async ({ page }) => {
  await page.goto(`/playground?src=${encodeCompressedSource(OVERSIZED_COMPRESSED_SOURCE)}`);

  const textarea = page.locator('[data-testid="textarea-bpmn-source"]');
  await page.waitForTimeout(250);
  await expect(textarea).toHaveValue(/bpmn-beta/);
  await expect(textarea).not.toHaveValue(OVERSIZED_COMPRESSED_SOURCE);
});

test('highlights and scrolls to the physical error line without painting outside the editor', async ({ page }) => {
  const encodedSource = Buffer.from(INVALID_SOURCE).toString('base64url');
  await page.goto(`/playground?src=${encodedSource}`);

  const textarea = page.locator('[data-testid="textarea-bpmn-source"]');
  const highlight = page.locator('[data-testid="editor-error-line-highlight"]');
  const errorDetail = page.locator('[data-testid="text-parse-error-detail"]');
  const viewport = page.locator('[data-testid="source-editor-viewport"]');

  await expect(errorDetail).toHaveAttribute('data-parse-error-line', String(ERROR_LINE));
  await expect(highlight).toHaveAttribute('data-error-line', String(ERROR_LINE));
  await expect(highlight).toHaveCSS('top', `${16 + (ERROR_LINE - 1) * 23}px`);
  await expect(textarea).toHaveAttribute('wrap', 'off');
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