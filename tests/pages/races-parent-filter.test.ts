import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import RacesPage from '~/pages/races/index.vue'

describe('Races Page - Parent Race Filter', () => {
  describe('Parent Race filter', () => {
    it('displays parent race filter select dropdown', async () => {
      const wrapper = await mountSuspended(RacesPage)

      // Open filters first
      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Wait for races to load
      await wrapper.vm.$nextTick()

      // Look for the parent race select dropdown
      const parentRaceSelect = wrapper.find('[data-testid="parent-race-filter"]')
      expect(parentRaceSelect.exists()).toBe(true)
    })

    it('allows selecting a parent race', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any

      // Select a parent race by name (e.g., "Elf")
      component.selectedParentRace = 'Elf'
      await wrapper.vm.$nextTick()

      // Filter should be set
      expect(component.selectedParentRace).toBe('Elf')
    })

    it('displays parent race filter chip when parent race is selected', async () => {
      const wrapper = await mountSuspended(RacesPage)

      // Select a parent race
      const component = wrapper.vm as any
      component.selectedParentRace = 'Elf'
      await wrapper.vm.$nextTick()

      // Look for the chip
      const chip = wrapper.find('[data-testid="parent-race-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Elf')
      expect(chip.text()).toContain('✕')
    })

    it('clicking parent race chip clears filter', async () => {
      const wrapper = await mountSuspended(RacesPage)

      // Select a parent race
      const component = wrapper.vm as any
      component.selectedParentRace = 'Elf'
      await wrapper.vm.$nextTick()

      // Click chip
      const chip = wrapper.find('[data-testid="parent-race-filter-chip"]')
      await chip.trigger('click')

      // Filter should be cleared
      expect(component.selectedParentRace).toBe('')
    })

    it('does not show parent race chip when no parent race selected', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any
      component.selectedParentRace = ''
      await wrapper.vm.$nextTick()

      // Chip should not exist
      const chip = wrapper.find('[data-testid="parent-race-filter-chip"]')
      expect(chip.exists()).toBe(false)
    })

    it('clears parent race filter when clearFilters is called', async () => {
      const wrapper = await mountSuspended(RacesPage)

      // Set parent race filter
      const component = wrapper.vm as any
      component.selectedParentRace = 'Elf'
      await wrapper.vm.$nextTick()

      // Call clearFilters
      component.clearFilters()
      await wrapper.vm.$nextTick()

      // Filter should be cleared
      expect(component.selectedParentRace).toBe('')
    })

    it('includes parent race in active filter count', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any

      // Initially no filters
      expect(component.activeFilterCount).toBe(0)

      // Add parent race filter
      component.selectedParentRace = 'Elf'
      await wrapper.vm.$nextTick()

      // Count should increase
      expect(component.activeFilterCount).toBeGreaterThan(0)
    })
  })
})
