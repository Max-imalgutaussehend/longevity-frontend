import { test, expect } from '@playwright/test';
import { uniqueEmail, registerAndLogin } from './helpers.js';

// Issue #31 — Lifestyle-Fragebogen UI in /daten
test.describe('lifestyle questionnaire', () => {
  test('fills lifestyle fields and saves via POST /api/labs', async ({ page }) => {
    const email = uniqueEmail();
    const password = 'longevity-test-2026';
    await registerAndLogin(page, email, password);

    await page.goto('/daten');

    await page.getByTestId('lifestyle-smoking').selectOption('1');
    await page.getByTestId('lifestyle-alcohol_units').fill('3');
    await page.getByTestId('lifestyle-strength_sessions').fill('2');
    await page.getByTestId('lifestyle-zone2_minutes').fill('90');

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/labs') && res.request().method() === 'POST'),
      page.getByTestId('save-lifestyle-values').click(),
    ]);
    expect(response.status()).toBe(201);
  });

  test('rejects strength_sessions above 4 without submitting', async ({ page }) => {
    const email = uniqueEmail();
    const password = 'longevity-test-2026';
    await registerAndLogin(page, email, password);

    await page.goto('/daten');
    await page.getByTestId('lifestyle-strength_sessions').fill('7');

    let requestFired = false;
    page.on('request', (req) => {
      if (req.url().includes('/api/labs') && req.method() === 'POST') requestFired = true;
    });

    await page.getByTestId('save-lifestyle-values').click();
    await expect(page.getByText('maximal 4 sein')).toBeVisible();
    expect(requestFired).toBe(false);
  });
});
