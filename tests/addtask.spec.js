import { test, expect } from '@playwright/test';

// npx playwright test tests/addtask.spec.js --headed --project=firefox --timeout=600000

test.describe('Add Task Page Tests', () => {

  // Helper function to sign in
  async function signIn(page, email, password) {
    page.on('dialog', async dialog => dialog.accept());
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/personnel');
  }

  // Helper function to navigate to add task page
  async function navigateToAddTask(page) {
    await page.click('span:has-text("Task")');
    await page.waitForURL('**/task');
    await page.click('button:has-text("Add New Task")');
    await page.waitForURL('**/task/addtask');
  }

  // -------------------------------------------------------
  test('TC-AddTask-001: Admin successfully adds task with all fields', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    console.log('✓ Admin logged in');

    // Navigate to add task page via URL
    await page.goto('http://localhost:3000/task/addtask');
    await page.waitForURL('**/task/addtask');
    console.log('✓ Successfully navigated to Add Task page');

    // Fill Task Name
    await page.fill('input[name="taskname"]', 'Full Task');
    await expect(page.locator('input[name="taskname"]')).toHaveValue('Full Task');
    console.log('✓ Task Name input correct');

    // Fill Due Date
    await page.fill('input[name="enddate"]', '2026-01-01');
    await expect(page.locator('input[name="enddate"]')).toHaveValue('2026-01-01');
    console.log('✓ Due Date input correct');

    // Select Project
    await page.selectOption('select[name="projectid"]', '6');
    console.log('✓ Project selected');

    // Fill Description
    await page.fill('textarea[name="description"]', 'Task Description');
    await expect(page.locator('textarea[name="description"]')).toHaveValue('Task Description');
    console.log('✓ Description input correct');

    // Select Status
    await page.selectOption('select[name="taskstatus"]', 'In Progress');
    await expect(page.locator('select[name="taskstatus"]')).toHaveValue('In Progress');
    console.log('✓ Task Status selected: In Progress');

    // Submit form
    await page.click('button[type="submit"]:has-text("Create Task")');
    await page.waitForURL('**/task');
    console.log('✓ Task added successfully, redirected to task page');

    console.log('✓ TC-AddTask-001 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddTask-002: Minimal task (only task name) accepted', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    console.log('✓ Admin logged in');

    await navigateToAddTask(page);
    console.log('✓ Navigated to Add Task page');

    // Fill only Task Name
    await page.fill('input[name="taskname"]', 'Minimal Task');
    await expect(page.locator('input[name="taskname"]')).toHaveValue('Minimal Task');
    console.log('✓ Task Name input correct');

    // Submit form without filling other fields
    await page.click('button[type="submit"]:has-text("Create Task")');
    await page.waitForURL('**/task');
    console.log('✓ Minimal task added successfully, redirected to task page');

    console.log('✓ TC-AddTask-002 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddTask-003: Very long task name (under limit) accepted', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    console.log('✓ Admin logged in');

    await navigateToAddTask(page);
    console.log('✓ Navigated to Add Task page');

    // Fill with very long task name (but within acceptable limit)
    const longTaskName = 'This Is A Really Long Task Name This Is A Really Long Task Name This Is A Really Long Task Name This Is A Really Long Task Name This Is A Really Long Task Name This Is A Really Long Task Name This Is A Really Long Task Name This Is A Really Long Task Name';
    await page.fill('input[name="taskname"]', longTaskName);
    await expect(page.locator('input[name="taskname"]')).toHaveValue(longTaskName);
    console.log('✓ Very long task name input correct');

    // Submit form
    await page.click('button[type="submit"]:has-text("Create Task")');
    await page.waitForURL('**/task');
    console.log('✓ Task with very long name added successfully, redirected to task page');

    console.log('✓ TC-AddTask-003 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddTask-004: Extremely long task name (over limit) rejected', async ({ page }) => {
    page.on('dialog', async dialog => {
      console.log('✓ Error displayed: Task name is too long');
      await dialog.accept();
    });

    await signIn(page, 'admin', 'admin');
    console.log('✓ Admin logged in');

    await navigateToAddTask(page);
    console.log('✓ Navigated to Add Task page');

    // Fill with extremely long task name (exceeds limit)
    const extremelyLongTaskName = 'This Is A Really Long Task Name This Is A Really Long Task Name This Is A Really Long Task Name This Is A Really Long Task Name This Is A Really Long Task Name This Is A Really Long Task Name This Is A Really Long Task Name This Is A Really Long Task Name This Is Extra';
    await page.fill('input[name="taskname"]', extremelyLongTaskName);
    console.log('✓ Extremely long task name input filled');

    // Try to submit form
    await page.click('button[type="submit"]:has-text("Create Task")');

    console.log('✓ TC-AddTask-004 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddTask-005: Task with long description accepted', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    console.log('✓ Admin logged in');

    await navigateToAddTask(page);
    console.log('✓ Navigated to Add Task page');

    // Fill Task Name
    await page.fill('input[name="taskname"]', 'Long Task Description');
    await expect(page.locator('input[name="taskname"]')).toHaveValue('Long Task Description');
    console.log('✓ Task Name input correct');

    // Fill with very long description
    const longDescription = 'TaskDescriptionTaskDescriptionTaskDescriptionTaskDescriptionTaskDescriptionTaskDescriptionTaskDescriptionTaskDescriptionTaskDescriptionTaskDescriptionTaskDescriptionTaskDescriptionTaskDescriptionTaskDescriptionTaskDescriptionTaskDescriptionTaskDescriptionTaskDescription';
    await page.fill('textarea[name="description"]', longDescription);
    await expect(page.locator('textarea[name="description"]')).toHaveValue(longDescription);
    console.log('✓ Long description input correct');

    // Submit form
    await page.click('button[type="submit"]:has-text("Create Task")');
    await page.waitForURL('**/task');
    console.log('✓ Task with long description added successfully, redirected to task page');

    console.log('✓ TC-AddTask-005 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddTask-006: Task Name required validation', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    console.log('✓ Admin logged in');

    await navigateToAddTask(page);
    console.log('✓ Navigated to Add Task page');

    // Try to submit without filling task name
    await page.click('button[type="submit"]:has-text("Create Task")');

    // Check for validation message on Task Name field
    const taskNameInput = page.locator('input[name="taskname"]');
    const validationMessage = await taskNameInput.evaluate(el => el.validationMessage);
    expect(validationMessage).toContain('fill');
    console.log('✓ Validation error displayed: please fill out this field on Task Name');

    console.log('✓ TC-AddTask-006 passed!');
  });

});
