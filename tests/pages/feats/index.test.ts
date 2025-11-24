import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Tests for Feats Page - has_prerequisites Filter
 *
 * Requirements:
 * 1. Add has_prerequisites tri-state filter (All/Yes/No)
 * 2. Filter uses UiFilterToggle component
 * 3. Filter initialized from route.query
 * 4. Filter included in queryBuilder
 * 5. Filter has chip with remove functionality
 * 6. Filter included in clearFilters function
 * 7. Clear Filters button condition includes filter
 */
describe('Feats Page - has_prerequisites Filter', () => {
  const featsPagePath = join(process.cwd(), 'app/pages/feats/index.vue')

  // Read file once for all tests
  const featsPageContent = readFileSync(featsPagePath, 'utf-8')

  describe('Filter State Management', () => {
    it('should import ref from vue', () => {
      // Look for ref import
      const hasRefImport = featsPageContent.includes('import')
        && featsPageContent.includes('ref')
        && featsPageContent.includes('from \'vue\'')

      expect(hasRefImport).toBe(true)
    })

    it('should import useRoute', () => {
      // Look for useRoute import or usage
      const hasUseRoute = featsPageContent.includes('useRoute')

      expect(hasUseRoute).toBe(true)
    })

    it('should initialize hasPrerequisites from route query', () => {
      // Look for hasPrerequisites ref initialization from route.query.has_prerequisites
      const hasPrerequisitesRef = featsPageContent.includes('hasPrerequisites')
        && featsPageContent.includes('route.query.has_prerequisites')

      expect(hasPrerequisitesRef).toBe(true)
    })

    it('should initialize hasPrerequisites as string | null type', () => {
      // Look for hasPrerequisites with type annotation or cast
      const hasPrerequisitesType = featsPageContent.includes('hasPrerequisites')
        && (featsPageContent.includes('as string') || featsPageContent.includes('string | null'))

      expect(hasPrerequisitesType).toBe(true)
    })
  })

  describe('Query Builder Integration', () => {
    it('should replace empty queryBuilder with conditional params', () => {
      // Ensure queryBuilder is not just an empty object
      const notEmptyQueryBuilder = !featsPageContent.includes('queryBuilder: computed(() => ({}))')

      expect(notEmptyQueryBuilder).toBe(true)
    })

    it('should include has_prerequisites in queryBuilder when hasPrerequisites is not null', () => {
      // Look for hasPrerequisites in queryBuilder params
      const hasPrerequisitesInQueryBuilder = featsPageContent.includes('queryBuilder')
        && featsPageContent.includes('hasPrerequisites')
        && (featsPageContent.includes('params.has_prerequisites') || featsPageContent.includes('params[\'has_prerequisites\']'))

      expect(hasPrerequisitesInQueryBuilder).toBe(true)
    })
  })

  describe('UiFilterToggle Component', () => {
    it('should render UiFilterToggle for has_prerequisites filter', () => {
      // Look for UiFilterToggle with hasPrerequisites v-model
      const hasPrerequisitesToggle = featsPageContent.includes('UiFilterToggle')
        && featsPageContent.includes('v-model="hasPrerequisites"')

      expect(hasPrerequisitesToggle).toBe(true)
    })

    it('should configure has_prerequisites toggle with correct label', () => {
      // Look for label="Has Prerequisites"
      const hasPrerequisitesLabel = featsPageContent.includes('label="Has Prerequisites"')

      expect(hasPrerequisitesLabel).toBe(true)
    })

    it('should configure has_prerequisites toggle with primary color', () => {
      // Look for color="primary" (unified filter color)
      const hasPrerequisitesColor = featsPageContent.includes('hasPrerequisites')
        && featsPageContent.includes('color="primary"')

      expect(hasPrerequisitesColor).toBe(true)
    })

    it('should configure has_prerequisites toggle with tri-state options', () => {
      // Look for options with null, '1', '0' values
      const hasPrerequisitesOptions = featsPageContent.includes('hasPrerequisites')
        && featsPageContent.includes('value: null')
        && featsPageContent.includes('value: \'1\'')
        && featsPageContent.includes('value: \'0\'')

      expect(hasPrerequisitesOptions).toBe(true)
    })

    it('should have All/Yes/No labels in options', () => {
      // Look for the three option labels
      const hasLabels = featsPageContent.includes('label: \'All\'')
        && featsPageContent.includes('label: \'Yes\'')
        && featsPageContent.includes('label: \'No\'')

      expect(hasLabels).toBe(true)
    })
  })

  describe('Filter Chip', () => {
    it('should display filter chip when hasPrerequisites is not null', () => {
      // Look for v-if="hasPrerequisites !== null" with UButton
      const hasPrerequisitesChip = featsPageContent.includes('v-if="hasPrerequisites !== null"')
        && featsPageContent.includes('UButton')

      expect(hasPrerequisitesChip).toBe(true)
    })

    it('should display "Has Prerequisites: Yes" or "No" in chip text', () => {
      // Look for conditional display of Yes/No based on hasPrerequisites value
      const hasPrerequisitesChipText = featsPageContent.includes('Has Prerequisites')
        && featsPageContent.includes('hasPrerequisites === \'1\'')
        && (featsPageContent.includes('Yes') || featsPageContent.includes('No'))

      expect(hasPrerequisitesChipText).toBe(true)
    })

    it('should remove hasPrerequisites filter when chip is clicked', () => {
      // Look for @click handler that sets hasPrerequisites to null
      const hasPrerequisitesChipRemove = featsPageContent.includes('@click="hasPrerequisites = null"')

      expect(hasPrerequisitesChipRemove).toBe(true)
    })

    it('should use primary color for hasPrerequisites chip', () => {
      // Look for color="primary" in chip (unified filter color)
      const hasPrerequisitesChipColor = featsPageContent.includes('hasPrerequisites')
        && featsPageContent.includes('color="primary"')

      expect(hasPrerequisitesChipColor).toBe(true)
    })

    it('should use xs size for chip', () => {
      // Look for size="xs" in filter chips section
      const hasChipSize = featsPageContent.includes('hasPrerequisites')
        && featsPageContent.includes('size="xs"')

      expect(hasChipSize).toBe(true)
    })

    it('should use soft variant for chip', () => {
      // Look for variant="soft" in filter chips section
      const hasChipVariant = featsPageContent.includes('hasPrerequisites')
        && featsPageContent.includes('variant="soft"')

      expect(hasChipVariant).toBe(true)
    })
  })

  describe('Clear Filters Integration', () => {
    it('should have custom clearFilters function', () => {
      // Should override composable's clearFilters
      const hasCustomClearFilters = featsPageContent.includes('clearFilters: clearBaseFilters')
        || (featsPageContent.includes('const clearFilters') && featsPageContent.includes('clearBaseFilters()'))

      expect(hasCustomClearFilters).toBe(true)
    })

    it('should reset hasPrerequisites in clearFilters function', () => {
      // Look for hasPrerequisites.value = null in clearFilters
      const hasClearPrerequisites = featsPageContent.includes('clearFilters')
        && featsPageContent.includes('hasPrerequisites.value = null')

      expect(hasClearPrerequisites).toBe(true)
    })

    it('should include hasPrerequisites in Clear Filters button condition', () => {
      // Look for hasPrerequisites !== null in v-if for Clear Filters button
      const hasPrerequisitesInClearCondition = featsPageContent.includes('hasPrerequisites !== null')
        && featsPageContent.includes('Clear Filters')

      expect(hasPrerequisitesInClearCondition).toBe(true)
    })

    it('should show Clear Filters button when hasPrerequisites is set', () => {
      // Verify button appears with filter active
      const hasClearButton = featsPageContent.includes('v-if')
        && featsPageContent.includes('hasPrerequisites')
        && featsPageContent.includes('Clear Filters')

      expect(hasClearButton).toBe(true)
    })
  })

  describe('Filter Placement', () => {
    it('should place filter toggle after search input', () => {
      // Filter should appear between search and results
      const searchIndex = featsPageContent.indexOf('Search feats')
      const filterIndex = featsPageContent.indexOf('UiFilterToggle')
      const resultsIndex = featsPageContent.indexOf('UiListSkeletonCards')

      expect(searchIndex).toBeGreaterThan(-1)
      expect(filterIndex).toBeGreaterThan(searchIndex)
      expect(resultsIndex).toBeGreaterThan(filterIndex)
    })

    it('should place filter chips in dedicated section', () => {
      // Filter chips should be in a separate section with "Active:" label
      const hasActiveSection = featsPageContent.includes('Active:')
        || (featsPageContent.includes('hasActiveFilters') && featsPageContent.includes('hasPrerequisites'))

      expect(hasActiveSection).toBe(true)
    })
  })
})
