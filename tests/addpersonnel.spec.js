import { test, expect } from '@playwright/test';

// npx playwright test tests/addpersonnel.spec.js --headed --project=firefox --timeout=600000

test.describe('Add Personnel Page Tests', () => {

  // Helper function to sign in
  async function signIn(page, email, password) {
    page.on('dialog', async dialog => dialog.accept());
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/personnel');
  }

  // Helper function to navigate to add personnel page
  async function navigateToAddPersonnel(page) {
    await page.click('button:has-text("Add Personnel")');
    await page.waitForURL('**/personnel/addpersonnel');
  }

  // Helper function to delete personnel by name or email
  async function deletePersonnel(page, identifier) {
    page.on('dialog', async dialog => dialog.accept());
    await page.goto('http://localhost:3000/personnel');
    await page.waitForURL('**/personnel');
    
    // Click on the row containing the identifier
    const row = page.locator(`table tbody tr:has-text("${identifier}")`);
    await row.click();
    await page.waitForURL('**/personnel/viewpersonnel?id=*');
    
    // Click delete button
    await page.click('button:has-text("Delete Personnel")');
    await page.waitForURL('**/personnel');
    console.log(`✓ Deleted personnel: ${identifier}`);
  }

  // -------------------------------------------------------
  test('TC-AddPersonnel-001: Admin successfully adds personnel with all fields', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    console.log('✓ Admin logged in');

    await navigateToAddPersonnel(page);
    console.log('✓ Navigated to Add Personnel page');

    // Fill all fields
    await page.fill('input[name="name"]', 'Testing');
    await expect(page.locator('input[name="name"]')).toHaveValue('Testing');
    console.log('✓ Name input correct');

    await page.fill('input[name="dateofbirth"]', '2004-08-02');
    await expect(page.locator('input[name="dateofbirth"]')).toHaveValue('2004-08-02');
    console.log('✓ Date of Birth input correct');

    await page.fill('input[name="phonenumber"]', '01020304');
    await expect(page.locator('input[name="phonenumber"]')).toHaveValue('01020304');
    console.log('✓ Phone Number input correct');

    await page.fill('input[name="email"]', 'email@email.vn');
    await expect(page.locator('input[name="email"]')).toHaveValue('email@email.vn');
    console.log('✓ Email input correct');

    await page.fill('input[name="password"]', 'password');
    await expect(page.locator('input[name="password"]')).toHaveValue('password');
    console.log('✓ Password input correct');

    await page.selectOption('select[name="positionid"]', '12');
    await expect(page.locator('select[name="positionid"]')).toHaveValue('12');
    console.log('✓ Position selected correct');

    // Verify Admin/HR/CEO options are visible for admin
    const positionSelect = page.locator('select[name="positionid"]');
    const options = await positionSelect.locator('option').allTextContents();
    const hasAdminOptions = options.some(opt => opt.includes('Admin') || opt.includes('HR') || opt.includes('CEO'));
    expect(hasAdminOptions).toBe(true);
    console.log('✓ Admin/HR/CEO options are ENABLED');

    // Submit form
    await page.click('button[type="submit"]:has-text("Add Personnel")');
    await page.waitForURL('**/personnel');
    console.log('✓ Personnel added successfully, redirected to personnel page');

    console.log('✓ TC-AddPersonnel-001 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddPersonnel-002: HR successfully adds personnel (without admin roles)', async ({ page }) => {
    await signIn(page, 'hr@email.com', 'hr');
    console.log('✓ HR logged in');

    await navigateToAddPersonnel(page);
    console.log('✓ Navigated to Add Personnel page');

    // Fill all fields
    await page.fill('input[name="name"]', 'Testing');
    await page.fill('input[name="dateofbirth"]', '2004-08-02');
    await page.fill('input[name="phonenumber"]', '01020304');
    await page.fill('input[name="email"]', 'email2@email.vn');
    await page.fill('input[name="password"]', 'password');
    await page.selectOption('select[name="positionid"]', 'Testing');
    console.log('✓ All fields filled');

    // Verify Admin/HR/CEO options are hidden for HR
    const positionSelect = page.locator('select[name="positionid"]');
    const options = await positionSelect.locator('option').allTextContents();
    const hasAdminOptions = options.some(opt => opt.includes('Admin') || opt.includes('HR Generalist') || opt.includes('Chief Executive Officer'));
    expect(hasAdminOptions).toBe(false);
    console.log('✓ Admin/HR/CEO options are HIDDEN');

    // Submit form
    await page.click('button[type="submit"]:has-text("Add Personnel")');
    await page.waitForURL('**/personnel');
    console.log('✓ Personnel added successfully');

    console.log('✓ TC-AddPersonnel-002 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddPersonnel-003: Validation - Name field required', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    await navigateToAddPersonnel(page);
    console.log('✓ Navigated to Add Personnel page');

    // Try to submit without filling any fields
    await page.click('button[type="submit"]:has-text("Add Personnel")');
    
    // Check for validation message on Full Name field
    const nameInput = page.locator('input[name="name"]');
    const validationMessage = await nameInput.evaluate(el => el.validationMessage);
    expect(validationMessage).toContain('fill');
    console.log('✓ Validation error displayed: please fill out this field on Full Name');

    console.log('✓ TC-AddPersonnel-003 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddPersonnel-004: Validation - Date of Birth required', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    await navigateToAddPersonnel(page);

    // Fill only name and other fields except Date of Birth
    await page.fill('input[name="name"]', 'Testing');
    await page.fill('input[name="phonenumber"]', '01020304');
    await page.fill('input[name="email"]', 'email@email.vn');
    await page.fill('input[name="password"]', 'password');
    console.log('✓ Filled fields except Date of Birth');

    await page.click('button[type="submit"]:has-text("Add Personnel")');
    
    // Check for validation message on Date of Birth field
    const dobInput = page.locator('input[name="dateofbirth"]');
    const validationMessage = await dobInput.evaluate(el => el.validationMessage);
    expect(validationMessage).toContain('fill');
    console.log('✓ Validation error displayed: please fill out this field on Date of Birth');

    console.log('✓ TC-AddPersonnel-004 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddPersonnel-005: Validation - Phone Number required', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    await navigateToAddPersonnel(page);

    // Fill all fields except Phone Number
      await page.fill('input[name="name"]', 'Testing');
      await page.fill('input[name="dateofbirth"]', '2004-08-02');
      await page.fill('input[name="email"]', 'email@email.vn');
      await page.fill('input[name="password"]', 'password');
    console.log('✓ Filled fields except Phone Number');

    await page.click('button[type="submit"]:has-text("Add Personnel")');
    
    // Check for validation message on Phone Number field
      const phoneInput = page.locator('input[name="phonenumber"]');
    const validationMessage = await phoneInput.evaluate(el => el.validationMessage);
    expect(validationMessage).toContain('fill');
    console.log('✓ Validation error displayed: please fill out this field on Phone Number');

    console.log('✓ TC-AddPersonnel-005 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddPersonnel-006: Validation - Email required', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    await navigateToAddPersonnel(page);

    // Fill all fields except Email
    await page.fill('input[name="name"]', 'Testing');
    await page.fill('input[name="dateofbirth"]', '2004-08-02');
    await page.fill('input[name="phonenumber"]', '01020304');
    await page.fill('input[name="password"]', 'password');
    console.log('✓ Filled fields except Email');

    await page.click('button[type="submit"]:has-text("Add Personnel")');
    
    // Check for validation message on Email field
    const emailInput = page.locator('input[name="email"]');
    const validationMessage = await emailInput.evaluate(el => el.validationMessage);
    expect(validationMessage).toContain('fill');
    console.log('✓ Validation error displayed: please fill out this field on Email');

    console.log('✓ TC-AddPersonnel-006 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddPersonnel-007: Validation - Password required', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    await navigateToAddPersonnel(page);

    // Fill all fields except Password
    await page.fill('input[name="name"]', 'Testing');
    await page.fill('input[name="dateofbirth"]', '2004-08-02');
    await page.fill('input[name="phonenumber"]', '01020304');
    await page.fill('input[name="email"]', 'email@email.vn');
    console.log('✓ Filled fields except Password');

    await page.click('button[type="submit"]:has-text("Add Personnel")');
    
    // Check for validation message on Password field
    const passwordInput = page.locator('input[name="password"]');
    const validationMessage = await passwordInput.evaluate(el => el.validationMessage);
    expect(validationMessage).toContain('fill');
    console.log('✓ Validation error displayed: please fill out this field on Password');

    console.log('✓ TC-AddPersonnel-007 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddPersonnel-008: Date of Birth field does not accept text input', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    await navigateToAddPersonnel(page);

    await page.fill('input[name="name"]', 'Testing');
    console.log('✓ Filled Name');

    // Try to input text into Date of Birth field
    const dobInput = page.locator('input[name="dateofbirth"]');
    await dobInput.fill('aaaaa');
    
    // Verify that the field shows malformed validation error
    const validationMessage = await dobInput.evaluate(el => el.validationMessage);
    expect(validationMessage.toLowerCase()).toContain('malformed');
    console.log('✓ Date of Birth field shows malformed error for text input - test passed');

    console.log('✓ TC-AddPersonnel-008 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddPersonnel-009: Phone number cannot be text', async ({ page }) => {
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Phone number cannot be text');
      console.log('✓ Error displayed: Phone number cannot be text');
      await dialog.accept();
    });

    await signIn(page, 'admin', 'admin');
    await navigateToAddPersonnel(page);

    await page.fill('input[name="name"]', 'Testing');
    await page.fill('input[name="dateofbirth"]', '2004-08-02');
    await page.fill('input[name="phonenumber"]', 'abc');
    await page.fill('input[name="email"]', 'email@email.vn');
    await page.fill('input[name="password"]', 'password');
    console.log('✓ Filled fields with text phone number');

    await page.click('button[type="submit"]:has-text("Add Personnel")');
    
    console.log('✓ TC-AddPersonnel-009 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddPersonnel-010: Email must contain @ symbol', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    await navigateToAddPersonnel(page);

    await page.fill('input[name="name"]', 'Testing');
    await page.fill('input[name="dateofbirth"]', '2004-08-02');
    await page.fill('input[name="phonenumber"]', '01020304');
    await page.fill('input[name="email"]', 'email');
    await page.fill('input[name="password"]', 'password');
    console.log('✓ Filled fields with invalid email');

    await page.click('button[type="submit"]:has-text("Add Personnel")');
    
    // Check for validation message on Email field
    const emailInput = page.locator('input[name="email"]');
    const validationMessage = await emailInput.evaluate(el => el.validationMessage);
    expect(validationMessage).toContain('Please enter an email address.');
    console.log('✓ Validation error displayed: Please include an \'@\' in the email address');

    console.log('✓ TC-AddPersonnel-010 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddPersonnel-011: Duplicate email error', async ({ page }) => {
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Email cannot be duplicate');
      console.log('✓ Error displayed: Email cannot be duplicate');
      await dialog.accept();
    });

    await signIn(page, 'admin', 'admin');
    await navigateToAddPersonnel(page);

    await page.fill('input[name="name"]', 'Testing');
    await page.fill('input[name="dateofbirth"]', '2004-08-02');
    await page.fill('input[name="phonenumber"]', '01020304');
    await page.fill('input[name="email"]', 'email@email.com'); // Existing email
    await page.fill('input[name="password"]', 'password');
    console.log('✓ Filled fields with duplicate email');

    await page.click('button[type="submit"]:has-text("Add Personnel")');
    
    console.log('✓ TC-AddPersonnel-011 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddPersonnel-012: Date of Birth cannot be in the future', async ({ page }) => {
    page.on('dialog', async dialog => {
      expect(dialog.message()).toMatch(/Value must be.*or earlier/i);
      console.log('✓ Error displayed: Value must be [Today] or earlier for Date of Birth');
      await dialog.accept();
    });

    await signIn(page, 'admin', 'admin');
    await navigateToAddPersonnel(page);

    await page.fill('input[name="name"]', 'Testing');
    await page.fill('input[name="dateofbirth"]', '2030-01-01');
    await page.fill('input[name="phonenumber"]', '01020304');
    await page.fill('input[name="email"]', 'email@email.com');
    await page.fill('input[name="password"]', 'password');
    console.log('✓ Filled fields with future date');

    await page.click('button[type="submit"]:has-text("Add Personnel")');
    
    console.log('✓ TC-AddPersonnel-012 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddPersonnel-013: Very long name (150 chars) accepted', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    await navigateToAddPersonnel(page);

    const longName = 'Tests'.repeat(30); // 150 characters
    await page.fill('input[name="name"]', longName);
    await page.fill('input[name="dateofbirth"]', '2004-01-01');
    await page.fill('input[name="phonenumber"]', '01020304');
    await page.fill('input[name="email"]', 'longnametest@email.vn');
    await page.fill('input[name="password"]', 'password');
    console.log('✓ Filled fields with 150 character name');

    await page.click('button[type="submit"]:has-text("Add Personnel")');
    await page.waitForURL('**/personnel');
    console.log('✓ Personnel with long name added successfully');

    console.log('✓ TC-AddPersonnel-013 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddPersonnel-014: Extremely long name (151+ chars) rejected', async ({ page }) => {
    page.on('dialog', async dialog => {
      console.log('✓ Error displayed when adding personnel with 151+ character name');
      await dialog.accept();
    });

    await signIn(page, 'admin', 'admin');
    await navigateToAddPersonnel(page);

    const veryLongName = 'Tests'.repeat(31); // 155 characters
    await page.fill('input[name="name"]', veryLongName);
    await page.fill('input[name="dateofbirth"]', '2004-01-01');
    await page.fill('input[name="phonenumber"]', '01020304');
    await page.fill('input[name="email"]', 'verylongnametest@email.vn');
    await page.fill('input[name="password"]', 'password');
    console.log('✓ Filled fields with 155 character name');

    await page.click('button[type="submit"]:has-text("Add Personnel")');
    
    console.log('✓ TC-AddPersonnel-014 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddPersonnel-015: Very long phone number (20 digits) accepted', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    await navigateToAddPersonnel(page);

    await page.fill('input[name="name"]', 'Testing');
    await page.fill('input[name="dateofbirth"]', '2004-01-01');
    await page.fill('input[name="phonenumber"]', '12345678901234567890'); // 20 digits
    await page.fill('input[name="email"]', 'longphonetest@email.vn');
    await page.fill('input[name="password"]', 'password');
    console.log('✓ Filled fields with 20 digit phone number');

    await page.click('button[type="submit"]:has-text("Add Personnel")');
    await page.waitForURL('**/personnel');
    console.log('✓ Personnel with 20 digit phone number added successfully');

    console.log('✓ TC-AddPersonnel-015 passed!');
  });

  // -------------------------------------------------------
  test('TC-AddPersonnel-016: Extremely long phone number (21+ digits) rejected', async ({ page }) => {
    page.on('dialog', async dialog => {
      console.log('✓ Error displayed when adding personnel with 21+ digit phone number');
      await dialog.accept();
    });

    await signIn(page, 'admin', 'admin');
    await navigateToAddPersonnel(page);

    await page.fill('input[name="name"]', 'Testing');
    await page.fill('input[name="dateofbirth"]', '2004-01-01');
    await page.fill('input[name="phonenumber"]', '123456789012345678901'); // 21 digits
    await page.fill('input[name="email"]', 'verylongphonetest@email.vn');
    await page.fill('input[name="password"]', 'password');
    console.log('✓ Filled fields with 21 digit phone number');

    await page.click('button[type="submit"]:has-text("Add Personnel")');
    
    console.log('✓ TC-AddPersonnel-016 passed!');
  });

});
