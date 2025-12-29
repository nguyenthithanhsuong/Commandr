import { test, expect } from '@playwright/test';

// npx playwright test tests/request.spec.js --headed --project=firefox --timeout=60000

test.describe('Request Page Access Tests', () => {

	async function signIn(page, email, password, expectPath) {
		page.on('dialog', async dialog => dialog.accept());
		await page.goto('http://localhost:3000/signin');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', password);
		await page.click('button[type="submit"]');
		await page.waitForURL(`**/${expectPath}`);
	}

	// -------------------------------------------------------
	test('TC-Request-001: Admin nav → request, add new, return to request', async ({ page }) => {
		await signIn(page, 'admin', 'admin', 'personnel');
		await page.click('span:has-text("Request")');
		await page.waitForURL('**/request');
		await expect(page).toHaveURL(/.*\/request$/);
		await expect(page.locator('button:has-text("Manage Requests")')).toBeVisible();
		await expect(page.locator('button:has-text("Delete Requests")')).toBeVisible();
		await expect(page.locator('button:has-text("Add New Request")')).toBeVisible();
		await page.click('button:has-text("Add New Request")');
		await page.waitForURL('**/request/addrequest');
		await expect(page).toHaveURL(/.*\/request\/addrequest$/);
		await page.click('button:has-text("Return to Request List")');
		await page.waitForURL('**/request');
		await expect(page).toHaveURL(/.*\/request$/);
		await expect(page.locator('button:has-text("Manage Requests")')).toBeVisible();
		await expect(page.locator('button:has-text("Delete Requests")')).toBeVisible();
		await expect(page.locator('button:has-text("Add New Request")')).toBeVisible();
	});

	// -------------------------------------------------------
	test('TC-Request-002: HR nav → request, manage only', async ({ page }) => {
		await signIn(page, 'hr@email.com', 'hr', 'personnel');
		await page.click('span:has-text("Request")');
		await page.waitForURL('**/request');
		await expect(page).toHaveURL(/.*\/request$/);
		await expect(page.locator('button:has-text("Manage Requests")')).toBeVisible();
		await expect(page.locator('button:has-text("Delete Requests")')).toHaveCount(0);
		await expect(page.locator('button:has-text("Add New Request")')).toHaveCount(0);
	});

	// -------------------------------------------------------
	test('TC-Request-003: CEO nav → request, manage only', async ({ page }) => {
		await signIn(page, 'ceo@email.com', 'ceo', 'personnel');
		await page.click('span:has-text("Request")');
		await page.waitForURL('**/request');
		await expect(page).toHaveURL(/.*\/request$/);
		await expect(page.locator('button:has-text("Manage Requests")')).toBeVisible();
		await expect(page.locator('button:has-text("Delete Requests")')).toHaveCount(0);
		await expect(page.locator('button:has-text("Add New Request")')).toHaveCount(0);
	});

	// -------------------------------------------------------
	test('TC-Request-004: Admin direct → request, sees manage/delete/add, direct addrequest allowed', async ({ page }) => {
		await signIn(page, 'admin', 'admin', 'personnel');
		await page.goto('http://localhost:3000/request');
		await page.waitForURL('**/request');
		await expect(page).toHaveURL(/.*\/request$/);
		await expect(page.locator('button:has-text("Manage Requests")')).toBeVisible();
		await expect(page.locator('button:has-text("Delete Requests")')).toBeVisible();
		await expect(page.locator('button:has-text("Add New Request")')).toBeVisible();
		await page.goto('http://localhost:3000/request/addrequest');
		await page.waitForURL('**/request/addrequest');
		await expect(page).toHaveURL(/.*\/request\/addrequest$/);
	});

	// -------------------------------------------------------
	test('TC-Request-005: HR direct → request, manage only, addrequest blocked', async ({ page }) => {
		await signIn(page, 'hr@email.com', 'hr', 'personnel');
		await page.goto('http://localhost:3000/request');
		await page.waitForURL('**/request');
		await expect(page).toHaveURL(/.*\/request$/);
		await expect(page.locator('button:has-text("Manage Requests")')).toBeVisible();
		await expect(page.locator('button:has-text("Delete Requests")')).toHaveCount(0);
		await expect(page.locator('button:has-text("Add New Request")')).toHaveCount(0);
		await page.goto('http://localhost:3000/request/addrequest');
		await page.waitForURL('**/request');
		await expect(page).toHaveURL(/.*\/request$/);
	});

	// -------------------------------------------------------
	test('TC-Request-006: CEO direct → request, manage only, addrequest blocked', async ({ page }) => {
		await signIn(page, 'ceo@email.com', 'ceo', 'personnel');
		await page.goto('http://localhost:3000/request');
		await page.waitForURL('**/request');
		await expect(page).toHaveURL(/.*\/request$/);
		await expect(page.locator('button:has-text("Manage Requests")')).toBeVisible();
		await expect(page.locator('button:has-text("Delete Requests")')).toHaveCount(0);
		await expect(page.locator('button:has-text("Add New Request")')).toHaveCount(0);
		await page.goto('http://localhost:3000/request/addrequest');
		await page.waitForURL('**/request');
		await expect(page).toHaveURL(/.*\/request$/);
	});

	// -------------------------------------------------------
	test('TC-Request-007: Personnel blocked from request and addrequest', async ({ page }) => {
		await signIn(page, 'email@email.com', 'password', 'personal');
		await page.goto('http://localhost:3000/request');
		await page.waitForURL('**/personal');
		await expect(page).toHaveURL(/.*\/personal$/);
		await page.goto('http://localhost:3000/request/addrequest');
		await page.waitForURL('**/personal');
		await expect(page).toHaveURL(/.*\/personal$/);
	});

	// -------------------------------------------------------
	test('TC-Request-008: Unauthenticated blocked from request and addrequest', async ({ page }) => {
		await page.goto('http://localhost:3000/request');
		await page.waitForURL('**/signin');
		await expect(page).toHaveURL(/.*\/signin$/);
		await page.goto('http://localhost:3000/request/addrequest');
		await page.waitForURL('**/signin');
		await expect(page).toHaveURL(/.*\/signin$/);
	});

});
