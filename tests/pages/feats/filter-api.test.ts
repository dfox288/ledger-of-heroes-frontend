import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import FeatsPage from '~/pages/feats/index.vue'

describe('Feats Page - API Filter Integration', () => {
  // Reset Pinia store before each test to ensure clean state
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('has_prerequisites filter', () => {
    it('generates correct filter for has_prerequisites = true', async () => {
      const wrapper = await mountSuspended(FeatsPage)
      const component = wrapper.vm as any

      // Clear all filters first to ensure clean state
      component.clearFilters()

      // Set filter
      component.hasPrerequisites = '1'
      await wrapper.vm.$nextTick()

      // Check queryParams includes correct filter
      const queryParams = component.queryParams
      expect(queryParams.filter).toBe('has_prerequisites = true')
    })

    it('generates correct filter for has_prerequisites = false', async () => {
      const wrapper = await mountSuspended(FeatsPage)
      const component = wrapper.vm as any

      // Clear all filters first to ensure clean state
      component.clearFilters()

      // Set filter
      component.hasPrerequisites = '0'
      await wrapper.vm.$nextTick()

      // Check queryParams includes correct filter
      const queryParams = component.queryParams
      expect(queryParams.filter).toBe('has_prerequisites = false')
    })

    it('does not include filter when null', async () => {
      const wrapper = await mountSuspended(FeatsPage)
      const component = wrapper.vm as any

      // Clear all filters first to ensure clean state
      component.clearFilters()

      // Set filter to null
      component.hasPrerequisites = null
      await wrapper.vm.$nextTick()

      // Check queryParams does not include filter
      const queryParams = component.queryParams
      expect(queryParams.filter).toBeUndefined()
    })
  })

  describe('grants_proficiencies filter', () => {
    it('generates correct filter for grants_proficiencies = true', async () => {
      const wrapper = await mountSuspended(FeatsPage)
      const component = wrapper.vm as any

      // Clear all filters first to ensure clean state
      component.clearFilters()

      // Set filter
      component.grantsProficiencies = '1'
      await wrapper.vm.$nextTick()

      // Check queryParams includes correct filter
      const queryParams = component.queryParams
      expect(queryParams.filter).toBe('grants_proficiencies = true')
    })

    it('generates correct filter for grants_proficiencies = false', async () => {
      const wrapper = await mountSuspended(FeatsPage)
      const component = wrapper.vm as any

      // Clear all filters first to ensure clean state
      component.clearFilters()

      // Set filter
      component.grantsProficiencies = '0'
      await wrapper.vm.$nextTick()

      // Check queryParams includes correct filter
      const queryParams = component.queryParams
      expect(queryParams.filter).toBe('grants_proficiencies = false')
    })
  })

  describe('improved_abilities filter', () => {
    it('generates correct filter for single ability', async () => {
      const wrapper = await mountSuspended(FeatsPage)
      const component = wrapper.vm as any

      // Clear all filters first to ensure clean state
      component.clearFilters()

      // Set filter
      component.selectedImprovedAbilities = ['STR']
      await wrapper.vm.$nextTick()

      // Check queryParams includes correct filter
      const queryParams = component.queryParams
      expect(queryParams.filter).toBe('improved_abilities IN [STR]')
    })

    it('generates correct filter for multiple abilities', async () => {
      const wrapper = await mountSuspended(FeatsPage)
      const component = wrapper.vm as any

      // Clear all filters first to ensure clean state
      component.clearFilters()

      // Set filter
      component.selectedImprovedAbilities = ['STR', 'DEX']
      await wrapper.vm.$nextTick()

      // Check queryParams includes correct filter
      const queryParams = component.queryParams
      expect(queryParams.filter).toBe('improved_abilities IN [STR, DEX]')
    })

    it('does not include filter when empty array', async () => {
      const wrapper = await mountSuspended(FeatsPage)
      const component = wrapper.vm as any

      // Clear all filters first to ensure clean state
      component.clearFilters()

      // Set filter to empty
      component.selectedImprovedAbilities = []
      await wrapper.vm.$nextTick()

      // Check queryParams does not include filter
      const queryParams = component.queryParams
      expect(queryParams.filter).toBeUndefined()
    })
  })

  describe('prerequisite_types filter', () => {
    it('generates correct filter for single type', async () => {
      const wrapper = await mountSuspended(FeatsPage)
      const component = wrapper.vm as any

      // Clear all filters first to ensure clean state
      component.clearFilters()

      // Set filter
      component.selectedPrerequisiteTypes = ['Race']
      await wrapper.vm.$nextTick()

      // Check queryParams includes correct filter
      const queryParams = component.queryParams
      expect(queryParams.filter).toBe('prerequisite_types IN [Race]')
    })

    it('generates correct filter for multiple types', async () => {
      const wrapper = await mountSuspended(FeatsPage)
      const component = wrapper.vm as any

      // Clear all filters first to ensure clean state
      component.clearFilters()

      // Set filter
      component.selectedPrerequisiteTypes = ['Race', 'AbilityScore']
      await wrapper.vm.$nextTick()

      // Check queryParams includes correct filter
      const queryParams = component.queryParams
      expect(queryParams.filter).toBe('prerequisite_types IN [Race, AbilityScore]')
    })
  })

  describe('source_codes filter', () => {
    it('generates correct filter for single source', async () => {
      const wrapper = await mountSuspended(FeatsPage)
      const component = wrapper.vm as any

      // Clear all filters first to ensure clean state
      component.clearFilters()

      // Set filter
      component.selectedSources = ['PHB']
      await wrapper.vm.$nextTick()

      // Check queryParams includes correct filter
      const queryParams = component.queryParams
      expect(queryParams.filter).toBe('source_codes IN [PHB]')
    })

    it('generates correct filter for multiple sources', async () => {
      const wrapper = await mountSuspended(FeatsPage)
      const component = wrapper.vm as any

      // Clear all filters first to ensure clean state
      component.clearFilters()

      // Set filter
      component.selectedSources = ['PHB', 'XGTE']
      await wrapper.vm.$nextTick()

      // Check queryParams includes correct filter
      const queryParams = component.queryParams
      expect(queryParams.filter).toBe('source_codes IN [PHB, XGTE]')
    })
  })

  describe('combined filters', () => {
    it('combines boolean and array filters with AND', async () => {
      const wrapper = await mountSuspended(FeatsPage)
      const component = wrapper.vm as any

      // Clear all filters first to ensure clean state
      component.clearFilters()

      // Set multiple filters - batch mutations before single nextTick
      component.hasPrerequisites = '1'
      component.selectedImprovedAbilities = ['STR']
      await wrapper.vm.$nextTick()

      // Check queryParams includes combined filter
      const queryParams = component.queryParams
      expect(queryParams.filter).toBe('has_prerequisites = true AND improved_abilities IN [STR]')
    })

    it('combines multiple array filters', async () => {
      const wrapper = await mountSuspended(FeatsPage)
      const component = wrapper.vm as any

      // Clear all filters first to ensure clean state
      component.clearFilters()

      // Set multiple filters - batch mutations before single nextTick
      component.selectedImprovedAbilities = ['STR', 'DEX']
      component.selectedSources = ['PHB']
      await wrapper.vm.$nextTick()

      // Check queryParams includes combined filter
      const queryParams = component.queryParams
      expect(queryParams.filter).toBe('improved_abilities IN [STR, DEX] AND source_codes IN [PHB]')
    })

    it('combines all filter types', async () => {
      const wrapper = await mountSuspended(FeatsPage)
      const component = wrapper.vm as any

      // Clear all filters first to ensure clean state
      component.clearFilters()

      // Set all filters - batch mutations before single nextTick
      component.hasPrerequisites = '1'
      component.grantsProficiencies = '1'
      component.selectedImprovedAbilities = ['STR']
      component.selectedPrerequisiteTypes = ['Race']
      component.selectedSources = ['PHB']
      await wrapper.vm.$nextTick()

      // Check queryParams includes all filters
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

      // Set all filters - batch mutations before single nextTick
      component.hasPrerequisites = '1'
      component.grantsProficiencies = '1'
      component.selectedImprovedAbilities = ['STR']
      component.selectedPrerequisiteTypes = ['Race']
      component.selectedSources = ['PHB']
      await wrapper.vm.$nextTick()

      // Clear filters
      component.clearFilters()
      await wrapper.vm.$nextTick()

      // Check all filters are cleared
      expect(component.hasPrerequisites).toBeNull()
      expect(component.grantsProficiencies).toBeNull()
      expect(component.selectedImprovedAbilities).toEqual([])
      expect(component.selectedPrerequisiteTypes).toEqual([])
      expect(component.selectedSources).toEqual([])

      // Check queryParams has no filter
      const queryParams = component.queryParams
      expect(queryParams.filter).toBeUndefined()
    })
  })
})
