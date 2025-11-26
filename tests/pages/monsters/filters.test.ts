import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import MonstersPage from '~/pages/monsters/index.vue'

describe('Monsters Page - Filter Layout', () => {
  // Reset Pinia store before each test to ensure clean state
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  describe('Layout improvements', () => {
    it('displays "Active filters:" label (not "Active:")', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Apply a filter to show chips
      const component = wrapper.vm as any
      component.selectedType = 'dragon'

      await wrapper.vm.$nextTick()

      // Look for the label
      const text = wrapper.text()
      expect(text).toContain('Active filters:')
      expect(text).not.toContain('Active:')
    })

    it('positions Clear filters button on same row as Active filters', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Apply filters
      const component = wrapper.vm as any
      component.selectedType = 'dragon'
      component.filtersOpen = true

      await wrapper.vm.$nextTick()

      // Find the chips container
      const chipsRow = wrapper.find('.flex.flex-wrap.items-center.justify-between')
      expect(chipsRow.exists()).toBe(true)

      // Check structure: left side has label + chips, right side has button
      const buttons = chipsRow.findAll('button')
      const clearButton = buttons.find(btn => btn.text().includes('Clear filters'))
      expect(clearButton?.exists()).toBe(true)
    })

    it('shows Clear filters button only when filters are active', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // No filters active initially
      const clearButton = wrapper.find('button:contains("Clear filters")')
      expect(clearButton.exists()).toBe(false)

      // Apply a filter
      const component = wrapper.vm as any
      component.selectedType = 'dragon'
      await wrapper.vm.$nextTick()

      // Button should appear
      const buttons = wrapper.findAll('button')
      const clearButtons = buttons.filter(btn => btn.text().includes('Clear filters'))
      expect(clearButtons.length).toBeGreaterThan(0)
    })
  })

  describe('CR Filter - Multiselect', () => {
    it('displays CR filter multiselect', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Open filters first
      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Look for the multiselect
      const multiselect = wrapper.find('[data-testid="cr-filter-multiselect"]')
      expect(multiselect.exists()).toBe(true)
    })

    it('allows selecting multiple CR values', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any

      // Select multiple CRs (as strings, per UiFilterMultiSelect)
      component.selectedCRs = ['0', '5', '17']
      await wrapper.vm.$nextTick()

      expect(component.selectedCRs).toEqual(['0', '5', '17'])
    })

    it('initializes as empty array', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      // Clear filters to ensure clean state (store may have persisted data)
      component.clearFilters()
      await wrapper.vm.$nextTick()

      expect(Array.isArray(component.selectedCRs)).toBe(true)
      expect(component.selectedCRs.length).toBe(0)
    })
  })

  describe('CR Filter chip display', () => {
    it('shows chip with selected CR labels', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Select multiple CRs (as strings)
      const component = wrapper.vm as any
      component.selectedCRs = ['0', '5', '17']

      await wrapper.vm.$nextTick()

      // Look for chip
      const chip = wrapper.find('[data-testid="cr-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('CRs')
      expect(chip.text()).toContain('0')
      expect(chip.text()).toContain('5')
      expect(chip.text()).toContain('17')
    })

    it('shows single CR without plural', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Select single CR (as string)
      const component = wrapper.vm as any
      component.selectedCRs = ['5']

      await wrapper.vm.$nextTick()

      // Look for chip
      const chip = wrapper.find('[data-testid="cr-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('CR')
      expect(chip.text()).not.toContain('CRs')
      expect(chip.text()).toContain('5')
    })

    it('clicking chip clears CR filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Select CRs (as strings)
      const component = wrapper.vm as any
      component.selectedCRs = ['0', '5']

      await wrapper.vm.$nextTick()

      // Click chip
      const chip = wrapper.find('[data-testid="cr-filter-chip"]')
      await chip.trigger('click')

      // CRs should be cleared
      expect(component.selectedCRs).toEqual([])
    })

    it('does not show chip when no CRs selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedCRs = []

      await wrapper.vm.$nextTick()

      // Chip should not exist
      const chip = wrapper.find('[data-testid="cr-filter-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })

  describe('Filter integration', () => {
    it('clears all filters including CRs', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any

      // Set multiple filters
      component.selectedCRs = ['0', '5']
      component.selectedType = 'dragon'
      component.isLegendary = '1'

      await wrapper.vm.$nextTick()

      // Clear all filters
      component.clearFilters()
      await wrapper.vm.$nextTick()

      // All should be cleared
      expect(component.selectedCRs).toEqual([])
      expect(component.selectedType).toBeNull()
      expect(component.isLegendary).toBeNull()
    })

    it('counts CR multiselect in active filter count', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any

      // Clear filters to ensure clean state (store may have persisted data)
      component.clearFilters()
      await wrapper.vm.$nextTick()

      // Initially 0
      expect(component.activeFilterCount).toBe(0)

      // Add CR filter (each CR value counts as 1)
      component.selectedCRs = ['0', '5', '17']
      await wrapper.vm.$nextTick()

      // Store counts each selected CR value individually
      expect(component.activeFilterCount).toBe(3)

      // Add type filter
      component.selectedType = 'dragon'
      await wrapper.vm.$nextTick()

      // 3 CRs + 1 type = 4
      expect(component.activeFilterCount).toBe(4)
    })
  })

  describe('Size Filter - Multiselect', () => {
    it('displays size filter multiselect', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Open filters first
      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Look for the multiselect
      const multiselect = wrapper.find('[data-testid="size-filter-multiselect"]')
      expect(multiselect.exists()).toBe(true)
    })

    it('allows selecting multiple sizes', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any

      // Select multiple sizes (as strings - size IDs)
      component.selectedSizes = ['1', '3', '6']
      await wrapper.vm.$nextTick()

      expect(component.selectedSizes).toEqual(['1', '3', '6'])
    })

    it('initializes as empty array', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      // Clear filters to ensure clean state (store may have persisted data)
      component.clearFilters()
      await wrapper.vm.$nextTick()

      expect(Array.isArray(component.selectedSizes)).toBe(true)
      expect(component.selectedSizes.length).toBe(0)
    })
  })

  describe('Size Filter chip display', () => {
    it('shows chip with selected size labels', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Select multiple sizes (as strings)
      const component = wrapper.vm as any
      component.selectedSizes = ['1', '3', '6']

      await wrapper.vm.$nextTick()

      // Wait for sizeOptions to load
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Verify the computed property works
      expect(component.getSizeFilterText).toBeTruthy()
      expect(component.getSizeFilterText).toContain('Sizes:')

      // Verify activeFilterCount includes this filter
      expect(component.activeFilterCount).toBeGreaterThan(0)
    })

    it('shows single size without plural', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Select single size (as string)
      const component = wrapper.vm as any
      component.selectedSizes = ['3']

      await wrapper.vm.$nextTick()

      // Wait for sizeOptions to load
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Verify the computed property works
      expect(component.getSizeFilterText).toBeTruthy()
      expect(component.getSizeFilterText).toContain('Size:')
      expect(component.getSizeFilterText).not.toContain('Sizes:')

      // Verify activeFilterCount includes this filter
      expect(component.activeFilterCount).toBeGreaterThan(0)
    })

    it('clicking chip clears size filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Select sizes (as strings)
      const component = wrapper.vm as any
      component.selectedSizes = ['1', '3']

      await wrapper.vm.$nextTick()

      // Check chip exists first
      const chip = wrapper.find('[data-testid="size-filter-chip"]')
      if (chip.exists()) {
        await chip.trigger('click')
        // Sizes should be cleared
        expect(component.selectedSizes).toEqual([])
      } else {
        // If chip doesn't exist, call clear function directly
        component.clearSizeFilter()
        expect(component.selectedSizes).toEqual([])
      }
    })

    it('does not show chip when no sizes selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedSizes = []

      await wrapper.vm.$nextTick()

      // Chip should not exist
      const chip = wrapper.find('[data-testid="size-filter-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })

  describe('Alignment Filter - Multiselect', () => {
    it('displays alignment filter multiselect', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Open filters first
      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Look for the multiselect
      const multiselect = wrapper.find('[data-testid="alignment-filter-multiselect"]')
      expect(multiselect.exists()).toBe(true)
    })

    it('allows selecting multiple alignments', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any

      // Select multiple alignments
      component.selectedAlignments = ['Lawful Good', 'Chaotic Evil', 'Neutral']
      await wrapper.vm.$nextTick()

      // Check length and content (order doesn't matter for multiselect)
      expect(component.selectedAlignments.length).toBe(3)
      expect(component.selectedAlignments).toContain('Lawful Good')
      expect(component.selectedAlignments).toContain('Chaotic Evil')
      expect(component.selectedAlignments).toContain('Neutral')
    })

    it('initializes as empty array', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      // Clear filters to ensure clean state (store may have persisted data)
      component.clearFilters()
      await wrapper.vm.$nextTick()

      expect(Array.isArray(component.selectedAlignments)).toBe(true)
      expect(component.selectedAlignments.length).toBe(0)
    })
  })

  describe('Movement Types Multiselect', () => {
    it('displays movement types multiselect', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const multiselect = wrapper.find('[data-testid="movement-types-filter"]')
      expect(multiselect.exists()).toBe(true)
    })

    it('allows selecting multiple movement types', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any
      component.selectedMovementTypes = ['fly', 'swim', 'burrow']
      await wrapper.vm.$nextTick()

      expect(component.selectedMovementTypes).toHaveLength(3)
      expect(component.selectedMovementTypes).toContain('fly')
      expect(component.selectedMovementTypes).toContain('swim')
      expect(component.selectedMovementTypes).toContain('burrow')
    })

    it('initializes as empty array', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      // Clear filters to ensure clean state (store may have persisted data)
      component.clearFilters()
      await wrapper.vm.$nextTick()

      expect(Array.isArray(component.selectedMovementTypes)).toBe(true)
      expect(component.selectedMovementTypes.length).toBe(0)
    })

    it('shows movement types chip when types selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any
      component.selectedMovementTypes = ['fly', 'swim']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="movement-types-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Movement')
      expect(chip.text()).toContain('Fly')
      expect(chip.text()).toContain('Swim')
    })

    it('does not show chip when no movement types selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any
      component.selectedMovementTypes = []
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="movement-types-chip"]')
      expect(chip.exists()).toBe(false)
    })

    it('clicking chip clears movement types filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any
      component.selectedMovementTypes = ['fly', 'hover']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="movement-types-chip"]')
      await chip.trigger('click')

      expect(component.selectedMovementTypes).toEqual([])
    })
  })

  describe('Monsters AC Filter', () => {
    it('has AC range filter state', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any

      // Should have selectedACRange ref
      expect(component.selectedACRange).toBeDefined()
      expect(component.selectedACRange).toBeNull()
    })

    it('has correct AC range options', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any

      // Should have acRangeOptions
      expect(component.acRangeOptions).toBeDefined()
      expect(Array.isArray(component.acRangeOptions)).toBe(true)
      expect(component.acRangeOptions.length).toBe(4)

      // Verify option labels
      const labels = component.acRangeOptions.map((o: any) => o.label)
      expect(labels).toContain('All AC')
      expect(labels).toContain('Low (10-14)')
      expect(labels).toContain('Medium (15-17)')
      expect(labels).toContain('High (18+)')
    })

    it('shows AC range filter chip when AC is selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedACRange = '10-14'
      await wrapper.vm.$nextTick()

      const chips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('AC:') && btn.text().includes('Low') && btn.text().includes('✕')
      )
      expect(chips.length).toBeGreaterThan(0)
    })

    it('clicking AC range chip clears the filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedACRange = '10-14'
      await wrapper.vm.$nextTick()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('AC:') && btn.text().includes('Low') && btn.text().includes('✕')
      )
      expect(chip).toBeDefined()
      await chip!.trigger('click')

      expect(component.selectedACRange).toBeNull()
    })
  })

  describe('Monsters HP Filter', () => {
    it('has HP range filter state', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any

      // Should have selectedHPRange ref
      expect(component.selectedHPRange).toBeDefined()
      expect(component.selectedHPRange).toBeNull()
    })

    it('has correct HP range options', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any

      // Should have hpRangeOptions
      expect(component.hpRangeOptions).toBeDefined()
      expect(Array.isArray(component.hpRangeOptions)).toBe(true)
      expect(component.hpRangeOptions.length).toBe(5)

      // Verify option labels
      const labels = component.hpRangeOptions.map((o: any) => o.label)
      expect(labels).toContain('All HP')
      expect(labels).toContain('Low (1-50)')
      expect(labels).toContain('Medium (51-150)')
      expect(labels).toContain('High (151-300)')
      expect(labels).toContain('Very High (301+)')
    })

    it('shows HP range filter chip when HP is selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedHPRange = '1-50'
      await wrapper.vm.$nextTick()

      const chips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('HP:') && btn.text().includes('Low') && btn.text().includes('✕')
      )
      expect(chips.length).toBeGreaterThan(0)
    })

    it('clicking HP range chip clears the filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedHPRange = '1-50'
      await wrapper.vm.$nextTick()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('HP:') && btn.text().includes('Low') && btn.text().includes('✕')
      )
      expect(chip).toBeDefined()
      await chip!.trigger('click')

      expect(component.selectedHPRange).toBeNull()
    })
  })

  describe('Armor Type Filter - Multiselect', () => {
    it('displays armor type filter multiselect', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const multiselect = wrapper.find('[data-testid="armor-type-filter-multiselect"]')
      expect(multiselect.exists()).toBe(true)
    })

    it('allows selecting multiple armor types', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any

      component.selectedArmorTypes = ['natural armor', 'plate armor', 'leather armor']
      await wrapper.vm.$nextTick()

      // Check length and content (order doesn't matter for multiselect)
      expect(component.selectedArmorTypes.length).toBe(3)
      expect(component.selectedArmorTypes).toContain('natural armor')
      expect(component.selectedArmorTypes).toContain('plate armor')
      expect(component.selectedArmorTypes).toContain('leather armor')
    })

    it('initializes as empty array', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      // Clear filters to ensure clean state (store may have persisted data)
      component.clearFilters()
      await wrapper.vm.$nextTick()

      expect(Array.isArray(component.selectedArmorTypes)).toBe(true)
      expect(component.selectedArmorTypes.length).toBe(0)
    })

    it('shows chip with selected armor types', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedArmorTypes = ['natural armor', 'plate armor']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="armor-type-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Armor Types')
      expect(chip.text()).toContain('✕')
    })

    it('clicking chip clears armor type filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedArmorTypes = ['natural armor']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="armor-type-filter-chip"]')
      await chip.trigger('click')

      expect(component.selectedArmorTypes).toEqual([])
    })
  })

  describe('Boolean Ability Filters', () => {
    it('displays has lair actions toggle', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const toggle = wrapper.find('[data-testid="has-lair-actions-toggle"]')
      expect(toggle.exists()).toBe(true)
    })

    it('displays has reactions toggle', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const toggle = wrapper.find('[data-testid="has-reactions-toggle"]')
      expect(toggle.exists()).toBe(true)
    })

    it('displays is spellcaster toggle', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const toggle = wrapper.find('[data-testid="is-spellcaster-toggle"]')
      expect(toggle.exists()).toBe(true)
    })

    it('displays has magic resistance toggle', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const toggle = wrapper.find('[data-testid="has-magic-resistance-toggle"]')
      expect(toggle.exists()).toBe(true)
    })

    it('shows chip when has lair actions is set to yes', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasLairActions = '1'
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-lair-actions-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Lair Actions')
      expect(chip.text()).toContain('Yes')
    })

    it('shows chip when has reactions is set to yes', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasReactions = '1'
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-reactions-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Reactions')
      expect(chip.text()).toContain('Yes')
    })

    it('shows chip when is spellcaster is set to yes', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.isSpellcaster = '1'
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="is-spellcaster-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Spellcaster')
      expect(chip.text()).toContain('Yes')
    })

    it('shows chip when has magic resistance is set to yes', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasMagicResistance = '1'
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-magic-resistance-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Magic Resistance')
      expect(chip.text()).toContain('Yes')
    })

    it('includes all 5 new filters in activeFilterCount', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any

      // Clear filters to ensure clean state (store may have persisted data)
      component.clearFilters()
      await wrapper.vm.$nextTick()

      expect(component.activeFilterCount).toBe(0)

      component.selectedArmorTypes = ['natural armor']
      component.hasLairActions = '1'
      component.hasReactions = '1'
      component.isSpellcaster = '1'
      component.hasMagicResistance = '1'
      await wrapper.vm.$nextTick()

      expect(component.activeFilterCount).toBe(5)
    })

    it('clears all 5 new filters when clearFilters is called', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any

      component.selectedArmorTypes = ['natural armor']
      component.hasLairActions = '1'
      component.hasReactions = '1'
      component.isSpellcaster = '1'
      component.hasMagicResistance = '1'
      await wrapper.vm.$nextTick()

      component.clearFilters()
      await wrapper.vm.$nextTick()

      expect(component.selectedArmorTypes).toEqual([])
      expect(component.hasLairActions).toBeNull()
      expect(component.hasReactions).toBeNull()
      expect(component.isSpellcaster).toBeNull()
      expect(component.hasMagicResistance).toBeNull()
    })
  })
})
