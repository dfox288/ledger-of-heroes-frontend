/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Items Page - Filter Tests (Consolidated)
 *
 * This file tests PAGE-LEVEL filter behavior only:
 * - UI rendering (chips, labels, button positions)
 * - Chip click interactions
 * - queryBuilder Meilisearch filter generation
 * - Computed option arrays (rarityOptions, costRangeOptions, etc.)
 *
 * Store-level tests (state mutations, hasActiveFilters, clearAll, URL sync)
 * are covered in tests/stores/filterStores.test.ts
 *
 * Consolidation: 2 files (1,472 lines) → 1 file (~500 lines)
 * GitHub Issue: #635
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ItemsPage from '~/pages/items/index.vue'

describe('Items Page - Filters', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ============================================================================
  // UI LAYOUT & LABELS
  // ============================================================================

  describe('Active filters label', () => {
    it('shows "Active filters:" label when filters are active', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedRarity = 'rare'
      await flushPromises()

      const labels = wrapper.findAll('.text-sm.font-medium')
      const activeFiltersLabel = labels.find(l => l.text() === 'Active filters:')
      expect(activeFiltersLabel).toBeDefined()
    })
  })

  describe('Clear filters button', () => {
    it('shows clear filters button on same row as chips', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedRarity = 'rare'
      await flushPromises()

      const outerContainer = wrapper.findAll('.flex.flex-wrap.items-center.justify-between')
        .find((el) => {
          const text = el.text()
          return text.includes('Active filters:') && text.includes('Clear filters')
        })
      expect(outerContainer).toBeDefined()
    })

    it('hides when no filters active', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      // Explicitly clear any persisted state
      component.clearFilters()
      await flushPromises()

      const chipsContainer = wrapper.findAll('.flex.flex-wrap.items-center.justify-between')
        .find(el => el.text().includes('Active filters:'))
      expect(chipsContainer).toBeUndefined()
    })

    it('clears all filters when clicked', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedType = 1
      component.selectedRarity = 'rare'
      component.selectedMagic = 'true'
      await flushPromises()

      const clearButton = wrapper.findAll('button').find(btn =>
        btn.text().includes('Clear filters')
      )
      await clearButton!.trigger('click')

      expect(component.selectedType).toBeNull()
      expect(component.selectedRarity).toBeNull()
      expect(component.selectedMagic).toBeNull()
    })
  })

  // ============================================================================
  // FILTER CHIPS - Display & Interaction
  // ============================================================================

  describe('Filter chip display', () => {
    it('shows rarity chip with prefix', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedRarity = 'rare'
      await flushPromises()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Rarity:') && btn.text().includes('rare')
      )
      expect(chip).toBeDefined()
    })

    it('shows type chip when selected', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedRarity = 'rare' // Make chips visible
      component.selectedType = 1
      await flushPromises()

      const typeChip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Type:') && btn.text().includes('✕')
      )
      expect(typeChip).toBeDefined()
    })

    it('shows magic chip when selected', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedMagic = 'true'
      await flushPromises()

      const chips = wrapper.findAll('button').filter(btn =>
        btn.text().includes('Magic')
      )
      expect(chips.length).toBeGreaterThan(0)
    })

    it('shows attunement chip with Yes/No', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.requiresAttunement = '1'
      await flushPromises()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Attunement: Yes')
      )
      expect(chip).toBeDefined()
    })

    it('shows stealth disadvantage chip', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.stealthDisadvantage = '1'
      await flushPromises()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Stealth Disadv.: Yes')
      )
      expect(chip).toBeDefined()
    })

    it('shows property chips individually', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedProperties = ['Finesse', 'Light']
      await flushPromises()

      const finesseChip = wrapper.findAll('button').find(btn => btn.text().includes('Finesse'))
      const lightChip = wrapper.findAll('button').find(btn => btn.text().includes('Light'))
      expect(finesseChip).toBeDefined()
      expect(lightChip).toBeDefined()
    })

    it('shows damage dice chips', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedDamageDice = ['1d6', '1d8']
      await wrapper.vm.$nextTick()

      const d6Chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('1d6') && btn.text().includes('✕')
      )
      expect(d6Chip).toBeDefined()
    })

    it('shows versatile damage chips with prefix', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedVersatileDamage = ['1d8']
      await wrapper.vm.$nextTick()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Versatile') && btn.text().includes('1d8')
      )
      expect(chip).toBeDefined()
    })

    it('shows range chip with label', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedRange = '30-80'
      await wrapper.vm.$nextTick()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Range:') && btn.text().includes('Medium')
      )
      expect(chip).toBeDefined()
    })

    it('shows AC range chip', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedACRange = '11-14'
      await wrapper.vm.$nextTick()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('AC:') && btn.text().includes('Light')
      )
      expect(chip).toBeDefined()
    })

    it('shows strength requirement chip', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedStrengthReq = '13'
      await wrapper.vm.$nextTick()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('STR 13+')
      )
      expect(chip).toBeDefined()
    })

    it('shows recharge timing chips', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedRechargeTiming = ['dawn']
      await wrapper.vm.$nextTick()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Dawn')
      )
      expect(chip).toBeDefined()
    })
  })

  describe('Filter chip interactions', () => {
    it('clicking rarity chip clears rarity filter', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.clearFilters()
      await wrapper.vm.$nextTick()
      component.selectedRarity = 'rare'
      await wrapper.vm.$nextTick()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Rarity:') && btn.text().includes('rare') && btn.text().includes('✕')
      )
      await chip!.trigger('click')

      expect(component.selectedRarity).toBeNull()
    })

    it('clicking property chip removes only that property', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedProperties = ['Finesse', 'Light']
      await flushPromises()

      const finesseChip = wrapper.findAll('button').find(btn =>
        btn.text().includes('Finesse') && btn.text().includes('✕')
      )
      await finesseChip!.trigger('click')

      expect(component.selectedProperties).toEqual(['Light'])
    })

    it('clicking damage dice chip removes only that die', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedDamageDice = ['1d6', '1d8']
      await wrapper.vm.$nextTick()

      const chip = wrapper.findAll('button').find(btn =>
        btn.text().includes('1d6') && btn.text().includes('✕')
      )
      await chip!.trigger('click')

      expect(component.selectedDamageDice).toEqual(['1d8'])
    })
  })

  // ============================================================================
  // COMPUTED OPTIONS - Verify arrays are populated correctly
  // ============================================================================

  describe('Rarity options', () => {
    it('includes "All Rarities" as first option', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      expect(component.rarityOptions[0]).toEqual({
        label: 'All Rarities',
        value: null
      })
    })

    it('capitalizes rarity labels', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      if (component.rarities?.length > 0) {
        const firstRarity = component.rarityOptions[1]
        expect(firstRarity.label.charAt(0)).toBe(firstRarity.label.charAt(0).toUpperCase())
      }
    })
  })

  describe('Cost range options', () => {
    it('has 6 price range options', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      expect(component.costRangeOptions).toHaveLength(6)
      const labels = component.costRangeOptions.map((o: any) => o.label)
      expect(labels).toContain('All Prices')
      expect(labels).toContain('Under 1 gp')
      expect(labels).toContain('1000+ gp')
    })
  })

  describe('AC range options', () => {
    it('has light/medium/heavy options', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      expect(component.acRangeOptions).toHaveLength(4)
      const labels = component.acRangeOptions.map((o: any) => o.label)
      expect(labels).toContain('Light (11-14)')
      expect(labels).toContain('Medium (15-16)')
      expect(labels).toContain('Heavy (17+)')
    })
  })

  describe('Strength requirement options', () => {
    it('has STR 13+ and STR 15+ options', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      expect(component.strengthReqOptions).toHaveLength(3)
      const labels = component.strengthReqOptions.map((o: any) => o.label)
      expect(labels).toContain('STR 13+')
      expect(labels).toContain('STR 15+')
    })
  })

  describe('Damage dice options', () => {
    it('includes common dice types', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      const values = component.damageDiceOptions.map((o: any) => o.value)
      expect(values).toContain('1d4')
      expect(values).toContain('1d6')
      expect(values).toContain('1d8')
      expect(values).toContain('2d6')
    })
  })

  describe('Range options', () => {
    it('has short/medium/long/very long options', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      const labels = component.rangeOptions.map((o: any) => o.label)
      expect(labels).toContain('Short (<30ft)')
      expect(labels).toContain('Medium (30-80ft)')
      expect(labels).toContain('Long (80-150ft)')
      expect(labels).toContain('Very Long (>150ft)')
    })
  })

  // ============================================================================
  // QUERYBUILDER - Meilisearch filter generation
  // ============================================================================

  describe('queryBuilder filter generation', () => {
    it('generates rarity filter', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedRarity = 'rare'
      const queryParams = component.queryBuilder

      expect(queryParams.filter).toContain('rarity')
    })

    it('generates cost range filter for under 1 gp', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedCostRange = 'under-100'
      const queryParams = component.queryBuilder

      expect(queryParams.filter).toContain('cost_cp <= 99')
    })

    it('generates cost range filter for 1-10 gp', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedCostRange = '100-1000'
      const queryParams = component.queryBuilder

      expect(queryParams.filter).toContain('cost_cp >= 100 AND cost_cp <= 1000')
    })

    it('generates cost range filter for 1000+ gp', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedCostRange = 'over-100000'
      const queryParams = component.queryBuilder

      expect(queryParams.filter).toContain('cost_cp >= 100000')
    })

    it('generates AC range filter for light armor', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedACRange = '11-14'
      const queryParams = component.queryBuilder

      expect(queryParams.filter).toContain('armor_class >= 11 AND armor_class <= 14')
    })

    it('generates strength requirement filter', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedStrengthReq = '13'
      const queryParams = component.queryBuilder

      expect(queryParams.filter).toContain('strength_requirement > 13')
    })

    it('generates damage dice IN filter', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedDamageDice = ['1d6', '1d8']
      const queryParams = component.queryBuilder

      expect(queryParams.filter).toContain('damage_dice')
      expect(queryParams.filter).toContain('1d6')
      expect(queryParams.filter).toContain('1d8')
    })

    it('generates versatile damage IN filter', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedVersatileDamage = ['1d8', '1d10']
      const queryParams = component.queryBuilder

      expect(queryParams.filter).toContain('versatile_damage')
    })

    it('generates range filter for short range', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedRange = 'under-30'
      const queryParams = component.queryBuilder

      expect(queryParams.filter).toContain('range_normal <= 29')
    })

    it('generates range filter for medium range', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedRange = '30-80'
      const queryParams = component.queryBuilder

      expect(queryParams.filter).toContain('range_normal >= 30 AND range_normal <= 80')
    })

    it('generates recharge timing IN filter', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedRechargeTiming = ['dawn']
      const queryParams = component.queryBuilder

      expect(queryParams.filter).toContain('recharge_timing')
      expect(queryParams.filter).toContain('dawn')
    })

    it('excludes cost_cp when null', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedCostRange = null
      const queryParams = component.queryBuilder

      if (queryParams.filter) {
        expect(queryParams.filter).not.toContain('cost_cp')
      }
    })

    it('excludes armor_class when null', async () => {
      const wrapper = await mountSuspended(ItemsPage)
      const component = wrapper.vm as any

      component.selectedACRange = null
      const queryParams = component.queryBuilder

      if (queryParams.filter) {
        expect(queryParams.filter).not.toContain('armor_class')
      }
    })
  })
})
