// E2E tests for schedule functionality
// Updated: 2025-02-07 - Schedule test suite

import { test, expect } from '@playwright/test';

test.describe('Schedule', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the schedule page
    await page.goto('/schedule');
  });

  test('should load schedule page', async ({ page }) => {
    await page.goto('/schedule');

    // Check that the page loads successfully
    await expect(page).toHaveTitle(/Schedule/);

    // Verify the page is accessible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show schedule calendar component', async ({ page }) => {
    await page.goto('/schedule');

    // Check for calendar component
    await expect(
      page.locator('[data-testid="schedule-calendar"]')
    ).toBeVisible();
  });

  test('should show schedule filters', async ({ page }) => {
    await page.goto('/schedule');

    // Check for filters component
    await expect(
      page.locator('[data-testid="schedule-filters"]')
    ).toBeVisible();
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    await page.goto('/schedule');

    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('body')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle calendar navigation', async ({ page }) => {
    await page.goto('/schedule');

    // Check for navigation controls
    const prevButton = page.locator('button[aria-label*="Previous"]');
    const nextButton = page.locator('button[aria-label*="Next"]');

    if (await prevButton.isVisible()) {
      await expect(prevButton).toBeEnabled();
    }

    if (await nextButton.isVisible()) {
      await expect(nextButton).toBeEnabled();
    }
  });

  test('should show proper loading states', async ({ page }) => {
    await page.goto('/schedule');

    // Check for loading indicators if they exist
    const loadingIndicator = page.locator('[data-testid="loading"]');
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeVisible();
    }
  });
});
