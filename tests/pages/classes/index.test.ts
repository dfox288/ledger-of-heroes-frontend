import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Tests for Classes Page - is_base_class and is_spellcaster Filters
 *
 * Requirements:
 * 1. Add is_base_class tri-state filter (All/Yes/No)
 * 2. Add is_spellcaster tri-state filter (All/Yes/No)
 * 3. Both filters use UiFilterToggle component
 * 4. Both filters initialized from route.query
 * 5. Both filters included in queryBuilder
 * 6. Both filters have filter chips with remove functionality
 * 7. Both filters included in clearFilters function
 * 8. Clear Filters button added and includes both filters
 * 9. Active filter chips section added
 */
describe('Classes Page - Filter Integration', () => {
  const classesPagePath = join(process.cwd(), 'app/pages/classes/index.vue')

  // Read file once for all tests
  const classesPageContent = readFileSync(classesPagePath, 'utf-8')

  describe('is_base_class filter', () => {
    it('should initialize isBaseClass from route query', () => {
      const hasIsBaseClassRef = classesPageContent.includes('isBaseClass')
        && classesPageContent.includes('route.query.is_base_class')

      expect(hasIsBaseClassRef).toBe(true)
    })

    it('should include is_base_class in queryBuilder', () => {
      const hasIsBaseClassInQueryBuilder = classesPageContent.includes('queryBuilder')
        && classesPageContent.includes('isBaseClass')
        && (classesPageContent.includes('params.is_base_class') || classesPageContent.includes('params[\'is_base_class\']'))

      expect(hasIsBaseClassInQueryBuilder).toBe(true)
    })

    it('should render UiFilterToggle with correct label', () => {
      const hasIsBaseClassToggle = classesPageContent.includes('UiFilterToggle')
        && classesPageContent.includes('v-model="isBaseClass"')
        && classesPageContent.includes('label="Base Class Only"')

      expect(hasIsBaseClassToggle).toBe(true)
    })

    it('should use primary color (unified filter color)', () => {
      const hasIsBaseClassColor = classesPageContent.includes('isBaseClass')
        && classesPageContent.includes('color="primary"')

      expect(hasIsBaseClassColor).toBe(true)
    })

    it('should have tri-state options', () => {
      const hasIsBaseClassOptions = classesPageContent.includes('isBaseClass')
        && classesPageContent.includes('value: null')
        && classesPageContent.includes('value: \'1\'')
        && classesPageContent.includes('value: \'0\'')

      expect(hasIsBaseClassOptions).toBe(true)
    })

    it('should display filter chip when active', () => {
      const hasIsBaseClassChip = classesPageContent.includes('v-if="isBaseClass !== null"')
        && classesPageContent.includes('Base Class Only')

      expect(hasIsBaseClassChip).toBe(true)
    })

    it('should remove filter via chip', () => {
      const hasIsBaseClassChipRemove = classesPageContent.includes('@click="isBaseClass = null"')

      expect(hasIsBaseClassChipRemove).toBe(true)
    })

    it('should be cleared by clearFilters', () => {
      const hasClearIsBaseClass = classesPageContent.includes('clearFilters')
        && classesPageContent.includes('isBaseClass.value = null')

      expect(hasClearIsBaseClass).toBe(true)
    })
  })

  describe('is_spellcaster filter', () => {
    it('should initialize isSpellcaster from route query', () => {
      const hasIsSpellcasterRef = classesPageContent.includes('isSpellcaster')
        && classesPageContent.includes('route.query.is_spellcaster')

      expect(hasIsSpellcasterRef).toBe(true)
    })

    it('should include is_spellcaster in queryBuilder', () => {
      const hasIsSpellcasterInQueryBuilder = classesPageContent.includes('queryBuilder')
        && classesPageContent.includes('isSpellcaster')
        && (classesPageContent.includes('params.is_spellcaster') || classesPageContent.includes('params[\'is_spellcaster\']'))

      expect(hasIsSpellcasterInQueryBuilder).toBe(true)
    })

    it('should render UiFilterToggle with correct label', () => {
      const hasIsSpellcasterToggle = classesPageContent.includes('UiFilterToggle')
        && classesPageContent.includes('v-model="isSpellcaster"')
        && classesPageContent.includes('label="Spellcaster"')

      expect(hasIsSpellcasterToggle).toBe(true)
    })

    it('should use primary color (unified filter color)', () => {
      const hasIsSpellcasterColor = classesPageContent.includes('isSpellcaster')
        && classesPageContent.includes('color="primary"')

      expect(hasIsSpellcasterColor).toBe(true)
    })

    it('should have tri-state options', () => {
      const hasIsSpellcasterOptions = classesPageContent.includes('isSpellcaster')
        && classesPageContent.includes('value: null')
        && classesPageContent.includes('value: \'1\'')
        && classesPageContent.includes('value: \'0\'')

      expect(hasIsSpellcasterOptions).toBe(true)
    })

    it('should display filter chip when active', () => {
      const hasIsSpellcasterChip = classesPageContent.includes('v-if="isSpellcaster !== null"')
        && classesPageContent.includes('Spellcaster')

      expect(hasIsSpellcasterChip).toBe(true)
    })

    it('should remove filter via chip', () => {
      const hasIsSpellcasterChipRemove = classesPageContent.includes('@click="isSpellcaster = null"')

      expect(hasIsSpellcasterChipRemove).toBe(true)
    })

    it('should be cleared by clearFilters', () => {
      const hasClearIsSpellcaster = classesPageContent.includes('clearFilters')
        && classesPageContent.includes('isSpellcaster.value = null')

      expect(hasClearIsSpellcaster).toBe(true)
    })
  })

  describe('Filter UI Structure', () => {
    it('should have Clear Filters button', () => {
      const hasClearFiltersButton = classesPageContent.includes('Clear Filters')
        && classesPageContent.includes('UButton')

      expect(hasClearFiltersButton).toBe(true)
    })

    it('should have Active Filter Chips section', () => {
      const hasActiveChipsSection = classesPageContent.includes('Active:')
        && classesPageContent.includes('hasActiveFilters')

      expect(hasActiveChipsSection).toBe(true)
    })

    it('should show search query chip when search is active', () => {
      const hasSearchChip = classesPageContent.includes('v-if="searchQuery"')
        && classesPageContent.includes('searchQuery = \'\'')

      expect(hasSearchChip).toBe(true)
    })
  })
})
