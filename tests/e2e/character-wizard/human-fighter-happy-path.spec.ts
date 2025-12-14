import { test, expect } from '@playwright/test'

/**
 * E2E Test: Complete Character Creation Wizard - Human Fighter
 *
 * spec: tests/e2e/specs/character-wizard.plan.md
 * seed: tests/e2e/seed.spec.ts
 *
 * Tests the simplest path through the character wizard:
 * - No subrace (Human has no subraces)
 * - No subclass at level 1 (Fighter gets subclass at level 3)
 * - No spells (Fighter is not a spellcaster)
 *
 * Key validations:
 * - URL transitions from /new/ to /{publicId}/edit/ after race selection
 * - Conditional steps are properly hidden
 * - Character creation completes successfully
 */

test.describe('Human Fighter (Simple Path)', () => {
  test('Complete Happy Path - Human Fighter', async ({ page }) => {
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
    await page.waitForTimeout(500)

    // Click Continue button and wait for navigation
    const continueButton = page.getByRole('button', { name: /Continue/i })
    await expect(continueButton).toBeEnabled()

    // Use Promise.all to click and wait for navigation together
    await Promise.all([
      page.waitForURL(/\/characters\/new\/race/, { timeout: 10000 }),
      continueButton.click()
    ])

    // 3. At race step, search for and select 'Human'
    await expect(page).toHaveURL(/\/characters\/new\/race/)
    
    // Search for Human
    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill('Human')
    
    // Click Human card to select
    const humanCard = page.getByRole('link', { name: /Human/i }).or(page.getByText('Human')).first()
    await humanCard.click()

    // 4. Click the confirm/continue button to save race
    // Verify race details panel appears
    await expect(page.getByText(/Ability Score/i)).toBeVisible({ timeout: 5000 })
    
    // Click Confirm button
    const confirmButton = page.getByRole('button', { name: /Confirm|Save/i })
    await confirmButton.click()

    // Verify URL changes from /characters/new/race to /characters/{publicId}/edit/size
    await expect(page).toHaveURL(/\/characters\/[a-z]+-[a-z]+-[A-Z0-9]+\/edit\/(size|class)/, { timeout: 10000 })
    
    // Extract and store publicId from URL for later verification
    const url = page.url()
    const publicIdMatch = url.match(/\/characters\/([a-z]+-[a-z]+-[A-Z0-9]+)\//)
    expect(publicIdMatch).not.toBeNull()
    const publicId = publicIdMatch![1]

    // 5. At size step, select Medium and continue
    // Note: Size step might be auto-skipped if Human has only one size option
    if (page.url().includes('/size')) {
      const mediumOption = page.getByText('Medium').or(page.getByRole('radio', { name: /Medium/i }))
      await mediumOption.click()
      await page.getByRole('button', { name: /Continue|Next/i }).click()
    }

    // 6. At class step, search for and select 'Fighter', confirm
    await expect(page).toHaveURL(new RegExp(`/characters/${publicId}/edit/class`))
    
    // Search for Fighter
    await page.getByPlaceholder(/search/i).fill('Fighter')
    
    // Click Fighter card
    const fighterCard = page.getByRole('link', { name: /Fighter/i }).or(page.getByText('Fighter')).first()
    await fighterCard.click()
    
    // Verify class details appear (hit die: d10)
    await expect(page.getByText(/d10|Hit Die/i)).toBeVisible({ timeout: 5000 })
    
    // Confirm Fighter selection
    await page.getByRole('button', { name: /Confirm|Save/i }).click()

    // Verify subclass step NOT visible (Fighter gets subclass at level 3)
    await expect(page).not.toHaveURL(/\/subclass/, { timeout: 5000 })

    // 7. At background step, search for and select 'Soldier', confirm
    await expect(page).toHaveURL(new RegExp(`/characters/${publicId}/edit/background`))
    
    // Search for Soldier
    await page.getByPlaceholder(/search/i).fill('Soldier')
    
    // Click Soldier card
    const soldierCard = page.getByRole('link', { name: /Soldier/i }).or(page.getByText('Soldier')).first()
    await soldierCard.click()
    
    // Confirm Soldier selection
    await page.getByRole('button', { name: /Confirm|Save/i }).click()

    // 8. At abilities step, use Standard Array and assign scores
    await expect(page).toHaveURL(new RegExp(`/characters/${publicId}/edit/abilities`))
    
    // Select Standard Array method
    const standardArrayOption = page.getByText('Standard Array').or(page.getByRole('radio', { name: /Standard Array/i }))
    await standardArrayOption.click()
    
    // Assign scores: STR=15, DEX=14, CON=13, INT=12, WIS=10, CHA=8
    // Note: The exact UI for assignment varies, this is a placeholder
    // You may need to interact with dropdowns or input fields
    await page.waitForTimeout(1000) // Allow UI to update
    
    // Continue to next step
    await page.getByRole('button', { name: /Continue|Next/i }).click()

    // 9. At proficiencies step, select 2 skills
    // May auto-navigate if no choices needed
    if (page.url().includes('/proficiencies')) {
      // Select 2 skills: Athletics and Perception
      await page.getByRole('checkbox', { name: /Athletics/i }).click()
      await page.getByRole('checkbox', { name: /Perception/i }).click()
      
      await page.getByRole('button', { name: /Continue|Next/i }).click()
    }

    // Languages step may appear or auto-skip
    if (page.url().includes('/languages')) {
      // If there are language choices, make them
      await page.getByRole('button', { name: /Continue|Next/i }).click()
    }

    // 10. At equipment step, make equipment choices
    if (page.url().includes('/equipment')) {
      // Make equipment selections (exact UI varies)
      // This is a placeholder - you'll need to interact with the actual equipment choice UI
      await page.waitForTimeout(1000)
      
      // Wait for Continue button to be enabled (all equipment choices made)
      const equipmentContinue = page.getByRole('button', { name: /Continue|Next/i })
      await equipmentContinue.waitFor({ state: 'visible', timeout: 5000 })
      
      // Note: In real test, you'd select each equipment option
      // For now, we'll skip if auto-skipped or continue if possible
      if (await equipmentContinue.isEnabled()) {
        await equipmentContinue.click()
      }
    }

    // Verify spells step NOT visible (Fighter is not a spellcaster)
    await expect(page).not.toHaveURL(/\/spells/)

    // 11. At details step, enter name 'Thorin Ironforge'
    await expect(page).toHaveURL(new RegExp(`/characters/${publicId}/edit/details`))
    
    // Enter character name
    const nameInput = page.getByPlaceholder(/name/i).or(page.getByLabel(/name/i))
    await nameInput.fill('Thorin Ironforge')
    
    // Select alignment if required
    const alignmentSelect = page.getByLabel(/alignment/i)
    if (await alignmentSelect.isVisible()) {
      await alignmentSelect.selectOption({ label: /Lawful Good/i })
    }
    
    await page.getByRole('button', { name: /Continue|Next/i }).click()

    // 12. At review step, verify character info and click Finish
    await expect(page).toHaveURL(new RegExp(`/characters/${publicId}/edit/review`))
    
    // Verify character information is displayed
    await expect(page.getByText('Thorin Ironforge')).toBeVisible()
    await expect(page.getByText(/Human/i)).toBeVisible()
    await expect(page.getByText(/Fighter/i)).toBeVisible()
    await expect(page.getByText(/Soldier/i)).toBeVisible()
    
    // Verify Finish button is enabled
    const finishButton = page.getByRole('button', { name: /Finish|Complete|Create Character/i })
    await expect(finishButton).toBeEnabled()
    
    // Click Finish
    await finishButton.click()

    // 13. Verify redirect to character sheet
    await expect(page).toHaveURL(new RegExp(`/characters/${publicId}$`), { timeout: 10000 })
    
    // Verify character sheet displays correctly
    await expect(page.getByText('Thorin Ironforge')).toBeVisible()
    await expect(page.getByText(/Level 1/i)).toBeVisible()
    
    // Verify no pending choices remain
    // (This would require checking specific UI elements that show pending choices)
  })
})
