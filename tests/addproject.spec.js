import { test, expect } from '@playwright/test';

// npx playwright test tests/addproject.spec.js --headed --project=firefox --timeout=600000

test.describe('Add Project Page Tests', () => {
  // Helper: sign in
  async function signIn(page, email, password) {
    page.on('dialog', async dialog => dialog.accept());
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/personnel');
  }

  // Helper: go to add project page via UI
  async function navigateToAddProject(page) {
    await page.click('span:has-text("Project")');
    await page.waitForURL('**/project');
    await page.click('button:has-text("Add New Project")');
    await page.waitForURL('**/project/addproject');
  }

  // -------------------------------------------------------
  test('TC-AddProject-001: Admin adds full project with all fields', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    await navigateToAddProject(page);
    console.log('✓ Navigated to Add Project page');

    // Project Name
    await page.fill('input[name="projectname"]', 'Full Project');
    await expect(page.locator('input[name="projectname"]').first()).toHaveValue('Full Project');
    console.log('✓ Project Name input correct');

    // Description
    await page.fill('textarea[name="description"]', 'Project Description');
    await expect(page.locator('textarea[name="description"]').first()).toHaveValue('Project Description');
    console.log('✓ Description input correct');

    // Status = In Progress
    await page.selectOption('select[name="projectstatus"]', 'In Progress');
    await expect(page.locator('select[name="projectstatus"]').first()).toHaveValue('In Progress');
    console.log('✓ Project Status selected: In Progress');

    // Submit
    await page.click('button[type="submit"]:has-text("Create Project")');
    await page.waitForURL('**/project');
    console.log('✓ Project created and redirected to project list');

    console.log('✓ TC-AddProject-001 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddProject-002: Minimal project (only name) accepted', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    await navigateToAddProject(page);

    // Only Project Name (status has default "Planning")
    await page.fill('input[name="projectname"]', 'Minimum Name');
    await expect(page.locator('input[name="projectname"]').first()).toHaveValue('Minimum Name');

    await page.click('button[type="submit"]:has-text("Create Project")');
    await page.waitForURL('**/project');
    console.log('✓ Minimal project created successfully');

    console.log('✓ TC-AddProject-002 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddProject-003: Overlong name variant (should be rejected)', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    await navigateToAddProject(page);

    const longName = 'This is a really long Project Name This is a really long Project Name This is a really long Project Name This is a really long Project Name This is a really long Project Name This is a really long Project Name This is a really long Project Name This is a ';
    await page.fill('input[name="projectname"]', longName);

    await page.click('button[type="submit"]:has-text("Create Project")');

    // Expect failure: remain on addproject (no redirect)
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(/\/project\/addproject/);
    console.log('✓ Overlong name rejected (remained on add page)');

    console.log('✓ TC-AddProject-003 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddProject-004: Overlong name (full) rejected', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    await navigateToAddProject(page);

    const veryLongName = 'This is a really long Project Name This is a really long Project Name This is a really long Project Name This is a really long Project Name This is a really long Project Name This is a really long Project Name This is a really long Project Name This is a really long Project Name';
    await page.fill('input[name="projectname"]', veryLongName);

    await page.click('button[type="submit"]:has-text("Create Project")');

    // Expect failure: remain on addproject
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(/\/project\/addproject/);
    console.log('✓ Overlong name rejected (remained on add page)');

    console.log('✓ TC-AddProject-004 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddProject-005: Long description accepted', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    await navigateToAddProject(page);

    // Project Name
    await page.fill('input[name="projectname"]', 'Long Project Description');

    // Long Description
    const longDesc = 'This is a really long Project Description This is a really long Project Description This is a really long Project Description This is a really long Project Description This is a really long Project Description This is a really long Project Description This is a really long Project Description.';
    await page.fill('textarea[name="description"]', longDesc);
    await expect(page.locator('textarea[name="description"]').first()).toHaveValue(longDesc);

    await page.click('button[type="submit"]:has-text("Create Project")');
    await page.waitForURL('**/project');
    console.log('✓ Project with long description created successfully');

    console.log('✓ TC-AddProject-005 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddProject-006: Validation when creating without name', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    await navigateToAddProject(page);

    // Try submit with no fields
    await page.click('button[type="submit"]:has-text("Create Project")');

    // Check native validation message on Project Name field
    const nameInput = page.locator('input[name="projectname"]');
    const validationMessage = await nameInput.evaluate(el => el.validationMessage);
    expect(validationMessage.toLowerCase()).toContain('fill');
    console.log('✓ Validation error displayed for missing Project Name');

    console.log('✓ TC-AddProject-006 passed!');
  });
});
