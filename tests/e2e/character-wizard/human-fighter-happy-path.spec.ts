import { test, expect } from '@playwright/test'

/**
 * E2E Test: Character Creation Wizard - Initial Steps
 *
 * spec: tests/e2e/specs/character-wizard.plan.md
 *
 * Tests the initial steps of character creation:
 * - Sourcebook selection (validates hydration fix)
 * - Race selection (validates character creation)
 * - URL transition from /new/ to /{publicId}/edit/
 *
 * Note: Full wizard completion test requires more detailed UI interactions
 * for skill selection, equipment choices, etc. This test validates the
 * core navigation and character creation flow.
 */

test.describe('Human Fighter (Initial Steps)', () => {
  // Run serially to avoid state interference from shared wizard store
  test.describe.configure({ mode: 'serial' })

  // Increase timeout for character creation tests (API saves can be slow)
  test.setTimeout(60000)
  test('Sourcebooks to Background - validates hydration fix and character creation', async ({ page }) => {
    // 1. Navigate to /characters/new/sourcebooks
    await page.goto('/characters/new/sourcebooks')
    await expect(page).toHaveURL('/characters/new/sourcebooks')

    // 2. Select sourcebooks (PHB is required for Human/Fighter)
    // Wait for sources to load
    await expect(page.getByText(/Choose Your Sourcebooks/i)).toBeVisible()

    // Wait for sources to finish loading
    await page.waitForSelector('text=Player\'s Handbook', { timeout: 5000 })

    // Click "Select All" button to select all sourcebooks
    const selectAllBtn = page.getByRole('button', { name: 'Select All', exact: true })
    await expect(selectAllBtn).toBeVisible()
    await expect(selectAllBtn).toBeEnabled()
    await selectAllBtn.click()

    // Wait for selection to register - must see at least 1 selected
    await expect(page.getByText(/[1-9]\d* of \d+ selected/i)).toBeVisible({ timeout: 5000 })

    // Wait for any Vue hydration/reactivity to settle
    await page.waitForTimeout(1000)

    // Click Continue button - use exact match to avoid ambiguity with other buttons
    const continueButton = page.getByRole('button', { name: 'Continue', exact: true })
    await expect(continueButton).toBeEnabled()

    // Scroll button into view and click with force
    await continueButton.scrollIntoViewIfNeeded()
    await continueButton.click({ force: true })

    // Wait for navigation to race step (longer timeout for potential slow navigation)
    await page.waitForURL(/\/characters\/new\/race/, { timeout: 15000 })

    // 3. At race step, search for and select 'Human'
    await expect(page).toHaveURL(/\/characters\/new\/race/)

    // Wait for race cards to load before searching
    // Look for any h3 heading (race name) to confirm cards are rendered
    await page.waitForSelector('h3', { timeout: 10000 })

    // Search for Human
    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill('Human')

    // Wait for search results to filter
    await page.waitForTimeout(500)

    // Click Human card - use heading to find it reliably
    const humanCard = page.locator('h3', { hasText: 'Human' }).locator('..')
    await humanCard.first().click()

    // 4. Click the "Continue with Human" button to save race
    // The button text changes to show the selected race
    const continueWithRaceBtn = page.getByRole('button', { name: /Continue with Human/i })
    await expect(continueWithRaceBtn).toBeVisible({ timeout: 5000 })
    await continueWithRaceBtn.click()

    // Verify URL changes from /characters/new/race to /characters/{publicId}/edit/...
    // Human has optional subraces, so expect subrace step
    await expect(page).toHaveURL(/\/characters\/[a-z]+-[a-z]+-[A-Za-z0-9]+\/edit\//, { timeout: 10000 })

    // Extract and store publicId from URL for later verification
    const url = page.url()
    const publicIdMatch = url.match(/\/characters\/([a-z]+-[a-z]+-[A-Za-z0-9]+)\//)
    expect(publicIdMatch).not.toBeNull()
    const publicId = publicIdMatch![1]

    // 5. Handle subrace step - Human has optional subraces
    // Select "No Subrace" to continue with base Human
    if (page.url().includes('/subrace')) {
      // "No Subrace" should already be selected, just click Continue
      const continueBtn = page.getByRole('button', { name: /Continue/i })
      await expect(continueBtn).toBeVisible()
      await continueBtn.click()
      await page.waitForTimeout(500)
    }

    // 6. At size step, select Medium and continue
    // Note: Size step might be auto-skipped if Human has only one size option
    if (page.url().includes('/size')) {
      const mediumOption = page.getByText('Medium').or(page.getByRole('radio', { name: /Medium/i }))
      await mediumOption.click()
      await page.getByRole('button', { name: /Continue|Next/i }).click()
    }

    // 7. At class step, search for and select 'Fighter', confirm
    await expect(page).toHaveURL(new RegExp(`/characters/${publicId}/edit/class`))

    // Wait for class cards to load
    await page.waitForSelector('h3', { timeout: 10000 })

    // Search for Fighter
    await page.getByPlaceholder(/search/i).fill('Fighter')
    await page.waitForTimeout(500)

    // Click Fighter card
    const fighterCard = page.locator('h3', { hasText: 'Fighter' }).locator('..')
    await fighterCard.first().click()

    // Click "Continue with Fighter" button
    const continueWithClassBtn = page.getByRole('button', { name: /Continue with Fighter/i })
    await expect(continueWithClassBtn).toBeVisible({ timeout: 5000 })
    await continueWithClassBtn.click()

    // Verify subclass step NOT visible (Fighter gets subclass at level 3)
    await expect(page).not.toHaveURL(/\/subclass/, { timeout: 5000 })

    // 8. At background step, search for and select 'Soldier', confirm
    await expect(page).toHaveURL(new RegExp(`/characters/${publicId}/edit/background`))

    // Wait for background cards to load
    await page.waitForSelector('h3', { timeout: 10000 })

    // Search for Soldier
    await page.getByPlaceholder(/search/i).fill('Soldier')
    await page.waitForTimeout(500)

    // Click Soldier card
    const soldierCard = page.locator('h3', { hasText: 'Soldier' }).locator('..')
    await soldierCard.first().click()

    // Click "Continue with Soldier" button
    const continueWithBgBtn = page.getByRole('button', { name: /Continue with Soldier/i })
    await expect(continueWithBgBtn).toBeVisible({ timeout: 5000 })
    await continueWithBgBtn.click()

    // Wait for navigation away from background step
    // Next steps could be: feats (auto-skip), abilities, skills, or languages
    await page.waitForFunction(
      () => !window.location.href.includes('/background'),
      { timeout: 15000 }
    )

    // 9. Verify we've progressed beyond background
    // At this point, character has: Race (Human), Class (Fighter), Background (Soldier)
    // The wizard should be at feats, abilities, proficiencies, or another step

    // Validate character was created and we're in edit mode
    expect(page.url()).toContain(`/characters/${publicId}/edit/`)
    expect(page.url()).not.toContain('/background')

    // Test success: We've validated:
    // 1. Sourcebook selection works (hydration fix verified)
    // 2. Navigation from /new/ to /{publicId}/edit/ works
    // 3. Race, subrace, class, and background selection all work
    // 4. Character creation and persistence works
  })
})
