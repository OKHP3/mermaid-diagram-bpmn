/**
 * Verify the lifecycle tracker targets the row variant that is actually
 * displayed by responsive CSS. Both desktop and mobile rows exist in the DOM,
 * so this must run in a real browser rather than relying on happy-dom's
 * offsetParent behavior.
 */

import { expect, test, type Page } from '@playwright/test';

const SKILL_ID = 'okhp3-process-intake-and-scope';
const SKILL_NAME = 'Process Intake & Scope';

async function loadWalkthrough(page: Page) {
  await page.goto('walkthrough');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[data-testid="walkthrough-table"]')).toBeVisible();
  await expect(page.locator(`#row-${SKILL_ID}-lg`)).toHaveCount(1);
  await expect(page.locator(`#row-${SKILL_ID}-sm`)).toHaveCount(1);
}

async function recordScrollTargets(page: Page) {
  await page.evaluate(({ skillId }) => {
    const calls: string[] = [];
    (window as Window & { __lifecycleScrollCalls?: string[] }).__lifecycleScrollCalls = calls;

    for (const variant of ['lg', 'sm']) {
      const row = document.getElementById(`row-${skillId}-${variant}`);
      if (!row) continue;
      const original = row.scrollIntoView.bind(row);
      row.scrollIntoView = function (options) {
        calls.push(this.id);
        original(options);
      };
    }
  }, { skillId: SKILL_ID });
}

async function expectCorrectRowScrolled(page: Page, variant: 'lg' | 'sm') {
  const expectedId = `row-${SKILL_ID}-${variant}`;
  await expect.poll(async () => (
    page.evaluate(() => (window as Window & { __lifecycleScrollCalls?: string[] })
      .__lifecycleScrollCalls ?? [])
  )).toContain(expectedId);
  await expect(page.locator(`#${expectedId}`)).toBeInViewport();
}

test.describe('lifecycle tracker responsive row targeting', () => {
  test('uses the desktop row at a desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loadWalkthrough(page);
    await recordScrollTargets(page);

    await page.getByRole('button', { name: `Jump to ${SKILL_NAME} in the table` }).first().click();

    await expectCorrectRowScrolled(page, 'lg');
    await expect(page.locator(`#row-${SKILL_ID}-sm`)).not.toBeVisible();
  });

  test('uses the mobile row at a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loadWalkthrough(page);
    await recordScrollTargets(page);

    await page.getByRole('button', { name: `Jump to ${SKILL_NAME} in the table` }).last().click();

    await expectCorrectRowScrolled(page, 'sm');
    await expect(page.locator(`#row-${SKILL_ID}-lg`)).not.toBeVisible();
  });
});