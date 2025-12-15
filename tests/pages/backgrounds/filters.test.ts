/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Backgrounds Page - Filter Tests (Consolidated)
 *
 * This file consolidates tests for all background page filters:
 * - Layout & structure tests (Active filters label, Clear button)
 * - Source filter tests (multiselect)
 * - Skills filter tests (multiselect)
 * - Tool types filter tests (multiselect)
 * - Language choice filter tests (boolean toggle)
 *
 * Consolidation: 3 files → 1 file
 * GitHub Issue: #323
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import BackgroundsPage from '~/pages/backgrounds/index.vue'

describe('Backgrounds Page - Filters', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ===========================================================================
  // Layout & Structure Tests
  // ===========================================================================
  describe('layout & structure', () => {
    describe('active filters label', () => {
      it('displays "Active filters:" label (not old "Active:" label)', async () => {
        const wrapper = await mountSuspended(BackgroundsPage)

        const component = wrapper.vm as any
        component.searchQuery = 'Noble'
        await wrapper.vm.$nextTick()

        const html = wrapper.html()
        expect(html).toContain('Active filters:')
        expect(html).not.toMatch(/Active:</)
        expect(html).not.toMatch(/Active:\s*</)
      })
    })

    describe('clear filters button', () => {
      it('displays clear button with filters and clicking it clears search', async () => {
        const wrapper = await mountSuspended(BackgroundsPage)

        const component = wrapper.vm as any
        component.searchQuery = 'Noble'
        await wrapper.vm.$nextTick()

        const container = wrapper.find('.flex.flex-wrap.items-center.justify-between')
        expect(container.exists()).toBe(true)

        const html = container.html()
        expect(html).toContain('Active filters:')
        expect(html).toContain('Clear filters')

        const buttons = wrapper.findAll('button')
        const clearFiltersButton = buttons.find(btn => btn.text().includes('Clear filters'))

        expect(clearFiltersButton).toBeDefined()
        await clearFiltersButton!.trigger('click')

        expect(component.searchQuery).toBe('')
      })

      it('does not show clear button when no filters are active', async () => {
        const wrapper = await mountSuspended(BackgroundsPage)

        const component = wrapper.vm as any
        component.searchQuery = ''

        const container = wrapper.find('.flex.flex-wrap.items-center.justify-between')
        expect(container.exists()).toBe(false)
      })
    })

    describe('filter chip display', () => {
      it('displays search query chip and allows clearing via click', async () => {
        const wrapper = await mountSuspended(BackgroundsPage)

        const component = wrapper.vm as any
        component.searchQuery = 'Noble'
        await wrapper.vm.$nextTick()

        const html = wrapper.html()
        expect(html).toContain('"Noble"')
        expect(html).toContain('✕')

        const chips = wrapper.findAll('button')
        const searchChip = chips.find(btn => btn.text().includes('"Noble"'))

        expect(searchChip).toBeDefined()
        await searchChip!.trigger('click')

        expect(component.searchQuery).toBe('')
      })
    })

    describe('layout structure', () => {
      it('uses flex-wrap layout and groups label with chips', async () => {
        const wrapper = await mountSuspended(BackgroundsPage)

        const component = wrapper.vm as any
        component.searchQuery = 'Noble'
        await wrapper.vm.$nextTick()

        const container = wrapper.find('.flex.flex-wrap.items-center.justify-between')
        expect(container.exists()).toBe(true)
        expect(container.classes()).toContain('flex-wrap')

        const innerContainer = wrapper.find('.flex.flex-wrap.items-center.gap-2')
        expect(innerContainer.exists()).toBe(true)

        const text = innerContainer.text()
        expect(text).toContain('Active filters:')
        expect(text).toContain('"Noble"')
      })
    })
  })

  // ===========================================================================
  // Source Filter Tests (Multiselect)
  // ===========================================================================
  describe('source filter', () => {
    describe('UI', () => {
      it('renders source filter multiselect when filters are open', async () => {
        const wrapper = await mountSuspended(BackgroundsPage)
        const component = wrapper.vm as any

        component.filtersOpen = true
        await wrapper.vm.$nextTick()

        const html = wrapper.html()
        expect(html).toContain('Source')
      })

      it('has sourceOptions computed property', async () => {
        const wrapper = await mountSuspended(BackgroundsPage)
        const component = wrapper.vm as any

        expect(component.sourceOptions).toBeDefined()
        expect(Array.isArray(component.sourceOptions)).toBe(true)
      })
    })

    describe('state', () => {
      it('updates selectedSources when source is selected', async () => {
        const wrapper = await mountSuspended(BackgroundsPage)
        const component = wrapper.vm as any

        expect(component.selectedSources).toEqual([])

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

    describe('filter count', () => {
      it('shows count badge when source filter is active', async () => {
        const wrapper = await mountSuspended(BackgroundsPage)
        const component = wrapper.vm as any

        component.selectedSources = ['PHB']

        expect(component.activeFilterCount).toBe(1)
      })

      it('counts each selected source in filter count', async () => {
        const wrapper = await mountSuspended(BackgroundsPage)
        const component = wrapper.vm as any

        component.clearFilters()

        component.selectedSources = ['PHB', 'ERLW', 'WGTE']

        expect(component.activeFilterCount).toBe(3)
      })

      it('includes source filter in total count with search', async () => {
        const wrapper = await mountSuspended(BackgroundsPage)
        const component = wrapper.vm as any

        component.searchQuery = 'Noble'
        component.selectedSources = ['PHB']

        expect(component.activeFilterCount).toBe(1)
      })
    })

    describe('chips', () => {
      it('displays source chip when source is selected', async () => {
        const wrapper = await mountSuspended(BackgroundsPage)
        const component = wrapper.vm as any

        component.selectedSources = ['PHB']
        await wrapper.vm.$nextTick()

        const html = wrapper.html()
        expect(html).toContain('✕')
      })

      it('shows multiple sources in chip', async () => {
        const wrapper = await mountSuspended(BackgroundsPage)
        const component = wrapper.vm as any

        component.selectedSources = ['PHB', 'ERLW']
        await wrapper.vm.$nextTick()

        const html = wrapper.html()
        const chipCount = (html.match(/✕/g) || []).length
        expect(chipCount).toBeGreaterThanOrEqual(2)
      })

      it('clicking source chip clears source filter', async () => {
        const wrapper = await mountSuspended(BackgroundsPage)
        const component = wrapper.vm as any

        component.selectedSources = ['PHB']
        await wrapper.vm.$nextTick()

        const buttons = wrapper.findAll('button')
        const sourceChips = buttons.filter(btn => btn.text().includes('✕'))

        expect(sourceChips.length).toBeGreaterThan(0)

        await sourceChips[0].trigger('click')

        expect(component.selectedSources.length).toBeLessThan(1)
      })
    })

    describe('query generation', () => {
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

    describe('clear', () => {
      it('clears source filter when clearFilters is called', async () => {
        const wrapper = await mountSuspended(BackgroundsPage)
        const component = wrapper.vm as any

        component.selectedSources = ['PHB']

        component.clearFilters()

        expect(component.selectedSources).toEqual([])
      })
    })
  })

  // ===========================================================================
  // Skills Filter Tests (Multiselect)
  // ===========================================================================
  describe('skills filter', () => {
    it('renders skill proficiencies multiselect filter', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      expect(html).toContain('Skills')
    })

    it('allows selecting multiple skills', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSkills = ['1', '2']

      expect(component.selectedSkills).toHaveLength(2)
      expect(component.selectedSkills).toContain('1')
      expect(component.selectedSkills).toContain('2')
    })

    it('displays active skill filter chips', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSkills = ['stealth', 'perception']
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      expect(html).toContain('✕')
    })

    it('clicking skill chip removes that skill', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSkills = ['stealth', 'perception']
      await wrapper.vm.$nextTick()

      const chips = wrapper.findAll('button')
      const skillChip = chips.find(btn => btn.text().includes('✕'))

      if (skillChip) {
        await skillChip.trigger('click')
      }

      expect(component.selectedSkills.length).toBeLessThanOrEqual(2)
    })

    it('includes selectedSkills in filter count', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.clearFilters()

      const initialCount = component.activeFilterCount
      expect(initialCount).toBe(0)

      component.selectedSkills = ['stealth']
      await wrapper.vm.$nextTick()

      expect(component.activeFilterCount).toBeGreaterThan(initialCount)
    })

    it('clears skills when clear filters button is clicked', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSkills = ['stealth', 'perception']
      await wrapper.vm.$nextTick()

      component.clearFilters()

      expect(component.selectedSkills).toEqual([])
    })
  })

  // ===========================================================================
  // Tool Types Filter Tests (Multiselect)
  // ===========================================================================
  describe('tool types filter', () => {
    it('renders tool proficiency types multiselect filter', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      expect(html).toContain('Tool Types')
    })

    it('allows selecting multiple tool types', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedToolTypes = ['artisan-tools', 'musical-instruments']

      expect(component.selectedToolTypes).toHaveLength(2)
      expect(component.selectedToolTypes).toContain('artisan-tools')
      expect(component.selectedToolTypes).toContain('musical-instruments')
    })

    it('displays active tool type filter chips', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedToolTypes = ['artisan-tools']
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      expect(html).toContain('✕')
    })

    it('clicking tool type chip removes that type', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedToolTypes = ['artisan-tools', 'gaming-sets']

      component.selectedToolTypes = component.selectedToolTypes.filter((t: string) => t !== 'artisan-tools')

      expect(component.selectedToolTypes).toHaveLength(1)
      expect(component.selectedToolTypes).not.toContain('artisan-tools')
    })

    it('includes selectedToolTypes in filter count', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.clearFilters()

      const initialCount = component.activeFilterCount
      expect(initialCount).toBe(0)

      component.selectedToolTypes = ['gaming-sets']
      await wrapper.vm.$nextTick()

      expect(component.activeFilterCount).toBeGreaterThan(initialCount)
    })

    it('clears tool types when clear filters button is clicked', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedToolTypes = ['artisan-tools', 'musical-instruments']
      await wrapper.vm.$nextTick()

      component.clearFilters()

      expect(component.selectedToolTypes).toEqual([])
    })
  })

  // ===========================================================================
  // Language Choice Filter Tests (Boolean Toggle)
  // ===========================================================================
  describe('language choice filter', () => {
    it('renders language choice toggle filter', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      expect(html).toContain('Language Choice')
    })

    it('allows setting language choice to Yes (1)', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.languageChoiceFilter = '1'

      expect(component.languageChoiceFilter).toBe('1')
    })

    it('allows setting language choice to No (0)', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.languageChoiceFilter = '0'

      expect(component.languageChoiceFilter).toBe('0')
    })

    it('allows setting language choice to All (null)', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.languageChoiceFilter = null

      expect(component.languageChoiceFilter).toBeNull()
    })

    it('displays active language choice filter chip when set to Yes', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.languageChoiceFilter = '1'
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      expect(html).toContain('Language Choice')
      expect(html).toContain('Yes')
      expect(html).toContain('✕')
    })

    it('displays active language choice filter chip when set to No', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.languageChoiceFilter = '0'
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      expect(html).toContain('Language Choice')
      expect(html).toContain('No')
      expect(html).toContain('✕')
    })

    it('does not display chip when set to All', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.languageChoiceFilter = null
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('button')
      const languageChip = buttons.find(btn => btn.text().includes('Language Choice'))

      expect(languageChip).toBeUndefined()
    })

    it('clicking language choice chip clears the filter', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.languageChoiceFilter = '1'
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('button')
      const languageChip = buttons.find(btn => btn.text().includes('Language Choice'))

      if (languageChip) {
        await languageChip.trigger('click')
      }

      expect(component.languageChoiceFilter).toBeNull()
    })

    it('includes languageChoiceFilter in filter count when not null', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      const initialCount = component.activeFilterCount

      component.languageChoiceFilter = '1'
      await wrapper.vm.$nextTick()

      expect(component.activeFilterCount).toBeGreaterThan(initialCount)
    })

    it('clears language choice when clear filters button is clicked', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.languageChoiceFilter = '1'
      await wrapper.vm.$nextTick()

      component.clearFilters()

      expect(component.languageChoiceFilter).toBeNull()
    })
  })

  // ===========================================================================
  // Combined Filters Tests
  // ===========================================================================
  describe('combined filters', () => {
    it('counts all filters correctly', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      const initialCount = component.activeFilterCount

      component.selectedSkills = ['stealth']
      component.selectedToolTypes = ['artisan-tools']
      component.languageChoiceFilter = '1'

      expect(component.activeFilterCount).toBe(initialCount + 3)
    })

    it('clears all filters when clear filters is clicked', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSkills = ['stealth', 'perception']
      component.selectedToolTypes = ['artisan-tools']
      component.languageChoiceFilter = '1'

      component.clearFilters()

      expect(component.selectedSkills).toEqual([])
      expect(component.selectedToolTypes).toEqual([])
      expect(component.languageChoiceFilter).toBeNull()
    })

    it('displays all filter chips simultaneously', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSkills = ['stealth']
      component.selectedToolTypes = ['gaming-sets']
      component.languageChoiceFilter = '1'
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      const chipCount = (html.match(/✕/g) || []).length
      expect(chipCount).toBeGreaterThanOrEqual(3)
    })
  })
})
