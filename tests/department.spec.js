import { test, expect } from '@playwright/test';

// npx playwright test tests/department.spec.js --headed --project=firefox --timeout=60000

test.describe('Department Page Tests', () => {

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

	// Helper: expect admin-only controls to be visible
	const expectAdminControlsVisible = async page => {
		await expect(page.locator('button:has-text("Add Position")')).toBeVisible();
		await expect(page.locator('button:has-text("Add Department")')).toBeVisible();
		await expect(page.locator('th:has-text("Actions")')).toBeVisible();
		await expect(page.locator('table button:has-text("Edit")').first()).toBeVisible();
		await expect(page.locator('table button:has-text("Delete")').first()).toBeVisible();
	};

	// Helper: expect admin-only controls to be hidden
	const expectAdminControlsHidden = async page => {
		await expect(page.locator('button:has-text("Add Position")')).toHaveCount(0);
		await expect(page.locator('button:has-text("Add Department")')).toHaveCount(0);
		await expect(page.locator('th:has-text("Actions")')).toHaveCount(0);
		await expect(page.locator('table button:has-text("Edit")')).toHaveCount(0);
		await expect(page.locator('table button:has-text("Delete")')).toHaveCount(0);
	};

	// -------------------------------------------------------
	test('TC-Department-001: Admin nav access with management controls', async ({ page }) => {
		await signIn(page, 'admin', 'admin', 'personnel');

		await page.locator('header nav >> text=Department').click();

		await page.waitForURL('**/department');
		await expect(page).toHaveURL(/.*\/department$/);
		await expect(page.getByText('Positions & Departments List')).toBeVisible();

		await expectAdminControlsVisible(page);
	});

	// -------------------------------------------------------
	test('TC-Department-002: HR nav access without management controls', async ({ page }) => {
		await signIn(page, 'hr@email.com', 'hr', 'personnel');

		await page.locator('header nav >> text=Department').click();

		await page.waitForURL('**/department');
		await expect(page).toHaveURL(/.*\/department$/);
		await expect(page.getByText('Positions & Departments List')).toBeVisible();

		await expectAdminControlsHidden(page);
	});

	// -------------------------------------------------------
	test('TC-Department-003: CEO nav access without management controls', async ({ page }) => {
		await signIn(page, 'ceo@email.com', 'ceo', 'personnel');

		await page.locator('header nav >> text=Department').click();

		await page.waitForURL('**/department');
		await expect(page).toHaveURL(/.*\/department$/);
		await expect(page.getByText('Positions & Departments List')).toBeVisible();

		await expectAdminControlsHidden(page);
	});

	// -------------------------------------------------------
	test('TC-Department-004: Admin direct access keeps management controls', async ({ page }) => {
		await signIn(page, 'admin', 'admin', 'personnel');

		await page.goto('http://localhost:3000/department');

		await page.waitForURL('**/department');
		await expect(page).toHaveURL(/.*\/department$/);
		await expect(page.getByText('Positions & Departments List')).toBeVisible();

		await expectAdminControlsVisible(page);
	});

	// -------------------------------------------------------
	test('TC-Department-005: HR direct access without management controls', async ({ page }) => {
		await signIn(page, 'hr@email.com', 'hr', 'personnel');

		await page.goto('http://localhost:3000/department');

		await page.waitForURL('**/department');
		await expect(page).toHaveURL(/.*\/department$/);
		await expect(page.getByText('Positions & Departments List')).toBeVisible();

		await expectAdminControlsHidden(page);
	});

	// -------------------------------------------------------
	test('TC-Department-006: CEO direct access without management controls', async ({ page }) => {
		await signIn(page, 'ceo@email.com', 'ceo', 'personnel');

		await page.goto('http://localhost:3000/department');

		await page.waitForURL('**/department');
		await expect(page).toHaveURL(/.*\/department$/);
		await expect(page.getByText('Positions & Departments List')).toBeVisible();

		await expectAdminControlsHidden(page);
	});

	// -------------------------------------------------------
	test('TC-Department-007: Personnel user is rerouted away from /department', async ({ page }) => {
		await signIn(page, 'email@email.com', 'password', 'personal');

		await page.goto('http://localhost:3000/department');

		await page.waitForURL('**/personal');
		await expect(page).toHaveURL(/.*\/personal$/);
	});

	// -------------------------------------------------------
	test('TC-Department-008: Unauthenticated user is rerouted to /signin', async ({ page }) => {
		await page.goto('http://localhost:3000/department');

		await page.waitForURL('**/signin');
		await expect(page).toHaveURL(/.*\/signin$/);
	});

});
