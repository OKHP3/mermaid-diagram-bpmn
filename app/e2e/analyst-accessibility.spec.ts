import { test, expect, type Download } from '@playwright/test';

const diagram = 'bpmn-beta\nstart s "Request"\ntask:user t "Review quote"\nend e "Decision"\nflow s -> t\nflow t -> e';
async function contents(download: Download) {
  const stream = await download.createReadStream();
  if (!stream) throw new Error(`Could not read downloaded bundle: ${await download.failure() ?? 'download stream unavailable'}`);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

test('analyst routes and intake stages identify themselves after navigation', async ({ page }) => {
  await page.goto('skills');
  await expect(page).toHaveTitle(/Agent Skills/);
  await page.getByTestId('nav-intake').press('Enter');
  await expect(page).toHaveTitle('Process brief | Guided intake | BPMN for Mermaid');
  await page.getByRole('button', { name: '03 Agent handoff' }).press('Enter');
  await expect(page).toHaveTitle('Agent handoff | Guided intake | BPMN for Mermaid');
  await expect(page.locator('#intake-stage-title')).toBeFocused();
  await page.getByTestId('nav-playground').press('Enter');
  await expect(page).toHaveTitle('Workbench | BPMN for Mermaid');
  await page.getByRole('tab', { name: 'Source', exact: true }).press('Enter');
  await expect(page).toHaveTitle('Workbench | BPMN for Mermaid');
  await page.getByTestId('link-home-logo').press('Enter');
  await expect(page).toHaveTitle('BPMN for Mermaid');
});

test('import preview, cancel and apply keep a meaningful keyboard focus target', async ({ page }) => {
  await page.goto('intake');
  await page.getByRole('button', { name: '04 Review result' }).press('Enter');
  const input = page.getByLabel('Import process result');
  const file = { name: 'diagram.mmd', mimeType: 'text/plain', buffer: Buffer.from(diagram) };
  await input.focus();
  await input.setInputFiles(file);
  await expect(page.getByRole('heading', { name: 'Review before applying' })).toBeFocused();
  await page.getByRole('button', { name: 'Cancel import' }).press('Enter');
  await expect(input).toBeFocused();
  await input.setInputFiles(file);
  await page.getByRole('button', { name: 'Apply imported copy' }).press('Enter');
  await expect(page.locator('#intake-stage-title')).toBeFocused();
  await expect(page.getByText('Parsed', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Open diagram workbench', exact: true }).press('Enter');
  await expect(page.getByRole('region', { name: 'Process diagram workbench' })).toBeVisible();
  await expect(page).toHaveTitle('Review result | Guided intake | BPMN for Mermaid');
});

test('a downloaded process bundle reopens with facts, unknowns and source intact', async ({ page, context }) => {
  await page.goto('intake');
  await page.getByRole('button', { name: 'Use purchase starter' }).click();
  await page.getByLabel('Process name', { exact: true }).fill('Team equipment purchasing');
  await page.getByRole('button', { name: '04 Review result' }).click();
  await page.getByLabel('Import process result').setInputFiles({ name: 'diagram.mmd', mimeType: 'text/plain', buffer: Buffer.from(diagram) });
  await page.getByRole('button', { name: 'Apply imported copy' }).click();
  const firstDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download this version' }).click();
  const original = await contents(await firstDownload);
  const reopened = await context.newPage();
  await reopened.goto('intake');
  await reopened.getByRole('button', { name: '04 Review result' }).click();
  await reopened.getByLabel('Import process result').setInputFiles({ name: 'process-bundle.json', mimeType: 'application/json', buffer: original });
  await expect(reopened.getByRole('region', { name: 'Import preview' })).toContainText('Team equipment purchasing');
  await reopened.getByRole('button', { name: 'Apply imported copy' }).click();
  const secondDownload = reopened.waitForEvent('download');
  await reopened.getByRole('button', { name: 'Download this version' }).click();
  expect(JSON.parse((await contents(await secondDownload)).toString())).toEqual(JSON.parse(original.toString()));
  await reopened.getByRole('button', { name: '03 Agent handoff' }).click();
  await expect(reopened.getByText('What are the approval limits?', { exact: true })).toBeVisible();
  await reopened.close();
});
