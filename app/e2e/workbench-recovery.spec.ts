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
const sourceBeforeRestore = [
  'bpmn-beta',
  'accTitle: Before restoring a draft',
  'start s1 "Start"',
  'task t1 "Connected task"',
  'task beforeOrphan "Before restore orphan"',
  'end e1 "End"',
  's1 --> t1',
  't1 --> e1',
].join('\n');

const sourceWithShiftedWarning = [
  'bpmn-beta',
  'accTitle: Restored warning draft',
  '%% Context retained in this saved draft',
  '%% The warning belongs to a different source line',
  '%% Restoring must clear the previous selection',
  'start savedStart "Start"',
  'task savedTask "Connected saved task"',
  'task restoredOrphan "Restored orphan"',
  'end savedEnd "End"',
  'savedStart --> savedTask',
  'savedTask --> savedEnd',
].join('\n');

for (const draft of [
  { name: 'warning-free', title: 'Recovery example', source, warningLine: null },
  { name: 'shifted-warning', title: 'Restored warning draft', source: sourceWithShiftedWarning, warningLine: 8 },
]) {
  test(`restoring a ${draft.name} draft clears the previous warning selection`, async ({ page }) => {
    await page.goto('playground?view=split');
    const editor = page.getByTestId('textarea-bpmn-source');
    await editor.fill(draft.source);
    await expect(page.getByTestId('draft-save-status')).toContainText('Draft saved');

    // A new editing session preserves the saved draft as a recovery input.
    await page.goto('playground?example=01-linear&view=split');
    await editor.fill(sourceBeforeRestore);
    await expect(page.getByTestId('draft-save-status')).toContainText('Draft saved');
    const highlight = page.getByTestId('editor-lint-warning-line-highlight');
    await page.getByRole('button', { name: 'Go to line 5 for ORPHAN_NODE', exact: true }).press('Enter');
    await expect(highlight).toHaveAttribute('data-lint-warning-line', '5');

    const savedSources = await page.evaluate(() => Object.entries(localStorage)
      .filter(([key]) => key.startsWith('bpmn-workbench:draft:v1:'))
      .map(([key, value]) => ({ key, source: JSON.parse(value).source as string })));
    expect(savedSources.map(record => record.source)).toEqual(expect.arrayContaining([draft.source, sourceBeforeRestore]));

    const recovery = page.getByTestId('draft-recovery');
    await recovery.locator('summary').click();
    await recovery.getByRole('listitem')
      .filter({ has: page.getByText(draft.title, { exact: true }) })
      .getByRole('button', { name: 'Restore draft', exact: true }).click();
    await expect(editor).toHaveValue(draft.source);
    await expect(page.getByTestId('heading-playground')).toHaveText(draft.title);
    await expect(highlight).toHaveCount(0);
    await expect(page.getByTestId('lint-warning-ORPHAN_NODE-beforeOrphan')).toHaveCount(0);

    if (draft.warningLine === null) {
      await expect(page.getByTestId('div-lint-warnings')).toHaveCount(0);
      await expect(page.getByTestId('badge-lint-warnings')).toHaveCount(0);
    } else {
      await expect(page.getByTestId('div-lint-warnings')).toBeVisible();
      await expect(page.getByTestId('badge-lint-warnings')).toHaveText('1 warning');
      await expect(page.getByTestId('lint-warning-ORPHAN_NODE-restoredOrphan')).toBeVisible();
      await page.getByRole('button', {
        name: `Go to line ${draft.warningLine} for ORPHAN_NODE`, exact: true,
      }).press('Enter');
      await expect(highlight).toHaveAttribute('data-lint-warning-line', String(draft.warningLine));
      await expect(editor).toBeFocused();
      await expect(editor).toHaveValue(draft.source);
    }

    // Restoring creates a copy; neither saved source may be overwritten.
    expect(await page.evaluate(records => records.map(({ key }) => {
      const value = localStorage.getItem(key);
      return value === null ? null : JSON.parse(value).source;
    }), savedSources)).toEqual(savedSources.map(record => record.source));
    await expect(recovery.getByText(draft.title, { exact: true })).toBeVisible();
    await expect(recovery.getByText('Before restoring a draft', { exact: true })).toBeVisible();
  });
}

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
test('a long warning list remains scrollable without hiding the source editor', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('playground?view=source');
  const editor = page.getByTestId('textarea-bpmn-source');
  await editor.fill('bpmn-beta\n' + Array.from({ length: 30 }, (_, i) => `task t${i} "Disconnected ${i}"`).join('\n'));
  const warnings = page.getByTestId('div-lint-warnings');
  await expect(warnings).toBeVisible();
  expect(await warnings.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
  expect((await editor.boundingBox())!.height).toBeGreaterThan(160);
  await editor.fill(source);
  await expect(warnings).toBeHidden();
});
