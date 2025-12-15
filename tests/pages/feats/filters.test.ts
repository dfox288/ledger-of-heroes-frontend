/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Feats Page - Filter Tests (Consolidated)
 *
 * This file consolidates tests for all feat page filters:
 * - Filter layout tests (labels, active filters section, clear button)
 * - API filter integration tests (query generation)
 *
 * Consolidation: 2 files → 1 file
 * GitHub Issue: #323
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import FeatsPage from '~/pages/feats/index.vue'

describe('Feats Page - Filters', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ===========================================================================
  // Filter Layout Tests
  // ===========================================================================
  describe('filter layout', () => {
    describe('filter labels', () => {
      it('displays label on Prerequisites filter toggle', async () => {
        const wrapper = await mountSuspended(FeatsPage)

        const component = wrapper.vm as any
        component.filtersOpen = true
        await wrapper.vm.$nextTick()

        const filterSection = wrapper.find('.space-y-4')
        expect(filterSection.exists()).toBe(true)

        const labelElements = wrapper.findAll('label')
        const hasPrereqLabel = labelElements.some(el => el.text().includes('Has Prerequisites'))
        expect(hasPrereqLabel).toBe(true)
      })
    })

    describe('active filters section and clear button', () => {
      it('displays correct label, clear button layout, and toggles with filter state', async () => {
        const wrapper = await mountSuspended(FeatsPage)
        const component = wrapper.vm as any

        component.hasPrerequisites = '1'
        await wrapper.vm.$nextTick()

        const activeFiltersSection = wrapper.find('.flex.flex-wrap.items-center')
        expect(activeFiltersSection.exists()).toBe(true)
        expect(activeFiltersSection.text()).toContain('Active filters:')
        expect(activeFiltersSection.text()).not.toContain('Active:')

        const activeFiltersRow = wrapper.find('.flex.flex-wrap.items-center.justify-between')
        expect(activeFiltersRow.exists()).toBe(true)
        const buttons = activeFiltersRow.findAll('button')
        const clearButton = buttons.find(btn => btn.text().includes('Clear filters'))
        expect(clearButton).toBeDefined()
        expect(clearButton!.text()).toContain('Clear filters')

        component.filtersOpen = true
        component.hasPrerequisites = null
        await wrapper.vm.$nextTick()

        const filterContent = wrapper.find('.space-y-4')
        expect(filterContent.exists()).toBe(true)
        const justifyEndSection = filterContent.find('.flex.justify-end')
        expect(justifyEndSection.exists()).toBe(false)

        const clearButtons = wrapper.findAll('button').filter(btn => btn.text().includes('Clear filters'))
        expect(clearButtons.length).toBe(0)
      })
    })

    describe('filter chips and clearing', () => {
      it('shows chips, allows clearing via chip click or clear button', async () => {
        const wrapper = await mountSuspended(FeatsPage)
        const component = wrapper.vm as any

        component.hasPrerequisites = '1'
        component.searchQuery = 'lucky'
        await wrapper.vm.$nextTick()

        const prereqChips = wrapper.findAll('button').filter(btn =>
          btn.text().includes('Has Prerequisites') && btn.text().includes('✕')
        )
        expect(prereqChips.length).toBeGreaterThan(0)
        expect(prereqChips[0].text()).toContain('Yes')

        const searchChips = wrapper.findAll('button').filter(btn =>
          btn.text().includes('"lucky"') && btn.text().includes('✕')
        )
        expect(searchChips.length).toBeGreaterThan(0)

        const chip = wrapper.findAll('button').find(btn =>
          btn.text().includes('Has Prerequisites')
        )
        expect(chip).toBeDefined()
        await chip!.trigger('click')

        expect(component.hasPrerequisites).toBeNull()
        expect(component.searchQuery).toBe('lucky')

        component.hasPrerequisites = '0'
        component.searchQuery = 'sentinel'
        await wrapper.vm.$nextTick()

        const clearButton = wrapper.findAll('button').find(btn =>
          btn.text().includes('Clear filters')
        )
        expect(clearButton).toBeDefined()

        await clearButton!.trigger('click')

        expect(component.hasPrerequisites).toBeNull()
        expect(component.searchQuery).toBe('')
      })
    })
  })

  // ===========================================================================
  // API Filter Integration Tests
  // ===========================================================================
  describe('API filter integration', () => {
    describe('has_prerequisites filter', () => {
      it('generates correct filter for has_prerequisites = true', async () => {
        const wrapper = await mountSuspended(FeatsPage)
        const component = wrapper.vm as any

        component.clearFilters()
        component.hasPrerequisites = '1'
        await wrapper.vm.$nextTick()

        const queryParams = component.queryParams
        expect(queryParams.filter).toBe('has_prerequisites = true')
      })

      it('generates correct filter for has_prerequisites = false', async () => {
        const wrapper = await mountSuspended(FeatsPage)
        const component = wrapper.vm as any

        component.clearFilters()
        component.hasPrerequisites = '0'
        await wrapper.vm.$nextTick()

        const queryParams = component.queryParams
        expect(queryParams.filter).toBe('has_prerequisites = false')
      })

      it('does not include filter when null', async () => {
        const wrapper = await mountSuspended(FeatsPage)
        const component = wrapper.vm as any

        component.clearFilters()
        component.hasPrerequisites = null
        await wrapper.vm.$nextTick()

        const queryParams = component.queryParams
        expect(queryParams.filter).toBeUndefined()
      })
    })

    describe('grants_proficiencies filter', () => {
      it('generates correct filter for grants_proficiencies = true', async () => {
        const wrapper = await mountSuspended(FeatsPage)
        const component = wrapper.vm as any

        component.clearFilters()
        component.grantsProficiencies = '1'
        await wrapper.vm.$nextTick()

        const queryParams = component.queryParams
        expect(queryParams.filter).toBe('grants_proficiencies = true')
      })

      it('generates correct filter for grants_proficiencies = false', async () => {
        const wrapper = await mountSuspended(FeatsPage)
        const component = wrapper.vm as any

        component.clearFilters()
        component.grantsProficiencies = '0'
        await wrapper.vm.$nextTick()

        const queryParams = component.queryParams
        expect(queryParams.filter).toBe('grants_proficiencies = false')
      })
    })

    describe('improved_abilities filter', () => {
      it('generates correct filter for single ability', async () => {
        const wrapper = await mountSuspended(FeatsPage)
        const component = wrapper.vm as any

        component.clearFilters()
        component.selectedImprovedAbilities = ['STR']
        await wrapper.vm.$nextTick()

        const queryParams = component.queryParams
        expect(queryParams.filter).toBe('improved_abilities IN [STR]')
      })

      it('generates correct filter for multiple abilities', async () => {
        const wrapper = await mountSuspended(FeatsPage)
        const component = wrapper.vm as any

        component.clearFilters()
        component.selectedImprovedAbilities = ['STR', 'DEX']
        await wrapper.vm.$nextTick()

        const queryParams = component.queryParams
        expect(queryParams.filter).toBe('improved_abilities IN [STR, DEX]')
      })

      it('does not include filter when empty array', async () => {
        const wrapper = await mountSuspended(FeatsPage)
        const component = wrapper.vm as any

        component.clearFilters()
        component.selectedImprovedAbilities = []
        await wrapper.vm.$nextTick()

        const queryParams = component.queryParams
        expect(queryParams.filter).toBeUndefined()
      })
    })

    describe('prerequisite_types filter', () => {
      it('generates correct filter for single type', async () => {
        const wrapper = await mountSuspended(FeatsPage)
        const component = wrapper.vm as any

        component.clearFilters()
        component.selectedPrerequisiteTypes = ['Race']
        await wrapper.vm.$nextTick()

        const queryParams = component.queryParams
        expect(queryParams.filter).toBe('prerequisite_types IN [Race]')
      })

      it('generates correct filter for multiple types', async () => {
        const wrapper = await mountSuspended(FeatsPage)
        const component = wrapper.vm as any

        component.clearFilters()
        component.selectedPrerequisiteTypes = ['Race', 'AbilityScore']
        await wrapper.vm.$nextTick()

        const queryParams = component.queryParams
        expect(queryParams.filter).toBe('prerequisite_types IN [Race, AbilityScore]')
      })
    })

    describe('source_codes filter', () => {
      it('generates correct filter for single source', async () => {
        const wrapper = await mountSuspended(FeatsPage)
        const component = wrapper.vm as any

        component.clearFilters()
        component.selectedSources = ['PHB']
        await wrapper.vm.$nextTick()

        const queryParams = component.queryParams
        expect(queryParams.filter).toBe('source_codes IN [PHB]')
      })

      it('generates correct filter for multiple sources', async () => {
        const wrapper = await mountSuspended(FeatsPage)
        const component = wrapper.vm as any

        component.clearFilters()
        component.selectedSources = ['PHB', 'XGTE']
        await wrapper.vm.$nextTick()

        const queryParams = component.queryParams
        expect(queryParams.filter).toBe('source_codes IN [PHB, XGTE]')
      })
    })

    describe('combined filters', () => {
      it('combines boolean and array filters with AND', async () => {
        const wrapper = await mountSuspended(FeatsPage)
        const component = wrapper.vm as any

        component.clearFilters()
        component.hasPrerequisites = '1'
        component.selectedImprovedAbilities = ['STR']
        await wrapper.vm.$nextTick()

        const queryParams = component.queryParams
        expect(queryParams.filter).toBe('has_prerequisites = true AND improved_abilities IN [STR]')
      })

      it('combines multiple array filters', async () => {
        const wrapper = await mountSuspended(FeatsPage)
        const component = wrapper.vm as any

        component.clearFilters()
        component.selectedImprovedAbilities = ['STR', 'DEX']
        component.selectedSources = ['PHB']
        await wrapper.vm.$nextTick()

        const queryParams = component.queryParams
        expect(queryParams.filter).toBe('improved_abilities IN [STR, DEX] AND source_codes IN [PHB]')
      })

      it('combines all filter types', async () => {
        const wrapper = await mountSuspended(FeatsPage)
        const component = wrapper.vm as any

        component.clearFilters()
        component.hasPrerequisites = '1'
        component.grantsProficiencies = '1'
        component.selectedImprovedAbilities = ['STR']
        component.selectedPrerequisiteTypes = ['Race']
        component.selectedSources = ['PHB']
        await wrapper.vm.$nextTick()

        const queryParams = component.queryParams
        expect(queryParams.filter).toContain('has_prerequisites = true')
        expect(queryParams.filter).toContain('grants_proficiencies = true')
        expect(queryParams.filter).toContain('improved_abilities IN [STR]')
        expect(queryParams.filter).toContain('prerequisite_types IN [Race]')
        expect(queryParams.filter).toContain('source_codes IN [PHB]')
        expect(queryParams.filter).toContain(' AND ')
      })
    })

    describe('filter clearing', () => {
      it('clears all custom filters', async () => {
        const wrapper = await mountSuspended(FeatsPage)
        const component = wrapper.vm as any

        component.hasPrerequisites = '1'
        component.grantsProficiencies = '1'
        component.selectedImprovedAbilities = ['STR']
        component.selectedPrerequisiteTypes = ['Race']
        component.selectedSources = ['PHB']
        await wrapper.vm.$nextTick()

        component.clearFilters()
        await wrapper.vm.$nextTick()

        expect(component.hasPrerequisites).toBeNull()
        expect(component.grantsProficiencies).toBeNull()
        expect(component.selectedImprovedAbilities).toEqual([])
        expect(component.selectedPrerequisiteTypes).toEqual([])
        expect(component.selectedSources).toEqual([])

        const queryParams = component.queryParams
        expect(queryParams.filter).toBeUndefined()
      })
    })
  })
})
