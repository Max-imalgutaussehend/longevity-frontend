import { test, expect, Browser } from '@playwright/test';
import { uniqueEmail, registerAndLogin, loginAs } from './helpers.js';

// Issue: simulator slider — keyboard interaction updates score within 500 ms,
// tabular-nums prevents layout shift on the score number.
test.describe('Hebel simulator', () => {
  const PASSWORD = 'longevity-test-2026';

  test('arrow key on slider updates score within 500 ms without layout shift', async ({ page }) => {
    const email = uniqueEmail();
    await registerAndLogin(page, email, PASSWORD);
    await page.goto('/hebel');

    // Wait for sliders to be ready (levers loaded or page rendered)
    const slider = page.getByRole('slider', { name: 'Schritte' });
    await expect(slider).toBeVisible({ timeout: 8000 });

    const scoreEl = page.getByTestId('sim-score');
    await expect(scoreEl).toBeVisible();

    // Capture initial state
    const scoreBefore = await scoreEl.textContent();
    const widthBefore = await scoreEl.evaluate((el) => (el as HTMLElement).offsetWidth);

    // Move slider with keyboard — 10 ArrowRight presses = +5000 steps (step 500)
    await slider.focus();
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowRight');
    }

    // Score must update within 500 ms (debounce 120 ms + network)
    await expect(async () => {
      const scoreAfter = await scoreEl.textContent();
      expect(scoreAfter).not.toBe(scoreBefore);
    }).toPass({ timeout: 500 });

    // Width must not change (tabular-nums keeps layout stable)
    const widthAfter = await scoreEl.evaluate((el) => (el as HTMLElement).offsetWidth);
    expect(widthAfter).toBe(widthBefore);
  });
});
