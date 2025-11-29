import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import MonstersPage from '~/pages/monsters/index.vue'
import { useMonsterFiltersStore } from '~/stores/monsterFilters'

describe('Monsters Page - Range & Boolean Filters', () => {
  // Reset Pinia store before each test to ensure clean state
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Monsters AC Filter', () => {
    it('has AC range filter state', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      // Should have selectedACRange ref
      expect(store.selectedACRange).toBeDefined()
      expect(store.selectedACRange).toBeNull()
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

  describe('Monsters HP Filter', () => {
    it('has HP range filter state', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      // Should have selectedHPRange ref
      expect(store.selectedHPRange).toBeDefined()
      expect(store.selectedHPRange).toBeNull()
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

    it('includes all 5 new filters in activeFilterCount', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()
      const component = wrapper.vm as any

      // Clear filters to ensure clean state (store may have persisted data)
      store.clearAll()

      // No nextTick needed - activeFilterCount is computed from store
      expect(component.activeFilterCount).toBe(0)

      // Batch all filter changes with $patch
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

    it('clears all 5 new filters when clearFilters is called', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      // Batch all filter changes with $patch
      store.$patch({
        selectedArmorTypes: ['natural armor'],
        hasLairActions: '1',
        hasReactions: '1',
        isSpellcaster: '1',
        hasMagicResistance: '1'
      })
      await wrapper.vm.$nextTick()

      store.clearAll()

      // No nextTick needed - just checking store values
      expect(store.selectedArmorTypes).toEqual([])
      expect(store.hasLairActions).toBeNull()
      expect(store.hasReactions).toBeNull()
      expect(store.isSpellcaster).toBeNull()
      expect(store.hasMagicResistance).toBeNull()
    })
  })
})
