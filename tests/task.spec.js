import { test, expect } from '@playwright/test';

// npx playwright test tests/task.spec.js --headed --project=firefox --timeout=30000

test.describe('Task Page Tests', () => {

  // Helper function to sign in
  async function signIn(page, email, password) {
    page.on('dialog', async dialog => dialog.accept());
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/personnel');
  }

  // -------------------------------------------------------
  test('TC-Task-001: Admin successfully navigates through task pages using UI', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    console.log('✓ Admin logged in');

    // Click on Task on the Navigation Bar
    await page.click('span:has-text("Task")');
    await page.waitForURL('**/task');
    console.log('✓ Navigated to Task page');

    // Click on 'Add New Task'
    await page.click('button:has-text("Add New Task")');
    await page.waitForURL('**/task/addtask');
    console.log('✓ Navigated to Add Task page');

    // Click on 'Return to Task List'
    await page.click('button:has-text("Return to Task List")');
    await page.waitForURL('**/task');
    console.log('✓ Returned to Task page');

    // Click on first task in the list
    const taskRow = page.locator('table tbody tr').first();
    await taskRow.click();
    await page.waitForURL('**/task/viewtask?id=*');
    console.log('✓ Navigated to Task detail page');

    // Click on 'Update Task'
    await page.click('button:has-text("Update Task")');
    await page.waitForURL('**/task/updatetask?id=*');
    console.log('✓ Navigated to Task update page');

    console.log('✓ TC-Task-001 passed!');
  });

  // -------------------------------------------------------
  test('TC-Task-002: CEO successfully navigates through task pages using UI', async ({ page }) => {
    await signIn(page, 'ceo@email.com', 'ceo');
    console.log('✓ CEO logged in');

    // Click on Task on the Navigation Bar
    await page.click('span:has-text("Task")');
    await page.waitForURL('**/task');
    console.log('✓ Navigated to Task page');

    // Click on 'Add New Task'
    await page.click('button:has-text("Add New Task")');
    await page.waitForURL('**/task/addtask');
    console.log('✓ Navigated to Add Task page');

    // Click on 'Return to Task List'
    await page.click('button:has-text("Return to Task List")');
    await page.waitForURL('**/task');
    console.log('✓ Returned to Task page');

    // Click on first task in the list
    const taskRow = page.locator('table tbody tr').first();
    await taskRow.click();
    await page.waitForURL('**/task/viewtask?id=*');
    console.log('✓ Navigated to Task detail page');

    // Click on 'Update Task'
    await page.click('button:has-text("Update Task")');
    await page.waitForURL('**/task/updatetask?id=*');
    console.log('✓ Navigated to Task update page');

    console.log('✓ TC-Task-002 passed!');
  });

  // -------------------------------------------------------
  test('TC-Task-003: HR UI access control in task pages', async ({ page }) => {
    await signIn(page, 'hr@email.com', 'hr');
    console.log('✓ HR logged in');

    // Click on Task on the Navigation Bar
    await page.click('span:has-text("Task")');
    await page.waitForURL('**/task');
    console.log('✓ Navigated to Task page');

    // Verify "Add New Task" button is not shown for HR
    await expect(page.locator('button:has-text("Add New Task")')).toHaveCount(0);
    console.log('✓ Add New Task option is not visible for HR');

    // Click on 'Task Name' Task row
    const taskRow = page.locator('table tbody tr:has-text("Task Name")');
    await expect(taskRow).toBeVisible();
    await taskRow.click();

    // Check if redirected to viewtask page
    await page.waitForURL('**/task/viewtask?id=*');
    await expect(page).toHaveURL(/.*\/task\/viewtask\?id=\d+/);
    console.log('✓ Navigated to Task Name detail page');

    // Verify no Update/Delete actions are shown for HR
    await expect(page.locator('button:has-text("Update Task")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Delete Task")')).toHaveCount(0);
    console.log('✓ No update or delete options visible for HR');

    console.log('✓ TC-Task-003 passed!');
  });

  // -------------------------------------------------------
  test('TC-Task-004: Admin can directly navigate to task pages via URL', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    console.log('✓ Admin logged in');

    // Navigate directly to task page
    await page.goto('http://localhost:3000/task');
    await page.waitForURL('**/task');
    console.log('✓ Successfully accessed /task page');

    // Navigate directly to add task page
    await page.goto('http://localhost:3000/task/addtask');
    await page.waitForURL('**/task/addtask');
    console.log('✓ Successfully accessed /task/addtask page');

    // Navigate directly to view task page
    await page.goto('http://localhost:3000/task/viewtask?id=9');
    await page.waitForURL('**/task/viewtask?id=*');
    console.log('✓ Successfully accessed /task/viewtask page');

    // Navigate directly to update task page
    await page.goto('http://localhost:3000/task/updatetask?id=9');
    await page.waitForURL('**/task/updatetask?id=*');
    console.log('✓ Successfully accessed /task/updatetask page');

    console.log('✓ TC-Task-004 passed!');
  });

  // -------------------------------------------------------
  test('TC-Task-005: HR has restricted access to task pages', async ({ page }) => {
    await signIn(page, 'hr@email.com', 'hr');
    console.log('✓ HR logged in');

    // HR can access task page
    await page.goto('http://localhost:3000/task');
    await page.waitForURL('**/task');
    console.log('✓ HR successfully accessed /task page');

    // HR cannot access add task page - should be redirected to task
    await page.goto('http://localhost:3000/task/addtask');
    await page.waitForURL('**/task');
    console.log('✓ HR rejected from /task/addtask, redirected to /task');

    // HR can access view task page
    await page.goto('http://localhost:3000/task/viewtask?id=9');
    await page.waitForURL('**/task/viewtask?id=*');
    console.log('✓ HR successfully accessed /task/viewtask page');

    // HR cannot access update task page - should be redirected to task
    await page.goto('http://localhost:3000/task/updatetask?id=9');
    await page.waitForURL('**/task');
    console.log('✓ HR rejected from /task/updatetask, redirected to /task');

    console.log('✓ TC-Task-005 passed!');
  });

  // -------------------------------------------------------
  test('TC-Task-006: CEO can access all task pages', async ({ page }) => {
    await signIn(page, 'ceo@email.com', 'ceo');
    console.log('✓ CEO logged in');

    // CEO can access task page
    await page.goto('http://localhost:3000/task');
    await page.waitForURL('**/task');
    console.log('✓ CEO successfully accessed /task page');

    // CEO can access add task page
    await page.goto('http://localhost:3000/task/addtask');
    await page.waitForURL('**/task/addtask');
    console.log('✓ CEO successfully accessed /task/addtask page');

    // CEO can access view task page
    await page.goto('http://localhost:3000/task/viewtask?id=9');
    await page.waitForURL('**/task/viewtask?id=*');
    console.log('✓ CEO successfully accessed /task/viewtask page');

    // CEO can access update task page
    await page.goto('http://localhost:3000/task/updatetask?id=9');
    await page.waitForURL('**/task/updatetask?id=*');
    console.log('✓ CEO successfully accessed /task/updatetask page');

    console.log('✓ TC-Task-006 passed!');
  });

  // -------------------------------------------------------
  test('TC-Task-007: Regular user has no access to task pages', async ({ page }) => {
    await signIn(page, 'email@email.com', 'password');
    console.log('✓ Regular user logged in');

    // Regular user cannot access task page - redirected to personal
    await page.goto('http://localhost:3000/task');
    await page.waitForURL('**/personal');
    console.log('✓ Regular user rejected from /task, redirected to /personal');

    // Re-sign in for next test
    await signIn(page, 'email@email.com', 'password');

    // Regular user cannot access add task page - redirected to personal
    await page.goto('http://localhost:3000/task/addtask');
    await page.waitForURL('**/personal');
    console.log('✓ Regular user rejected from /task/addtask, redirected to /personal');

    // Re-sign in for next test
    await signIn(page, 'email@email.com', 'password');

    // Regular user cannot access view task page - redirected to personal
    await page.goto('http://localhost:3000/task/viewtask?id=9');
    await page.waitForURL('**/personal');
    console.log('✓ Regular user rejected from /task/viewtask, redirected to /personal');

    // Re-sign in for next test
    await signIn(page, 'email@email.com', 'password');

    // Regular user cannot access update task page - redirected to personal
    await page.goto('http://localhost:3000/task/updatetask?id=9');
    await page.waitForURL('**/personal');
    console.log('✓ Regular user rejected from /task/updatetask, redirected to /personal');

    console.log('✓ TC-Task-007 passed!');
  });

  // -------------------------------------------------------
  test('TC-Task-008: Unauthenticated user cannot access task pages', async ({ page }) => {
    // Unauthenticated user tries to access task page - redirected to signin
    await page.goto('http://localhost:3000/task');
    await page.waitForURL('**/signin');
    console.log('✓ Unauthenticated user rejected from /task, redirected to /signin');

    // Unauthenticated user tries to access add task page - redirected to signin
    await page.goto('http://localhost:3000/task/addtask');
    await page.waitForURL('**/signin');
    console.log('✓ Unauthenticated user rejected from /task/addtask, redirected to /signin');

    // Unauthenticated user tries to access view task page - redirected to signin
    await page.goto('http://localhost:3000/task/viewtask?id=9');
    await page.waitForURL('**/signin');
    console.log('✓ Unauthenticated user rejected from /task/viewtask, redirected to /signin');

    // Unauthenticated user tries to access update task page - redirected to signin
    await page.goto('http://localhost:3000/task/updatetask?id=9');
    await page.waitForURL('**/signin');
    console.log('✓ Unauthenticated user rejected from /task/updatetask, redirected to /signin');

    console.log('✓ TC-Task-008 passed!');
  });

});
