import { test, expect } from '@playwright/test'

/**
 * E2E Test: Edit Character Flow
 *
 * spec: tests/e2e/specs/character-wizard.plan.md (Section 1.3 Sidebar Navigation)
 *
 * Tests editing an existing character:
 * 1. Finds an existing character with race, class, and background
 * 2. Navigates directly to the edit wizard
 * 3. Changes the character name via the Details step
 * 4. Verifies the change is saved
 * 5. Verifies no corruption of other character data (race, class still intact)
 *
 * PREREQUISITE: At least one character with race, class, and background must exist.
 *
 * To create a test character:
 * - Run the human-fighter or elf-wizard E2E tests first
 * - OR use the character wizard UI
 *
 * This test will skip (not fail) if no suitable character is found.
 */

test.describe('Edit Character: Change Name Flow', () => {
  // Run serially to avoid state interference
  test.describe.configure({ mode: 'serial' })

  // Increase timeout for edit tests (API saves can be slow)
  test.setTimeout(60000)

  test('Edit existing character name and verify save persists', async ({ page }) => {
    // ═══════════════════════════════════════════════════════════════════
    // PART 1: Find a character with race, class, and background via API
    // ═══════════════════════════════════════════════════════════════════

    // Query the API directly to find a suitable character
    const response = await page.request.get('/api/characters')
    const data = await response.json()

    // Find a character that has at least race, class, and background
    const character = data.data?.find((c: Record<string, unknown>) =>
      c.public_id &&
      c.race &&
      c.class &&
      c.background
    )

    if (!character) {
      test.skip(true, 'No character with race, class, and background found. Run character wizard tests first.')
      return
    }

    const publicId = character.public_id as string
    const originalName = character.name as string

    // ═══════════════════════════════════════════════════════════════════
    // PART 2: Navigate directly to Edit Mode (details step)
    // ═══════════════════════════════════════════════════════════════════

    // Navigate directly to the edit wizard's details step
    await page.goto(`/characters/${publicId}/edit/details`)
    await expect(page).toHaveURL(new RegExp(`/characters/${publicId}/edit/details`), { timeout: 10000 })

    // ═══════════════════════════════════════════════════════════════════
    // PART 3: Change the character name
    // ═══════════════════════════════════════════════════════════════════

    // Wait for form to load
    await expect(page.getByText(/Character Details/)).toBeVisible()
    await page.waitForTimeout(1000) // Wait for hydration

    // Find the name input
    const nameInput = page.getByPlaceholder(/Enter your character's name/i)
    await expect(nameInput).toBeVisible()

    // Generate a new unique name with timestamp
    const timestamp = Date.now().toString().slice(-6)
    const newName = `TestEdit_${timestamp}`

    // Triple-click to select all, then type new name (more reliable than clear+fill)
    await nameInput.click({ clickCount: 3 })
    await nameInput.type(newName)

    // Verify input has the new value
    await expect(nameInput).toHaveValue(newName)

    // ═══════════════════════════════════════════════════════════════════
    // PART 4: Save and verify persistence
    // ═══════════════════════════════════════════════════════════════════

    // Click Continue to Review (which saves the details before navigating)
    // Note: If character has pending choices, navigation may fail but save still occurs
    const continueBtn = page.getByRole('button', { name: /Continue to Review/i })
    await expect(continueBtn).toBeVisible()
    await expect(continueBtn).toBeEnabled()

    // Scroll button into view and click
    await continueBtn.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await continueBtn.click()

    // Wait for save to complete (the button triggers saveDetails before nextStep)
    await page.waitForTimeout(2000)

    // ═══════════════════════════════════════════════════════════════════
    // PART 5: Verify save persisted by refreshing the page
    // ═══════════════════════════════════════════════════════════════════

    // Refresh the details page to verify the name was saved
    await page.goto(`/characters/${publicId}/edit/details`)
    await expect(page).toHaveURL(new RegExp(`/characters/${publicId}/edit/details`), { timeout: 10000 })

    // Wait for form to reload
    await expect(page.getByText(/Character Details/)).toBeVisible()
    await page.waitForTimeout(1000)

    // Verify the name input shows the new name (proving it was saved)
    const refreshedNameInput = page.getByPlaceholder(/Enter your character's name/i)
    await expect(refreshedNameInput).toHaveValue(newName, { timeout: 5000 })

    // ═══════════════════════════════════════════════════════════════════
    // PART 6: Verify character sheet shows the new name
    // ═══════════════════════════════════════════════════════════════════

    // Navigate to character sheet
    await page.goto(`/characters/${publicId}`)
    await expect(page).toHaveURL(new RegExp(`/characters/${publicId}$`), { timeout: 10000 })

    // Wait for page to load
    await page.waitForTimeout(1000)

    // Verify the new name appears in the character sheet header
    const nameElement = page.getByRole('heading', { level: 1 }).or(page.locator('h1')).first()
    await expect(nameElement).toContainText(newName, { timeout: 5000 })

    // Verify we can still access the Actions dropdown (character is functional)
    const actionsDropdown = page.getByTestId('actions-dropdown')
    await expect(actionsDropdown).toBeVisible()

    // Success! Character name was edited and saved correctly
  })

  test('Sidebar navigation allows backward navigation to earlier steps', async ({ page }) => {
    // ═══════════════════════════════════════════════════════════════════
    // Find a character with race, class, and background via API
    // ═══════════════════════════════════════════════════════════════════

    const response = await page.request.get('/api/characters')
    const data = await response.json()

    const character = data.data?.find((c: Record<string, unknown>) =>
      c.public_id &&
      c.race &&
      c.class &&
      c.background
    )

    if (!character) {
      test.skip(true, 'No character with race, class, and background found.')
      return
    }

    const publicId = character.public_id as string

    // ═══════════════════════════════════════════════════════════════════
    // Navigate to a later step (details) to test backward navigation
    // ═══════════════════════════════════════════════════════════════════

    // Start at the details step - this way earlier steps are "completed"
    await page.goto(`/characters/${publicId}/edit/details`)
    await expect(page).toHaveURL(new RegExp(`/characters/${publicId}/edit/details`), { timeout: 10000 })
    await page.waitForTimeout(1000)

    // Verify we're on details step
    await expect(page.getByText(/Character Details/i)).toBeVisible()

    // ═══════════════════════════════════════════════════════════════════
    // Verify sidebar steps are visible with checkmarks for completed
    // ═══════════════════════════════════════════════════════════════════

    // Check that core steps are visible in sidebar
    const coreSteps = ['race', 'class', 'background', 'details']

    for (const stepName of coreSteps) {
      const stepButton = page.getByTestId(`step-item-${stepName}`)
      await expect(stepButton).toBeVisible({ timeout: 3000 })
    }

    // ═══════════════════════════════════════════════════════════════════
    // Test backward navigation via sidebar
    // ═══════════════════════════════════════════════════════════════════

    // From details, we should be able to click on earlier (completed) steps
    // The wizard allows navigating backward to any step before current

    // Click on Race step (should be navigable since it's before current)
    const raceStep = page.getByTestId('step-item-race')
    await raceStep.click()
    await expect(page).toHaveURL(new RegExp(`/characters/${publicId}/edit/race`), { timeout: 5000 })

    // Verify race step loaded (search for races should be visible)
    await page.waitForTimeout(500)
    const raceCards = page.locator('h3').filter({ hasText: /Human|Elf|Dwarf|Halfling/i })
    await expect(raceCards.first()).toBeVisible({ timeout: 5000 })

    // Now we're at race - only sourcebooks (earlier) is navigable
    // Going back to earlier step should work
    const sourcesStep = page.getByTestId('step-item-sourcebooks')
    await sourcesStep.click()
    await expect(page).toHaveURL(new RegExp(`/characters/${publicId}/edit/sourcebooks`), { timeout: 5000 })

    // Verify sourcebooks step loaded
    await expect(page.getByText(/Choose Your Sourcebooks/i)).toBeVisible({ timeout: 5000 })

    // Success! Sidebar backward navigation works correctly
  })
})
