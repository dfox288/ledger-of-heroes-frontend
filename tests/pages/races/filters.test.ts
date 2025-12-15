/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Races Page - Filter Tests (Consolidated)
 *
 * This file consolidates tests for all race page filters:
 * - Filter layout tests (size filter, active filters section)
 * - Parent race filter tests
 *
 * Consolidation: 2 files → 1 file
 * GitHub Issue: #323
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import RacesPage from '~/pages/races/index.vue'

describe('Races Page - Filters', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  // ===========================================================================
  // Size Filter Layout Tests
  // ===========================================================================
  describe('size filter', () => {
    it('displays size filter select (UiFilterSelect)', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const sizeFilter = wrapper.find('[data-testid="size-filter"]')
      expect(sizeFilter.exists()).toBe(true)
    })

    it('displays size filter chip when size is selected', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any
      component.selectedSize = 'M'
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="size-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('✕')
    })

    it('clicking size chip clears size filter', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any
      component.selectedSize = 'M'
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="size-filter-chip"]')
      await chip.trigger('click')

      expect(component.selectedSize).toBe('')
    })

    it('does not show size chip when no size selected', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any
      component.selectedSize = ''

      const chip = wrapper.find('[data-testid="size-filter-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })

  // ===========================================================================
  // Parent Race Filter Tests
  // ===========================================================================
  describe('parent race filter', () => {
    it('displays parent race filter select dropdown', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const parentRaceSelect = wrapper.find('[data-testid="parent-race-filter"]')
      expect(parentRaceSelect.exists()).toBe(true)
    })

    it('allows selecting a parent race', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any
      component.selectedParentRace = 'Elf'

      expect(component.selectedParentRace).toBe('Elf')
    })

    it('displays parent race filter chip when parent race is selected', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any
      component.selectedParentRace = 'Elf'
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="parent-race-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Elf')
      expect(chip.text()).toContain('✕')
    })

    it('clicking parent race chip clears filter', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any
      component.selectedParentRace = 'Elf'
      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="parent-race-filter-chip"]')
      await chip.trigger('click')

      expect(component.selectedParentRace).toBe('')
    })

    it('does not show parent race chip when no parent race selected', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any
      component.selectedParentRace = ''

      const chip = wrapper.find('[data-testid="parent-race-filter-chip"]')
      expect(chip.exists()).toBe(false)
    })

    it('clears parent race filter when clearFilters is called', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any
      component.selectedParentRace = 'Elf'

      component.clearFilters()

      expect(component.selectedParentRace).toBe('')
    })

    it('includes parent race in active filter count', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any
      expect(component.activeFilterCount).toBe(0)

      component.selectedParentRace = 'Elf'
      await wrapper.vm.$nextTick()

      expect(component.activeFilterCount).toBeGreaterThan(0)
    })
  })

  // ===========================================================================
  // Active Filters Section Tests
  // ===========================================================================
  describe('active filters section', () => {
    it('displays "Active filters:" label (not "Active:")', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any
      component.selectedSize = 'M'
      await wrapper.vm.$nextTick()

      const text = wrapper.text()
      expect(text).toContain('Active filters:')
      expect(text).not.toContain('Active:')
    })

    it('displays Clear filters button when filters are active', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any
      component.selectedSize = 'M'
      await wrapper.vm.$nextTick()

      const text = wrapper.text()
      expect(text).toContain('Clear filters')
      expect(text).toContain('Active filters:')
    })

    it('Clear filters button only shows when filters are active', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any
      // Clear all filters first to ensure clean state
      component.clearFilters()
      await wrapper.vm.$nextTick()

      let text = wrapper.text()
      expect(text).not.toContain('Clear filters')

      component.selectedSize = 'M'
      await wrapper.vm.$nextTick()

      text = wrapper.text()
      expect(text).toContain('Clear filters')
    })

    it('clicking Clear filters button clears all filters', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any
      component.selectedSize = 'M'
      component.searchQuery = 'Elf'
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('button')
      const clearButton = buttons.find(btn => btn.text().includes('Clear filters'))
      expect(clearButton).toBeDefined()
      await clearButton!.trigger('click')

      expect(component.selectedSize).toBe('')
      expect(component.searchQuery).toBe('')
    })
  })

  // ===========================================================================
  // Search Query Chip Tests
  // ===========================================================================
  describe('search query chip', () => {
    it('displays search query chip when search is active', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any
      component.searchQuery = 'Elf'
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      expect(html).toContain('"Elf"')
      expect(html).toContain('✕')
    })

    it('clicking search query chip clears search', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any
      component.searchQuery = 'Elf'
      await wrapper.vm.$nextTick()

      const chips = wrapper.findAll('button')
      const searchChip = chips.find(btn => btn.text().includes('"Elf"'))

      expect(searchChip).toBeDefined()
      await searchChip!.trigger('click')

      expect(component.searchQuery).toBe('')
    })
  })
})
