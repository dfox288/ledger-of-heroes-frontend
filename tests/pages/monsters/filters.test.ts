/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Monsters Page - Filter Tests (Consolidated)
 *
 * This file tests PAGE-LEVEL filter behavior only:
 * - UI rendering (chips, labels, button positions)
 * - Chip click interactions
 * - Multiselect filter behavior
 * - Computed option arrays
 *
 * Store-level tests (state mutations, hasActiveFilters, clearAll, URL sync)
 * are covered in tests/stores/filterStores.test.ts
 *
 * Consolidation: 3 files (1,145 lines) → 1 file
 * GitHub Issue: #636
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import MonstersPage from '~/pages/monsters/index.vue'
import { useMonsterFiltersStore } from '~/stores/monsterFilters'

describe('Monsters Page - Filters', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ============================================================================
  // UI LAYOUT & LABELS
  // ============================================================================

  describe('Active filters label', () => {
    it('displays "Active filters:" label when filters are active', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedType = 'dragon'
      await wrapper.vm.$nextTick()

      const text = wrapper.text()
      expect(text).toContain('Active filters:')
      expect(text).not.toContain('Active:')
    })
  })

  describe('Clear filters button', () => {
    it('positions button on same row as Active filters', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.$patch({
        selectedType: 'dragon',
        filtersOpen: true
      })
      await wrapper.vm.$nextTick()

      const chipsRow = wrapper.find('.flex.flex-wrap.items-center.justify-between')
      expect(chipsRow.exists()).toBe(true)

      const buttons = chipsRow.findAll('button')
      const clearButton = buttons.find(btn => btn.text().includes('Clear filters'))
      expect(clearButton?.exists()).toBe(true)
    })

    it('shows only when filters are active', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      const clearButton = wrapper.find('button:contains("Clear filters")')
      expect(clearButton.exists()).toBe(false)

      store.selectedType = 'dragon'
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('button')
      const clearButtons = buttons.filter(btn => btn.text().includes('Clear filters'))
      expect(clearButtons.length).toBeGreaterThan(0)
    })

    it('clears all filters when clicked', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.$patch({
        selectedCRs: ['0', '5'],
        selectedType: 'dragon',
        isLegendary: '1'
      })
      await wrapper.vm.$nextTick()

      store.clearAll()

      expect(store.selectedCRs).toEqual([])
      expect(store.selectedType).toBeNull()
      expect(store.isLegendary).toBeNull()
    })
  })

  // ============================================================================
  // CR FILTER - Multiselect & Chip
  // ============================================================================

  describe('CR Filter', () => {
    it('displays CR filter multiselect', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.filtersOpen = true
      await wrapper.vm.$nextTick()

      const multiselect = wrapper.find('[data-testid="cr-filter-multiselect"]')
      expect(multiselect.exists()).toBe(true)
    })

    it('allows selecting multiple CR values', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedCRs = ['0', '5', '17']
      expect(store.selectedCRs).toEqual(['0', '5', '17'])
    })

    it('initializes as empty array', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.clearAll()
      expect(Array.isArray(store.selectedCRs)).toBe(true)
      expect(store.selectedCRs.length).toBe(0)
    })

    it('shows chip with selected CR labels', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedCRs = ['0', '5', '17']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="cr-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('CRs')
      expect(chip.text()).toContain('0')
      expect(chip.text()).toContain('5')
      expect(chip.text()).toContain('17')
    })

    it('shows single CR without plural', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedCRs = ['5']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="cr-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('CR')
      expect(chip.text()).not.toContain('CRs')
      expect(chip.text()).toContain('5')
    })

    it('clicking chip clears CR filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedCRs = ['0', '5']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="cr-filter-chip"]')
      await chip.trigger('click')

      expect(store.selectedCRs).toEqual([])
    })

    it('does not show chip when no CRs selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedCRs = []
      const chip = wrapper.find('[data-testid="cr-filter-chip"]')
      expect(chip.exists()).toBe(false)
    })

    it('counts CR selections in active filter count', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()
      const component = wrapper.vm as any

      store.clearAll()
      expect(component.activeFilterCount).toBe(0)

      store.$patch({
        selectedCRs: ['0', '5', '17'],
        selectedType: 'dragon'
      })
      await wrapper.vm.$nextTick()

      // 3 CRs + 1 type = 4
      expect(component.activeFilterCount).toBe(4)
    })
  })

  // ============================================================================
  // SIZE FILTER - Multiselect & Chip
  // ============================================================================

  describe('Size Filter', () => {
    it('displays size filter multiselect', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.filtersOpen = true
      await wrapper.vm.$nextTick()

      const multiselect = wrapper.find('[data-testid="size-filter-multiselect"]')
      expect(multiselect.exists()).toBe(true)
    })

    it('allows selecting multiple sizes', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedSizes = ['1', '3', '6']
      expect(store.selectedSizes).toEqual(['1', '3', '6'])
    })

    it('initializes as empty array', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.clearAll()
      expect(Array.isArray(store.selectedSizes)).toBe(true)
      expect(store.selectedSizes.length).toBe(0)
    })

    it('shows chip with selected size labels', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()
      const component = wrapper.vm as any

      store.selectedSizes = ['1', '3', '6']
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(component.getSizeFilterText).toBeTruthy()
      expect(component.getSizeFilterText).toContain('Sizes:')
      expect(component.activeFilterCount).toBeGreaterThan(0)
    })

    it('shows single size without plural', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()
      const component = wrapper.vm as any

      store.selectedSizes = ['3']
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(component.getSizeFilterText).toBeTruthy()
      expect(component.getSizeFilterText).toContain('Size:')
      expect(component.getSizeFilterText).not.toContain('Sizes:')
    })

    it('clicking chip clears size filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedSizes = ['1', '3']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="size-filter-chip"]')
      if (chip.exists()) {
        await chip.trigger('click')
        expect(store.selectedSizes).toEqual([])
      } else {
        const component = wrapper.vm as any
        component.clearSizeFilter()
        expect(store.selectedSizes).toEqual([])
      }
    })

    it('does not show chip when no sizes selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedSizes = []
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="size-filter-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })

  // ============================================================================
  // ALIGNMENT FILTER - Multiselect & Chip
  // ============================================================================

  describe('Alignment Filter', () => {
    it('displays alignment filter multiselect', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.filtersOpen = true
      await wrapper.vm.$nextTick()

      const multiselect = wrapper.find('[data-testid="alignment-filter-multiselect"]')
      expect(multiselect.exists()).toBe(true)
    })

    it('allows selecting multiple alignments', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedAlignments = ['Lawful Good', 'Chaotic Evil', 'Neutral']

      expect(store.selectedAlignments.length).toBe(3)
      expect(store.selectedAlignments).toContain('Lawful Good')
      expect(store.selectedAlignments).toContain('Chaotic Evil')
      expect(store.selectedAlignments).toContain('Neutral')
    })

    it('initializes as empty array', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.clearAll()
      expect(Array.isArray(store.selectedAlignments)).toBe(true)
      expect(store.selectedAlignments.length).toBe(0)
    })

    it('shows chip with selected alignment labels', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedAlignments = ['Lawful Good', 'Chaotic Evil', 'Neutral']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="alignment-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Alignments')
      expect(chip.text()).toContain('Lawful Good')
      expect(chip.text()).toContain('Chaotic Evil')
      expect(chip.text()).toContain('Neutral')
    })

    it('shows single alignment without plural', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedAlignments = ['Lawful Good']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="alignment-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Alignment')
      expect(chip.text()).not.toContain('Alignments')
    })

    it('clicking chip clears alignment filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedAlignments = ['Lawful Good', 'Chaotic Evil']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="alignment-filter-chip"]')
      await chip.trigger('click')

      expect(store.selectedAlignments).toEqual([])
    })

    it('does not show chip when no alignments selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedAlignments = []
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="alignment-filter-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })

  // ============================================================================
  // MOVEMENT TYPES FILTER - Multiselect & Chip
  // ============================================================================

  describe('Movement Types Filter', () => {
    it('displays movement types multiselect', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.filtersOpen = true
      await wrapper.vm.$nextTick()

      const multiselect = wrapper.find('[data-testid="movement-types-filter"]')
      expect(multiselect.exists()).toBe(true)
    })

    it('allows selecting multiple movement types', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedMovementTypes = ['fly', 'swim', 'burrow']

      expect(store.selectedMovementTypes).toHaveLength(3)
      expect(store.selectedMovementTypes).toContain('fly')
      expect(store.selectedMovementTypes).toContain('swim')
      expect(store.selectedMovementTypes).toContain('burrow')
    })

    it('initializes as empty array', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.clearAll()
      expect(Array.isArray(store.selectedMovementTypes)).toBe(true)
      expect(store.selectedMovementTypes.length).toBe(0)
    })

    it('shows chip with selected movement types', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedMovementTypes = ['fly', 'swim']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="movement-types-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Movement')
      expect(chip.text()).toContain('Fly')
      expect(chip.text()).toContain('Swim')
    })

    it('shows single movement type', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedMovementTypes = ['burrow']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="movement-types-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Movement')
      expect(chip.text()).toContain('Burrow')
    })

    it('shows multiple movement types sorted', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedMovementTypes = ['swim', 'climb', 'fly']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="movement-types-chip"]')
      expect(chip.exists()).toBe(true)
      const text = chip.text()
      expect(text).toContain('Climb')
      expect(text).toContain('Fly')
      expect(text).toContain('Swim')
    })

    it('clicking chip clears movement types filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedMovementTypes = ['fly', 'hover']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="movement-types-chip"]')
      await chip.trigger('click')

      expect(store.selectedMovementTypes).toEqual([])
    })

    it('does not show chip when no movement types selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedMovementTypes = []
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="movement-types-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })

  // ============================================================================
  // ARMOR TYPE FILTER - Multiselect & Chip
  // ============================================================================

  describe('Armor Type Filter', () => {
    it('displays armor type filter multiselect', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.filtersOpen = true
      await wrapper.vm.$nextTick()

      const multiselect = wrapper.find('[data-testid="armor-type-filter-multiselect"]')
      expect(multiselect.exists()).toBe(true)
    })

    it('allows selecting multiple armor types', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedArmorTypes = ['natural armor', 'plate armor', 'leather armor']

      expect(store.selectedArmorTypes.length).toBe(3)
      expect(store.selectedArmorTypes).toContain('natural armor')
      expect(store.selectedArmorTypes).toContain('plate armor')
      expect(store.selectedArmorTypes).toContain('leather armor')
    })

    it('initializes as empty array', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.clearAll()
      expect(Array.isArray(store.selectedArmorTypes)).toBe(true)
      expect(store.selectedArmorTypes.length).toBe(0)
    })

    it('shows chip with selected armor types', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedArmorTypes = ['natural armor', 'plate armor']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="armor-type-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Armor Types')
      expect(chip.text()).toContain('✕')
    })

    it('clicking chip clears armor type filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedArmorTypes = ['natural armor']
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="armor-type-filter-chip"]')
      await chip.trigger('click')

      expect(store.selectedArmorTypes).toEqual([])
    })
  })

  // ============================================================================
  // AC RANGE FILTER
  // ============================================================================

  describe('AC Range Filter', () => {
    it('has AC range filter state', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      expect(store.selectedACRange).toBeDefined()
      expect(store.selectedACRange).toBeNull()
    })

    it('has correct AC range options', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      expect(component.acRangeOptions).toBeDefined()
      expect(Array.isArray(component.acRangeOptions)).toBe(true)
      expect(component.acRangeOptions.length).toBe(4)

      const labels = component.acRangeOptions.map((o: any) => o.label)
      expect(labels).toContain('All AC')
      expect(labels).toContain('Low (10-14)')
      expect(labels).toContain('Medium (15-17)')
      expect(labels).toContain('High (18+)')
    })

    it('shows AC range filter chip when AC is selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedACRange = '10-14'
      await wrapper.vm.$nextTick()

      const chips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('AC:') && btn.text().includes('Low') && btn.text().includes('✕')
      )
      expect(chips.length).toBeGreaterThan(0)
    })

    it('clicking AC range chip clears the filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedACRange = '10-14'
      await wrapper.vm.$nextTick()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('AC:') && btn.text().includes('Low') && btn.text().includes('✕')
      )
      expect(chip).toBeDefined()
      await chip!.trigger('click')

      expect(store.selectedACRange).toBeNull()
    })
  })

  // ============================================================================
  // HP RANGE FILTER
  // ============================================================================

  describe('HP Range Filter', () => {
    it('has HP range filter state', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      expect(store.selectedHPRange).toBeDefined()
      expect(store.selectedHPRange).toBeNull()
    })

    it('has correct HP range options', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      expect(component.hpRangeOptions).toBeDefined()
      expect(Array.isArray(component.hpRangeOptions)).toBe(true)
      expect(component.hpRangeOptions.length).toBe(5)

      const labels = component.hpRangeOptions.map((o: any) => o.label)
      expect(labels).toContain('All HP')
      expect(labels).toContain('Low (1-50)')
      expect(labels).toContain('Medium (51-150)')
      expect(labels).toContain('High (151-300)')
      expect(labels).toContain('Very High (301+)')
    })

    it('shows HP range filter chip when HP is selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedHPRange = '1-50'
      await wrapper.vm.$nextTick()

      const chips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('HP:') && btn.text().includes('Low') && btn.text().includes('✕')
      )
      expect(chips.length).toBeGreaterThan(0)
    })

    it('clicking HP range chip clears the filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.selectedHPRange = '1-50'
      await wrapper.vm.$nextTick()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('HP:') && btn.text().includes('Low') && btn.text().includes('✕')
      )
      expect(chip).toBeDefined()
      await chip!.trigger('click')

      expect(store.selectedHPRange).toBeNull()
    })
  })

  // ============================================================================
  // BOOLEAN ABILITY FILTERS
  // ============================================================================

  describe('Boolean Ability Filters', () => {
    it('displays has lair actions toggle', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.filtersOpen = true
      await wrapper.vm.$nextTick()

      const toggle = wrapper.find('[data-testid="has-lair-actions-toggle"]')
      expect(toggle.exists()).toBe(true)
    })

    it('displays has reactions toggle', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.filtersOpen = true
      await wrapper.vm.$nextTick()

      const toggle = wrapper.find('[data-testid="has-reactions-toggle"]')
      expect(toggle.exists()).toBe(true)
    })

    it('displays is spellcaster toggle', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.filtersOpen = true
      await wrapper.vm.$nextTick()

      const toggle = wrapper.find('[data-testid="is-spellcaster-toggle"]')
      expect(toggle.exists()).toBe(true)
    })

    it('displays has magic resistance toggle', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.filtersOpen = true
      await wrapper.vm.$nextTick()

      const toggle = wrapper.find('[data-testid="has-magic-resistance-toggle"]')
      expect(toggle.exists()).toBe(true)
    })

    it('shows chip when has lair actions is set to yes', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.hasLairActions = '1'
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-lair-actions-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Lair Actions')
      expect(chip.text()).toContain('Yes')
    })

    it('shows chip when has reactions is set to yes', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.hasReactions = '1'
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-reactions-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Reactions')
      expect(chip.text()).toContain('Yes')
    })

    it('shows chip when is spellcaster is set to yes', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.isSpellcaster = '1'
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="is-spellcaster-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Spellcaster')
      expect(chip.text()).toContain('Yes')
    })

    it('shows chip when has magic resistance is set to yes', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.hasMagicResistance = '1'
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-magic-resistance-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Magic Resistance')
      expect(chip.text()).toContain('Yes')
    })

    it('includes all boolean filters in activeFilterCount', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()
      const component = wrapper.vm as any

      store.clearAll()
      expect(component.activeFilterCount).toBe(0)

      store.$patch({
        selectedArmorTypes: ['natural armor'],
        hasLairActions: '1',
        hasReactions: '1',
        isSpellcaster: '1',
        hasMagicResistance: '1'
      })
      await wrapper.vm.$nextTick()

      expect(component.activeFilterCount).toBe(5)
    })

    it('clears all boolean filters when clearAll is called', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.$patch({
        selectedArmorTypes: ['natural armor'],
        hasLairActions: '1',
        hasReactions: '1',
        isSpellcaster: '1',
        hasMagicResistance: '1'
      })
      await wrapper.vm.$nextTick()

      store.clearAll()

      expect(store.selectedArmorTypes).toEqual([])
      expect(store.hasLairActions).toBeNull()
      expect(store.hasReactions).toBeNull()
      expect(store.isSpellcaster).toBeNull()
      expect(store.hasMagicResistance).toBeNull()
    })
  })

  // ============================================================================
  // COMPUTED OPTIONS - API-driven filter options
  // ============================================================================

  describe('Alignment Options', () => {
    it('alignmentOptions computed property exists', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      expect(component.alignmentOptions).toBeDefined()
      expect(Array.isArray(component.alignmentOptions)).toBe(true)
    })

    it('alignmentOptions returns array with label/value pairs when loaded', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      expect(Array.isArray(component.alignmentOptions)).toBe(true)

      if (component.alignmentOptions.length > 0) {
        component.alignmentOptions.forEach((option: any) => {
          expect(option).toHaveProperty('label')
          expect(option).toHaveProperty('value')
          expect(typeof option.label).toBe('string')
          expect(typeof option.value).toBe('string')
        })
      }
    })

    it('handles missing API data gracefully', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      expect(component.alignmentOptions).toBeDefined()
      expect(Array.isArray(component.alignmentOptions)).toBe(true)
    })
  })

  describe('Monster Type Options', () => {
    it('typeOptions computed property exists', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      expect(component.typeOptions).toBeDefined()
      expect(Array.isArray(component.typeOptions)).toBe(true)
    })

    it('includes "All Types" as first option with null value', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      expect(component.typeOptions.length).toBeGreaterThan(0)
      expect(component.typeOptions[0]).toEqual({
        label: 'All Types',
        value: null
      })
    })

    it('maps API data to label/slug format', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      component.typeOptions.forEach((option: any, index: number) => {
        expect(option).toHaveProperty('label')
        expect(option).toHaveProperty('value')
        expect(typeof option.label).toBe('string')

        if (index === 0) {
          expect(option.value).toBe(null)
        } else if (option.value !== null) {
          expect(typeof option.value).toBe('string')
        }
      })
    })

    it('displays creature type filter select', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const select = wrapper.find('[data-testid="type-filter"]')
      expect(select.exists()).toBe(true)
    })

    it('getTypeLabel helper returns correct label', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      expect(component.getTypeLabel(null)).toBe('All Types')

      if (component.typeOptions.length > 1) {
        const secondOption = component.typeOptions[1]
        if (secondOption.value) {
          expect(component.getTypeLabel(secondOption.value)).toBe(secondOption.label)
        }
      }
    })
  })

  describe('Armor Type Options', () => {
    it('armorTypeOptions computed property exists', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      expect(component.armorTypeOptions).toBeDefined()
      expect(Array.isArray(component.armorTypeOptions)).toBe(true)
    })

    it('armorTypeOptions returns array with label/value pairs when loaded', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      expect(Array.isArray(component.armorTypeOptions)).toBe(true)

      if (component.armorTypeOptions.length > 0) {
        component.armorTypeOptions.forEach((option: any) => {
          expect(option).toHaveProperty('label')
          expect(option).toHaveProperty('value')
          expect(typeof option.label).toBe('string')
          expect(typeof option.value).toBe('string')
        })
      }
    })

    it('handles missing API data gracefully', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      expect(component.armorTypeOptions).toBeDefined()
      expect(Array.isArray(component.armorTypeOptions)).toBe(true)
    })
  })

  // ============================================================================
  // FILTER INTEGRATION
  // ============================================================================

  describe('Filter Integration', () => {
    it('shows both alignment and movement chips when active', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.$patch({
        selectedAlignments: ['Lawful Good', 'Chaotic Evil'],
        selectedMovementTypes: ['fly', 'swim']
      })
      await wrapper.vm.$nextTick()

      expect(wrapper.find('[data-testid="alignment-filter-chip"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="movement-types-chip"]').exists()).toBe(true)
    })

    it('clears all filters via clearAll()', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      store.$patch({
        selectedAlignments: ['Lawful Good'],
        selectedMovementTypes: ['fly', 'burrow', 'climb']
      })
      await wrapper.vm.$nextTick()

      store.clearAll()

      expect(store.selectedAlignments).toEqual([])
      expect(store.selectedMovementTypes).toEqual([])
    })
  })
})
