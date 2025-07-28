# E2E Tests

This directory contains end-to-end tests for the 911 project using Playwright.

## Test Structure

- `home.spec.ts` - Tests for the home page and basic navigation
- `auth.spec.ts` - Tests for authentication flows (login, signup, protected routes)
- `schedule.spec.ts` - Tests for schedule functionality

## Running Tests

### Basic Commands

```bash
# Run all e2e tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug
```

### Playwright Commands

```bash
# Run specific test file
npx playwright test home.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests with specific grep pattern
npx playwright test -g "should load"

# Show test report
npx playwright show-report
```

## Test Configuration

The tests are configured in `playwright.config.ts` with:

- Base URL: `http://localhost:3000`
- Test directory: `./tests/e2e`
- Multiple browser support (Chrome, Firefox, Safari, Mobile)
- Automatic dev server startup
- Screenshot and video capture on failure
- HTML and JSON reporting

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

### Best Practices

1. **Use descriptive test names** that explain what the test verifies
2. **Use data-testid attributes** for reliable element selection
3. **Test responsive behavior** on different screen sizes
4. **Test accessibility** with proper ARIA attributes
5. **Use beforeEach hooks** for common setup
6. **Test error states** and edge cases
7. **Keep tests independent** - each test should be able to run alone

### Element Selection

```typescript
// Prefer data-testid for reliable selection
await expect(page.locator('[data-testid="my-component"]')).toBeVisible();

// Use semantic selectors when possible
await expect(page.locator('button[type="submit"]')).toBeVisible();

// Avoid text-based selectors when possible
await expect(page.locator('text=Submit')).toBeVisible();
```

## Debugging

### Visual Debugging

```bash
# Run with headed mode to see browser
npm run test:e2e:headed

# Use debug mode for step-by-step execution
npm run test:e2e:debug
```

### Code Debugging

```typescript
// Add debugging statements
await page.pause(); // Pause execution
console.log('Debug info:', await page.title());
```

### Screenshots and Videos

- Screenshots are automatically taken on test failure
- Videos are recorded for failed tests
- View them in the test report: `npx playwright show-report`

## CI/CD Integration

The tests are configured to run in CI environments with:

- Reduced parallelism (1 worker)
- Retry on failure (2 retries)
- Forbidden `test.only()` usage
- Proper timeout handling

## Browser Support

Tests run against:
- Desktop: Chrome, Firefox, Safari
- Mobile: Chrome (Pixel 5), Safari (iPhone 12)

## Performance

- Tests run in parallel by default
- Dev server is reused between tests
- Browser instances are shared when possible 