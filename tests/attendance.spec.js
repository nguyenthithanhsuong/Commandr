import { test, expect } from '@playwright/test';

// npx playwright test tests/attendance.spec.js --headed --project=firefox --timeout=60000

test.describe('Attendance Page Access Tests', () => {

	async function signIn(page, email, password, expectPath) {
		page.on('dialog', async dialog => dialog.accept());
		await page.goto('http://localhost:3000/signin');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', password);
		await page.click('button[type="submit"]');
		await page.waitForURL(`**/${expectPath}`);
	}

	// -------------------------------------------------------
	test('TC-Attendance-001: Admin sign-in, click Attendance in nav → /attendance', async ({ page }) => {
		await signIn(page, 'admin', 'admin', 'personnel');
		await page.click('span:has-text("Attendance")');
		await page.waitForURL('**/attendance');
		await expect(page).toHaveURL(/.*\/attendance$/);
	});

	// -------------------------------------------------------
	test('TC-Attendance-002: HR sign-in, click Attendance in nav → /attendance', async ({ page }) => {
		await signIn(page, 'hr@email.com', 'hr', 'personnel');
		await page.click('span:has-text("Attendance")');
		await page.waitForURL('**/attendance');
		await expect(page).toHaveURL(/.*\/attendance$/);
	});

	// -------------------------------------------------------
	test('TC-Attendance-003: CEO sign-in, click Attendance in nav → /attendance', async ({ page }) => {
		await signIn(page, 'ceo@email.com', 'ceo', 'personnel');
		await page.click('span:has-text("Attendance")');
		await page.waitForURL('**/attendance');
		await expect(page).toHaveURL(/.*\/attendance$/);
	});

	// -------------------------------------------------------
	test('TC-Attendance-004: Admin direct navigation to /attendance succeeds', async ({ page }) => {
		await signIn(page, 'admin', 'admin', 'personnel');
		await page.goto('http://localhost:3000/attendance');
		await page.waitForURL('**/attendance');
		await expect(page).toHaveURL(/.*\/attendance$/);
	});

	// -------------------------------------------------------
	test('TC-Attendance-005: HR direct navigation to /attendance succeeds', async ({ page }) => {
		await signIn(page, 'hr@email.com', 'hr', 'personnel');
		await page.goto('http://localhost:3000/attendance');
		await page.waitForURL('**/attendance');
		await expect(page).toHaveURL(/.*\/attendance$/);
	});

	// -------------------------------------------------------
	test('TC-Attendance-006: CEO direct navigation to /attendance succeeds', async ({ page }) => {
		await signIn(page, 'ceo@email.com', 'ceo', 'personnel');
		await page.goto('http://localhost:3000/attendance');
		await page.waitForURL('**/attendance');
		await expect(page).toHaveURL(/.*\/attendance$/);
	});

	// -------------------------------------------------------
	test('TC-Attendance-007: Personnel blocked from /attendance, redirected to /personal', async ({ page }) => {
		await signIn(page, 'email@email.com', 'password', 'personal');
		await page.goto('http://localhost:3000/attendance');
		await page.waitForURL('**/personal');
		await expect(page).toHaveURL(/.*\/personal$/);
	});

	// -------------------------------------------------------
	test('TC-Attendance-008: Unauthenticated access to /attendance redirected to /signin', async ({ page }) => {
		await page.goto('http://localhost:3000/attendance');
		await page.waitForURL('**/signin');
		await expect(page).toHaveURL(/.*\/signin$/);
	});

});

