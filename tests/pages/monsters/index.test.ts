import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Tests for Monsters Page - is_legendary Filter
 *
 * Requirements:
 * 1. Add is_legendary tri-state filter (All/Yes/No)
 * 2. Filter uses UiFilterToggle component
 * 3. Filter initialized from route.query.is_legendary
 * 4. Filter included in queryBuilder
 * 5. Filter has chip with remove functionality
 * 6. Filter included in clearFilters function
 * 7. Clear Filters button condition includes filter
 */
describe('Monsters Page - is_legendary Filter', () => {
  const monstersPagePath = join(process.cwd(), 'app/pages/monsters/index.vue')
  let monstersPageContent: string

  // Read file once for all tests
  monstersPageContent = readFileSync(monstersPagePath, 'utf-8')

  describe('Filter State Management', () => {
    it('should initialize isLegendary from route query', () => {
      // Look for isLegendary ref initialization from route.query.is_legendary
      const hasIsLegendaryRef = monstersPageContent.includes('isLegendary') &&
        monstersPageContent.includes('route.query.is_legendary')

      expect(hasIsLegendaryRef).toBe(true)
    })

    it('should initialize isLegendary as string | null type', () => {
      // Look for isLegendary with type annotation or cast
      const hasIsLegendaryType = monstersPageContent.includes('isLegendary') &&
        (monstersPageContent.includes('as string') || monstersPageContent.includes('string | null'))

      expect(hasIsLegendaryType).toBe(true)
    })
  })

  describe('Query Builder Integration', () => {
    it('should include is_legendary in queryBuilder when isLegendary is not null', () => {
      // Look for isLegendary in queryBuilder params
      const hasIsLegendaryInQueryBuilder = monstersPageContent.includes('queryBuilder') &&
        monstersPageContent.includes('isLegendary') &&
        (monstersPageContent.includes('params.is_legendary') || monstersPageContent.includes('params[\'is_legendary\']'))

      expect(hasIsLegendaryInQueryBuilder).toBe(true)
    })
  })

  describe('UiFilterToggle Component', () => {
    it('should render UiFilterToggle for is_legendary filter', () => {
      // Look for UiFilterToggle with isLegendary v-model
      const hasIsLegendaryToggle = monstersPageContent.includes('UiFilterToggle') &&
        monstersPageContent.includes('v-model="isLegendary"')

      expect(hasIsLegendaryToggle).toBe(true)
    })

    it('should configure is_legendary toggle with correct label', () => {
      // Look for label="Legendary"
      const hasIsLegendaryLabel = monstersPageContent.includes('label="Legendary"')

      expect(hasIsLegendaryLabel).toBe(true)
    })

    it('should configure is_legendary toggle with error color (monster semantic)', () => {
      // Look for color="error" near isLegendary
      const hasIsLegendaryColor = monstersPageContent.includes('isLegendary') &&
        monstersPageContent.includes('color="error"')

      expect(hasIsLegendaryColor).toBe(true)
    })

    it('should configure is_legendary toggle with tri-state options', () => {
      // Look for options with null, '1', '0' values near isLegendary
      const hasIsLegendaryOptions = monstersPageContent.includes('isLegendary') &&
        monstersPageContent.includes('value: null') &&
        monstersPageContent.includes('value: \'1\'') &&
        monstersPageContent.includes('value: \'0\'')

      expect(hasIsLegendaryOptions).toBe(true)
    })
  })

  describe('Filter Chips', () => {
    it('should display filter chip when isLegendary is not null', () => {
      // Look for v-if="isLegendary !== null" with UButton
      const hasIsLegendaryChip = monstersPageContent.includes('v-if="isLegendary !== null"') &&
        monstersPageContent.includes('UButton')

      expect(hasIsLegendaryChip).toBe(true)
    })

    it('should display "Legendary: Yes" or "No" in chip text', () => {
      // Look for conditional display of Yes/No based on isLegendary value
      const hasIsLegendaryChipText = monstersPageContent.includes('Legendary') &&
        monstersPageContent.includes('isLegendary === \'1\'') &&
        (monstersPageContent.includes('Yes') || monstersPageContent.includes('No'))

      expect(hasIsLegendaryChipText).toBe(true)
    })

    it('should remove isLegendary filter when chip is clicked', () => {
      // Look for @click handler that sets isLegendary to null
      const hasIsLegendaryChipRemove = monstersPageContent.includes('@click="isLegendary = null"')

      expect(hasIsLegendaryChipRemove).toBe(true)
    })

    it('should use error color for isLegendary chip', () => {
      // Look for color="error" near isLegendary chip
      const hasIsLegendaryChipColor = monstersPageContent.includes('isLegendary') &&
        monstersPageContent.includes('color="error"')

      expect(hasIsLegendaryChipColor).toBe(true)
    })
  })

  describe('Clear Filters Integration', () => {
    it('should reset isLegendary in clearFilters function', () => {
      // Look for isLegendary.value = null in clearFilters
      const hasClearIsLegendary = monstersPageContent.includes('clearFilters') &&
        monstersPageContent.includes('isLegendary.value = null')

      expect(hasClearIsLegendary).toBe(true)
    })

    it('should include isLegendary in Clear Filters button condition', () => {
      // Look for isLegendary in hasActiveFilters or v-if for Clear Filters button
      const hasIsLegendaryInClearCondition = monstersPageContent.includes('isLegendary') &&
        (monstersPageContent.includes('hasActiveFilters') || monstersPageContent.includes('Clear Filters'))

      expect(hasIsLegendaryInClearCondition).toBe(true)
    })
  })
})
