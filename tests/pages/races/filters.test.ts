import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import RacesPage from '~/pages/races/index.vue'

describe('Races Page - Filter Layout', () => {
  describe('Size filter layout', () => {
    it('displays size filter select (UiFilterSelect)', async () => {
      const wrapper = await mountSuspended(RacesPage)

      // Open filters and wait for sizes to load
      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Look for the size filter select component
      const sizeFilter = wrapper.find('[data-testid="size-filter"]')
      expect(sizeFilter.exists()).toBe(true)
    })
  })

  describe('Active filters section', () => {
    it('displays "Active filters:" label (not "Active:")', async () => {
      const wrapper = await mountSuspended(RacesPage)

      // Set a filter to make section visible
      const component = wrapper.vm as any
      component.selectedSize = 'M'
      await wrapper.vm.$nextTick()

      // The label is rendered by UiFilterChips and contains "Active filters:"
      const text = wrapper.text()
      expect(text).toContain('Active filters:')
      expect(text).not.toContain('Active:')
    })

    it('displays size filter chip when size is selected', async () => {
      const wrapper = await mountSuspended(RacesPage)

      // Select a size
      const component = wrapper.vm as any
      component.selectedSize = 'M'
      await wrapper.vm.$nextTick()

      // Look for the chip
      const chip = wrapper.find('[data-testid="size-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('✕')
    })

    it('clicking size chip clears size filter', async () => {
      const wrapper = await mountSuspended(RacesPage)

      // Select a size
      const component = wrapper.vm as any
      component.selectedSize = 'M'
      await wrapper.vm.$nextTick()

      // Click chip
      const chip = wrapper.find('[data-testid="size-filter-chip"]')
      await chip.trigger('click')

      // Size should be cleared (store-only check, no tick needed)
      expect(component.selectedSize).toBe('')
    })

    it('does not show size chip when no size selected', async () => {
      const wrapper = await mountSuspended(RacesPage)

      // Ensure no size selected (already default state after mount)
      const component = wrapper.vm as any
      component.selectedSize = ''

      // Chip should not exist (checking non-existence, no tick needed)
      const chip = wrapper.find('[data-testid="size-filter-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })

  describe('Clear filters button position', () => {
    it('displays Clear filters button when filters are active', async () => {
      const wrapper = await mountSuspended(RacesPage)

      // Set a filter to make section visible
      const component = wrapper.vm as any
      component.selectedSize = 'M'
      await wrapper.vm.$nextTick()

      // Look for the Clear filters button (rendered by UiFilterChips)
      // The button text is "Clear filters" and it's right-aligned via justify-between
      const text = wrapper.text()
      expect(text).toContain('Clear filters')
      expect(text).toContain('Active filters:')
    })

    it('Clear filters button only shows when filters are active', async () => {
      const wrapper = await mountSuspended(RacesPage)

      const component = wrapper.vm as any

      // No filters - button should not exist (batch mutations)
      component.selectedSize = ''
      component.searchQuery = ''
      await wrapper.vm.$nextTick()

      let text = wrapper.text()
      expect(text).not.toContain('Clear filters')

      // Add filter - button should appear
      component.selectedSize = 'M'
      await wrapper.vm.$nextTick()

      text = wrapper.text()
      expect(text).toContain('Clear filters')
    })

    it('clicking Clear filters button clears all filters', async () => {
      const wrapper = await mountSuspended(RacesPage)

      // Set filters (batch mutations before single tick)
      const component = wrapper.vm as any
      component.selectedSize = 'M'
      component.searchQuery = 'Elf'
      await wrapper.vm.$nextTick()

      // Click Clear filters button by finding button with text "Clear filters"
      const buttons = wrapper.findAll('button')
      const clearButton = buttons.find(btn => btn.text().includes('Clear filters'))
      expect(clearButton).toBeDefined()
      await clearButton!.trigger('click')

      // All filters should be cleared (store-only checks, no tick needed)
      expect(component.selectedSize).toBe('')
      expect(component.searchQuery).toBe('')
    })
  })

  describe('Search query chip', () => {
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

      // Find and click search chip (the one with the query text)
      const chips = wrapper.findAll('button')
      const searchChip = chips.find(btn => btn.text().includes('"Elf"'))

      expect(searchChip).toBeDefined()
      await searchChip!.trigger('click')

      // Store-only check, no tick needed
      expect(component.searchQuery).toBe('')
    })
  })
})
