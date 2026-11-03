import { expect, test } from '@playwright/test';

test.describe('Roadmap internal evidence routes', () => {
  test('the live plugin demo evidence route loads', async ({ page }) => {
    await page.goto('roadmap');
    await page.getByTestId('heading-roadmap').waitFor();
    await page.locator('a[href$="/mermaid-host-demo"]').click();

    await expect(page.locator('[data-testid="version-metadata"]')).toBeVisible();
  });

  test('the DSL Reference evidence route loads', async ({ page }) => {
    await page.goto('roadmap');
    await page.getByTestId('heading-roadmap').waitFor();
    await page.locator('a[href$="/dsl"]').click();

    await expect(page.getByTestId('heading-dsl')).toBeVisible();
  });
});
