/**
 * First-visit outcome evaluation.
 *
 * This is a repeatable task walkthrough, not a substitute for moderated user
 * research. It records whether a fresh browser context can reach the promised
 * artifact or verification point without maintainer guidance.
 */
import { test, expect, type Page } from '@playwright/test';

const route = (path: string) => path.replace(/^\/+/, '');

async function timedTask(page: Page, name: string, action: () => Promise<void>) {
  const started = Date.now();
  await action();
  const elapsedMs = Date.now() - started;
  console.log(`[first-visit] ${name}: completed in ${elapsedMs} ms`);
  test.info().annotations.push({ type: 'time-to-outcome', description: `${name}: ${elapsedMs} ms` });
}

async function openHome(page: Page) {
  await page.goto(route('/'));
  await expect(page.getByTestId('path-chooser')).toBeVisible();
}

test.describe('First-visit outcome evaluation — desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('Create a diagram: reach a usable source and export controls', async ({ page }) => {
    await openHome(page);
    await timedTask(page, 'create a diagram', async () => {
      await page.getByTestId('button-open-playground').click();
      await expect(page).toHaveURL(/playground/);
      await expect(page.getByTestId('textarea-bpmn-source')).toBeVisible();
      await expect(page.getByTestId('div-diagram-preview')).toBeVisible();
      await expect(page.getByTestId('button-copy-source')).toBeEnabled();
      await expect(page.getByTestId('button-download-mmd')).toBeEnabled();
      await expect(page.getByTestId('button-export-svg')).toBeEnabled();

      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.getByTestId('button-copy-source').click();
      await expect(page.getByTestId('copy-live-region')).toContainText('Source copied');

      const sourceDownload = page.waitForEvent('download');
      await page.getByTestId('button-download-mmd').click();
      await expect((await sourceDownload).suggestedFilename()).toMatch(/\.mmd$/);

      const svgDownload = page.waitForEvent('download');
      await page.getByTestId('button-export-svg').click();
      await expect((await svgDownload).suggestedFilename()).toMatch(/\.svg$/);
    });
  });

  test('Use with Mermaid: verify host proof and find integration guidance', async ({ page }) => {
    await openHome(page);
    await timedTask(page, 'use with Mermaid', async () => {
      await page.getByTestId('button-plugin-demo').click();
      await expect(page).toHaveURL(/mermaid-host-demo/);
      await expect(page.getByTestId('host-demo-install')).toBeVisible();
      await expect(page.getByTestId('host-demo-npm-status-badge')).toContainText('published on npm');
      await expect(page.getByTestId('version-metadata')).toContainText('strict');
      await expect(page.getByTestId('svg-output-demo-linear').locator('svg')).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByTestId('version-metadata')).toContainText(
        '7 rendered · 1 expected error',
      );
    });
  });

  test('Start a process workflow: identify the first step and download its starter pack', async ({
    page,
  }) => {
    await openHome(page);
    await timedTask(page, 'start a process workflow', async () => {
      await page.getByTestId('button-browse-skills').click();
      await expect(page).toHaveURL(/skills/);
      await expect(page.getByTestId('start-here-panel')).toBeVisible();
      await expect(page.getByTestId('start-here-env-notice')).toContainText(
        'not in this browser',
      );
      await expect(page.getByTestId('start-here-recommended-skill')).toContainText(
        'Process Intake & Scope',
      );
      await expect(page.getByTestId('button-copy-first-agent-prompt')).toBeVisible();
      const download = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download Starter Pack' }).click();
      await expect((await download).suggestedFilename()).toBe('bp-skill-starter-pack.zip');
    });
  });
});

test.describe('First-visit outcome evaluation — small screen and recovery', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('mobile path chooser remains actionable and keyboard activation reaches Playground', async ({
    page,
  }) => {
    await openHome(page);
    await expect(page.getByTestId('path-card-create')).toBeVisible();
    await expect(page.getByTestId('path-card-plugin')).toBeVisible();
    await expect(page.getByTestId('path-card-skills')).toBeVisible();

    const started = Date.now();
    await page.getByTestId('button-open-playground').focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/playground/);
    await expect(page.getByTestId('textarea-bpmn-source')).toBeVisible();
    const elapsedMs = Date.now() - started;
    console.log(`[first-visit] mobile keyboard path selection: completed in ${elapsedMs} ms`);
    test.info().annotations.push({
      type: 'time-to-outcome',
      description: `mobile keyboard path selection: ${elapsedMs} ms`,
    });
  });

  test('invalid source preserves editing and recovers to a valid preview', async ({ page }) => {
    await page.goto(route('/playground'));
    const editor = page.getByTestId('textarea-bpmn-source');
    await expect(editor).toBeVisible();

    const started = Date.now();
    await editor.fill('bpmn-beta\nthis is not valid syntax');
    await expect(page.getByTestId('text-parse-error-detail')).toBeVisible();
    await expect(editor).toHaveValue(/this is not valid syntax/);

    await editor.fill('bpmn-beta\nstart s "Start"\nend e "End"\ns --> e');
    await expect(page.getByTestId('text-parse-error-detail')).toBeHidden();
    await expect(page.getByTestId('div-diagram-preview')).toBeVisible();
    const elapsedMs = Date.now() - started;
    console.log(`[first-visit] invalid-source recovery: completed in ${elapsedMs} ms`);
    test.info().annotations.push({
      type: 'time-to-outcome',
      description: `invalid-source recovery: ${elapsedMs} ms`,
    });
  });
});