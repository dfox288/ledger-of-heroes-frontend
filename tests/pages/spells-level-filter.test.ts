import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import SpellsPage from '~/pages/spells/index.vue'

describe('Spells Page - Level Filtering', () => {
  // Reset Pinia store before each test to ensure clean state
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('UI components', () => {
    it('displays level filter multiselect', async () => {
      const wrapper = await mountSuspended(SpellsPage)

      // Open filters first
      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Look for the multiselect
      const multiselect = wrapper.find('[data-testid="level-filter-multiselect"]')
      expect(multiselect.exists()).toBe(true)
    })

    it('does not display mode toggle (removed)', async () => {
      const wrapper = await mountSuspended(SpellsPage)

      // Open filters first
      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Mode toggle should not exist
      const toggle = wrapper.find('[data-testid="level-filter-mode-toggle"]')
      expect(toggle.exists()).toBe(false)
    })

    it('does not display slider (removed)', async () => {
      const wrapper = await mountSuspended(SpellsPage)

      // Open filters first
      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Slider should not exist
      const slider = wrapper.find('[data-testid="level-range-slider"]')
      expect(slider.exists()).toBe(false)
    })
  })

  describe('multiselect behavior', () => {
    it('allows selecting multiple levels', async () => {
      const wrapper = await mountSuspended(SpellsPage)

      const component = wrapper.vm as any

      // Select multiple levels (as strings, per UiFilterMultiSelect)
      component.selectedLevels = ['0', '3', '9']
      await wrapper.vm.$nextTick()

      expect(component.selectedLevels).toEqual(['0', '3', '9'])
    })

    it('initializes as empty array', async () => {
      const wrapper = await mountSuspended(SpellsPage)

      const component = wrapper.vm as any
      // Clear any persisted state from previous test
      component.clearFilters()
      await wrapper.vm.$nextTick()

      expect(Array.isArray(component.selectedLevels)).toBe(true)
      expect(component.selectedLevels.length).toBe(0)
    })
  })

  describe('filter chip display', () => {
    it('shows chip with selected level labels', async () => {
      const wrapper = await mountSuspended(SpellsPage)

      // Select multiple levels (as strings)
      const component = wrapper.vm as any
      component.selectedLevels = ['0', '3', '9']

      await wrapper.vm.$nextTick()

      // Look for chip
      const chip = wrapper.find('[data-testid="level-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Levels')
      expect(chip.text()).toContain('Cantrip')
      expect(chip.text()).toContain('3rd')
      expect(chip.text()).toContain('9th')
    })

    it('shows single level without plural', async () => {
      const wrapper = await mountSuspended(SpellsPage)

      // Select single level (as string)
      const component = wrapper.vm as any
      component.selectedLevels = ['3']

      await wrapper.vm.$nextTick()

      // Look for chip
      const chip = wrapper.find('[data-testid="level-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Level')
      expect(chip.text()).toContain('3rd')
    })

    it('shows "Cantrip" for level 0', async () => {
      const wrapper = await mountSuspended(SpellsPage)

      // Select cantrip (as string)
      const component = wrapper.vm as any
      component.selectedLevels = ['0']

      await wrapper.vm.$nextTick()

      // Look for chip
      const chip = wrapper.find('[data-testid="level-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Cantrip')
    })

    it('clicking chip clears level filter', async () => {
      const wrapper = await mountSuspended(SpellsPage)

      // Select levels (as strings)
      const component = wrapper.vm as any
      component.selectedLevels = ['0', '3']

      await wrapper.vm.$nextTick()

      // Click chip
      const chip = wrapper.find('[data-testid="level-filter-chip"]')
      await chip.trigger('click')

      // Levels should be cleared
      expect(component.selectedLevels).toEqual([])
    })

    it('does not show chip when no levels selected', async () => {
      const wrapper = await mountSuspended(SpellsPage)

      const component = wrapper.vm as any
      component.selectedLevels = []

      await wrapper.vm.$nextTick()

      // Chip should not exist
      const chip = wrapper.find('[data-testid="level-filter-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })
})
