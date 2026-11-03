import { test, expect } from '@playwright/test';
const source = 'bpmn-beta\naccTitle: Recovery example\nstart s "Begin"\nend e "Finish"\ns --> e';
test('edited source survives reload and can be recovered without replacing the example on arrival', async ({ page }) => {
  await page.goto('playground?view=split');
  await page.getByTestId('textarea-bpmn-source').fill(source);
  await expect(page.getByTestId('draft-save-status')).toContainText('Draft saved');
  await page.goto('playground?example=01-linear&view=split');
  await expect(page.getByTestId('select-example')).toHaveValue('01-linear');
  await page.getByText('Recover saved work (1)', { exact: true }).click();
  await page.getByRole('button', { name: 'Restore draft', exact: true }).click();
  await expect(page.getByTestId('textarea-bpmn-source')).toHaveValue(source);
  await expect(page.getByTestId('heading-playground')).toHaveText('Recovery example');
});
test('a second tab saves separately and never changes the first editor', async ({ page, context }) => {
  await page.goto('playground?view=split');
  await page.getByTestId('textarea-bpmn-source').fill(source);
  const second = await context.newPage();
  await second.goto('playground?view=source');
  await second.getByTestId('textarea-bpmn-source').fill(source.replace('Recovery example', 'Second process'));
  await expect(page.getByTestId('textarea-bpmn-source')).toHaveValue(source);
  await expect(page.getByTestId('draft-recovery')).toContainText('Second process');
  await second.close();
});
test('storage denial keeps editing and exports available and cancels accidental replacement', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Storage denied', 'QuotaExceededError'); };
  });
  await page.goto('playground?view=split');
  await page.getByTestId('textarea-bpmn-source').fill(source);
  await expect(page.getByTestId('draft-save-status')).toContainText('storage is unavailable');
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByTestId('select-example').selectOption('01-linear');
  await expect(page.getByTestId('textarea-bpmn-source')).toHaveValue(source);
  const download = page.waitForEvent('download');
  await page.getByTestId('button-download-mmd').click();
  expect((await download).suggestedFilename()).toMatch(/\.mmd$/);
});
test('mobile views, keyboard selection, and full labels remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('playground');
  await expect(page.getByTestId('div-diagram-preview')).toBeVisible();
  await expect(page.getByTestId('textarea-bpmn-source')).toBeHidden();
  await page.getByRole('tab', { name: 'Diagram', exact: true }).press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Source', exact: true })).toBeFocused();
  await page.getByTestId('textarea-bpmn-source').fill(source);
  await page.getByRole('tab', { name: 'Diagram', exact: true }).click();
  await page.getByText('Read all diagram labels (2)', { exact: true }).click();
  await expect(page.locator('.workbench-finish')).toContainText('Finish');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const canvas = page.getByTestId('div-diagram-preview');
  const canvasBox = await canvas.boundingBox();
  const svgBox = await canvas.locator('svg').boundingBox();
  expect(svgBox!.height).toBeLessThanOrEqual(canvasBox!.height + 1);
});
