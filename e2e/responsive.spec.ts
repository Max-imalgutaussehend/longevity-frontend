import { test, expect, Browser } from '@playwright/test';
import { uniqueEmail, registerAndLogin } from './helpers.js';

// Issue: responsive layout — 375px viewport, no horizontal overflow, nav accessible
test.describe('responsive layout at 375px', () => {
  const PASSWORD = 'longevity-test-2026';

  test.use({ viewport: { width: 375, height: 812 } });

  test('dashboard has no horizontal overflow', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail(), PASSWORD);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });

  test('navigation links are accessible on mobile viewport', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail(), PASSWORD);

    // Nav bar is always visible on mobile (no hover required)
    const nav = page.locator('.pill-nav-bar');
    await expect(nav).toBeVisible();

    // All nav links are present in the DOM and reachable
    for (const label of ['Dashboard', 'Score', 'Hebel', 'Daten', 'Freigabe', 'Vorteile', 'Bericht']) {
      await expect(page.getByRole('link', { name: label, exact: true })).toBeAttached();
    }
  });

  test('score page has no horizontal overflow at 375px', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail(), PASSWORD);
    await page.goto('/score');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });
});
