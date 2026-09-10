import { test, expect, Browser } from '@playwright/test';
import { uniqueEmail, loginAs, registerAndLogin } from './helpers.js';

// Issue #19: create share token and verify in a second browser context (no session)
test.describe('share token flow', () => {
  const EMAIL = uniqueEmail();
  const PASSWORD = 'longevity-test-2026';

  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    const page = await browser.newPage();
    await registerAndLogin(page, EMAIL, PASSWORD);
    await page.close();
  });

  test('creates a token and verifies it in a fresh context', async ({ browser }) => {
    // ── authenticated context ────────────────────────────────────────
    const authCtx = await browser.newContext();
    const authPage = await authCtx.newPage();
    await loginAs(authPage, EMAIL, PASSWORD);

    await authPage.goto('/freigabe');
    await authPage.getByTestId('create-token-btn').click();
    // modal opens — confirm with default 90 days
    await authPage.getByTestId('confirm-create-token').click();

    // wait for the token card to appear
    const urlCode = await authPage.getByTestId('token-verify-url').first().textContent({ timeout: 5000 });
    expect(urlCode).toMatch(/\/verify\//);

    // extract the absolute URL from the displayed text
    const verifyUrl = urlCode!.trim();

    // ── unauthenticated context (no cookies) ─────────────────────────
    const anonCtx = await browser.newContext();
    const anonPage = await anonCtx.newPage();
    await anonPage.goto(verifyUrl);

    const band = await anonPage.getByTestId('verify-band');
    await expect(band).toBeVisible({ timeout: 8000 });
    await expect(band).toContainText('Band');

    await anonCtx.close();

    // ── revoke and verify it shows invalid ───────────────────────────
    await authPage.getByTestId('revoke-token-btn').first().click();
    // wait for revoke to reflect (chip appears)
    await expect(authPage.getByText('Widerrufen')).toBeVisible({ timeout: 5000 });

    const anonCtx2 = await browser.newContext();
    const anonPage2 = await anonCtx2.newPage();
    await anonPage2.goto(verifyUrl);
    await expect(anonPage2.getByTestId('verify-invalid')).toBeVisible({ timeout: 8000 });
    await anonCtx2.close();

    await authCtx.close();
  });
});
