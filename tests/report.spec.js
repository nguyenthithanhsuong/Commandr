import { test, expect } from '@playwright/test';

// npx playwright test tests/report.spec.js --headed --project=firefox --timeout=60000

test.describe('Report Page Tests', () => {

  // Helper: sign in and wait for the landing page
  const signIn = async (page, email, password, expectedPath) => {
    page.on('dialog', async dialog => dialog.accept());

    await page.goto('http://localhost:3000/signin');

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    const [apiResponse] = await Promise.all([
      page.waitForResponse(r =>
        r.url().includes('/db/dbroute') &&
        r.request().method() === 'POST'
      ),
      page.click('button[type="submit"]'),
    ]);

    console.log('Auth:', apiResponse.status());

    await page.waitForURL(`**/${expectedPath}`);
    await expect(page).toHaveURL(new RegExp(`.*/${expectedPath}$`));
  };

  // -------------------------------------------------------
  test('TC-Report-001: Admin nav access to report page', async ({ page }) => {
    await signIn(page, 'admin', 'admin', 'personnel');

    await page.locator('header nav >> text=Report').click();

    await page.waitForURL('**/report');
    await expect(page).toHaveURL(/.*\/report$/);
  });

  // -------------------------------------------------------
  test('TC-Report-002: HR nav access to report page', async ({ page }) => {
    await signIn(page, 'hr@email.com', 'hr', 'personnel');

    await page.locator('header nav >> text=Report').click();

    await page.waitForURL('**/report');
    await expect(page).toHaveURL(/.*\/report$/);
  });

  // -------------------------------------------------------
  test('TC-Report-003: CEO nav access to report page', async ({ page }) => {
    await signIn(page, 'ceo@email.com', 'ceo', 'personnel');

    await page.locator('header nav >> text=Report').click();

    await page.waitForURL('**/report');
    await expect(page).toHaveURL(/.*\/report$/);
  });

  // -------------------------------------------------------
  test('TC-Report-004: Admin direct access to report page', async ({ page }) => {
    await signIn(page, 'admin', 'admin', 'personnel');

    await page.goto('http://localhost:3000/report');

    await page.waitForURL('**/report');
    await expect(page).toHaveURL(/.*\/report$/);
  });

  // -------------------------------------------------------
  test('TC-Report-005: HR direct access to report page', async ({ page }) => {
    await signIn(page, 'hr@email.com', 'hr', 'personnel');

    await page.goto('http://localhost:3000/report');

    await page.waitForURL('**/report');
    await expect(page).toHaveURL(/.*\/report$/);
  });

  // -------------------------------------------------------
  test('TC-Report-006: CEO direct access to report page', async ({ page }) => {
    await signIn(page, 'ceo@email.com', 'ceo', 'personnel');

    await page.goto('http://localhost:3000/report');

    await page.waitForURL('**/report');
    await expect(page).toHaveURL(/.*\/report$/);
  });

  // -------------------------------------------------------
  test('TC-Report-007: Personnel user is rerouted away from /report', async ({ page }) => {
    await signIn(page, 'email@email.com', 'password', 'personal');

    await page.goto('http://localhost:3000/report');

    await page.waitForURL('**/personal');
    await expect(page).toHaveURL(/.*\/personal$/);
  });

  // -------------------------------------------------------
  test('TC-Report-008: Unauthenticated user is rerouted to /signin', async ({ page }) => {
    await page.goto('http://localhost:3000/report');

    await page.waitForURL('**/signin');
    await expect(page).toHaveURL(/.*\/signin$/);
  });

});
