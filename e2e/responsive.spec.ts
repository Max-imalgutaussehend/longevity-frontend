import { test, expect, Browser } from '@playwright/test';
import { uniqueEmail, registerAndLogin } from './helpers.js';

// Issue: responsive layout — 375px viewport, no horizontal overflow, nav accessible
test.describe('responsive layout at 375px', () => {
  const EMAIL = uniqueEmail();
  const PASSWORD = 'longevity-test-2026';

  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    const page = await browser.newPage();
    await registerAndLogin(page, EMAIL, PASSWORD);
    await page.close();
  });

  test.use({ viewport: { width: 375, height: 812 } });

  test('dashboard has no horizontal overflow', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await ctx.newPage();

    await page.goto('/login');
    await page.getByTestId('login-email').fill(EMAIL);
    await page.getByTestId('login-password').fill(PASSWORD);
    await page.getByTestId('login-submit').click();
    await page.waitForURL('**/dashboard');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);

    await ctx.close();
  });

  test('navigation links are accessible on mobile viewport', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await ctx.newPage();

    await page.goto('/login');
    await page.getByTestId('login-email').fill(EMAIL);
    await page.getByTestId('login-password').fill(PASSWORD);
    await page.getByTestId('login-submit').click();
    await page.waitForURL('**/dashboard');

    // Nav bar is always visible on mobile (no hover required)
    const nav = page.locator('.pill-nav-bar');
    await expect(nav).toBeVisible();

    // All nav links are present in the DOM and reachable
    for (const label of ['Dashboard', 'Score', 'Hebel', 'Daten', 'Freigabe', 'Vorteile', 'Bericht']) {
      await expect(page.getByRole('link', { name: label })).toBeAttached();
    }

    await ctx.close();
  });

  test('score page has no horizontal overflow at 375px', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await ctx.newPage();

    await page.goto('/login');
    await page.getByTestId('login-email').fill(EMAIL);
    await page.getByTestId('login-password').fill(PASSWORD);
    await page.getByTestId('login-submit').click();
    await page.waitForURL('**/dashboard');
    await page.goto('/score');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);

    await ctx.close();
  });
});
