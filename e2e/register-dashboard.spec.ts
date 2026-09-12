import { test, expect } from '@playwright/test';
import { uniqueEmail } from './helpers.js';

// Spec §6 / CLAUDE.md — Flow 1: Register → auto-login → /dashboard
// Mock data is seeded at registration (90 days of samples), so score ≠ 50.
test.describe('register → dashboard', () => {
  test('registers, lands on dashboard, shows real score and bioAge', async ({ page }) => {
    const email = uniqueEmail();
    const password = 'longevity-test-2026';

    await page.goto('/register');
    await page.getByTestId('register-email').fill(email);
    await page.getByTestId('register-password').fill(password);
    await page.getByTestId('register-birthdate').fill('1990-04-15');
    await page.getByTestId('register-sex-m').click();
    await page.getByTestId('register-submit').click();

    // Auto-login: registration sets session cookie and navigate('/dashboard') fires
    await page.waitForURL('**/dashboard', { timeout: 10_000 });

    // ── score ≠ 50 ──────────────────────────────────────────────────
    // Mock samples are seeded during registration, so the computed score
    // will differ from the default cohort midpoint of 50.0.
    const scoreEl = page.getByTestId('score-value');
    await expect(scoreEl).toBeVisible({ timeout: 10_000 });
    const scoreText = await scoreEl.textContent();
    expect(scoreText).not.toBe('50.0');
    // Sanity: must be a valid number in range
    const scoreNum = parseFloat(scoreText ?? '');
    expect(scoreNum).toBeGreaterThan(0);
    expect(scoreNum).toBeLessThan(100);

    // ── bioAge visible ───────────────────────────────────────────────
    const bioAgeEl = page.getByTestId('bio-age');
    await expect(bioAgeEl).toBeVisible();
    const bioAgeText = await bioAgeEl.textContent();
    expect(parseInt(bioAgeText ?? '', 10)).toBeGreaterThan(0);

    // ── TrendChart card rendered ─────────────────────────────────────
    // The card always renders; inner content is either a <svg> (≥7 snapshots)
    // or the "not enough data" fallback. Both states satisfy "TrendChart rendered".
    await expect(page.getByTestId('trend-chart')).toBeVisible();
  });
});
