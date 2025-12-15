/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Classes Page - Filter Tests (Consolidated)
 * Consolidation: 2 files → 1 file
 * GitHub Issue: #323
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import ClassesPage from '~/pages/classes/index.vue'

describe('Classes Page - Filters', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

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
      const baseClassChip = wrapper.find('[data-testid="is-base-class-filter-chip"]')
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

  describe('hit die filter', () => {
    it('has hit die filter state', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      const component = wrapper.vm as any

      // Should have selectedHitDice ref (array)
      expect(component.selectedHitDice).toBeDefined()
      expect(Array.isArray(component.selectedHitDice)).toBe(true)
      expect(component.selectedHitDice.length).toBe(0)
    })

    it('has correct hit die options', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      const component = wrapper.vm as any

      // Should have hitDieOptions
      expect(component.hitDieOptions).toBeDefined()
      expect(Array.isArray(component.hitDieOptions)).toBe(true)
      expect(component.hitDieOptions.length).toBe(4)

      // Verify option labels
      const labels = component.hitDieOptions.map((o: any) => o.label)
      expect(labels).toContain('d6')
      expect(labels).toContain('d8')
      expect(labels).toContain('d10')
      expect(labels).toContain('d12')
    })

    it('allows selecting multiple hit dice', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      const component = wrapper.vm as any

      // Select multiple hit dice
      component.selectedHitDice = [6, 12]
      await wrapper.vm.$nextTick()

      expect(component.selectedHitDice).toEqual([6, 12])
    })

    it('shows hit die chips when dice are selected', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      const component = wrapper.vm as any
      component.selectedHitDice = [6, 12]
      await wrapper.vm.$nextTick()

      // Look for chips
      const chips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('d6') || btn.text().includes('d12')
      )
      expect(chips.length).toBeGreaterThan(0)
    })

    it('clicking chip removes that hit die from filter', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      const component = wrapper.vm as any
      component.selectedHitDice = [6, 8, 12]
      await wrapper.vm.$nextTick()

      // Find and click d8 chip
      const d8Chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('d8') && btn.text().includes('✕')
      )
      expect(d8Chip).toBeDefined()
      await d8Chip!.trigger('click')

      // d8 should be removed
      expect(component.selectedHitDice).toEqual([6, 12])
    })
  })

  describe('spellcasting ability filter', () => {
    it('has spellcasting ability filter state', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      const component = wrapper.vm as any

      // Should have selectedSpellcastingAbility ref
      expect(component.selectedSpellcastingAbility).toBeDefined()
      expect(component.selectedSpellcastingAbility).toBeNull()
    })

    it('has correct spellcasting ability options', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      const component = wrapper.vm as any

      // Should have spellcastingAbilityOptions
      expect(component.spellcastingAbilityOptions).toBeDefined()
      expect(Array.isArray(component.spellcastingAbilityOptions)).toBe(true)
      expect(component.spellcastingAbilityOptions.length).toBe(4)

      // Verify option labels
      const labels = component.spellcastingAbilityOptions.map((o: any) => o.label)
      expect(labels).toContain('All Abilities')
      expect(labels).toContain('Intelligence')
      expect(labels).toContain('Wisdom')
      expect(labels).toContain('Charisma')
    })
  })

  describe('parent class filter', () => {
    it('has parent class filter state', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      const component = wrapper.vm as any

      // Should have selectedParentClass ref
      expect(component.selectedParentClass).toBeDefined()
      expect(component.selectedParentClass).toBeNull()
    })

    it('fetches parent class options from base classes', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      const component = wrapper.vm as any

      // Wait for data to load
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Should have parentClassOptions computed
      expect(component.parentClassOptions).toBeDefined()
      expect(Array.isArray(component.parentClassOptions)).toBe(true)
      expect(component.parentClassOptions.length).toBeGreaterThan(0)

      // Should have "All Classes" option
      const labels = component.parentClassOptions.map((o: any) => o.label)
      expect(labels).toContain('All Classes')
    })
  })

  describe('sources filter', () => {
    it('has sources filter state', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      const component = wrapper.vm as any

      // Should have selectedSources ref (array)
      expect(component.selectedSources).toBeDefined()
      expect(Array.isArray(component.selectedSources)).toBe(true)
      expect(component.selectedSources.length).toBe(0)
    })

    it('fetches source options from API', async () => {
      const wrapper = await mountSuspended(ClassesPage)

      const component = wrapper.vm as any

      // Wait for data to load
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Should have sourceOptions computed
      expect(component.sourceOptions).toBeDefined()
      expect(Array.isArray(component.sourceOptions)).toBe(true)
    })
  })
})
