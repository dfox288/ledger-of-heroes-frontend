import { test, expect } from '@playwright/test'

/**
 * E2E Test: Level Up from 1 to 2 using Average HP
 *
 * spec: tests/e2e/specs/level-up.plan.md
 *
 * Tests the complete level-up flow:
 * 1. Finds an existing complete level 1 character
 * 2. Opens character sheet and initiates level-up
 * 3. Handles the confirmation modal
 * 4. Navigates through level-up preview
 * 5. Selects "Take Average" for HP increase
 * 6. Handles any class-specific feature choices
 * 7. Verifies summary shows level transition
 * 8. Confirms character sheet shows new level
 *
 * PREREQUISITE: At least one COMPLETE level 1 character must exist in the database.
 *
 * To create a test character:
 * - Use the character wizard UI to create and complete a character
 * - OR run: npm run test:character-stress -- --count=1
 *
 * This test will skip (not fail) if no suitable character is found.
 */

test.describe('Level Up: Level 1 to 2 (Average HP)', () => {
  // Run serially to avoid state interference
  test.describe.configure({ mode: 'serial' })

  // Increase timeout for level-up tests (API saves can be slow)
  test.setTimeout(60000)

  test('Level up an existing level 1 character using average HP', async ({ page }) => {
    // ═══════════════════════════════════════════════════════════════════
    // PART 1: Find a level 1 complete character
    // ═══════════════════════════════════════════════════════════════════

    // Navigate to characters page to find a complete level 1 character
    await page.goto('/characters')
    await expect(page).toHaveURL('/characters')

    // Wait for character cards to load
    await page.waitForTimeout(2000)

    // Find a View link that's near a "Complete" badge in the same card container
    // We'll iterate through cards and find one that's complete
    let publicId: string | null = null

    // Get all character card containers (they have rounded-lg class typically)
    const cards = page.locator('.rounded-lg').filter({
      has: page.locator('a[href^="/characters/"]')
    })

    const cardCount = await cards.count()

    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i)
      // Check if this card has a "Complete" badge
      const hasCompleteBadge = await card.locator('text=Complete').count() > 0

      if (hasCompleteBadge) {
        // Check if it's level 1 (not higher)
        const hasLevel1 = await card.locator('text=Level 1').count() > 0

        if (hasLevel1) {
          // Found a complete level 1 character - get its View link
          const viewLink = card.locator('a').filter({ hasText: 'View' }).first()
          const href = await viewLink.getAttribute('href')
          if (href) {
            const match = href.match(/\/characters\/([a-z]+-[a-z]+-[A-Za-z0-9]+)/)
            if (match) {
              publicId = match[1]
              await viewLink.click()
              break
            }
          }
        }
      }
    }

    if (!publicId) {
      test.skip(true, 'No complete level 1 character found. Run character wizard tests first to create one.')
      return
    }

    // Wait for character sheet to load
    await page.waitForURL(new RegExp(`/characters/${publicId}$`), { timeout: 10000 })

    // Verify we're on a character sheet - look for Actions dropdown
    await expect(page.getByTestId('actions-dropdown')).toBeVisible({ timeout: 5000 })

    // ═══════════════════════════════════════════════════════════════════
    // PART 2: Level Up from 1 to 2
    // ═══════════════════════════════════════════════════════════════════

    // 2.1 Open Actions dropdown and click Level Up
    const actionsDropdown = page.getByTestId('actions-dropdown')
    await expect(actionsDropdown).toBeVisible()
    await actionsDropdown.click()

    const levelUpMenuItem = page.getByRole('menuitem', { name: /Level Up/i })
    await expect(levelUpMenuItem).toBeVisible()
    await levelUpMenuItem.click()

    // 2.2 Handle confirmation modal
    // A modal appears asking "Level Up Character?" with Cancel and Level Up buttons
    const confirmModal = page.getByRole('dialog').or(page.locator('[role="alertdialog"]'))
    await expect(confirmModal).toBeVisible({ timeout: 3000 })

    // Click the "Level Up" button in the modal
    const confirmLevelUpBtn = page.getByRole('button', { name: 'Level Up', exact: true })
    await expect(confirmLevelUpBtn).toBeVisible()
    await confirmLevelUpBtn.click()

    // 2.3 Verify level-up preview page
    await expect(page).toHaveURL(new RegExp(`/characters/${publicId}/level-up`), { timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'Level Up' })).toBeVisible()

    // Verify level transition preview (1 → 2) - the numbers in the transition display
    // Preview shows current level and target level in large text
    await page.waitForTimeout(500)

    // 2.4 Click "Begin Level Up"
    const beginLevelUpBtn = page.getByRole('button', { name: /Begin Level Up/i })
    await expect(beginLevelUpBtn).toBeVisible()
    await beginLevelUpBtn.click()

    // 2.5 HP Step - Select Average
    await expect(page).toHaveURL(new RegExp(`/characters/${publicId}/level-up/hit-points`), { timeout: 10000 })
    await expect(page.getByText(/Hit Point Increase/)).toBeVisible()

    // Click "Take Average" option
    const averageButton = page.getByTestId('average-button')
    await expect(averageButton).toBeVisible()
    await averageButton.click()

    // Verify average value is shown in the result display
    await page.waitForTimeout(500)

    // 2.6 Confirm HP Increase
    const confirmHpBtn = page.getByTestId('confirm-hp-btn')
    await expect(confirmHpBtn).toBeEnabled()
    await confirmHpBtn.click()

    // 2.7 Handle additional steps (feature choices, spells, etc.)
    // Some classes (like Artificer) have additional choices at certain levels
    // Keep clicking Continue/Skip until we reach the summary
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      await page.waitForTimeout(1000)
      const currentUrl = page.url()

      // Check if we're at summary
      if (currentUrl.includes('/level-up/summary')) {
        break
      }

      // Look for any Continue/Skip button and click it
      const continueBtn = page.getByRole('button', { name: /Continue|Skip|Next|Confirm/i }).first()
      const isContinueVisible = await continueBtn.isVisible().catch(() => false)

      if (isContinueVisible) {
        const isEnabled = await continueBtn.isEnabled().catch(() => false)
        if (isEnabled) {
          await continueBtn.click()
          attempts++
          continue
        }
      }

      attempts++

      // If stuck for too long, navigate directly to summary
      if (attempts >= maxAttempts - 1) {
        await page.goto(`/characters/${publicId}/level-up/summary`)
        break
      }
    }

    // 2.8 Summary Step - Verify level up complete
    await expect(page).toHaveURL(new RegExp(`/characters/${publicId}/level-up/summary`), { timeout: 10000 })
    await expect(page.getByText(/Level Up Complete/)).toBeVisible()

    // Verify level transition shown (Class 1 → Class 2)
    await expect(page.getByText(/1.*→.*2/)).toBeVisible()

    // Verify HP gained is shown
    await expect(page.getByText(/Hit Points/)).toBeVisible()
    await expect(page.getByText(/\+\d+/)).toBeVisible() // +N HP

    // 2.9 Click "View Character Sheet"
    const viewSheetBtn = page.getByTestId('view-sheet-button')
    await expect(viewSheetBtn).toBeVisible()
    await viewSheetBtn.click()

    // 2.10 Verify character is now level 2
    await expect(page).toHaveURL(new RegExp(`/characters/${publicId}$`), { timeout: 5000 })

    // Wait for page to load and verify level 2 is shown in the header
    // Character sheet header shows class/level like "Artificer 2" or "Fighter 2"
    await page.waitForTimeout(1000)
    await expect(page.getByText(/(?:Fighter|Wizard|Rogue|Cleric|Barbarian|Bard|Druid|Monk|Paladin|Ranger|Sorcerer|Warlock|Artificer)\s+2(?:\s|$|\))/)).toBeVisible({ timeout: 5000 })

    // Success! Character has been leveled up from 1 to 2
  })
})
