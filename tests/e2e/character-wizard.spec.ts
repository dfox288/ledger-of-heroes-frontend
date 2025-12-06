// tests/e2e/character-wizard.spec.ts
import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * E2E Tests: Character Creation Wizard
 *
 * Tests the complete character creation flow with:
 * - Race: Human (no subrace)
 * - Class: Bard (spellcaster)
 * - Background: Acolyte
 * - Abilities: Manual entry
 */

// ════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════

const WIZARD_BASE_URL = '/characters/new'

/** Test character ability scores (valid range: 3-20) */
const TEST_ABILITY_SCORES = {
  strength: 8,
  dexterity: 14,
  constitution: 13,
  intelligence: 10,
  wisdom: 12,
  charisma: 15
} as const

/** Test character name */
const TEST_CHARACTER_NAME = 'Test Human Bard'

// ════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════

/**
 * Get the Next button in the wizard footer
 */
function getNextButton(page: Page): Locator {
  return page.locator('[data-test="next-button"]')
}

/**
 * Get the Back button in the wizard footer
 */
function getBackButton(page: Page): Locator {
  return page.locator('[data-test="back-button"]')
}

/**
 * Wait for the loading spinner to disappear
 */
async function waitForLoading(page: Page): Promise<void> {
  // Wait for any loading spinners to finish
  await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
    // No spinner found, that's fine
  })
}

/**
 * Click the Next button and wait for navigation
 */
async function clickNextAndWait(page: Page): Promise<void> {
  const nextButton = getNextButton(page)
  await expect(nextButton).toBeEnabled({ timeout: 10000 })
  await nextButton.click()
  await waitForLoading(page)
}

/**
 * Navigate to a specific wizard step
 */
async function goToStep(page: Page, step: string): Promise<void> {
  await page.goto(`${WIZARD_BASE_URL}/${step}`)
  await waitForLoading(page)
}

// ════════════════════════════════════════════════════════════════
// TESTS
// ════════════════════════════════════════════════════════════════

