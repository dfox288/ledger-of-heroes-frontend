import { test, expect } from '@playwright/test'

/**
 * Debug test for sourcebooks selection
 */
test.describe('Sourcebooks Debug', () => {
  test('Select All should persist', async ({ page }) => {
    // Navigate to sourcebooks
    await page.goto('/characters/new/sourcebooks')

    // Wait for page to fully load
    await expect(page.getByText('Choose Your Sourcebooks')).toBeVisible()
    await page.waitForSelector('text=Player\'s Handbook', { timeout: 10000 })

    // Verify initial state - should show some selection count
    const countBefore = await page.getByText(/\d+ of \d+ selected/i).textContent()
    console.log('Count before Select All:', countBefore)

    // Click Select All
    await page.getByRole('button', { name: 'Select All', exact: true }).click()

    // Wait a moment for state to update
    await page.waitForTimeout(1000)

    // Check selection count after
    const countAfter = await page.getByText(/\d+ of \d+ selected/i).textContent()
    console.log('Count after Select All:', countAfter)

    // Take screenshot
    await page.screenshot({ path: 'test-results/sourcebooks-after-select.png' })

    // Verify it shows 11 selected
    await expect(page.getByText(/11 of 11 selected/i)).toBeVisible()

    // Wait 2 more seconds to see if it resets
    await page.waitForTimeout(2000)

    const countLater = await page.getByText(/\d+ of \d+ selected/i).textContent()
    console.log('Count 2 seconds later:', countLater)

    // Should still be 11
    await expect(page.getByText(/11 of 11 selected/i)).toBeVisible()
  })
})
