const { test, expect } = require('@playwright/test');

test('Login but password is wrong', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.locator('text=Login').click();

  await page.getByPlaceholder('Enter Your Email').fill('Test123@Email.com');
  await page.getByPlaceholder('Enter Your Password').fill('wrongPassword');

  await page.getByRole('button', { name: 'LOGIN' }).click();
  const errorMessage = page.getByText('Invalid Password');
  await expect(errorMessage).toBeVisible();
});

test('Registration but user already exists', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.locator('text=Register').click();
  
    await page.getByPlaceholder('Enter Your Name').fill('TestTest123123');
    await page.getByPlaceholder('Enter Your Email').fill('Test123@Email.com');
    await page.getByPlaceholder('Enter Your Password').fill('password123');
    await page.getByPlaceholder('Enter Your Phone').fill('88885555');
    await page.getByPlaceholder('Enter Your Address').fill('Malaysia');
    await page.getByPlaceholder('Enter Your DOB').fill('2024-10-26');
    await page.getByPlaceholder('What is Your Favorite sports').fill('Hockey');
  
    await page.getByRole('button', { name: 'REGISTER' }).click();
    const errorMessage = page.getByText('Already Register please login');
    await expect(errorMessage).toBeVisible();
  });

test.fail('Navigate to Forgot Password Page', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.locator('text=Login').click();
  
    await page.getByRole('button', { name: 'Forgot password' }).click();
   
    await page.waitForURL('**/forgot-password');

    const pageNotFound = page.getByText('404');
    expect(pageNotFound).toBe(null); // Forgot Password page does not exist, thus test should fail
  });
  
