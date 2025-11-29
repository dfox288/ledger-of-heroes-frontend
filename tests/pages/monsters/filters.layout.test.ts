import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import MonstersPage from '~/pages/monsters/index.vue'
import { useMonsterFiltersStore } from '~/stores/monsterFilters'

describe('Monsters Page - Filter Layout & Structure', () => {
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
})
