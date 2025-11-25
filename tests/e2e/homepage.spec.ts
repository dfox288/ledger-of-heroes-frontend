import { test, expect } from '@playwright/test'

/**
 * E2E Tests: Homepage
 *
 * Tests the landing page (/) including:
 * - Page load and SEO
 * - Entity navigation cards
 * - Reference data section
 * - Search functionality
 */

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads successfully with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/D&D 5e Compendium/)
  })

  test('displays logo', async ({ page }) => {
    const logo = page.locator('img[alt="Ledger of Heroes"]')
    await expect(logo).toBeVisible()
  })

  test('displays hero section with description', async ({ page }) => {
    await expect(page.getByText(/Streamlined toolkit for managing your characters/i)).toBeVisible()
  })

  test('displays search input', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')
    await expect(searchInput).toBeVisible()
  })

  test.describe('Entity Navigation Cards', () => {
    const entityCards = [
      { name: 'Spells', url: '/spells', description: 'Browse hundreds of magical spells' },
      { name: 'Items', url: '/items', description: 'Discover weapons, armor, and magical items' },
      { name: 'Monsters', url: '/monsters', description: 'Encounter creatures from tiny beasts' },
      { name: 'Races', url: '/races', description: 'Explore playable races from elves' },
      { name: 'Classes', url: '/classes', description: 'Choose your path from wizards' },
      { name: 'Backgrounds', url: '/backgrounds', description: 'Define your character\'s history' },
      { name: 'Feats', url: '/feats', description: 'Gain special abilities and enhance' }
    ]

    entityCards.forEach(({ name, url, description }) => {
      test(`displays ${name} card with description`, async ({ page }) => {
        // Use .last() to select the entity card on homepage (not nav links)
        const card = page.locator(`a[href="${url}"]`).last()
        await expect(card).toBeVisible()
        await expect(card.getByRole('heading', { name })).toBeVisible()
        await expect(card.getByText(new RegExp(description, 'i'))).toBeVisible()
      })

      test(`${name} card links to ${url}`, async ({ page }) => {
        const card = page.locator(`a[href="${url}"]`).last()
        await expect(card).toHaveAttribute('href', url)
      })

      test(`${name} card is clickable and navigates`, async ({ page }) => {
        // Click the entity card (last link, not nav link)
        await page.locator(`a[href="${url}"]`).last().click()
        await expect(page).toHaveURL(url)
        // Verify we reached the list page
        await expect(page.locator('h1')).toBeVisible()
      })
    })
  })

  test.describe('Reference Data Section', () => {
    test('displays "Reference Data" heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Reference Data/i })).toBeVisible()
    })

    const referenceItems = [
      { label: 'Ability Scores', url: '/ability-scores' },
      { label: 'Conditions', url: '/conditions' },
      { label: 'Creature Sizes', url: '/sizes' },
      { label: 'Damage Types', url: '/damage-types' },
      { label: 'Item Types', url: '/item-types' },
      { label: 'Languages', url: '/languages' },
      { label: 'Proficiency Types', url: '/proficiency-types' },
      { label: 'Skills', url: '/skills' },
      { label: 'Source Books', url: '/sources' },
      { label: 'Spell Schools', url: '/spell-schools' }
    ]

    referenceItems.forEach(({ label, url }) => {
      test(`displays ${label} reference link`, async ({ page }) => {
        // Use getByRole to find links by accessible name (avoids strict mode violations)
        const link = page.getByRole('link', { name: label })
        await expect(link.last()).toBeVisible()
      })
    })
  })

  test('displays footer with app name', async ({ page }) => {
    await expect(page.getByText('Ledger of Heroes').last()).toBeVisible()
  })

  test('has responsive layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await expect(page.locator('img[alt="Ledger of Heroes"]')).toBeVisible()
    // Check for Spells entity card specifically
    await expect(page.locator('a[href="/spells"]').last()).toBeVisible()
  })

  test('has responsive layout on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }) // iPad
    await expect(page.locator('img[alt="Ledger of Heroes"]')).toBeVisible()
    await expect(page.locator('a[href="/spells"]').last()).toBeVisible()
  })

  test('has responsive layout on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 }) // Desktop
    await expect(page.locator('img[alt="Ledger of Heroes"]')).toBeVisible()
    await expect(page.locator('a[href="/spells"]').last()).toBeVisible()
  })
})
