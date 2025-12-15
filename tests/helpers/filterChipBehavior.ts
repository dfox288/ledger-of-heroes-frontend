import { describe, it, expect } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'

/**
 * Filter Chip Behavior Test Generators
 *
 * These helpers generate repetitive test suites for filter chip components
 * in list pages. They encode common patterns for chip display and removal.
 *
 * Usage:
 * ```typescript
 * import { testFilterChipBehavior } from '#tests/helpers/filterChipBehavior'
 *
 * describe('Monsters Page Filters', () => {
 *   testFilterChipBehavior({
 *     name: 'Alignment',
 *     mountPage: () => mountSuspended(MonstersPage),
 *     testId: 'alignment-filter-chip',
 *     storeField: 'selectedAlignments',
 *     singleValue: ['Lawful Good'],
 *     multipleValues: ['Lawful Good', 'Chaotic Evil', 'Neutral'],
 *     expectedSingleText: 'Alignment',
 *     expectedMultipleText: 'Alignments'
 *   })
 * })
 * ```
 *
 * Benefits:
 * - Reduces ~20 lines per chip test to ~10 lines of config
 * - Ensures consistent chip testing across all pages
 * - Covers common patterns: display, clear, singular/plural
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for a filter chip test suite
 */
export interface FilterChipTestConfig {
  /** Human-readable name for the filter (e.g., 'Alignment', 'Movement Types') */
  name: string
  /** Factory function that mounts the page component */
  mountPage: () => Promise<VueWrapper>
  /** data-testid attribute of the chip element */
  testId: string
  /** Store/component field name that holds the filter value */
  storeField: string
  /** Single value to test singular display */
  singleValue: unknown[]
  /** Multiple values to test plural display */
  multipleValues: unknown[]
  /** Expected chip text for single value (e.g., 'Alignment') */
  expectedSingleText: string
  /** Expected chip text for multiple values (e.g., 'Alignments') */
  expectedMultipleText: string
  /** Optional: expected display values in chip text */
  expectedDisplayValues?: string[]
}

/**
 * Simplified configuration for basic chip tests
 */
export interface BasicChipTestConfig {
  /** Human-readable name for the filter */
  name: string
  /** Factory function that mounts the page component */
  mountPage: () => Promise<VueWrapper>
  /** data-testid attribute of the chip element */
  testId: string
  /** Store/component field name that holds the filter value */
  storeField: string
  /** Value to set for showing chip */
  activeValue: unknown
  /** Value after clearing (usually [] or null) */
  clearedValue: unknown
}

// ============================================================================
// Test Generators
// ============================================================================

/**
 * Generates a complete filter chip test suite.
 *
 * Tests:
 * - Chip displays with correct text for single value
 * - Chip displays with correct text for multiple values
 * - Clicking chip clears the filter
 * - Chip is hidden when no values selected
 *
 * @param config - Test configuration
 *
 * @example
 * testFilterChipBehavior({
 *   name: 'Alignment',
 *   mountPage: () => mountSuspended(MonstersPage),
 *   testId: 'alignment-filter-chip',
 *   storeField: 'selectedAlignments',
 *   singleValue: ['Lawful Good'],
 *   multipleValues: ['Lawful Good', 'Chaotic Evil'],
 *   expectedSingleText: 'Alignment',
 *   expectedMultipleText: 'Alignments'
 * })
 */
