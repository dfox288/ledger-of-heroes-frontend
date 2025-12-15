/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Items Page - Filter Tests (Consolidated)
 * Consolidation: 4 files → 2 files
 * GitHub Issue: #323
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ItemsPage from '~/pages/items/index.vue'

describe('Items Page - Filters', () => {
  // Reset Pinia store before each test to ensure clean state
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ============================================================================
  // BASIC FILTERS
  // ============================================================================

  describe('filter label changes', () => {
    it('shows "Active filters:" label (not "Active:")', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedRarity = 'rare' // Use rarity instead - it's known to work
      await flushPromises()

      // Find all elements with this class and look for the one with "Active filters:"
      const labels = wrapper.findAll('.text-sm.font-medium')
      const activeFiltersLabel = labels.find(l => l.text() === 'Active filters:')
      expect(activeFiltersLabel).toBeDefined()
      expect(activeFiltersLabel!.text()).toBe('Active filters:')
    })

    it('does not show old "Active:" label', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedRarity = 'rare'
      await flushPromises()

      // Check that none of the labels say "Active:"
      const labels = wrapper.findAll('.text-sm.font-medium')
      const oldLabel = labels.find(l => l.text() === 'Active:')
      expect(oldLabel).toBeUndefined()
    })
  })

  describe('clear filters button position', () => {
    it('shows clear filters button on same row as chips', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedRarity = 'rare'
      await flushPromises()

      // Find the outer chips container (UiFilterChips component root)
      // It has justify-between to separate chips from clear button
      const outerContainer = wrapper.findAll('.flex.flex-wrap.items-center.justify-between')
        .find((el) => {
          const text = el.text()
          return text.includes('Active filters:') && text.includes('Clear filters')
        })
      expect(outerContainer).toBeDefined()

      // Clear filters button should be in this container
      const clearButton = wrapper.findAll('button').find(btn =>
        btn.text().includes('Clear filters')
      )
      expect(clearButton).toBeDefined()
      expect(clearButton!.text()).toContain('Clear filters')
    })

    it('does not show clear filters button in separate section', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Old pattern: button in .flex.justify-end container
      const oldButtonContainer = wrapper.find('.flex.justify-end')

      // If it exists, it should NOT contain the Clear Filters button
      if (oldButtonContainer.exists()) {
        const button = oldButtonContainer.find('button')
        if (button.exists()) {
          expect(button.text()).not.toContain('Clear Filters')
          expect(button.text()).not.toContain('Clear filters')
        }
      }
    })

    it('clear filters button is right-aligned using justify-between', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedRarity = 'rare'
      await flushPromises()

      // Find the chips row with justify-between (UiFilterChips root element)
      const chipsRow = wrapper.findAll('.flex.flex-wrap.items-center.justify-between')
        .find((el) => {
          const text = el.text()
          return text.includes('Active filters:') && text.includes('Clear filters')
        })
      expect(chipsRow).toBeDefined()
      expect(chipsRow!.classes()).toContain('justify-between')
    })
  })

  describe('filter chip display', () => {
    it('shows type filter chip when type is selected', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      // Set rarity to make chips container visible, then also set type
      component.selectedRarity = 'rare'
      component.selectedType = 1
      await flushPromises()

      // The type chip should be visible in the chips section
      // Look for a button/chip that contains "Type:" text
      const allButtons = wrapper.findAll('button')
      const typeChip = allButtons.find(btn => btn.text().includes('Type:') && btn.text().includes('✕'))

      expect(typeChip).toBeDefined()
      expect(typeChip!.text()).toContain('Type:')
    })

    it('shows rarity filter chip when rarity is selected', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedRarity = 'rare'
      await flushPromises()

      const chips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('rare')
      )
      expect(chips.length).toBeGreaterThan(0)
    })

    it('shows magic filter chip when magic filter is selected', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedMagic = 'true'
      await flushPromises()

      const chips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('Magic')
      )
      expect(chips.length).toBeGreaterThan(0)
    })

    it('clicking chip clears that specific filter', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      // Clear filters to ensure clean state (store may have persisted data)
      component.clearFilters()
      await wrapper.vm.$nextTick()

      component.selectedRarity = 'rare'
      await wrapper.vm.$nextTick()

      // Find the rarity chip - format is "Rarity: rare" with ✕
      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Rarity:') && btn.text().includes('rare') && btn.text().includes('✕')
      )
      expect(chip).toBeDefined()

      // Click the chip
      await chip!.trigger('click')

      // Rarity should be cleared
      expect(component.selectedRarity).toBeNull()
    })
  })

  describe('clear filters functionality', () => {
    it('clears all filters when clear filters button is clicked', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedType = 1
      component.selectedRarity = 'rare'
      component.selectedMagic = 'true'
      component.hasCharges = '1'
      component.requiresAttunement = '1'
      component.stealthDisadvantage = '1'
      component.selectedProperties = ['Finesse', 'Light']
      component.selectedDamageTypes = ['S', 'P']
      component.selectedSources = ['PHB', 'DMG']
      await flushPromises()

      // Find and click clear filters button
      const clearButton = wrapper.findAll('button').find(btn =>
        btn.text().includes('Clear filters')
      )
      expect(clearButton).toBeDefined()
      await clearButton!.trigger('click')

      // All filters should be cleared
      expect(component.selectedType).toBeNull()
      expect(component.selectedRarity).toBeNull()
      expect(component.selectedMagic).toBeNull()
      expect(component.hasCharges).toBeNull()
      expect(component.requiresAttunement).toBeNull()
      expect(component.stealthDisadvantage).toBeNull()
      expect(component.selectedProperties).toEqual([])
      expect(component.selectedDamageTypes).toEqual([])
      expect(component.selectedSources).toEqual([])
      expect(component.selectedCostRange).toBeNull()
    })

    it('only shows clear filters button when filters are active', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any

      // Wait for initial render
      await flushPromises()

      // No filters active - entire chips container should not be visible
      // UiFilterChips has v-if="visible" which is controlled by hasActiveFilters
      let chipsContainer = wrapper.findAll('.flex.flex-wrap.items-center.justify-between')
        .find(el => el.text().includes('Active filters:'))
      expect(chipsContainer).toBeUndefined()

      // Add a filter
      component.selectedRarity = 'rare'
      await flushPromises()

      // Chips container should now be visible with clear button
      chipsContainer = wrapper.findAll('.flex.flex-wrap.items-center.justify-between')
        .find(el => el.text().includes('Active filters:'))
      expect(chipsContainer).toBeDefined()

      // Clear button should exist
      const clearButton = wrapper.findAll('button').find(btn =>
        btn.text().includes('Clear filters')
      )
      expect(clearButton).toBeDefined()
    })
  })

  describe('Attunement filter', () => {
    it('shows attunement toggle filter in QUICK section', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Should have requiresAttunement ref
      expect(component.requiresAttunement).toBeDefined()
    })

    it('shows attunement filter chip when set to Yes', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.requiresAttunement = '1'
      await flushPromises()

      const chips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('Attunement: Yes')
      )
      expect(chips.length).toBeGreaterThan(0)
    })

    it('shows attunement filter chip when set to No', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.requiresAttunement = '0'
      await flushPromises()

      const chips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('Attunement: No')
      )
      expect(chips.length).toBeGreaterThan(0)
    })

    it('clicking attunement chip clears the filter', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.requiresAttunement = '1'
      await flushPromises()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Attunement: Yes')
      )
      expect(chip).toBeDefined()
      await chip!.trigger('click')

      expect(component.requiresAttunement).toBeNull()
    })
  })

  describe('Stealth Disadvantage filter', () => {
    it('shows stealth disadvantage toggle filter in QUICK section', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Should have stealthDisadvantage ref
      expect(component.stealthDisadvantage).toBeDefined()
    })

    it('shows stealth disadvantage filter chip when set to Yes', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.stealthDisadvantage = '1'
      await flushPromises()

      const chips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('Stealth Disadv.: Yes')
      )
      expect(chips.length).toBeGreaterThan(0)
    })

    it('clicking stealth disadvantage chip clears the filter', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.stealthDisadvantage = '1'
      await flushPromises()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Stealth Disadv.: Yes')
      )
      expect(chip).toBeDefined()
      await chip!.trigger('click')

      expect(component.stealthDisadvantage).toBeNull()
    })
  })

  describe('Properties filter', () => {
    it('shows properties multiselect filter in ADVANCED section', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Should have selectedProperties ref
      expect(component.selectedProperties).toBeDefined()
      expect(Array.isArray(component.selectedProperties)).toBe(true)
    })

    it('shows property filter chips when properties are selected', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedProperties = ['Finesse', 'Light']
      await flushPromises()

      const finesseChip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Finesse')
      )
      const lightChip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Light')
      )

      expect(finesseChip).toBeDefined()
      expect(lightChip).toBeDefined()
    })

    it('clicking property chip removes that property from filter', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedProperties = ['Finesse', 'Light']
      await flushPromises()

      const finesseChip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Finesse') && btn.text().includes('✕')
      )
      expect(finesseChip).toBeDefined()
      await finesseChip!.trigger('click')

      expect(component.selectedProperties).toEqual(['Light'])
    })
  })

  describe('Damage Type filter', () => {
    it('shows damage type multiselect filter in ADVANCED section', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Should have selectedDamageTypes ref
      expect(component.selectedDamageTypes).toBeDefined()
      expect(Array.isArray(component.selectedDamageTypes)).toBe(true)
    })

    it('shows damage type filter chips when damage types are selected', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      // Set rarity to make chips container visible
      component.selectedRarity = 'rare'
      component.selectedDamageTypes = ['S', 'P']
      await flushPromises()

      // Find chips that look like damage type chips (contain just code letters and ×)
      const allButtons = wrapper.findAll('button')
      const damageTypeChips = allButtons.filter((btn) => {
        const text = btn.text().trim()
        // Damage type chips show just the code (like "S ✕" or "P ✕")
        return text.includes('✕') && (text.includes('S') || text.includes('P')) && text.length < 10
      })

      expect(damageTypeChips.length).toBeGreaterThanOrEqual(2)
    })

    it('clicking damage type chip removes that type from filter', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      // Set rarity to make chips container visible
      component.selectedRarity = 'rare'
      component.selectedDamageTypes = ['S', 'P']
      await flushPromises()

      // Find chips that look like damage type chips
      const allButtons = wrapper.findAll('button')
      const damageTypeChips = allButtons.filter((btn) => {
        const text = btn.text().trim()
        return text.includes('✕') && (text.includes('S') || text.includes('P')) && text.length < 10
      })

      expect(damageTypeChips.length).toBeGreaterThanOrEqual(2)

      // Click first chip
      await damageTypeChips[0].trigger('click')

      // One damage type should remain
      expect(component.selectedDamageTypes.length).toBe(1)
    })
  })

  describe('Source filter', () => {
    it('shows source multiselect filter in ADVANCED section', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Should have selectedSources ref
      expect(component.selectedSources).toBeDefined()
      expect(Array.isArray(component.selectedSources)).toBe(true)
    })

    it('selecting sources updates the selectedSources array', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any

      // Initially empty
      expect(component.selectedSources).toEqual([])

      // Set sources
      component.selectedSources = ['PHB', 'DMG']
      await wrapper.vm.$nextTick()

      expect(component.selectedSources).toEqual(['PHB', 'DMG'])
    })

    it('clearing sources resets the selectedSources array', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any

      // Set sources
      component.selectedSources = ['PHB', 'DMG', 'XGE']
      await wrapper.vm.$nextTick()

      expect(component.selectedSources.length).toBe(3)

      // Clear filters
      component.clearFilters()
      await wrapper.vm.$nextTick()

      expect(component.selectedSources).toEqual([])
    })
  })

  // ============================================================================
  // ADVANCED FILTERS
  // ============================================================================

  describe('Items Cost Filter', () => {
    it('has cost range filter state', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any

      // Should have selectedCostRange ref
      expect(component.selectedCostRange).toBeDefined()
      expect(component.selectedCostRange).toBeNull()
    })

    it('has correct cost range options', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any

      // Should have costRangeOptions
      expect(component.costRangeOptions).toBeDefined()
      expect(Array.isArray(component.costRangeOptions)).toBe(true)
      expect(component.costRangeOptions.length).toBe(6)

      // Verify option labels
      const labels = component.costRangeOptions.map((o: any) => o.label)
      expect(labels).toContain('All Prices')
      expect(labels).toContain('Under 1 gp')
      expect(labels).toContain('1-10 gp')
      expect(labels).toContain('10-100 gp')
      expect(labels).toContain('100-1000 gp')
      expect(labels).toContain('1000+ gp')
    })

    it('shows cost range filter chip when cost is selected', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedCostRange = '100-1000'
      await wrapper.vm.$nextTick()

      const chips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('1-10 gp') && btn.text().includes('✕')
      )
      expect(chips.length).toBeGreaterThan(0)
    })

    it('clicking cost range chip clears the filter', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedCostRange = '100-1000'
      await wrapper.vm.$nextTick()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('1-10 gp') && btn.text().includes('✕')
      )
      expect(chip).toBeDefined()
      await chip!.trigger('click')

      expect(component.selectedCostRange).toBeNull()
    })

    it('generates correct filter for Under 1 gp', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedCostRange = 'under-100'

      const queryParams = component.queryBuilder
      expect(queryParams.filter).toContain('cost_cp <= 99')
    })

    it('generates correct filter for 1-10 gp', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedCostRange = '100-1000'

      const queryParams = component.queryBuilder
      expect(queryParams.filter).toContain('cost_cp >= 100 AND cost_cp <= 1000')
    })

    it('generates correct filter for 100-1000 gp', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedCostRange = '10000-100000'

      const queryParams = component.queryBuilder
      expect(queryParams.filter).toContain('cost_cp >= 10000 AND cost_cp <= 100000')
    })

    it('generates correct filter for 1000+ gp', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedCostRange = 'over-100000'

      const queryParams = component.queryBuilder
      expect(queryParams.filter).toContain('cost_cp >= 100000')
    })

    it('does not include filter when null', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedCostRange = null

      const queryParams = component.queryBuilder
      // Should not have cost_cp in filter
      if (queryParams.filter) {
        expect(queryParams.filter).not.toContain('cost_cp')
      }
    })
  })

  describe('Items AC Filter', () => {
    it('has AC range filter state', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any

      // Should have selectedACRange ref
      expect(component.selectedACRange).toBeDefined()
      expect(component.selectedACRange).toBeNull()
    })

    it('has correct AC range options', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any

      // Should have acRangeOptions
      expect(component.acRangeOptions).toBeDefined()
      expect(Array.isArray(component.acRangeOptions)).toBe(true)
      expect(component.acRangeOptions.length).toBe(4)

      // Verify option labels
      const labels = component.acRangeOptions.map((o: any) => o.label)
      expect(labels).toContain('All AC')
      expect(labels).toContain('Light (11-14)')
      expect(labels).toContain('Medium (15-16)')
      expect(labels).toContain('Heavy (17+)')
    })

    it('shows AC range filter chip when AC is selected', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedACRange = '11-14'
      await wrapper.vm.$nextTick()

      const chips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('AC:') && btn.text().includes('Light') && btn.text().includes('✕')
      )
      expect(chips.length).toBeGreaterThan(0)
    })

    it('clicking AC range chip clears the filter', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedACRange = '11-14'
      await wrapper.vm.$nextTick()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('AC:') && btn.text().includes('Light') && btn.text().includes('✕')
      )
      expect(chip).toBeDefined()
      await chip!.trigger('click')

      expect(component.selectedACRange).toBeNull()
    })

    it('generates correct filter for Light armor (AC 11-14)', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedACRange = '11-14'

      const queryParams = component.queryBuilder
      expect(queryParams.filter).toContain('armor_class >= 11 AND armor_class <= 14')
    })

    it('generates correct filter for Medium armor (AC 15-16)', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedACRange = '15-16'

      const queryParams = component.queryBuilder
      expect(queryParams.filter).toContain('armor_class >= 15 AND armor_class <= 16')
    })

    it('generates correct filter for Heavy armor (AC 17+)', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedACRange = '17-21'

      const queryParams = component.queryBuilder
      expect(queryParams.filter).toContain('armor_class >= 17 AND armor_class <= 21')
    })

    it('does not include filter when null', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedACRange = null

      const queryParams = component.queryBuilder
      // Should not have armor_class in filter
      if (queryParams.filter) {
        expect(queryParams.filter).not.toContain('armor_class')
      }
    })
  })

  // ============================================================================
  // WEAPON/ARMOR FILTERS
  // ============================================================================

  describe('Items Strength Requirement Filter', () => {
    it('has strength requirement filter state', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any

      // Should have selectedStrengthReq ref
      expect(component.selectedStrengthReq).toBeDefined()
      expect(component.selectedStrengthReq).toBeNull()
    })

    it('has correct strength requirement options', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any

      // Should have strengthReqOptions
      expect(component.strengthReqOptions).toBeDefined()
      expect(Array.isArray(component.strengthReqOptions)).toBe(true)
      expect(component.strengthReqOptions.length).toBe(3)

      // Verify option labels
      const labels = component.strengthReqOptions.map((o: any) => o.label)
      expect(labels).toContain('Any')
      expect(labels).toContain('STR 13+')
      expect(labels).toContain('STR 15+')
    })

    it('shows strength requirement filter chip when selected', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedStrengthReq = '13'
      await wrapper.vm.$nextTick()

      const chips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('STR 13+') && btn.text().includes('✕')
      )
      expect(chips.length).toBeGreaterThan(0)
    })

    it('clicking strength requirement chip clears the filter', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedStrengthReq = '15'
      await wrapper.vm.$nextTick()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('STR 15+') && btn.text().includes('✕')
      )
      expect(chip).toBeDefined()
      await chip!.trigger('click')

      expect(component.selectedStrengthReq).toBeNull()
    })

    it('generates correct filter for STR 13+', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedStrengthReq = '13'

      const queryParams = component.queryBuilder
      expect(queryParams.filter).toContain('strength_requirement > 13')
    })

    it('generates correct filter for STR 15+', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedStrengthReq = '15'

      const queryParams = component.queryBuilder
      expect(queryParams.filter).toContain('strength_requirement > 15')
    })
  })

  describe('Items Damage Dice Filter', () => {
    it('has damage dice filter state', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any

      // Should have selectedDamageDice ref
      expect(component.selectedDamageDice).toBeDefined()
      expect(Array.isArray(component.selectedDamageDice)).toBe(true)
    })

    it('has correct damage dice options', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any

      // Should have damageDiceOptions
      expect(component.damageDiceOptions).toBeDefined()
      expect(Array.isArray(component.damageDiceOptions)).toBe(true)
      expect(component.damageDiceOptions.length).toBeGreaterThan(0)

      // Verify common dice options
      const values = component.damageDiceOptions.map((o: any) => o.value)
      expect(values).toContain('1d4')
      expect(values).toContain('1d6')
      expect(values).toContain('1d8')
      expect(values).toContain('1d10')
      expect(values).toContain('1d12')
      expect(values).toContain('2d6')
    })

    it('shows damage dice filter chips when selected', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedDamageDice = ['1d6', '1d8']
      await wrapper.vm.$nextTick()

      const d6Chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('1d6') && btn.text().includes('✕')
      )
      const d8Chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('1d8') && btn.text().includes('✕')
      )

      expect(d6Chip).toBeDefined()
      expect(d8Chip).toBeDefined()
    })

    it('clicking damage dice chip removes that die from filter', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedDamageDice = ['1d6', '1d8']
      await wrapper.vm.$nextTick()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('1d6') && btn.text().includes('✕')
      )
      expect(chip).toBeDefined()
      await chip!.trigger('click')

      expect(component.selectedDamageDice).toEqual(['1d8'])
    })

    it('generates correct filter for damage dice', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedDamageDice = ['1d6', '1d8']

      const queryParams = component.queryBuilder
      expect(queryParams.filter).toContain('damage_dice')
      expect(queryParams.filter).toContain('1d6')
      expect(queryParams.filter).toContain('1d8')
    })
  })

  describe('Items Versatile Damage Filter', () => {
    it('has versatile damage filter state', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any

      // Should have selectedVersatileDamage ref
      expect(component.selectedVersatileDamage).toBeDefined()
      expect(Array.isArray(component.selectedVersatileDamage)).toBe(true)
    })

    it('has correct versatile damage options', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any

      // Should have versatileDamageOptions
      expect(component.versatileDamageOptions).toBeDefined()
      expect(Array.isArray(component.versatileDamageOptions)).toBe(true)

      // Verify versatile damage options (1d8, 1d10, 1d12)
      const values = component.versatileDamageOptions.map((o: any) => o.value)
      expect(values).toContain('1d8')
      expect(values).toContain('1d10')
      expect(values).toContain('1d12')
    })

    it('shows versatile damage filter chips when selected', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedVersatileDamage = ['1d8', '1d10']
      await wrapper.vm.$nextTick()

      const d8Chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Versatile') && btn.text().includes('1d8') && btn.text().includes('✕')
      )
      const d10Chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Versatile') && btn.text().includes('1d10') && btn.text().includes('✕')
      )

      expect(d8Chip).toBeDefined()
      expect(d10Chip).toBeDefined()
    })

    it('clicking versatile damage chip removes that die from filter', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedVersatileDamage = ['1d8', '1d10']
      await wrapper.vm.$nextTick()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Versatile') && btn.text().includes('1d8') && btn.text().includes('✕')
      )
      expect(chip).toBeDefined()
      await chip!.trigger('click')

      expect(component.selectedVersatileDamage).toEqual(['1d10'])
    })

    it('generates correct filter for versatile damage', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedVersatileDamage = ['1d8', '1d10']

      const queryParams = component.queryBuilder
      expect(queryParams.filter).toContain('versatile_damage')
      expect(queryParams.filter).toContain('1d8')
      expect(queryParams.filter).toContain('1d10')
    })
  })

  describe('Items Range Filter', () => {
    it('has range filter state', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any

      // Should have selectedRange ref
      expect(component.selectedRange).toBeDefined()
      expect(component.selectedRange).toBeNull()
    })

    it('has correct range options', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any

      // Should have rangeOptions
      expect(component.rangeOptions).toBeDefined()
      expect(Array.isArray(component.rangeOptions)).toBe(true)

      // Verify range options
      const labels = component.rangeOptions.map((o: any) => o.label)
      expect(labels).toContain('Any')
      expect(labels).toContain('Short (<30ft)')
      expect(labels).toContain('Medium (30-80ft)')
      expect(labels).toContain('Long (80-150ft)')
      expect(labels).toContain('Very Long (>150ft)')
    })

    it('shows range filter chip when selected', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedRange = '30-80'
      await wrapper.vm.$nextTick()

      const chips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('Range:') && btn.text().includes('Medium') && btn.text().includes('✕')
      )
      expect(chips.length).toBeGreaterThan(0)
    })

    it('clicking range chip clears the filter', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedRange = '80-150'
      await wrapper.vm.$nextTick()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Range:') && btn.text().includes('Long') && btn.text().includes('✕')
      )
      expect(chip).toBeDefined()
      await chip!.trigger('click')

      expect(component.selectedRange).toBeNull()
    })

    it('generates correct filter for short range (<30ft)', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedRange = 'under-30'

      const queryParams = component.queryBuilder
      expect(queryParams.filter).toContain('range_normal <= 29')
    })

    it('generates correct filter for medium range (30-80ft)', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedRange = '30-80'

      const queryParams = component.queryBuilder
      expect(queryParams.filter).toContain('range_normal >= 30 AND range_normal <= 80')
    })

    it('generates correct filter for very long range (>150ft)', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedRange = 'over-150'

      const queryParams = component.queryBuilder
      expect(queryParams.filter).toContain('range_normal >= 151')
    })
  })

  describe('Items Recharge Timing Filter', () => {
    it('has recharge timing filter state', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any

      // Should have selectedRechargeTiming ref
      expect(component.selectedRechargeTiming).toBeDefined()
      expect(Array.isArray(component.selectedRechargeTiming)).toBe(true)
    })

    it('has correct recharge timing options', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any

      // Should have rechargeTimingOptions
      expect(component.rechargeTimingOptions).toBeDefined()
      expect(Array.isArray(component.rechargeTimingOptions)).toBe(true)

      // Verify recharge timing options
      const values = component.rechargeTimingOptions.map((o: any) => o.value)
      expect(values).toContain('dawn')
      expect(values).toContain('dusk')
    })

    it('shows recharge timing filter chips when selected', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedRechargeTiming = ['dawn', 'dusk']
      await wrapper.vm.$nextTick()

      const dawnChip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Dawn') && btn.text().includes('✕')
      )
      const duskChip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Dusk') && btn.text().includes('✕')
      )

      expect(dawnChip).toBeDefined()
      expect(duskChip).toBeDefined()
    })

    it('clicking recharge timing chip removes that timing from filter', async () => {
      const wrapper = await mountSuspended(ItemsPage)

      const component = wrapper.vm as any
      component.selectedRechargeTiming = ['dawn', 'dusk']
      await wrapper.vm.$nextTick()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Dawn') && btn.text().includes('✕')
      )
      expect(chip).toBeDefined()
      await chip!.trigger('click')

      expect(component.selectedRechargeTiming).toEqual(['dusk'])
    })

    it('generates correct filter for recharge timing', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedRechargeTiming = ['dawn']

      const queryParams = component.queryBuilder
      expect(queryParams.filter).toContain('recharge_timing')
      expect(queryParams.filter).toContain('dawn')
    })
  })
})
