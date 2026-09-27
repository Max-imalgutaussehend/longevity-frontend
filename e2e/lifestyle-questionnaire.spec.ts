import { test, expect } from '@playwright/test';
import { uniqueEmail, registerAndLogin, grantHealthDataConsent, TEST_PASSWORD } from './helpers.js';

// Issue #31 — Lifestyle-Fragebogen UI in /daten
// Issue #50 E2E-Test 1 — manuelle Laborwert-Eingabe (Lebensstil-Werte) erhöht den Score.
test.describe('lifestyle questionnaire', () => {
  test('fills lifestyle fields and saves via POST /api/labs, score increases', async ({ page }) => {
    const email = uniqueEmail();
    const password = TEST_PASSWORD;
    await registerAndLogin(page, email, password);
    await grantHealthDataConsent(page);

    const scoreEl = page.getByTestId('score-value');
    await expect(scoreEl).toBeVisible({ timeout: 10_000 });
    const scoreBefore = parseFloat((await scoreEl.textContent()) ?? '');

    await page.goto('/daten');

    // Worst-case smoking value (non-smoker = best); pick the healthiest option
    // and strong activity numbers so the recomputed score can only go up from
    // the freshly-registered mock baseline (smoking left at default "never smoked").
    await page.getByTestId('lifestyle-smoking').selectOption('0');
    await page.getByTestId('lifestyle-alcohol_units').fill('0');
    await page.getByTestId('lifestyle-strength_sessions').fill('4');
    await page.getByTestId('lifestyle-zone2_minutes').fill('180');

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/labs') && res.request().method() === 'POST'),
      page.getByTestId('save-lifestyle-values').click(),
    ]);
    expect(response.status()).toBe(201);

    await page.goto('/dashboard');
    await expect(scoreEl).toBeVisible({ timeout: 10_000 });
    await expect(async () => {
      const scoreAfter = parseFloat((await scoreEl.textContent()) ?? '');
      expect(scoreAfter).toBeGreaterThan(scoreBefore);
    }).toPass({ timeout: 10_000 });
  });

  test('rejects strength_sessions above 4 without submitting', async ({ page }) => {
    const email = uniqueEmail();
    const password = TEST_PASSWORD;
    await registerAndLogin(page, email, password);
    await grantHealthDataConsent(page);

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