export function testFilterChipBehavior(config: FilterChipTestConfig): void {
  const {
    name,
    mountPage,
    testId,
    storeField,
    singleValue,
    multipleValues,
    expectedSingleText,
    expectedMultipleText,
    expectedDisplayValues
  } = config

  describe(`${name} Filter Chip`, () => {
    it(`shows chip with ${expectedSingleText} for single value`, async () => {
      const wrapper = await mountPage()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const component = wrapper.vm as any
      component[storeField] = singleValue
      await wrapper.vm.$nextTick()

      const chip = wrapper.find(`[data-testid="${testId}"]`)
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain(expectedSingleText)
    })

    it(`shows chip with ${expectedMultipleText} for multiple values`, async () => {
      const wrapper = await mountPage()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const component = wrapper.vm as any
      component[storeField] = multipleValues
      await wrapper.vm.$nextTick()

      const chip = wrapper.find(`[data-testid="${testId}"]`)
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain(expectedMultipleText)

      // Verify display values if provided
      if (expectedDisplayValues) {
        for (const value of expectedDisplayValues) {
          expect(chip.text()).toContain(value)
        }
      }
    })

    it('clicking chip clears the filter', async () => {
      const wrapper = await mountPage()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const component = wrapper.vm as any
      component[storeField] = multipleValues
      await wrapper.vm.$nextTick()

      const chip = wrapper.find(`[data-testid="${testId}"]`)
      await chip.trigger('click')

      expect(component[storeField]).toEqual([])
    })

    it('does not show chip when no values selected', async () => {
      const wrapper = await mountPage()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const component = wrapper.vm as any
      component[storeField] = []
      await wrapper.vm.$nextTick()

      const chip = wrapper.find(`[data-testid="${testId}"]`)
      expect(chip.exists()).toBe(false)
    })
  })
}

/**
 * Generates basic chip visibility and clear tests.
 *
 * Simpler version for chips that don't need singular/plural testing.
 *
 * @param config - Test configuration
 *
 * @example
 * testBasicChipBehavior({
 *   name: 'Magic',
 *   mountPage: () => mountSuspended(ItemsPage),
 *   testId: 'magic-filter-chip',
 *   storeField: 'selectedMagic',
 *   activeValue: 'true',
 *   clearedValue: null
 * })
 */
export function testBasicChipBehavior(config: BasicChipTestConfig): void {
  const {
    name,
    mountPage,
    testId,
    storeField,
    activeValue,
    clearedValue
  } = config

  describe(`${name} Filter Chip`, () => {
    it('shows chip when filter is active', async () => {
      const wrapper = await mountPage()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const component = wrapper.vm as any
      component[storeField] = activeValue
      await wrapper.vm.$nextTick()

      const chip = wrapper.find(`[data-testid="${testId}"]`)
      expect(chip.exists()).toBe(true)
    })

    it('clicking chip clears the filter', async () => {
      const wrapper = await mountPage()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const component = wrapper.vm as any
      component[storeField] = activeValue
      await wrapper.vm.$nextTick()

      const chip = wrapper.find(`[data-testid="${testId}"]`)
      await chip.trigger('click')

      expect(component[storeField]).toEqual(clearedValue)
    })

    it('does not show chip when filter is inactive', async () => {
      const wrapper = await mountPage()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const component = wrapper.vm as any
      component[storeField] = clearedValue
      await wrapper.vm.$nextTick()

      const chip = wrapper.find(`[data-testid="${testId}"]`)
      expect(chip.exists()).toBe(false)
    })
  })
}

/**
 * Tests that multiple filter chips can be displayed simultaneously.
 *
 * @param mountPage - Factory function that mounts the page
 * @param chips - Array of chip configurations to test together
 *
 * @example
 * testMultipleChipsDisplay(
 *   () => mountSuspended(MonstersPage),
 *   [
 *     { testId: 'alignment-filter-chip', storeField: 'selectedAlignments', value: ['Lawful Good'] },
 *     { testId: 'movement-types-chip', storeField: 'selectedMovementTypes', value: ['fly'] }
 *   ]
 * )
 */
export function testMultipleChipsDisplay(
  mountPage: () => Promise<VueWrapper>,
  chips: Array<{ testId: string, storeField: string, value: unknown }>
): void {
  describe('Multiple Filter Chips', () => {
    it('shows all active filter chips simultaneously', async () => {
      const wrapper = await mountPage()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const component = wrapper.vm as any

      // Set all chip values
      for (const chip of chips) {
        component[chip.storeField] = chip.value
      }
      await wrapper.vm.$nextTick()

      // Verify all chips are displayed
      for (const chip of chips) {
        const chipEl = wrapper.find(`[data-testid="${chip.testId}"]`)
        expect(chipEl.exists()).toBe(true)
      }
    })
  })
}
