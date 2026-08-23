/**
 * Playground semantic validation — real-browser coverage.
 *
 * Confirms that each of the four validation error codes (ORPHAN_NODE,
 * CROSS_POOL_SEQUENCE_FLOW, UNBALANCED_GATEWAY, UNDEFINED_NODE_REF) surfaced
 * by bpmn-validate.ts appear correctly in the Playground warning panel when a
 * user types a diagram that triggers them, and that a structurally valid
 * diagram produces no warning panel at all.
 *
 * These tests catch wiring regressions between the validation module and the
 * Playground UI — something the existing unit tests cannot reach because they
 * exercise the module in isolation.
 */

import { expect, test } from '@playwright/test';

// ── Fixture sources ───────────────────────────────────────────────────────────

/** Triggers ORPHAN_NODE: t2 has no incoming or outgoing flows. */
const SOURCE_ORPHAN_NODE = [
  'bpmn-beta',
  'start s1 "Start"',
  'task t1 "Connected Task"',
  'task t2 "Orphaned Task"',
  'end e1 "End"',
  's1 --> t1',
  't1 --> e1',
].join('\n');

const SOURCE_ORPHAN_NODE_WITH_DISTANT_LINE = [
  'bpmn-beta',
  ...Array.from({ length: 40 }, (_, index) => `%% Context note ${index + 1}`),
  'start s1 "Start"',
  'task t1 "Connected Task"',
  'task t2 "Orphaned Task"',
  'end e1 "End"',
  's1 --> t1',
  't1 --> e1',
].join('\n');
const ORPHAN_WARNING_LINE = 44;

const SOURCE_NOTE_ASSOCIATION = [
  'bpmn-beta',
  'start s1 "Start"',
  'task t1 "Review request"',
  'end e1 "Complete"',
  'note n1 "See SLA policy"',
  's1 --> t1',
  't1 --> e1',
  't1 --- n1',
].join('\n');

/**
 * Triggers CROSS_POOL_SEQUENCE_FLOW: t1 → e1 is a sequence flow crossing pool
 * boundaries. Pools without lanes also trigger POOL_NO_LANES advisory warnings;
 * the test checks for the validation message text rather than a warning count.
 */
const SOURCE_CROSS_POOL = [
  'bpmn-beta',
  'pool p1 "Pool A" {',
  '  start s1 "Start"',
  '  task t1 "Task A"',
  '}',
  'pool p2 "Pool B" {',
  '  end e1 "End"',
  '}',
  's1 --> t1',
  't1 --> e1',
].join('\n');

/**
 * Triggers UNBALANCED_GATEWAY: g1 has 2 incoming and 2 outgoing flows,
 * acting simultaneously as a join and a split.
 */
const SOURCE_UNBALANCED_GATEWAY = [
  'bpmn-beta',
  'start s1 "Start A"',
  'start s2 "Start B"',
  'xor g1 "Mixed Decision"',
  'end e1 "End A"',
  'end e2 "End B"',
  's1 --> g1',
  's2 --> g1',
  'g1 --> e1',
  'g1 --> e2',
].join('\n');

/** Triggers UNDEFINED_NODE_REF: "ghost" is never declared as a node. */
const SOURCE_UNDEFINED_NODE_REF = [
  'bpmn-beta',
  'start s1 "Start"',
  'task t1 "Task"',
  'end e1 "End"',
  's1 --> t1',
  't1 --> ghost',
].join('\n');

