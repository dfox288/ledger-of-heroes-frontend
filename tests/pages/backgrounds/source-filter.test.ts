import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import BackgroundsPage from '~/pages/backgrounds/index.vue'

/**
 * Backgrounds Page - Source Filter Tests
 *
 * Tests the source multiselect filter for backgrounds (PHB, ERLW, WGTE).
 * Follows TDD pattern - write test first, watch fail, implement, verify pass.
 */
describe('Backgrounds Page - Source Filter', () => {
  // Reset Pinia store before each test to ensure clean state
  beforeEach(() => {
    setActivePinia(createPinia())
  })
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

      expect(component.selectedSources).toEqual(['PHB'])
    })

    it('supports multiple source selections', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSources = ['PHB', 'ERLW']

      expect(component.selectedSources).toEqual(['PHB', 'ERLW'])
    })
  })

  describe('filter count badge', () => {
    it('shows count badge when source filter is active', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSources = ['PHB']

      // Badge count should be 1
      expect(component.activeFilterCount).toBe(1)
    })

    it('counts each selected source in filter count', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      // Clear filters first
      component.clearFilters()

      component.selectedSources = ['PHB', 'ERLW', 'WGTE']

      // Store counts each selected source individually
      expect(component.activeFilterCount).toBe(3)
    })

    it('includes source filter in total count with search', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.searchQuery = 'Noble'
      component.selectedSources = ['PHB']

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
      // Now we show individual chips per source, not "Source: PHB"
      expect(html).toContain('✕')
    })

    it('shows multiple sources in chip', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSources = ['PHB', 'ERLW']
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      // Now we show individual chips per source
      const chipCount = (html.match(/✕/g) || []).length
      expect(chipCount).toBeGreaterThanOrEqual(2)
    })

    it('clicking source chip clears source filter', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSources = ['PHB']
      await wrapper.vm.$nextTick()

      // Find source chip button (now it's just a chip with ✕)
      // The first chip with ✕ should be the source chip
      const buttons = wrapper.findAll('button')
      const sourceChips = buttons.filter(btn => btn.text().includes('✕'))

      expect(sourceChips.length).toBeGreaterThan(0)

      // Click the first source chip
      await sourceChips[0].trigger('click')

      // The sources array should be filtered to remove the clicked source
      expect(component.selectedSources.length).toBeLessThan(1)
    })
  })

  describe('filter query generation', () => {
    it('generates Meilisearch filter for single source', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSources = ['PHB']

      const filterParams = component.filterParams
      expect(filterParams.filter).toContain('source_codes IN [PHB]')
    })

    it('generates Meilisearch filter for multiple sources', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSources = ['PHB', 'ERLW']

      const filterParams = component.filterParams
      expect(filterParams.filter).toContain('source_codes IN [PHB, ERLW]')
    })
  })

  describe('clear filters', () => {
    it('clears source filter when clearFilters is called', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSources = ['PHB']

      component.clearFilters()

      expect(component.selectedSources).toEqual([])
    })
  })
})
