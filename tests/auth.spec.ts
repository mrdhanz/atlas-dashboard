import { test, expect } from '@playwright/test';

test('should allow a user to log in and log out', async ({ page }) => {
  // Go to the login page (it should redirect)
  await page.goto('/');
  await expect(page).toHaveURL(/.*login/);

  // Fill in the login form
  await page.getByLabel('Email').fill('dandi@atlas.dev');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Verify successful login by checking the dashboard URL and header
  await expect(page).toHaveURL('/');
  await expect(page.getByText('Dandi Gilang Ramadhan')).toBeVisible();

  // Log out
  await page.getByRole('button', { name: 'Open user menu' }).click(); // Assuming you add an aria-label
  await page.getByRole('menuitem', { name: 'Log out' }).click();

  // Verify successful logout
  await expect(page).toHaveURL(/.*login/);
});