/** A fully valid minimal diagram — no warnings expected. */
const SOURCE_VALID = [
  'bpmn-beta',
  'start s1 "Start"',
  'task t1 "Do the work"',
  'end e1 "End"',
  's1 --> t1',
  't1 --> e1',
].join('\n');

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Navigate to the Playground and replace the source editor content. */
async function openPlaygroundWith(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never, source: string) {
  await page.goto('playground');
  await page.locator('[data-testid="textarea-bpmn-source"]').fill(source);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test('ORPHAN_NODE — warning panel is visible and names the disconnected node', async ({ page }) => {
  await openPlaygroundWith(page, SOURCE_ORPHAN_NODE);

  const panel = page.locator('[data-testid="div-lint-warnings"]');
  await expect(panel).toBeVisible();
  // The message names the orphaned node and explains the problem
  await expect(panel).toContainText('Orphaned Task');
  await expect(panel).toContainText('has no incoming or outgoing flows');
  // Warning item carries the ORPHAN_NODE code and the node id
  await expect(page.locator('[data-testid="lint-warning-ORPHAN_NODE-t2"]')).toBeVisible();
  // Diagram still renders despite the warning
  await expect(page.locator('[data-testid="div-diagram-preview"] svg')).toBeVisible();
  // No hard parse error panel
  await expect(page.locator('[data-testid="text-parse-error"]')).toHaveCount(0);
});

test('ORPHAN_NODE — Line button focuses and scrolls to the flagged source row', async ({ page }) => {
  await openPlaygroundWith(page, SOURCE_ORPHAN_NODE_WITH_DISTANT_LINE);

  const textarea = page.locator('[data-testid="textarea-bpmn-source"]');
  const lineButton = page.getByRole('button', {
    name: `Go to line ${ORPHAN_WARNING_LINE} for ORPHAN_NODE`,
  });
  await expect(lineButton).toHaveText(`Line ${ORPHAN_WARNING_LINE}`);
  await textarea.evaluate((editor) => {
    editor.scrollTop = 0;
    editor.dispatchEvent(new Event('scroll', { bubbles: true }));
  });
  await lineButton.click();

  const highlight = page.locator('[data-testid="editor-lint-warning-line-highlight"]');
  await expect(highlight).toHaveAttribute('data-lint-warning-line', String(ORPHAN_WARNING_LINE));
  await expect(textarea).toBeFocused();
  await expect.poll(() => textarea.evaluate((editor) => editor.scrollTop)).toBeGreaterThan(0);
});

test('association — an attached note is not flagged as an orphan', async ({ page }) => {
  await openPlaygroundWith(page, SOURCE_NOTE_ASSOCIATION);

  await expect(page.locator('[data-testid="div-lint-warnings"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="div-diagram-preview"] svg')).toBeVisible();
  await expect(page.locator('[data-testid="text-parse-error"]')).toHaveCount(0);
});

test('CROSS_POOL_SEQUENCE_FLOW — warning panel names the cross-boundary flow', async ({ page }) => {
  await openPlaygroundWith(page, SOURCE_CROSS_POOL);

  const panel = page.locator('[data-testid="div-lint-warnings"]');
  await expect(panel).toBeVisible();
  // The message names both pools and explains the correction
  await expect(panel).toContainText('crosses pool boundaries');
  await expect(panel).toContainText('message flow');
  // Diagram still renders
  await expect(page.locator('[data-testid="div-diagram-preview"] svg')).toBeVisible();
  await expect(page.locator('[data-testid="text-parse-error"]')).toHaveCount(0);
});

test('UNBALANCED_GATEWAY — warning panel identifies the mixed join/split gateway', async ({ page }) => {
  await openPlaygroundWith(page, SOURCE_UNBALANCED_GATEWAY);

  const panel = page.locator('[data-testid="div-lint-warnings"]');
  await expect(panel).toBeVisible();
  // The message names the gateway and explains that it acts as both join and split
  await expect(panel).toContainText('Mixed Decision');
  await expect(panel).toContainText('acting as both a join and a split');
  // Warning item carries the UNBALANCED_GATEWAY code and the gateway node id
  await expect(page.locator('[data-testid="lint-warning-UNBALANCED_GATEWAY-g1"]')).toBeVisible();
  // Diagram still renders
  await expect(page.locator('[data-testid="div-diagram-preview"] svg')).toBeVisible();
  await expect(page.locator('[data-testid="text-parse-error"]')).toHaveCount(0);
});

test('UNDEFINED_NODE_REF — warning panel names the missing node ID', async ({ page }) => {
  await openPlaygroundWith(page, SOURCE_UNDEFINED_NODE_REF);

  const panel = page.locator('[data-testid="div-lint-warnings"]');
  await expect(panel).toBeVisible();
  // The message names the undefined node id and tells the author to declare it
  await expect(panel).toContainText('"ghost"');
  await expect(panel).toContainText('undefined');
  await expect(page.locator('[data-testid="text-parse-error"]')).toHaveCount(0);
});

test('valid diagram — no warning panel appears and the diagram renders', async ({ page }) => {
  await openPlaygroundWith(page, SOURCE_VALID);

  // The warning panel must not appear for a structurally valid diagram
  await expect(page.locator('[data-testid="div-lint-warnings"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="badge-lint-warnings"]')).toHaveCount(0);
  // Diagram renders correctly
  await expect(page.locator('[data-testid="div-diagram-preview"] svg')).toBeVisible();
  await expect(page.locator('[data-testid="text-parse-error"]')).toHaveCount(0);
});
