import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BackgroundsPage from '~/pages/backgrounds/index.vue'

/**
 * Backgrounds Page - Source Filter Tests
 *
 * Tests the source multiselect filter for backgrounds (PHB, ERLW, WGTE).
 * Follows TDD pattern - write test first, watch fail, implement, verify pass.
 */
describe('Backgrounds Page - Source Filter', () => {
  describe('filter UI', () => {
    it('renders source filter multiselect when filters are open', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      // Open filters
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      expect(html).toContain('Source')
    })

    it('has sourceOptions computed property', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      // Should have sourceOptions (may be empty if API not loaded in test)
      expect(component.sourceOptions).toBeDefined()
      expect(Array.isArray(component.sourceOptions)).toBe(true)
    })
  })

  describe('filter state', () => {
    it('updates selectedSources when source is selected', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      // Initially empty
      expect(component.selectedSources).toEqual([])

      // Select PHB
      component.selectedSources = ['PHB']
      await wrapper.vm.$nextTick()

      expect(component.selectedSources).toEqual(['PHB'])
    })

    it('supports multiple source selections', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSources = ['PHB', 'ERLW']
      await wrapper.vm.$nextTick()

      expect(component.selectedSources).toEqual(['PHB', 'ERLW'])
    })
  })

  describe('filter count badge', () => {
    it('shows count badge when source filter is active', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSources = ['PHB']
      await wrapper.vm.$nextTick()

      // Badge count should be 1
      expect(component.activeFilterCount).toBe(1)
    })

    it('counts multiple sources as one filter', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSources = ['PHB', 'ERLW', 'WGTE']
      await wrapper.vm.$nextTick()

      // Multiple selections in one filter = 1 count
      expect(component.activeFilterCount).toBe(1)
    })

    it('includes source filter in total count with search', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.searchQuery = 'Noble'
      component.selectedSources = ['PHB']
      await wrapper.vm.$nextTick()

      // Only counts non-search filters (source = 1)
      // Search is handled separately by hasActiveFilters
      expect(component.activeFilterCount).toBe(1)
    })
  })

  describe('active filter chips', () => {
    it('displays source chip when source is selected', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSources = ['PHB']
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      expect(html).toContain('Source:')
      expect(html).toContain('PHB')
    })

    it('shows multiple sources in chip', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSources = ['PHB', 'ERLW']
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      expect(html).toContain('Source:')
      expect(html).toContain('PHB, ERLW')
    })

    it('clicking source chip clears source filter', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSources = ['PHB']
      await wrapper.vm.$nextTick()

      // Find source chip button
      const buttons = wrapper.findAll('button')
      const sourceChip = buttons.find(btn => btn.text().includes('Source:'))

      expect(sourceChip).toBeDefined()
      await sourceChip!.trigger('click')

      expect(component.selectedSources).toEqual([])
    })
  })

  describe('filter query generation', () => {
    it('generates Meilisearch filter for single source', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSources = ['PHB']
      await wrapper.vm.$nextTick()

      const filterParams = component.filterParams
      expect(filterParams.filter).toContain('source_codes IN [PHB]')
    })

    it('generates Meilisearch filter for multiple sources', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSources = ['PHB', 'ERLW']
      await wrapper.vm.$nextTick()

      const filterParams = component.filterParams
      expect(filterParams.filter).toContain('source_codes IN [PHB, ERLW]')
    })
  })

  describe('clear filters', () => {
    it('clears source filter when clearFilters is called', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSources = ['PHB']
      await wrapper.vm.$nextTick()

      component.clearFilters()
      await wrapper.vm.$nextTick()

      expect(component.selectedSources).toEqual([])
    })
  })
})
