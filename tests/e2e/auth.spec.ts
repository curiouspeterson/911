// E2E tests for authentication flows
// Updated: 2025-02-07 - Authentication test suite

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test('should show login form on login page', async ({ page }) => {
    await page.goto('/auth/login');

    // Check for login form elements
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show signup form on signup page', async ({ page }) => {
    await page.goto('/auth/sign-up');

    // Check for signup form elements
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show forgot password form', async ({ page }) => {
    await page.goto('/auth/forgot-password');

    // Check for forgot password form
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should redirect to login when accessing protected route without auth', async ({
    page,
  }) => {
    // Try to access a protected route
    await page.goto('/protected');

    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('should show validation errors for invalid form submission', async ({
    page,
  }) => {
    await page.goto('/auth/login');

    // Try to submit empty form
    await page.locator('button[type="submit"]').click();

    // Should show validation errors
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('should have proper form accessibility', async ({ page }) => {
    await page.goto('/auth/login');

    // Check for proper labels and form structure
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toHaveAttribute('aria-required', 'true');
    await expect(passwordInput).toHaveAttribute('aria-required', 'true');

    // Check for proper form labels
    await expect(page.locator('label')).toHaveCount(2);
  });
});
