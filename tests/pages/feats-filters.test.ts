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

  describe('active filters section', () => {
    it('displays "Active filters:" instead of "Active:"', async () => {
      const wrapper = await mountSuspended(FeatsPage)

      // Set a filter to trigger active filters section
      const component = wrapper.vm as any
      component.hasPrerequisites = '1'
      await wrapper.vm.$nextTick()

      // Look for the "Active filters:" label
      const activeFiltersSection = wrapper.find('.flex.flex-wrap.items-center')
      expect(activeFiltersSection.exists()).toBe(true)
      expect(activeFiltersSection.text()).toContain('Active filters:')
      expect(activeFiltersSection.text()).not.toContain('Active:')
    })
  })

  describe('clear filters button', () => {
    it('shows clear filters button on same row as chips (right-aligned)', async () => {
      const wrapper = await mountSuspended(FeatsPage)

      // Set a filter to trigger active filters section
      const component = wrapper.vm as any
      component.hasPrerequisites = '1'
      await wrapper.vm.$nextTick()

      // Look for the active filters container with justify-between
      const activeFiltersRow = wrapper.find('.flex.flex-wrap.items-center.justify-between')
      expect(activeFiltersRow.exists()).toBe(true)

      // Should contain both the chips and the clear button
      const buttons = activeFiltersRow.findAll('button')
      const clearButton = buttons.find(btn => btn.text().includes('Clear filters'))
      expect(clearButton).toBeDefined()
      expect(clearButton!.text()).toContain('Clear filters')
    })

    it('does not show clear filters button inside filter collapse', async () => {
      const wrapper = await mountSuspended(FeatsPage)

      // Open filters first
      const component = wrapper.vm as any
      component.filtersOpen = true
      component.hasPrerequisites = '1'
      await wrapper.vm.$nextTick()

      // Look for the filter content section
      const filterContent = wrapper.find('.space-y-4')
      expect(filterContent.exists()).toBe(true)

      // Should not contain clear button with justify-end
      const justifyEndSection = filterContent.find('.flex.justify-end')
      expect(justifyEndSection.exists()).toBe(false)
    })

    it('only shows clear button when filters are active', async () => {
      const wrapper = await mountSuspended(FeatsPage)

      const component = wrapper.vm as any

      // Initially no filters
      component.hasPrerequisites = null
      component.searchQuery = ''
      await wrapper.vm.$nextTick()

      // Clear button should not exist
      let clearButtons = wrapper.findAll('button').filter(btn => btn.text().includes('Clear filters'))
      expect(clearButtons.length).toBe(0)

      // Set a filter
      component.hasPrerequisites = '1'
      await wrapper.vm.$nextTick()

      // Clear button should exist
      clearButtons = wrapper.findAll('button').filter(btn => btn.text().includes('Clear filters'))
      expect(clearButtons.length).toBeGreaterThan(0)
    })
  })

  describe('filter chips', () => {
    it('shows prerequisite filter chip when set', async () => {
      const wrapper = await mountSuspended(FeatsPage)

      const component = wrapper.vm as any
      component.hasPrerequisites = '1'
      await wrapper.vm.$nextTick()

      // Look for chip
      const chips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('Has Prerequisites') && btn.text().includes('✕')
      )
      expect(chips.length).toBeGreaterThan(0)
      expect(chips[0].text()).toContain('Yes')
    })

    it('clicking chip clears prerequisite filter', async () => {
      const wrapper = await mountSuspended(FeatsPage)

      const component = wrapper.vm as any
      component.hasPrerequisites = '1'
      await wrapper.vm.$nextTick()

      // Find and click chip
      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Has Prerequisites')
      )
      expect(chip).toBeDefined()

      await chip!.trigger('click')

      // Filter should be cleared
      expect(component.hasPrerequisites).toBeNull()
    })

    it('shows search query chip when search is active', async () => {
      const wrapper = await mountSuspended(FeatsPage)

      const component = wrapper.vm as any
      component.searchQuery = 'lucky'
      await wrapper.vm.$nextTick()

      // Look for search chip
      const chips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('"lucky"') && btn.text().includes('✕')
      )
      expect(chips.length).toBeGreaterThan(0)
    })
  })

  describe('clear filters functionality', () => {
    it('clears all filters when clear button is clicked', async () => {
      const wrapper = await mountSuspended(FeatsPage)

      const component = wrapper.vm as any
      component.hasPrerequisites = '0'
      component.searchQuery = 'sentinel'
      await wrapper.vm.$nextTick()

      // Find clear button
      const clearButton = wrapper.findAll('button').find(btn =>
        btn.text().includes('Clear filters')
      )
      expect(clearButton).toBeDefined()

      // Click it
      await clearButton!.trigger('click')

      // All filters should be cleared
      expect(component.hasPrerequisites).toBeNull()
      expect(component.searchQuery).toBe('')
    })
  })
})
