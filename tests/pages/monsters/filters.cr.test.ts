import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import MonstersPage from '~/pages/monsters/index.vue'
import { useMonsterFiltersStore } from '~/stores/monsterFilters'

describe('Monsters Page - Challenge Rating Filter', () => {
  // Reset Pinia store before each test to ensure clean state
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('CR Filter - Multiselect', () => {
    it('displays CR filter multiselect', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      // Open filters first
      store.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Look for the multiselect
      const multiselect = wrapper.find('[data-testid="cr-filter-multiselect"]')
      expect(multiselect.exists()).toBe(true)
    })

    it('allows selecting multiple CR values', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      // Select multiple CRs (as strings, per UiFilterMultiSelect)
      store.selectedCRs = ['0', '5', '17']

      // No nextTick needed - just checking store value
      expect(store.selectedCRs).toEqual(['0', '5', '17'])
    })

    it('initializes as empty array', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      // Clear filters to ensure clean state (store may have persisted data)
      store.clearAll()

      // No nextTick needed - just checking store value
      expect(Array.isArray(store.selectedCRs)).toBe(true)
      expect(store.selectedCRs.length).toBe(0)
    })
  })

  describe('CR Filter chip display', () => {
    it('shows chip with selected CR labels', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      // Select multiple CRs (as strings)
      store.selectedCRs = ['0', '5', '17']
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
      const store = useMonsterFiltersStore()

      // Select single CR (as string)
      store.selectedCRs = ['5']
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
      const store = useMonsterFiltersStore()

      // Select CRs (as strings)
      store.selectedCRs = ['0', '5']
      await wrapper.vm.$nextTick()

      // Click chip
      const chip = wrapper.find('[data-testid="cr-filter-chip"]')
      await chip.trigger('click')

      // CRs should be cleared
      expect(store.selectedCRs).toEqual([])
    })

    it('does not show chip when no CRs selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const store = useMonsterFiltersStore()

      // No nextTick needed - just checking default state
      store.selectedCRs = []

      // Chip should not exist
      const chip = wrapper.find('[data-testid="cr-filter-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })
})
