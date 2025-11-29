import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ClassesPage from '~/pages/classes/index.vue'

describe('Classes Page - Filter Layout', () => {
  describe('filter chips layout', () => {
    it('displays active filters section with correct layout and labeling', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      // Batch mutations before single nextTick
      const component = wrapper.vm as any
      component.isBaseClass = '1'
      component.isSpellcaster = '1'
      await wrapper.vm.$nextTick()

      // Check "Active filters:" label
      const chipsSection = wrapper.find('.text-sm.font-medium')
      expect(chipsSection.exists()).toBe(true)
      expect(chipsSection.text()).toBe('Active filters:')
      expect(chipsSection.text()).not.toBe('Active:')

      // Check active filters row layout
      const activeFiltersRow = wrapper.find('[data-testid="active-filters-row"]')
      expect(activeFiltersRow.exists()).toBe(true)
      expect(activeFiltersRow.classes()).toContain('justify-between')

      // Check Clear filters button
      const clearButton = wrapper.find('[data-testid="clear-filters-button"]')
      expect(clearButton.exists()).toBe(true)
      expect(clearButton.text()).toContain('Clear filters')
    })

    it('shows Clear filters button only when filters are active', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      const component = wrapper.vm as any

      // Batch all clear operations before single nextTick
      component.isBaseClass = null
      component.isSpellcaster = null
      component.searchQuery = ''
      await wrapper.vm.$nextTick()

      // Button should not exist
      let clearButton = wrapper.find('[data-testid="clear-filters-button"]')
      expect(clearButton.exists()).toBe(false)

      // Add a filter
      component.isBaseClass = '1'
      await wrapper.vm.$nextTick()

      // Button should now exist
      clearButton = wrapper.find('[data-testid="clear-filters-button"]')
      expect(clearButton.exists()).toBe(true)
    })
  })

  describe('filter chips display and clearing', () => {
    it('shows filter chips and allows clearing individual and all filters', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      // Batch all filter mutations before single nextTick
      const component = wrapper.vm as any
      component.isBaseClass = '1'
      component.isSpellcaster = '0'
      component.searchQuery = 'Wizard'
      await wrapper.vm.$nextTick()

      // Check Base Class chip
      let baseClassChip = wrapper.find('[data-testid="is-base-class-filter-chip"]')
      expect(baseClassChip.exists()).toBe(true)
      expect(baseClassChip.text()).toContain('Base Class')
      expect(baseClassChip.text()).toContain('Yes')

      // Check Spellcaster chip
      const spellcasterChip = wrapper.find('[data-testid="is-spellcaster-filter-chip"]')
      expect(spellcasterChip.exists()).toBe(true)
      expect(spellcasterChip.text()).toContain('Spellcaster')
      expect(spellcasterChip.text()).toContain('No')

      // Check search query chip
      const searchChip = wrapper.find('[data-testid="search-query-chip"]')
      expect(searchChip.exists()).toBe(true)
      expect(searchChip.text()).toContain('Wizard')

      // Test clicking individual chip clears that filter
      await baseClassChip.trigger('click')
      expect(component.isBaseClass).toBe(null)

      // Reset filter to test Clear All button
      component.isBaseClass = '1'
      await wrapper.vm.$nextTick()

      // Test Clear filters button clears all filters
      const clearButton = wrapper.find('[data-testid="clear-filters-button"]')
      expect(clearButton.exists()).toBe(true)
      await clearButton.trigger('click')

      // All filters should be cleared
      expect(component.isBaseClass).toBe(null)
      expect(component.isSpellcaster).toBe(null)
      expect(component.searchQuery).toBe('')
    })
  })
})