test.describe('Character Creation Wizard', () => {
  test.describe('Step 1: Sourcebooks', () => {
    test.beforeEach(async ({ page }) => {
      await goToStep(page, 'sourcebooks')
    })

    test('displays sourcebooks step with correct title', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /source/i })).toBeVisible()
    })

    test('has PHB sourcebook available', async ({ page }) => {
      // PHB should be visible and selectable
      await expect(page.getByText('PHB')).toBeVisible()
    })

    test('Next button is enabled when sourcebook selected', async ({ page }) => {
      // PHB should be selected by default
      await expect(getNextButton(page)).toBeEnabled()
    })

    test('can proceed to race step', async ({ page }) => {
      await clickNextAndWait(page)
      await expect(page).toHaveURL(/\/characters\/new\/race/)
    })
  })

  test.describe('Step 2: Race', () => {
    test.beforeEach(async ({ page }) => {
      await goToStep(page, 'race')
    })

    test('displays race selection with correct title', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /choose your race/i })).toBeVisible()
    })

    test('displays search input', async ({ page }) => {
      await expect(page.locator('input[placeholder*="Search races"]')).toBeVisible()
    })

    test('displays Human race card', async ({ page }) => {
      await expect(page.getByText('Human')).toBeVisible()
    })

    test('can search for Human', async ({ page }) => {
      await page.locator('input[placeholder*="Search races"]').fill('Human')
      await expect(page.getByText('Human')).toBeVisible()
    })

    test('can select Human race', async ({ page }) => {
      // Click on the Human card
      await page.getByText('Human').first().click()

      // The "Continue with Human" button should appear
      await expect(page.getByRole('button', { name: /continue with human/i })).toBeVisible()
    })

    test('Continue button is disabled until race selected', async ({ page }) => {
      // Initially no race selected - look for a disabled continue button
      const continueButton = page.getByRole('button', { name: /continue with/i })
      // The button text should show "Continue with Selection" when nothing selected
      // and be disabled
      await expect(page.getByRole('button', { name: /continue with selection/i })).toBeDisabled()
    })

    test('selecting Human and continuing skips subrace step', async ({ page }) => {
      // Select Human
      await page.getByText('Human').first().click()

      // Click Continue
      await page.getByRole('button', { name: /continue with human/i }).click()
      await waitForLoading(page)

      // Should skip subrace and go directly to class (Human has no subraces)
      await expect(page).toHaveURL(/\/characters\/new\/class/)
    })
  })

  test.describe('Step 3: Class', () => {
    test.beforeEach(async ({ page }) => {
      await goToStep(page, 'class')
    })

    test('displays class selection with correct title', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /choose your class/i })).toBeVisible()
    })

    test('displays search input', async ({ page }) => {
      await expect(page.locator('input[placeholder*="Search classes"]')).toBeVisible()
    })

    test('displays Bard class card', async ({ page }) => {
      await expect(page.getByText('Bard')).toBeVisible()
    })

    test('can search for Bard', async ({ page }) => {
      await page.locator('input[placeholder*="Search classes"]').fill('Bard')
      await expect(page.getByText('Bard')).toBeVisible()
    })

    test('shows spellcasting info when Bard selected', async ({ page }) => {
      // Click on Bard
      await page.getByText('Bard').first().click()

      // Should show info that Bard is a spellcaster
      await expect(page.getByText(/spellcasting class/i)).toBeVisible()
    })

    test('can select Bard and continue', async ({ page }) => {
      // Select Bard
      await page.getByText('Bard').first().click()

      // Click Continue
      await page.getByRole('button', { name: /continue with bard/i }).click()
      await waitForLoading(page)

      // Should skip subclass (Bard picks at level 3) and go to background
      await expect(page).toHaveURL(/\/characters\/new\/background/)
    })
  })

  test.describe('Step 4: Background', () => {
    test.beforeEach(async ({ page }) => {
      await goToStep(page, 'background')
    })

    test('displays background selection with correct title', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /choose your background/i })).toBeVisible()
    })

    test('displays Acolyte background', async ({ page }) => {
      await expect(page.getByText('Acolyte')).toBeVisible()
    })

    test('can search for Acolyte', async ({ page }) => {
      await page.locator('input[placeholder*="Search backgrounds"]').fill('Acolyte')
      await expect(page.getByText('Acolyte')).toBeVisible()
    })

    test('can select Acolyte and continue', async ({ page }) => {
      // Select Acolyte
      await page.getByText('Acolyte').first().click()

      // Click Continue
      await page.getByRole('button', { name: /continue with acolyte/i }).click()
      await waitForLoading(page)

      // Should go to abilities
      await expect(page).toHaveURL(/\/characters\/new\/abilities/)
    })
  })

  test.describe('Step 5: Abilities', () => {
    test.beforeEach(async ({ page }) => {
      await goToStep(page, 'abilities')
    })

    test('displays abilities step with correct title', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /assign ability scores/i })).toBeVisible()
    })

    test('displays method selector with three options', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Standard Array' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Point Buy' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Manual' })).toBeVisible()
    })

    test('can switch to Manual method', async ({ page }) => {
      // Click Manual button
      await page.getByRole('button', { name: 'Manual' }).click()

      // Should show number inputs for each ability
      await expect(page.getByText(/enter your ability scores/i)).toBeVisible()
    })

    test('can enter ability scores manually', async ({ page }) => {
      // Switch to Manual
      await page.getByRole('button', { name: 'Manual' }).click()

      // Fill in ability scores using data-testid
      await page.locator('[data-testid="input-strength"]').fill('8')
      await page.locator('[data-testid="input-dexterity"]').fill('14')
      await page.locator('[data-testid="input-constitution"]').fill('13')
      await page.locator('[data-testid="input-intelligence"]').fill('10')
      await page.locator('[data-testid="input-wisdom"]').fill('12')
      await page.locator('[data-testid="input-charisma"]').fill('15')

      // Save button should be enabled
      await expect(page.locator('[data-testid="save-abilities"]')).toBeEnabled()
    })

    test('validates ability score range (3-20)', async ({ page }) => {
      // Switch to Manual
      await page.getByRole('button', { name: 'Manual' }).click()

      // Enter invalid score (too low)
      await page.locator('[data-testid="input-strength"]').fill('2')

      // Save button should be disabled
      await expect(page.locator('[data-testid="save-abilities"]')).toBeDisabled()
    })

    test('can save abilities and continue', async ({ page }) => {
      // Switch to Manual
      await page.getByRole('button', { name: 'Manual' }).click()

      // Fill valid scores
      await page.locator('[data-testid="input-strength"]').fill('8')
      await page.locator('[data-testid="input-dexterity"]').fill('14')
      await page.locator('[data-testid="input-constitution"]').fill('13')
      await page.locator('[data-testid="input-intelligence"]').fill('10')
      await page.locator('[data-testid="input-wisdom"]').fill('12')
      await page.locator('[data-testid="input-charisma"]').fill('15')

      // Click Save & Continue
      await page.locator('[data-testid="save-abilities"]').click()
      await waitForLoading(page)

      // Should proceed to proficiencies
      await expect(page).toHaveURL(/\/characters\/new\/proficiencies/)
    })
  })
})
