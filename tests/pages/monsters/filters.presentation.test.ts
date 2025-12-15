/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Monsters Page - Filter Presentation Tests (Consolidated)
 * Consolidation: 6 files → 3 files
 * GitHub Issue: #323
 *
 * Merged from:
 * - filters.layout.test.ts
 * - filter-chips.test.ts
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import MonstersPage from '~/pages/monsters/index.vue'
import { useMonsterFiltersStore } from '~/stores/monsterFilters'

describe('Monsters Page - Filter Presentation', () => {
  // Reset Pinia store before each test to ensure clean state
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Layout improvements', () => {
    it('displays "Active filters:" label (not "Active:")', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      // Apply a filter to show chips
      store.selectedType = 'dragon'
      await wrapper.vm.$nextTick()

      // Look for the label
      const text = wrapper.text()
      expect(text).toContain('Active filters:')
      expect(text).not.toContain('Active:')
    })

    it('positions Clear filters button on same row as Active filters', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      // Apply filters
      store.$patch({
        selectedType: 'dragon',
        filtersOpen: true
      })
      await wrapper.vm.$nextTick()

      // Find the chips container
      const chipsRow = wrapper.find('.flex.flex-wrap.items-center.justify-between')
      expect(chipsRow.exists()).toBe(true)

      // Check structure: left side has label + chips, right side has button
      const buttons = chipsRow.findAll('button')
      const clearButton = buttons.find(btn => btn.text().includes('Clear filters'))
      expect(clearButton?.exists()).toBe(true)
    })

    it('shows Clear filters button only when filters are active', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      // No filters active initially
      const clearButton = wrapper.find('button:contains("Clear filters")')
      expect(clearButton.exists()).toBe(false)

      // Apply a filter
      store.selectedType = 'dragon'
      await wrapper.vm.$nextTick()

      // Button should appear
      const buttons = wrapper.findAll('button')
      const clearButtons = buttons.filter(btn => btn.text().includes('Clear filters'))
      expect(clearButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Filter integration', () => {
    it('clears all filters including CRs', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      // Set multiple filters
      store.$patch({
        selectedCRs: ['0', '5'],
        selectedType: 'dragon',
        isLegendary: '1'
      })
      await wrapper.vm.$nextTick()

      // Clear all filters
      store.clearAll()

      // All should be cleared - no nextTick needed for store values
      expect(store.selectedCRs).toEqual([])
      expect(store.selectedType).toBeNull()
      expect(store.isLegendary).toBeNull()
    })

    it('counts CR multiselect in active filter count', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()
      const component = wrapper.vm as any

      // Clear filters to ensure clean state (store may have persisted data)
      store.clearAll()

      // Initially 0 - no nextTick needed after clearAll for count check
      expect(component.activeFilterCount).toBe(0)

      // Add CR filter (each CR value counts as 1)
      // Add type filter - batch with $patch
      store.$patch({
        selectedCRs: ['0', '5', '17'],
        selectedType: 'dragon'
      })
      await wrapper.vm.$nextTick()

      // 3 CRs + 1 type = 4
      expect(component.activeFilterCount).toBe(4)
    })
  })

  describe('Alignment Filter Chips', () => {
    it('shows chip with selected alignment labels', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      // Select multiple alignments
      store.selectedAlignments = ['Lawful Good', 'Chaotic Evil', 'Neutral']
      await wrapper.vm.$nextTick()

      // Look for chip
      const chip = wrapper.find('[data-testid="alignment-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Alignments')
      expect(chip.text()).toContain('Lawful Good')
      expect(chip.text()).toContain('Chaotic Evil')
      expect(chip.text()).toContain('Neutral')
    })

    it('shows single alignment without plural', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      // Select single alignment
      store.selectedAlignments = ['Lawful Good']
      await wrapper.vm.$nextTick()

      // Look for chip
      const chip = wrapper.find('[data-testid="alignment-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Alignment')
      expect(chip.text()).not.toContain('Alignments')
      expect(chip.text()).toContain('Lawful Good')
    })

    it('clicking chip clears alignment filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      // Select alignments
      store.selectedAlignments = ['Lawful Good', 'Chaotic Evil']
      await wrapper.vm.$nextTick()

      // Click chip
      const chip = wrapper.find('[data-testid="alignment-filter-chip"]')
      await chip.trigger('click')

      // Alignments should be cleared
      expect(store.selectedAlignments).toEqual([])
    })

    it('does not show chip when no alignments selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedAlignments = []
      await wrapper.vm.$nextTick()

      // Chip should not exist
      const chip = wrapper.find('[data-testid="alignment-filter-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })

  describe('Movement Types Filter Chip', () => {
    it('shows movement types chip with selected types', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedMovementTypes = ['fly', 'swim']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="movement-types-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Movement')
      expect(chip.text()).toContain('Fly')
      expect(chip.text()).toContain('Swim')
    })

    it('shows single movement type', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedMovementTypes = ['burrow']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="movement-types-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Movement')
      expect(chip.text()).toContain('Burrow')
    })

    it('shows multiple movement types sorted', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedMovementTypes = ['swim', 'climb', 'fly']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="movement-types-chip"]')
      expect(chip.exists()).toBe(true)
      // Should be sorted alphabetically
      const text = chip.text()
      expect(text).toContain('Climb')
      expect(text).toContain('Fly')
      expect(text).toContain('Swim')
    })

    it('clicking chip clears movement types filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedMovementTypes = ['fly', 'swim']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="movement-types-chip"]')
      await chip.trigger('click')

      expect(store.selectedMovementTypes).toEqual([])
    })

    it('does not show chip when no movement types selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedMovementTypes = []
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="movement-types-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })

  describe('Alignment and Movement Integration', () => {
    it('shows both alignment and movement chips when active', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.$patch({
        selectedAlignments: ['Lawful Good', 'Chaotic Evil'],
        selectedMovementTypes: ['fly', 'swim']
      })
      await wrapper.vm.$nextTick()

      // Both chips should exist
      expect(wrapper.find('[data-testid="alignment-filter-chip"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="movement-types-chip"]').exists()).toBe(true)
    })

    it('clears all filters via clearAll()', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.$patch({
        selectedAlignments: ['Lawful Good'],
        selectedMovementTypes: ['fly', 'burrow', 'climb']
      })
      await wrapper.vm.$nextTick()

      // Clear all
      store.clearAll()

      // All should be cleared
      expect(store.selectedAlignments).toEqual([])
      expect(store.selectedMovementTypes).toEqual([])
    })
  })
})
