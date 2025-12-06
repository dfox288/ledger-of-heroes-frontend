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
})
