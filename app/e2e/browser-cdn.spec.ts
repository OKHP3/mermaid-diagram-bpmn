/**
 * Browser CDN adoption contract.
 *
 * This page intentionally uses only native browser ESM imports from the exact
 * URLs documented in the package README. It does not import the workspace app
 * or the plugin from a local path.
 */
import { test, expect } from '@playwright/test';

test.describe('standalone browser CDN proof', () => {
  test('loads the pinned Mermaid/plugin pair and renders an SVG', async ({ page }) => {
    await page.goto('browser-cdn-example.html');
    const status = page.locator('#status');

    await expect(status).toHaveAttribute('data-state', 'ok', { timeout: 30_000 });
    await expect(status).toContainText('mermaid@11.4.1');
    await expect(status).toContainText('plugin@0.1.1');
    await expect(page.locator('#output svg')).toBeVisible();
    await expect(page.locator('#output svg .bpmn-task')).toBeVisible();
  });

  test('surfaces a failure state instead of silently succeeding', async ({ page }) => {
    await page.route('https://cdn.jsdelivr.net/**', (route) => route.abort());
    await page.goto('browser-cdn-example.html');
    await expect(page.locator('#status')).toHaveAttribute('data-state', 'error', { timeout: 30_000 });
    await expect(page.locator('#status')).toContainText('CDN render failed');
    await expect(page.locator('#status')).toHaveAttribute('role', 'status');
  });
});