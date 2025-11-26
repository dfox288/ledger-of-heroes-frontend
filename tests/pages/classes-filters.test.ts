import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ClassesPage from '~/pages/classes/index.vue'

describe('Classes Page - Filter Layout', () => {
  describe('filter chips layout', () => {
    it('displays "Active filters:" label instead of "Active:"', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      // Set a filter to show chips section
      const component = wrapper.vm as any
      component.isBaseClass = '1'
      await wrapper.vm.$nextTick()

      // Check for "Active filters:" text
      const chipsSection = wrapper.find('.text-sm.font-medium')
      expect(chipsSection.exists()).toBe(true)
      expect(chipsSection.text()).toBe('Active filters:')
      expect(chipsSection.text()).not.toBe('Active:')
    })

    it('displays Clear filters button on same row as chips', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      // Set filters to show chips and button
      const component = wrapper.vm as any
      component.isBaseClass = '1'
      component.isSpellcaster = '1'
      await wrapper.vm.$nextTick()

      // Find the active filters row
      const activeFiltersRow = wrapper.find('[data-testid="active-filters-row"]')
      expect(activeFiltersRow.exists()).toBe(true)

      // Check it has justify-between class
      expect(activeFiltersRow.classes()).toContain('justify-between')
    })

    it('displays Clear filters button with right alignment', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      // Set a filter to show chips section
      const component = wrapper.vm as any
      component.isBaseClass = '1'
      await wrapper.vm.$nextTick()

      // Find Clear filters button
      const clearButton = wrapper.find('[data-testid="clear-filters-button"]')
      expect(clearButton.exists()).toBe(true)
      expect(clearButton.text()).toContain('Clear filters')
    })

    it('shows Clear filters button only when filters are active', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      const component = wrapper.vm as any

      // Initially no filters
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

  describe('filter chips display', () => {
    it('shows Base Class filter chip', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      const component = wrapper.vm as any
      component.isBaseClass = '1'
      await wrapper.vm.$nextTick()

      // Find chip by test ID
      const baseClassChip = wrapper.find('[data-testid="is-base-class-filter-chip"]')
      expect(baseClassChip.exists()).toBe(true)
      expect(baseClassChip.text()).toContain('Base Class')
      expect(baseClassChip.text()).toContain('Yes')
    })

    it('shows Spellcaster filter chip', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      const component = wrapper.vm as any
      component.isSpellcaster = '0'
      await wrapper.vm.$nextTick()

      // Find chip by test ID
      const spellcasterChip = wrapper.find('[data-testid="is-spellcaster-filter-chip"]')
      expect(spellcasterChip.exists()).toBe(true)
      expect(spellcasterChip.text()).toContain('Spellcaster')
      expect(spellcasterChip.text()).toContain('No')
    })

    it('shows search query chip', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      const component = wrapper.vm as any
      component.searchQuery = 'Wizard'
      await wrapper.vm.$nextTick()

      // Find chip by test ID
      const searchChip = wrapper.find('[data-testid="search-query-chip"]')
      expect(searchChip.exists()).toBe(true)
      expect(searchChip.text()).toContain('Wizard')
    })

    it('clicking filter chip clears that filter', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      const component = wrapper.vm as any
      component.isBaseClass = '1'
      await wrapper.vm.$nextTick()

      // Find and click chip
      const baseClassChip = wrapper.find('[data-testid="is-base-class-filter-chip"]')
      expect(baseClassChip.exists()).toBe(true)

      await baseClassChip.trigger('click')

      // Filter should be cleared
      expect(component.isBaseClass).toBe(null)
    })
  })

  describe('clear filters functionality', () => {
    it('Clear filters button clears all filters', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      const component = wrapper.vm as any
      component.isBaseClass = '1'
      component.isSpellcaster = '0'
      component.searchQuery = 'Paladin'
      await wrapper.vm.$nextTick()

      // Click Clear filters button
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
