import { Page } from '@playwright/test';

export function uniqueEmail() {
  return `e2e+${Date.now()}@longevity-test.invalid`;
}

// Must satisfy passwordSchema (backend/src/lib/password.ts): 10+ chars,
// upper + lower case, and a digit or special char.
export const TEST_PASSWORD = 'Longevity-Test-2026';

export async function loginAs(page: Page, email: string, password: string) {
  await page.addInitScript(() => {
    localStorage.setItem('longevity_tutorial_completed', 'true');
    sessionStorage.removeItem('longevity_auto_open_tutorial');
  });
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
  await page.waitForURL('**/dashboard');
}

// Grants the Art. 9 DSGVO health-data consent via the real API (using the
// browser context's session cookie), so tests unrelated to the consent flow
// itself don't have to fight the ConsentModal dialog intercepting clicks.
export async function grantHealthDataConsent(page: Page) {
  let token: string | undefined;
  const cookies = await page.context().cookies();
  const xsrfCookie = cookies.find((c) => c.name === 'XSRF-TOKEN');
  if (xsrfCookie) {
    token = decodeURIComponent(xsrfCookie.value);
  } else {
    const csrfRes = await page.request.get('/api/auth/csrf');
    if (csrfRes.ok()) {
      const data = (await csrfRes.json()) as { csrfToken?: string };
      token = data.csrfToken;
    }
  }

  const headers: Record<string, string> = {};
  if (token) {
    headers['x-csrf-token'] = token;
  }

  const res = await page.request.post('/api/account/consent', {
    data: { version: '2026-09-v1' },
    headers,
  });
  if (!res.ok()) throw new Error(`Failed to grant health data consent: ${res.status()}`);
}

export async function registerAndLogin(page: Page, email: string, password: string) {
  await page.addInitScript(() => {
    localStorage.setItem('longevity_tutorial_completed', 'true');
    sessionStorage.removeItem('longevity_auto_open_tutorial');
  });
  await page.goto('/register');
  await page.getByTestId('register-email').fill(email);
  await page.getByTestId('register-password').fill(password);
  await page.getByTestId('register-password-confirm').fill(password);
  await page.getByTestId('register-birthdate').fill('1990-04-15');
  await page.getByTestId('register-sex-m').click();
  await page.getByTestId('register-submit').click();
  // Registration now shows a "confirm your email" interstitial (issue #11)
  // before granting dashboard access — click through it.
  await page.getByTestId('register-go-dashboard').click();
  await page.waitForURL('**/dashboard');
  await dismissTutorialIfOpen(page);
}

// The onboarding tutorial auto-opens per-user (keyed by user id, which the
// pre-registration localStorage seed above can't know) and Register.tsx also
// force-opens it via a session flag — so it can reappear on later navigations
// too (e.g. after goto()). Dismiss it with Escape if it's covering the page.
export async function dismissTutorialIfOpen(page: Page) {
  await page.evaluate(() => {
    sessionStorage.removeItem('longevity_auto_open_tutorial');
    localStorage.setItem('longevity_tutorial_completed', 'true');
  }).catch(() => {});
  const tutorialHeading = page.getByText('LONGEVITY GUIDE');
  if (await tutorialHeading.isVisible({ timeout: 1500 }).catch(() => false)) {
    await page.keyboard.press('Escape');
    await tutorialHeading.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
  }
}
