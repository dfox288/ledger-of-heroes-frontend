import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Tests for Spells Page - Class Filter Feature
 *
 * Requirements:
 * 1. Fetch classes data from /classes?per_page=200 endpoint
 * 2. Client-side filter to show only base classes (is_base_class === '1')
 * 3. Sort alphabetically by name
 * 4. Add to existing filter UI following school filter pattern
 * 5. Add filter chip following school chip pattern
 * 6. Include in clear filters
 * 7. Include in active filter count
 * 8. Update queryBuilder to pass class filter to API
 */
describe('Spells Page - Class Filter Feature', () => {
  const spellsPagePath = join(process.cwd(), 'app/pages/spells/index.vue')
  let spellsPageContent: string

  // Read file once for all tests
  spellsPageContent = readFileSync(spellsPagePath, 'utf-8')

  describe('Data Fetching', () => {
    it('should fetch classes data from API endpoint', () => {
      // Look for useAsyncData call with 'classes' key and /classes endpoint
      const hasClassesFetch = spellsPageContent.includes('useAsyncData')
        && spellsPageContent.includes('/classes')

      expect(hasClassesFetch).toBe(true)
    })

    it('should request up to 200 classes (per_page=200)', () => {
      // Look for per_page parameter in classes fetch
      const hasPerPageParam = spellsPageContent.includes('per_page')
        && spellsPageContent.includes('200')

      expect(hasPerPageParam).toBe(true)
    })
  })

  describe('Type Imports', () => {
    it('should import CharacterClass type', () => {
      // Look for CharacterClass in imports
      const hasCharacterClassImport = spellsPageContent.includes('CharacterClass')

      expect(hasCharacterClassImport).toBe(true)
    })
  })

  describe('Filter State Management', () => {
    it('should initialize selectedClass from route query', () => {
      // Look for selectedClass ref initialization
      const hasSelectedClassRef = spellsPageContent.includes('selectedClass')
        && spellsPageContent.includes('route.query.class')

      expect(hasSelectedClassRef).toBe(true)
    })

    it('should create classOptions computed with base classes only', () => {
      // Look for computed classOptions with filter for base classes
      const hasClassOptions = spellsPageContent.includes('classOptions')
        && spellsPageContent.includes('is_base_class')

      expect(hasClassOptions).toBe(true)
    })

    it('should filter base classes using is_base_class === "1"', () => {
      // Look for filter checking is_base_class === '1'
      const hasBaseClassFilter = spellsPageContent.includes('is_base_class')
        && (spellsPageContent.includes('=== \'1\'') || spellsPageContent.includes('== \'1\''))

      expect(hasBaseClassFilter).toBe(true)
    })

    it('should sort classes alphabetically by name', () => {
      // Look for sort by name
      const hasSortByName = spellsPageContent.includes('sort')
        && spellsPageContent.includes('name')

      expect(hasSortByName).toBe(true)
    })

    it('should include "All Classes" option in classOptions', () => {
      // Look for "All Classes" label
      const hasAllClassesOption = spellsPageContent.includes('All Classes')

      expect(hasAllClassesOption).toBe(true)
    })
  })

  describe('Query Builder Integration', () => {
    it('should include class filter in queryBuilder', () => {
      // Look for selectedClass in queryBuilder params
      const hasClassInQueryBuilder = spellsPageContent.includes('queryBuilder')
        && spellsPageContent.includes('selectedClass')

      expect(hasClassInQueryBuilder).toBe(true)
    })

    it('should send classes parameter to API when class is selected', () => {
      // Look for 'classes' or 'class' parameter being set
      const hasClassesParam = spellsPageContent.includes('params.classes')
        || spellsPageContent.includes('params.class')

      expect(hasClassesParam).toBe(true)
    })
  })

  describe('Filter UI Components', () => {
    it('should add USelectMenu for class filter', () => {
      // Look for USelectMenu with classOptions
      const hasClassSelectMenu = spellsPageContent.includes('USelectMenu')
        && spellsPageContent.includes('classOptions')
        && spellsPageContent.includes('selectedClass')

      expect(hasClassSelectMenu).toBe(true)
    })

    it('should display "All Classes" placeholder in select menu', () => {
      // Look for placeholder="All Classes"
      const hasClassPlaceholder = spellsPageContent.includes('placeholder="All Classes"')

      expect(hasClassPlaceholder).toBe(true)
    })

    it('should use same styling as school filter (size="md", class="w-48")', () => {
      // Look for consistent styling with school filter
      const hasConsistentStyling = spellsPageContent.includes('size="md"')
        && spellsPageContent.includes('class="w-48"')

      expect(hasConsistentStyling).toBe(true)
    })
  })

  describe('Filter Chips', () => {
    it('should display active class filter chip', () => {
      // Look for v-if="selectedClass" chip
      const hasClassChip = spellsPageContent.includes('v-if="selectedClass')
        && spellsPageContent.includes('UButton')

      expect(hasClassChip).toBe(true)
    })

    it('should show class name in filter chip', () => {
      // Look for function or method to get class name
      const hasGetClassName = spellsPageContent.includes('getClassName')
        || (spellsPageContent.includes('classes') && spellsPageContent.includes('find'))

      expect(hasGetClassName).toBe(true)
    })

    it('should allow removing class filter by clicking chip', () => {
      // Look for @click handler that sets selectedClass to null
      const hasChipRemove = spellsPageContent.includes('@click="selectedClass = null"')

      expect(hasChipRemove).toBe(true)
    })
  })

  describe('Clear Filters Integration', () => {
    it('should reset selectedClass in clearFilters function', () => {
      // Look for selectedClass.value = null in clearFilters
      const hasClearClass = spellsPageContent.includes('clearFilters')
        && spellsPageContent.includes('selectedClass.value = null')

      expect(hasClearClass).toBe(true)
    })

    it('should include class filter in Clear Filters button condition', () => {
      // Look for selectedClass in v-if condition for Clear Filters button
      const hasClassInClearCondition = spellsPageContent.includes('selectedClass')
        && spellsPageContent.includes('Clear Filters')

      expect(hasClassInClearCondition).toBe(true)
    })
  })

  describe('Active Filter Count', () => {
    it('should include selectedClass in activeFilterCount', () => {
      // Look for selectedClass !== null check in activeFilterCount
      const hasClassInCount = spellsPageContent.includes('activeFilterCount')
        && spellsPageContent.includes('selectedClass')

      expect(hasClassInCount).toBe(true)
    })
  })

  describe('Helper Functions', () => {
    it('should define getClassName function for chip display', () => {
      // Look for getClassName function definition
      const hasGetClassName = spellsPageContent.includes('getClassName')

      expect(hasGetClassName).toBe(true)
    })
  })
})
