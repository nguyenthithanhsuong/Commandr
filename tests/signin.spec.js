import { test, expect } from '@playwright/test';

// npx playwright test tests/signin.spec.js --headed --project=firefox --timeout=60000

test.describe('Sign-in Page Tests', () => {

  // -------------------------------------------------------
  // Helper: capture alerts
  async function captureAlert(page) {
    let msg = '';
    page.on('dialog', async dialog => {
      msg = dialog.message();
      await dialog.accept();
    });
    return () => msg;
  }

  // -------------------------------------------------------
  test('TC-SignIn-001: Admin sign-in redirects to /personnel', async ({ page }) => {
    page.on('dialog', async dialog => dialog.accept());

    await page.goto('http://localhost:3000/signin');

    await page.fill('input[name="email"]', 'admin');
    await page.fill('input[name="password"]', 'admin');

    const [apiResponse] = await Promise.all([
      page.waitForResponse(r =>
        r.url().includes('/db/dbroute') &&
        r.request().method() === 'POST'
      ),
      page.click('button[type="submit"]'),
    ]);

    console.log('API response received:', apiResponse.status());

    await page.waitForURL('**/personnel');
  });

  // -------------------------------------------------------
  test('TC-SignIn-002: Valid user redirects to /personal', async ({ page }) => {
    page.on('dialog', async dialog => dialog.accept());

    await page.goto('http://localhost:3000/signin');

    await page.fill('input[name="email"]', 'email@email.com');
    await page.fill('input[name="password"]', 'password');

    const [apiResponse] = await Promise.all([
      page.waitForResponse(r =>
        r.url().includes('/db/dbroute') &&
        r.request().method() === 'POST'
      ),
      page.click('button[type="submit"]'),
    ]);

    console.log('Auth:', apiResponse.status());

    await page.waitForURL('**/personal');
  });

  // -------------------------------------------------------
  test('TC-SignIn-003: Wrong credentials alerts "Invalid email or password."', async ({ page }) => {
    const getAlert = await captureAlert(page);

    await page.goto('http://localhost:3000/signin');

    await page.fill('input[name="email"]', 'wrong');
    await page.fill('input[name="password"]', 'wrong');

    await page.click('button[type="submit"]');

    await expect.poll(getAlert).toBe('Invalid email or password.');
  });

  // -------------------------------------------------------
  test('TC-SignIn-004: Blank password alerts "Password cannot be blank!"', async ({ page }) => {
    const getAlert = await captureAlert(page);

    await page.goto('http://localhost:3000/signin');

    await page.fill('input[name="email"]', 'admin');
    await page.fill('input[name="password"]', '');

    await page.click('button[type="submit"]');

    await expect.poll(getAlert).toBe('Password cannot be blank!');
  });

  // -------------------------------------------------------
  test('TC-SignIn-005: Blank email alerts "Email cannot be blank!"', async ({ page }) => {
    const getAlert = await captureAlert(page);

    await page.goto('http://localhost:3000/signin');

    await page.fill('input[name="email"]', '');
    await page.fill('input[name="password"]', 'wrong');

    await page.click('button[type="submit"]');

    await expect.poll(getAlert).toBe('Email cannot be blank!');
  });

  // -------------------------------------------------------
  test('TC-SignIn-006: Blank both fields alerts "Email cannot be blank!"', async ({ page }) => {
    const getAlert = await captureAlert(page);

    await page.goto('http://localhost:3000/signin');

    await page.fill('input[name="email"]', '');
    await page.fill('input[name="password"]', '');

    await page.click('button[type="submit"]');

    await expect.poll(getAlert).toBe('Email cannot be blank!');
  });

});
