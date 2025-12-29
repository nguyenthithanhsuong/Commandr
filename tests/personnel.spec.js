import { test, expect } from '@playwright/test';

// npx playwright test tests/personnel.spec.js
// npx playwright test tests/personnel.spec.js --headed --project=firefox --timeout 

test.describe('Personnel Page Tests', () => {

  // -------------------------------------------------------
  test('TC-Personnel-001: Sign in as admin, navigate through personnel workflow', async ({ page }) => {
    page.on('dialog', async dialog => dialog.accept());

    // Sign in with admin credentials
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

    // Check if redirected to /personnel
    await page.waitForURL('**/personnel');
    await expect(page).toHaveURL(/.*\/personnel$/);
    console.log('✓ Redirected to /personnel');

    // Click on 'Add New Personnel' button
    await page.click('button:has-text("Add Personnel")');

    // Check if redirected to /personnel/addpersonnel
    await page.waitForURL('**/personnel/addpersonnel');
    await expect(page).toHaveURL(/.*\/personnel\/addpersonnel$/);
    console.log('✓ Redirected to /personnel/addpersonnel');

    // Click on 'Return to Personnels' button
    await page.click('button:has-text("Return to Personnels")');

    // Check if redirected back to /personnel
    await page.waitForURL('**/personnel');
    await expect(page).toHaveURL(/.*\/personnel$/);
    console.log('✓ Redirected back to /personnel');

    // Click on the first row of the personnel table
    await page.click('table tbody tr:first-child');

    // Check if redirected to viewpersonnel page
    await page.waitForURL('**/personnel/viewpersonnel?id=*');
    await expect(page).toHaveURL(/.*\/personnel\/viewpersonnel\?id=\d+/);
    console.log('✓ Redirected to /personnel/viewpersonnel page');

    // Check if Update button is visible
    const updateButton = page.locator('button:has-text("Update Personnel")');
    await expect(updateButton).toBeVisible();
    console.log('✓ Update button is visible');

    // Click the Update button
    await updateButton.click();

    // Check if redirected to update page
    await page.waitForURL('**/personnel/updatepersonnel?id=*');
    await expect(page).toHaveURL(/.*\/personnel\/updatepersonnel\?id=\d+/);
    console.log('✓ Redirected to /personnel/updatepersonnel page');

    console.log('✓ All checks passed!');
  });

  // -------------------------------------------------------
  test('TC-Personnel-002: Sign in as HR, navigate through personnel workflow', async ({ page }) => {
    page.on('dialog', async dialog => dialog.accept());

    // Sign in with HR credentials
    await page.goto('http://localhost:3000/signin');

    await page.fill('input[name="email"]', 'hr@email.com');
    await page.fill('input[name="password"]', 'hr');

    const [apiResponse] = await Promise.all([
      page.waitForResponse(r =>
        r.url().includes('/db/dbroute') &&
        r.request().method() === 'POST'
      ),
      page.click('button[type="submit"]'),
    ]);

    console.log('API response received:', apiResponse.status());

    // Check if redirected to /personnel
    await page.waitForURL('**/personnel');
    await expect(page).toHaveURL(/.*\/personnel$/);
    console.log('✓ HR logged in and redirected to /personnel');

    // Click on 'Add new Personnel' button
    await page.click('button:has-text("Add Personnel")');

    // Check if redirected to /personnel/addpersonnel
    await page.waitForURL('**/personnel/addpersonnel');
    await expect(page).toHaveURL(/.*\/personnel\/addpersonnel$/);
    console.log('✓ Redirected to /personnel/addpersonnel');

    // Click on 'Return to Personnels' button
    await page.click('button:has-text("Return to Personnels")');

    // Check if redirected back to /personnel
    await page.waitForURL('**/personnel');
    await expect(page).toHaveURL(/.*\/personnel$/);
    console.log('✓ Redirected back to /personnel');

    // Click on 'Scott Anderson' personnel row
    await page.locator('table tbody tr:has-text("Scott Anderson")').click();

    // Check if redirected to viewpersonnel page
    await page.waitForURL('**/personnel/viewpersonnel?id=*');
    await expect(page).toHaveURL(/.*\/personnel\/viewpersonnel\?id=\d+/);
    console.log('✓ Redirected to Scott Anderson personnel detail page');

    // Check if Update button is visible
    const updateButton = page.locator('button:has-text("Update Personnel")');
    await expect(updateButton).toBeVisible();
    console.log('✓ Update button is visible');

    // Click the Update button
    await updateButton.click();

    // Check if redirected to update page
    await page.waitForURL('**/personnel/updatepersonnel?id=*');
    await expect(page).toHaveURL(/.*\/personnel\/updatepersonnel\?id=\d+/);
    console.log('✓ Redirected to /personnel/updatepersonnel page');

    console.log('✓ TC-Personnel-002 passed!');
  });

  // -------------------------------------------------------
  test('TC-Personnel-003: CEO UI access control in personnel', async ({ page }) => {
    page.on('dialog', async dialog => dialog.accept());

    // Sign in with CEO credentials
    await page.goto('http://localhost:3000/signin');

    await page.fill('input[name="email"]', 'ceo@email.com');
    await page.fill('input[name="password"]', 'ceo');

    const [apiResponse] = await Promise.all([
      page.waitForResponse(r =>
        r.url().includes('/db/dbroute') &&
        r.request().method() === 'POST'
      ),
      page.click('button[type="submit"]'),
    ]);

    console.log('API response received:', apiResponse.status());

    // Check if redirected to /personnel
    await page.waitForURL('**/personnel');
    await expect(page).toHaveURL(/.*\/personnel$/);
    console.log('✓ CEO logged in and redirected to /personnel');

    // Verify "Add Personnel" button is not shown for CEO
    await expect(page.locator('button:has-text("Add Personnel")')).toHaveCount(0);
    console.log('✓ Add Personnel option is not visible for CEO');

    // Click on 'Scott Anderson' personnel row
    const scottRow = page.locator('table tbody tr:has-text("Scott Anderson")');
    await expect(scottRow).toBeVisible();
    await scottRow.click();

    // Check if redirected to Scott's detail page
    await page.waitForURL('**/personnel/viewpersonnel?id=*');
    await expect(page).toHaveURL(/.*\/personnel\/viewpersonnel\?id=\d+/);
    console.log('✓ Redirected to Scott Anderson personnel detail page');

    // Verify no update/delete/retire actions are shown for CEO
    await expect(page.locator('button:has-text("Update Personnel")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Delete Personnel")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Retire Personnel")')).toHaveCount(0);
    console.log('✓ No update, delete, or retire options visible for CEO');

    console.log('✓ TC-Personnel-003 passed!');
  });

  // -------------------------------------------------------
  test('TC-Personnel-004: Admin direct navigation to all personnel pages', async ({ page }) => {
    page.on('dialog', async dialog => dialog.accept());

    // Sign in with admin credentials
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

    // Check if redirected to /personnel
    await page.waitForURL('**/personnel');
    await expect(page).toHaveURL(/.*\/personnel$/);
    console.log('✓ Admin logged in and redirected to /personnel');

    // Go to /personnel/addpersonnel
    await page.goto('http://localhost:3000/personnel/addpersonnel');
    await page.waitForURL('**/personnel/addpersonnel');
    await expect(page).toHaveURL(/.*\/personnel\/addpersonnel$/);
    console.log('✓ Successfully accessed /personnel/addpersonnel');

    // Go to /personnel/viewpersonnel?id=1
    await page.goto('http://localhost:3000/personnel/viewpersonnel?id=1');
    await page.waitForURL('**/personnel/viewpersonnel?id=1');
    await expect(page).toHaveURL(/.*\/personnel\/viewpersonnel\?id=1/);
    console.log('✓ Successfully accessed /personnel/viewpersonnel?id=1');

    // Go to /personnel/updatepersonnel?id=1
    await page.goto('http://localhost:3000/personnel/updatepersonnel?id=1');
    await page.waitForURL('**/personnel/updatepersonnel?id=1');
    await expect(page).toHaveURL(/.*\/personnel\/updatepersonnel\?id=1/);
    console.log('✓ Successfully accessed /personnel/updatepersonnel?id=1');

    // Go to /personal
    await page.goto('http://localhost:3000/personal');
    await page.waitForURL('**/personal');
    await expect(page).toHaveURL(/.*\/personal$/);
    console.log('✓ Successfully accessed /personal');

    console.log('✓ TC-Personnel-004 passed!');
  });

  // -------------------------------------------------------
  test('TC-Personnel-005: HR direct navigation to all personnel pages', async ({ page }) => {
    page.on('dialog', async dialog => dialog.accept());

    // Sign in with HR credentials
    await page.goto('http://localhost:3000/signin');

    await page.fill('input[name="email"]', 'hr@email.com');
    await page.fill('input[name="password"]', 'hr');

    const [apiResponse] = await Promise.all([
      page.waitForResponse(r =>
        r.url().includes('/db/dbroute') &&
        r.request().method() === 'POST'
      ),
      page.click('button[type="submit"]'),
    ]);

    console.log('API response received:', apiResponse.status());

    // Check if redirected to /personnel
    await page.waitForURL('**/personnel');
    await expect(page).toHaveURL(/.*\/personnel$/);
    console.log('✓ HR logged in and redirected to /personnel');

    // Go to /personnel/addpersonnel
    await page.goto('http://localhost:3000/personnel/addpersonnel');
    await page.waitForURL('**/personnel/addpersonnel');
    await expect(page).toHaveURL(/.*\/personnel\/addpersonnel$/);
    console.log('✓ Successfully accessed /personnel/addpersonnel');

    // Go to /personnel/viewpersonnel?id=1
    await page.goto('http://localhost:3000/personnel/viewpersonnel?id=1');
    await page.waitForURL('**/personnel/viewpersonnel?id=1');
    await expect(page).toHaveURL(/.*\/personnel\/viewpersonnel\?id=1/);
    console.log('✓ Successfully accessed /personnel/viewpersonnel?id=1');

    // Go to /personnel/updatepersonnel?id=1
    await page.goto('http://localhost:3000/personnel/updatepersonnel?id=1');
    await page.waitForURL('**/personnel/updatepersonnel?id=1');
    await expect(page).toHaveURL(/.*\/personnel\/updatepersonnel\?id=1/);
    console.log('✓ Successfully accessed /personnel/updatepersonnel?id=1');

    // Go to /personal
    await page.goto('http://localhost:3000/personal');
    await page.waitForURL('**/personal');
    await expect(page).toHaveURL(/.*\/personal$/);
    console.log('✓ Successfully accessed /personal');

    console.log('✓ TC-Personnel-005 passed!');
  });

  // -------------------------------------------------------
  test('TC-Personnel-006: CEO access control - mixed permissions', async ({ page }) => {
    page.on('dialog', async dialog => dialog.accept());

    // Sign in with CEO credentials
    await page.goto('http://localhost:3000/signin');

    await page.fill('input[name="email"]', 'ceo@email.com');
    await page.fill('input[name="password"]', 'ceo');

    const [apiResponse] = await Promise.all([
      page.waitForResponse(r =>
        r.url().includes('/db/dbroute') &&
        r.request().method() === 'POST'
      ),
      page.click('button[type="submit"]'),
    ]);

    console.log('API response received:', apiResponse.status());

    // Check if redirected to /personnel
    await page.waitForURL('**/personnel');
    await expect(page).toHaveURL(/.*\/personnel$/);
    console.log('✓ CEO logged in and redirected to /personnel');

    // Try to go to /personnel/addpersonnel - should be rejected
    await page.goto('http://localhost:3000/personnel/addpersonnel');
    await page.waitForURL('**/personnel');
    await expect(page).toHaveURL(/.*\/personnel$/);
    console.log('✓ Access to /personnel/addpersonnel rejected, redirected to /personnel');

    // Go to /personnel/viewpersonnel?id=1 - should be accepted
    await page.goto('http://localhost:3000/personnel/viewpersonnel?id=1');
    await page.waitForURL('**/personnel/viewpersonnel?id=1');
    await expect(page).toHaveURL(/.*\/personnel\/viewpersonnel\?id=1/);
    console.log('✓ Successfully accessed /personnel/viewpersonnel?id=1');

    // Try to go to /personnel/updatepersonnel?id=1 - should be rejected
    await page.goto('http://localhost:3000/personnel/updatepersonnel?id=1');
    await page.waitForURL('**/personnel');
    await expect(page).toHaveURL(/.*\/personnel$/);
    console.log('✓ Access to /personnel/updatepersonnel?id=1 rejected, redirected to /personnel');

    // Go to /personal - should be accepted
    await page.goto('http://localhost:3000/personal');
    await page.waitForURL('**/personal');
    await expect(page).toHaveURL(/.*\/personal$/);
    console.log('✓ Successfully accessed /personal');

    console.log('✓ TC-Personnel-006 passed!');
  });

  // -------------------------------------------------------
  test('TC-Personnel-007: Personnel user access control - no personnel access', async ({ page }) => {
    page.on('dialog', async dialog => dialog.accept());

    // Sign in with Personnel credentials
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

    console.log('API response received:', apiResponse.status());

    // Check if redirected to /personal (not /personnel)
    await page.waitForURL('**/personal');
    await expect(page).toHaveURL(/.*\/personal$/);
    console.log('✓ Personnel logged in and redirected to /personal');

    // Try to go to /personnel/addpersonnel - should be rejected
    await page.goto('http://localhost:3000/personnel/addpersonnel');
    await page.waitForURL('**/personal');
    await expect(page).toHaveURL(/.*\/personal$/);
    console.log('✓ Access to /personnel/addpersonnel rejected, redirected to /personal');

    // Try to go to /personnel/viewpersonnel?id=1 - should be rejected
    await page.goto('http://localhost:3000/personnel/viewpersonnel?id=1');
    await page.waitForURL('**/personal');
    await expect(page).toHaveURL(/.*\/personal$/);
    console.log('✓ Access to /personnel/viewpersonnel?id=1 rejected, redirected to /personal');

    // Try to go to /personnel/updatepersonnel?id=1 - should be rejected
    await page.goto('http://localhost:3000/personnel/updatepersonnel?id=1');
    await page.waitForURL('**/personal');
    await expect(page).toHaveURL(/.*\/personal$/);
    console.log('✓ Access to /personnel/updatepersonnel?id=1 rejected, redirected to /personal');

    // Try to go to /personnel - should be rejected
    await page.goto('http://localhost:3000/personnel');
    await page.waitForURL('**/personal');
    await expect(page).toHaveURL(/.*\/personal$/);
    console.log('✓ Access to /personnel rejected, redirected to /personal');

    console.log('✓ TC-Personnel-007 passed!');
  });

  // -------------------------------------------------------
  test('TC-Personnel-008: Unauthenticated user access control', async ({ page }) => {
    // No sign in, try to access pages directly

    // Try to access /personnel - should be rejected
    await page.goto('http://localhost:3000/personnel');
    await page.waitForURL('**/signin');
    await expect(page).toHaveURL(/.*\/signin$/);
    console.log('✓ Access to /personnel rejected for unauthenticated user, redirected to signin');

    // Try to access /personnel/addpersonnel - should be rejected
    await page.goto('http://localhost:3000/personnel/addpersonnel');
    await page.waitForURL('**/signin');
    await expect(page).toHaveURL(/.*\/signin$/);
    console.log('✓ Access to /personnel/addpersonnel rejected, redirected to signin');

    // Try to access /personnel/viewpersonnel?id=1 - should be rejected
    await page.goto('http://localhost:3000/personnel/viewpersonnel?id=1');
    await page.waitForURL('**/signin');
    await expect(page).toHaveURL(/.*\/signin$/);
    console.log('✓ Access to /personnel/viewpersonnel?id=1 rejected, redirected to signin');

    // Try to access /personnel/updatepersonnel?id=1 - should be rejected
    await page.goto('http://localhost:3000/personnel/updatepersonnel?id=1');
    await page.waitForURL('**/signin');
    await expect(page).toHaveURL(/.*\/signin$/);
    console.log('✓ Access to /personnel/updatepersonnel?id=1 rejected, redirected to signin');

    // Try to access /personal - should be rejected
    await page.goto('http://localhost:3000/personal');
    await page.waitForURL('**/signin');
    await expect(page).toHaveURL(/.*\/signin$/);
    console.log('✓ Access to /personal rejected, redirected to signin');

    console.log('✓ TC-Personnel-008 passed!');
  });

});
