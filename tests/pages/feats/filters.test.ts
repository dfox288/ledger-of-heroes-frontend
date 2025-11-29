import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FeatsPage from '~/pages/feats/index.vue'

describe('Feats Page - Filter Layout', () => {
  describe('filter labels', () => {
    it('displays label on Prerequisites filter toggle', async () => {
      const wrapper = await mountSuspended(FeatsPage)

      // Open filters first
      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // The toggle should exist with a visible label
      const filterSection = wrapper.find('.space-y-4')
      expect(filterSection.exists()).toBe(true)

      // Label should be visible (UiFilterToggle keeps its label for context)
      const labelElements = wrapper.findAll('label')
      const hasPrereqLabel = labelElements.some(el => el.text().includes('Has Prerequisites'))
      expect(hasPrereqLabel).toBe(true)
    })
  })

  describe('active filters section and clear button', () => {
    it('displays correct label, clear button layout, and toggles with filter state', async () => {
      const wrapper = await mountSuspended(FeatsPage)
      const component = wrapper.vm as any

      // Part 1: Set filter and verify "Active filters:" label and button location
      component.hasPrerequisites = '1'
      await wrapper.vm.$nextTick()

      // Check "Active filters:" label (not old "Active:" label)
      let activeFiltersSection = wrapper.find('.flex.flex-wrap.items-center')
      expect(activeFiltersSection.exists()).toBe(true)
      expect(activeFiltersSection.text()).toContain('Active filters:')
      expect(activeFiltersSection.text()).not.toContain('Active:')

      // Button should exist in active filters row (right-aligned)
      const activeFiltersRow = wrapper.find('.flex.flex-wrap.items-center.justify-between')
      expect(activeFiltersRow.exists()).toBe(true)
      const buttons = activeFiltersRow.findAll('button')
      let clearButton = buttons.find(btn => btn.text().includes('Clear filters'))
      expect(clearButton).toBeDefined()
      expect(clearButton!.text()).toContain('Clear filters')

      // Part 2: Open filters, clear filter, check both states (batched)
      component.filtersOpen = true
      component.hasPrerequisites = null
      await wrapper.vm.$nextTick()

      // Filter collapse should not contain clear button
      const filterContent = wrapper.find('.space-y-4')
      expect(filterContent.exists()).toBe(true)
      const justifyEndSection = filterContent.find('.flex.justify-end')
      expect(justifyEndSection.exists()).toBe(false)

      // Clear button should disappear (no active filters)
      let clearButtons = wrapper.findAll('button').filter(btn => btn.text().includes('Clear filters'))
      expect(clearButtons.length).toBe(0)
    })
  })

  describe('filter chips and clearing', () => {
    it('shows chips, allows clearing via chip click or clear button', async () => {
      const wrapper = await mountSuspended(FeatsPage)
      const component = wrapper.vm as any

      // Part 1: Set both filters and show both chips (batched mutation)
      component.hasPrerequisites = '1'
      component.searchQuery = 'lucky'
      await wrapper.vm.$nextTick()

      // Check prerequisite chip
      let prereqChips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('Has Prerequisites') && btn.text().includes('✕')
      )
      expect(prereqChips.length).toBeGreaterThan(0)
      expect(prereqChips[0].text()).toContain('Yes')

      // Check search chip
      const searchChips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('"lucky"') && btn.text().includes('✕')
      )
      expect(searchChips.length).toBeGreaterThan(0)

      // Part 2: Clear via chip click
      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Has Prerequisites')
      )
      expect(chip).toBeDefined()
      await chip!.trigger('click')

      // Filter should be cleared (checking reactive data, no tick needed)
      expect(component.hasPrerequisites).toBeNull()
      // Search should still be set
      expect(component.searchQuery).toBe('lucky')

      // Part 3: Set multiple filters and clear all via clear button
      component.hasPrerequisites = '0'
      component.searchQuery = 'sentinel'
      await wrapper.vm.$nextTick()

      const clearButton = wrapper.findAll('button').find(btn =>
        btn.text().includes('Clear filters')
      )
      expect(clearButton).toBeDefined()

      await clearButton!.trigger('click')

      // All filters should be cleared (checking reactive data, no tick needed)
      expect(component.hasPrerequisites).toBeNull()
      expect(component.searchQuery).toBe('')
    })
  })
})
