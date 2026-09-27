import { test, expect, Browser } from '@playwright/test';
import { uniqueEmail, registerAndLogin, loginAs, grantHealthDataConsent, TEST_PASSWORD } from './helpers.js';

// Issue: simulator slider — keyboard interaction updates score within 500 ms,
// tabular-nums prevents layout shift on the score number.
// Issue #50 E2E-Test 2 — Regler bewegen, simulierter Score aktualisiert sich
// ohne Sprung auf Minimalwerte (kein Absturz auf 0 / Sockelwert bei jedem Schritt).
test.describe('Hebel simulator', () => {
  const PASSWORD = TEST_PASSWORD;

  test('arrow key on slider updates score within 500 ms without layout shift', async ({ page }) => {
    const email = uniqueEmail();
    await registerAndLogin(page, email, PASSWORD);
    await grantHealthDataConsent(page);
    await page.goto('/hebel');

    // Wait for sliders to be ready (levers loaded or page rendered)
    const slider = page.getByRole('slider', { name: 'Schritte' });
    await expect(slider).toBeVisible({ timeout: 8000 });

    const scoreEl = page.getByTestId('sim-score');
    await expect(scoreEl).toBeVisible();
    await expect(scoreEl).toHaveText(/\d/, { timeout: 8000 });

    // Capture initial state
    const scoreBeforeText = await scoreEl.textContent();
    const scoreBefore = parseFloat(scoreBeforeText ?? '');
    const widthBefore = await scoreEl.evaluate((el) => (el as HTMLElement).offsetWidth);
    expect(scoreBefore).toBeGreaterThan(0);

    // Move slider with keyboard, sampling the score after every step — 10
    // ArrowRight presses = +5000 steps (step 500). At no point should the
    // simulated score jump down to a minimal/floor value (e.g. 0 or single
    // digits) — a real regression in the debounce/recompute path would show
    // up as a transient collapse to the score's minimum before settling.
    await slider.focus();
    const samples: number[] = [scoreBefore];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowRight');
      const text = await scoreEl.textContent();
      const value = parseFloat(text ?? '');
      if (!Number.isNaN(value)) samples.push(value);
    }
    for (const value of samples) {
      expect(value).toBeGreaterThan(5);
      expect(value).toBeLessThan(100);
    }

    // Score must update within 500 ms (debounce 120 ms + network)
    await expect(async () => {
      const scoreAfterText = await scoreEl.textContent();
      expect(scoreAfterText).not.toBe(scoreBeforeText);
    }).toPass({ timeout: 500 });

    // Width must not change (tabular-nums keeps layout stable)
    const widthAfter = await scoreEl.evaluate((el) => (el as HTMLElement).offsetWidth);
    expect(widthAfter).toBe(widthBefore);
  });
});
