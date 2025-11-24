# E2E Tests with Playwright

## Overview

End-to-end tests that verify critical user workflows across the D&D 5e Compendium frontend application.

## Prerequisites

1. **Backend API running** at `http://localhost:8080`
   ```bash
   cd ../importer && docker compose up -d
   ```

2. **Frontend dev server running** at `http://localhost:3000`
   ```bash
   docker compose up -d
   ```

3. **Playwright installed** (first time only)
   ```bash
   npm install -D @playwright/test
   npx playwright install chromium
   ```

## Running Tests

### Run all E2E tests (headless)
```bash
npm run test:e2e
```

### Run with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run with browser visible (headed mode)
```bash
npm run test:e2e:headed
```

### View test report
```bash
npm run test:e2e:report
```

### Run specific test file
```bash
npx playwright test homepage
npx playwright test entity-lists
```

### Run specific test by name
```bash
npx playwright test --grep "loads successfully"
```

## Test Structure

### `homepage.spec.ts` - Homepage Tests (20+ tests)
- Page load and SEO
- Logo and hero section
- Entity navigation cards (7 entities)
- Reference data section (10 links)
- Search input
- Footer
- Responsive layouts (mobile, tablet, desktop)

### `entity-lists.spec.ts` - Entity List Pages (70+ tests)
- All 7 entity types: Spells, Items, Races, Classes, Backgrounds, Feats, Monsters
- List page rendering
- Card display and navigation
- Pagination controls
- Search functionality
- Breadcrumb navigation
- Empty state handling
- Responsive layouts
- Navigation flows (homepage → list → detail → back)

## Total Coverage

- **2 test files**
- **90+ E2E tests**
- **7 entity types fully covered**
- **Mobile, tablet, and desktop viewports**

## CI/CD Integration

Playwright tests are configured for CI/CD with:
- Automatic retries (2x on failure)
- Screenshot on failure
- Trace collection for debugging
- HTML report generation

## Troubleshooting

### Tests fail with "Target closed" or "Navigation timeout"
- Ensure dev server is running: `docker compose ps`
- Check backend API is accessible: `curl http://localhost:8080/api/v1/spells`
- Verify no port conflicts on 3000 or 8080

### "page.goto: net::ERR_CONNECTION_REFUSED"
- Frontend not running. Start with: `docker compose up -d`

### "Cannot find entity cards"
- Backend API may not be seeded. Check: `docker compose exec php php artisan db:seed`

### Slow test execution
- Use headed mode to see what's happening: `npm run test:e2e:headed`
- Check network tab in browser for slow API calls
- Verify Meilisearch is running: `docker compose ps meilisearch`

## Writing New Tests

Follow these patterns:

```typescript
import { test, expect } from '@playwright/test'

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/my-page')
  })

  test('does something', async ({ page }) => {
    // Wait for elements to load
    await page.waitForSelector('a[href="/spells"]', { timeout: 10000 })

    // Interact
    await page.click('button')

    // Assert
    await expect(page.locator('h1')).toContainText('Expected Text')
  })
})
```

## Best Practices

1. **Always wait for elements before interacting**
   - Use `page.waitForSelector()` before clicking
   - Use `page.waitForURL()` after navigation

2. **Use data-testid attributes for critical elements**
   - Add `data-testid="spell-card"` to components
   - Select with `page.locator('[data-testid="spell-card"]')`

3. **Test real user flows, not implementation details**
   - ✅ "User can search for spells and click results"
   - ❌ "useState is called with correct params"

4. **Keep tests independent**
   - Each test should work in isolation
   - Use `beforeEach` for setup, not shared state

5. **Use descriptive test names**
   - ✅ "Clicking next page changes URL and displays different spells"
   - ❌ "pagination works"

## Performance

- Average test runtime: ~30-60 seconds for full suite
- Single test: ~2-5 seconds
- Parallel execution: Tests run concurrently (default: 50% CPU cores)

## Coverage

These E2E tests complement the 886 unit/integration tests in Vitest:
- **Unit tests**: Component behavior in isolation
- **Integration tests**: Multiple components working together
- **E2E tests**: Full user journeys across the application

Together, they provide comprehensive test coverage from component to end-user experience.
