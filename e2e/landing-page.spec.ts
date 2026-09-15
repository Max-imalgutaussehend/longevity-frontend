import { test, expect } from '@playwright/test';

test.describe('Landing Page & Public Layer (#8, #9, #10, #18)', () => {
  test('renders full-screen hero section with video, LONGEVITY title, and direct CTA', async ({ page }) => {
    await page.goto('/');

    // Check main title on hero video
    const heading = page.locator('h1');
    await expect(heading).toContainText('LONGEVITY');

    // Check hero video exists, is muted, and has no control buttons
    const video = page.locator('video');
    await expect(video).toBeVisible();
    await expect(page.getByRole('button', { name: /mute|stumm/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /pause/i })).toHaveCount(0);

    // Check direct CTA to Dashboard
    await expect(page.getByRole('link', { name: 'Zum Dashboard →' }).first()).toBeVisible();

    // Check product section below hero video
    const productSection = page.locator('#produkt');
    await expect(productSection).toBeVisible();
    await expect(productSection.locator('h2')).toContainText('Messbare Vitalität');
    await expect(productSection.getByText('LONGEVITY Score')).toBeVisible();
    await expect(productSection.getByText('Biologisches Alter', { exact: true }).first()).toBeVisible();
  });

  test('interactive simulator updates live score on the landing page', async ({ page }) => {
    await page.goto('/');

    const simSection = page.locator('#simulator');
    await expect(simSection).toBeVisible();

    // Move resting HR slider to athlete level (48 bpm)
    const hrSlider = simSection.locator('input[type="range"]').first();
    await hrSlider.fill('48');

    // Check that projected score and band are rendered within simulator
    await expect(simSection.getByText('Prognostizierter Score')).toBeVisible();
    await expect(simSection.getByText(/Band (80|65|50)/)).toBeVisible();
  });

  test('contact form for insurers submits and displays confirmation (#10)', async ({ page }) => {
    await page.goto('/#kassen');

    const companyInput = page.locator('input[placeholder*="Techniker Krankenkasse"]');
    await expect(companyInput).toBeVisible();

    await companyInput.fill('AOK Baden-Württemberg');
    await page.locator('input[placeholder*="Dr. Vorname"]').fill('Dr. Bernd Koch');
    await page.locator('input[placeholder*="name@organisation.de"]').fill('b.koch@aok-test.de');
    await page.locator('textarea').fill('Wir interessieren uns für ein Pilotprojekt zur Incentivierung von Vorsorgeuntersuchungen.');

    await page.getByRole('button', { name: 'Erstkontakt anfordern' }).click();

    // Check success state
    await expect(page.getByText('Vielen Dank für Ihre Anfrage!')).toBeVisible({ timeout: 5000 });
  });

  test('public impressum and datenschutz routes render correctly (#9)', async ({ page }) => {
    await page.goto('/impressum');
    await expect(page.locator('h1')).toContainText('Impressum');

    await page.goto('/datenschutz');
    await expect(page.locator('h1')).toContainText('Datenschutzerklärung');
  });

  test('navigation buttons scroll to respective sections', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Click 'Produkt' in navbar
    const produktBtn = page.getByRole('button', { name: 'Produkt' }).first();
    await produktBtn.click();
    await expect(page.locator('#produkt')).toBeInViewport({ timeout: 5000 });

    // Click 'Live-Simulator' in navbar
    const simBtn = page.getByRole('button', { name: 'Live-Simulator' }).first();
    await simBtn.click();
    await expect(page.locator('#simulator')).toBeInViewport({ timeout: 5000 });
  });
});

