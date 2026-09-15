import { Page } from '@playwright/test';

export function uniqueEmail() {
  return `e2e+${Date.now()}@longevity-test.invalid`;
}

export async function loginAs(page: Page, email: string, password: string) {
  await page.addInitScript(() => {
    localStorage.setItem('longevity_tutorial_completed', 'true');
  });
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
  await page.waitForURL('**/dashboard');
}

export async function registerAndLogin(page: Page, email: string, password: string) {
  await page.addInitScript(() => {
    localStorage.setItem('longevity_tutorial_completed', 'true');
  });
  await page.goto('/register');
  await page.getByTestId('register-email').fill(email);
  await page.getByTestId('register-password').fill(password);
  await page.getByTestId('register-birthdate').fill('1990-04-15');
  await page.getByTestId('register-sex-m').click();
  await page.getByTestId('register-submit').click();
  await page.waitForURL('**/dashboard');
}
