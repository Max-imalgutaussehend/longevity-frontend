import { test, expect } from '@playwright/test';
import { uniqueEmail, registerAndLogin, TEST_PASSWORD } from './helpers.js';

// Spec §6 / CLAUDE.md — Flow 1: Register → auto-login → /dashboard
// A brand-new account has no samples, so the score legitimately starts at
// the cohort midpoint (50.0) until real or lifestyle data is entered.
test.describe('register → dashboard', () => {
  test('registers, lands on dashboard, shows real score and bioAge', async ({ page }) => {
    const email = uniqueEmail();
    const password = TEST_PASSWORD;

    await registerAndLogin(page, email, password);

    // ── score visible and in range ────────────────────────────────────
    const scoreEl = page.getByTestId('score-value');
    await expect(scoreEl).toBeVisible({ timeout: 10_000 });
    const scoreText = await scoreEl.textContent();
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
