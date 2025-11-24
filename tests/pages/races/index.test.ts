import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Tests for Races Page - has_darkvision Filter
 *
 * Requirements:
 * 1. Add has_darkvision tri-state filter (All/Yes/No)
 * 2. Filter uses UiFilterToggle component
 * 3. Filter initialized from route.query.has_darkvision
 * 4. Filter included in queryBuilder
 * 5. Filter has chip with remove functionality
 * 6. Filter included in clearFilters function
 * 7. Clear Filters button condition includes filter
 */
describe('Races Page - has_darkvision Filter', () => {
  const racesPagePath = join(process.cwd(), 'app/pages/races/index.vue')

  // Read file once for all tests
  const racesPageContent = readFileSync(racesPagePath, 'utf-8')

  describe('Filter State Management', () => {
    it('should initialize hasDarkvision from route query', () => {
      const hasDarkvisionRef = racesPageContent.includes('hasDarkvision')
        && racesPageContent.includes('route.query.has_darkvision')

      expect(hasDarkvisionRef).toBe(true)
    })

    it('should initialize hasDarkvision as string | null type', () => {
      const hasDarkvisionType = racesPageContent.includes('hasDarkvision')
        && (racesPageContent.includes('as string') || racesPageContent.includes('string | null'))

      expect(hasDarkvisionType).toBe(true)
    })
  })

  describe('Query Builder Integration', () => {
    it('should include has_darkvision in queryBuilder when hasDarkvision is not null', () => {
      const hasDarkvisionInQueryBuilder = racesPageContent.includes('queryBuilder')
        && racesPageContent.includes('hasDarkvision')
        && (racesPageContent.includes('params.has_darkvision') || racesPageContent.includes('params[\'has_darkvision\']'))

      expect(hasDarkvisionInQueryBuilder).toBe(true)
    })
  })

  describe('UiFilterToggle Component', () => {
    it('should render UiFilterToggle for has_darkvision filter', () => {
      const hasDarkvisionToggle = racesPageContent.includes('UiFilterToggle')
        && racesPageContent.includes('v-model="hasDarkvision"')

      expect(hasDarkvisionToggle).toBe(true)
    })

    it('should configure has_darkvision toggle with correct label', () => {
      const hasDarkvisionLabel = racesPageContent.includes('label="Has Darkvision"')

      expect(hasDarkvisionLabel).toBe(true)
    })

    it('should configure has_darkvision toggle with primary color (unified filter color)', () => {
      const hasDarkvisionColor = racesPageContent.includes('hasDarkvision')
        && racesPageContent.includes('color="primary"')

      expect(hasDarkvisionColor).toBe(true)
    })

    it('should configure has_darkvision toggle with tri-state options', () => {
      const hasDarkvisionOptions = racesPageContent.includes('hasDarkvision')
        && racesPageContent.includes('value: null')
        && racesPageContent.includes('value: \'1\'')
        && racesPageContent.includes('value: \'0\'')

      expect(hasDarkvisionOptions).toBe(true)
    })
  })

  describe('Filter Chips', () => {
    it('should display filter chip when hasDarkvision is not null', () => {
      const hasDarkvisionChip = racesPageContent.includes('v-if="hasDarkvision !== null"')
        && racesPageContent.includes('UButton')

      expect(hasDarkvisionChip).toBe(true)
    })

    it('should display "Has Darkvision: Yes" or "No" in chip text', () => {
      const hasDarkvisionChipText = racesPageContent.includes('Has Darkvision')
        && racesPageContent.includes('hasDarkvision === \'1\'')
        && (racesPageContent.includes('Yes') || racesPageContent.includes('No'))

      expect(hasDarkvisionChipText).toBe(true)
    })

    it('should remove hasDarkvision filter when chip is clicked', () => {
      const hasDarkvisionChipRemove = racesPageContent.includes('@click="hasDarkvision = null"')

      expect(hasDarkvisionChipRemove).toBe(true)
    })

    it('should use primary color for hasDarkvision chip', () => {
      const hasDarkvisionChipColor = racesPageContent.includes('hasDarkvision')
        && racesPageContent.includes('color="primary"')

      expect(hasDarkvisionChipColor).toBe(true)
    })
  })

  describe('Clear Filters Integration', () => {
    it('should reset hasDarkvision in clearFilters function', () => {
      const hasClearDarkvision = racesPageContent.includes('clearFilters')
        && racesPageContent.includes('hasDarkvision.value = null')

      expect(hasClearDarkvision).toBe(true)
    })

    it('should include hasDarkvision in Clear Filters button condition', () => {
      const hasDarkvisionInClearCondition = racesPageContent.includes('hasDarkvision')
        && (racesPageContent.includes('hasActiveFilters') || racesPageContent.includes('Clear Filters'))

      expect(hasDarkvisionInClearCondition).toBe(true)
    })
  })
})
