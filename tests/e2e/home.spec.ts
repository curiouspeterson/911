// E2E test for home page
// Updated: 2025-02-07 - Initial home page test

import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads successfully
    await expect(page).toHaveTitle(/Next.js and Supabase Starter Kit/);

    // Verify the page is accessible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have basic navigation elements', async ({ page }) => {
    await page.goto('/');

    // Check for common navigation elements
    await expect(page.locator('nav')).toBeVisible();

    // Check for main content area (first main element)
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');

    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('body')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
  });
});
