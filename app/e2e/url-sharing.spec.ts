/**
 * Playground shared URL — real-browser coverage.
 *
 * Covers canonical examples, versioned compressed custom sources, malformed
 * payload fallback, and the no-parameter default using the production preview.
 */

import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { deflateRawSync } from 'node:zlib';

function readExampleSource(filename: string): string {
  return readFileSync(new URL(`../examples/${filename}`, import.meta.url), 'utf8')
    .replace(/\r\n?/g, '\n');
}

const LINEAR_SOURCE = readExampleSource('01-linear-process.mmd');
const GATEWAY_SOURCE = readExampleSource('02-gateway-decision.mmd');
const CUSTOM_SOURCE = [
  'bpmn-beta',
  'accTitle: Shared URL approval path',
  'start s9 "Portal intake"',
  'task:user t9 "URL proof"',
  'end e9 "Shared link complete"',
  's9 --> t9',
  't9 --> e9',
].join('\n');

function encodeCompressedSource(source: string): string {
  const compressed = deflateRawSync(Buffer.from(source, 'utf8'));
  return Buffer.concat([Buffer.from([0x01]), compressed]).toString('base64url');
}

function sourceEditor(page: Page) {
  return page.locator('[data-testid="textarea-bpmn-source"]');
}

async function expectRenderedDiagram(page: Page, title: string, nodeLabel: string) {
  const diagram = page.locator('[data-testid="div-diagram-preview"] svg');
  await expect(diagram).toBeVisible();
  await expect(diagram.locator('title')).toHaveText(title);
  await expect(diagram).toContainText(nodeLabel);
}

async function expectExample(
  page: Page,
  id: '01-linear' | '02-gateway',
  source: string,
  diagramTitle: string,
  nodeLabel: string,
) {
  await expect(sourceEditor(page)).toHaveValue(source);
  await expect(page.locator(`[data-testid="button-example-${id}"]`)).toHaveClass(/forge-tab-active/);
  await expect(page.locator('[data-testid^="button-example-"].forge-tab-active')).toHaveCount(1);
  await expectRenderedDiagram(page, diagramTitle, nodeLabel);
}

test('loads the linear example from its canonical shared URL', async ({ page }) => {
  await page.goto('playground?example=01-linear');
  await expectExample(page, '01-linear', LINEAR_SOURCE, 'Simple Linear Process', 'Submit Request');
});

test('loads the gateway example from its canonical shared URL', async ({ page }) => {
  await page.goto('playground?example=02-gateway');
  await expectExample(page, '02-gateway', GATEWAY_SOURCE, 'Purchase Request Approval', 'Review Request');
});

test('loads a versioned compressed custom source without selecting an example', async ({ page }) => {
  await page.goto(`playground?src=${encodeCompressedSource(CUSTOM_SOURCE)}`);

  await expect(sourceEditor(page)).toHaveValue(CUSTOM_SOURCE);
  await expect(page.locator('[data-testid^="button-example-"].forge-tab-active')).toHaveCount(0);
  await expectRenderedDiagram(page, 'Shared URL approval path', 'URL proof');
});

test('falls back to the default diagram for malformed shared source data', async ({ page }) => {
  await page.goto('playground?src=INVALID_BASE64!!!');

  await expectExample(page, '02-gateway', GATEWAY_SOURCE, 'Purchase Request Approval', 'Review Request');
});

test('loads the gateway example by default without URL parameters', async ({ page }) => {
  await page.goto('playground');
  await expectExample(page, '02-gateway', GATEWAY_SOURCE, 'Purchase Request Approval', 'Review Request');
});
