import { test, expect } from '@playwright/test';

// npx playwright test tests/project.spec.js --headed --project=firefox --timeout=600000

test.describe('Project Page Tests', () => {
  // Helper: sign in
  async function signIn(page, email, password) {
    page.on('dialog', async dialog => dialog.accept());
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
  }

  // -------------------------------------------------------
  test('TC-Project-001: Admin navigates project UI via navbar', async ({ page }) => {
    await signIn(page, 'admin', 'admin');

    // Click Project in navbar
    await page.click('span:has-text("Project")');
    await page.waitForURL('**/project');

    // Click Add New Project
    await page.click('button:has-text("Add New Project")');
    await page.waitForURL('**/project/addproject');

    // Return to Project List
    await page.click('button:has-text("Return To Project List")');
    await page.waitForURL('**/project');

    // Click first project row to open details
    const row = page.locator('table tbody tr').first();
    await row.click();
    await page.waitForURL('**/project/viewproject?id=*');

    // Go to Update Project
    await page.click('button:has-text("Update Project")');
    await page.waitForURL('**/project/updateproject?id=*');
  });

  // -------------------------------------------------------
  test('TC-Project-002: CEO navigates project UI via navbar', async ({ page }) => {
    await signIn(page, 'ceo@email.com', 'ceo');

    await page.click('span:has-text("Project")');
    await page.waitForURL('**/project');

    await page.click('button:has-text("Add New Project")');
    await page.waitForURL('**/project/addproject');

    await page.click('button:has-text("Return To Project List")');
    await page.waitForURL('**/project');

    const row = page.locator('table tbody tr').first();
    await row.click();
    await page.waitForURL('**/project/viewproject?id=*');

    await page.click('button:has-text("Update Project")');
    await page.waitForURL('**/project/updateproject?id=*');
  });

  // -------------------------------------------------------
  test('TC-Project-003: HR UI access control in project pages', async ({ page }) => {
    await signIn(page, 'hr@email.com', 'hr');

    // Navigate to Project via navbar
    await page.click('span:has-text("Project")');
    await page.waitForURL('**/project');

    // Verify "Add New Project" button is not shown for HR
    await expect(page.locator('button:has-text("Add New Project")')).toHaveCount(0);

    // Click on 'Project Name' project row
    const projectRow = page.locator('table tbody tr:has-text("Project Name")');
    await expect(projectRow).toBeVisible();
    await projectRow.click();

    // Check if redirected to viewproject page
    await page.waitForURL('**/project/viewproject?id=*');
    await expect(page).toHaveURL(/.*\/project\/viewproject\?id=\d+/);

    // Verify no Update/Delete actions are shown for HR
    await expect(page.locator('button:has-text("Update Project")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Delete Project")')).toHaveCount(0);
  });

  // -------------------------------------------------------
  test('TC-Project-004: Admin direct URL navigation', async ({ page }) => {
    await signIn(page, 'admin', 'admin');

    await page.goto('http://localhost:3000/project');
    await page.waitForURL('**/project');

    await page.goto('http://localhost:3000/project/addproject');
    await page.waitForURL('**/project/addproject');

    await page.goto('http://localhost:3000/project/viewproject?id=6');
    await page.waitForURL('**/project/viewproject?id=*');

    await page.goto('http://localhost:3000/project/updateproject?id=6');
    await page.waitForURL('**/project/updateproject?id=*');
  });

  // -------------------------------------------------------
  test('TC-Project-005: HR restricted for add/update, can view list and details', async ({ page }) => {
    await signIn(page, 'hr@email.com', 'hr');

    await page.goto('http://localhost:3000/project');
    await page.waitForURL('**/project');

    await page.goto('http://localhost:3000/project/addproject');
    await page.waitForURL('**/project');

    await page.goto('http://localhost:3000/project/viewproject?id=6');
    await page.waitForURL('**/project/viewproject?id=*');

    await page.goto('http://localhost:3000/project/updateproject?id=6');
    await page.waitForURL('**/project');
  });

  // -------------------------------------------------------
  test('TC-Project-006: CEO allowed to access all project pages directly', async ({ page }) => {
    await signIn(page, 'ceo@email.com', 'ceo');

    await page.goto('http://localhost:3000/project');
    await page.waitForURL('**/project');

    await page.goto('http://localhost:3000/project/addproject');
    await page.waitForURL('**/project/addproject');

    await page.goto('http://localhost:3000/project/viewproject?id=6');
    await page.waitForURL('**/project/viewproject?id=*');

    await page.goto('http://localhost:3000/project/updateproject?id=6');
    await page.waitForURL('**/project/updateproject?id=*');
  });

  // -------------------------------------------------------
  test('TC-Project-007: Regular user is redirected to personal for all project pages', async ({ page }) => {
    await signIn(page, 'email@email.com', 'password');
    await page.waitForURL('**/personal');

    await page.goto('http://localhost:3000/project');
    await page.waitForURL('**/personal');

    // Re-authenticate for each navigation to reset state
    await signIn(page, 'email@email.com', 'password');
    await page.goto('http://localhost:3000/project/addproject');
    await page.waitForURL('**/personal');

    await signIn(page, 'email@email.com', 'password');
    await page.goto('http://localhost:3000/project/viewproject?id=6');
    await page.waitForURL('**/personal');

    await signIn(page, 'email@email.com', 'password');
    await page.goto('http://localhost:3000/project/updateproject?id=6');
    await page.waitForURL('**/personal');
  });

  // -------------------------------------------------------
  test('TC-Project-008: Unauthenticated user is redirected to signin', async ({ page }) => {
    await page.goto('http://localhost:3000/project');
    await page.waitForURL('**/signin');

    await page.goto('http://localhost:3000/project/addproject');
    await page.waitForURL('**/signin');

    await page.goto('http://localhost:3000/project/viewproject?id=6');
    await page.waitForURL('**/signin');

    await page.goto('http://localhost:3000/project/updateproject?id=6');
    await page.waitForURL('**/signin');
  });
});
