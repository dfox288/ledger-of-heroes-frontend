import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BackgroundsPage from '~/pages/backgrounds/index.vue'

describe('Backgrounds Page - Filter Layout', () => {
  describe('active filters label', () => {
    it('displays "Active filters:" label (not old "Active:" label)', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)

      const component = wrapper.vm as any
      component.searchQuery = 'Noble'
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      // Should have new label
      expect(html).toContain('Active filters:')
      // Should NOT have old label (without "filters")
      expect(html).not.toMatch(/Active:</)
      expect(html).not.toMatch(/Active:\s*</)
    })
  })

  describe('clear filters button layout', () => {
    it('displays clear button with filters and clicking it clears search', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)

      const component = wrapper.vm as any
      component.searchQuery = 'Noble'
      await wrapper.vm.$nextTick()

      // Find the parent container with justify-between
      const container = wrapper.find('.flex.flex-wrap.items-center.justify-between')
      expect(container.exists()).toBe(true)

      // Verify it contains both the label and the clear button
      const html = container.html()
      expect(html).toContain('Active filters:')
      expect(html).toContain('Clear filters')

      // Click clear button
      const buttons = wrapper.findAll('button')
      const clearFiltersButton = buttons.find(btn => btn.text().includes('Clear filters'))

      expect(clearFiltersButton).toBeDefined()
      await clearFiltersButton!.trigger('click')

      // Search should be cleared (store mutation is synchronous)
      expect(component.searchQuery).toBe('')
    })

    it('does not show clear button when no filters are active', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)

      const component = wrapper.vm as any
      component.searchQuery = ''

      // Container should not exist when no active filters (checking default state, no tick needed)
      const container = wrapper.find('.flex.flex-wrap.items-center.justify-between')
      expect(container.exists()).toBe(false)
    })
  })

  describe('filter chip display', () => {
    it('displays search query chip and allows clearing via click', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)

      const component = wrapper.vm as any
      component.searchQuery = 'Noble'
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      expect(html).toContain('"Noble"')
      expect(html).toContain('✕')

      // Click chip to clear
      const chips = wrapper.findAll('button')
      const searchChip = chips.find(btn => btn.text().includes('"Noble"'))

      expect(searchChip).toBeDefined()
      await searchChip!.trigger('click')

      // Store mutation is synchronous
      expect(component.searchQuery).toBe('')
    })
  })

  describe('layout structure', () => {
    it('uses flex-wrap layout and groups label with chips', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)

      const component = wrapper.vm as any
      component.searchQuery = 'Noble'
      await wrapper.vm.$nextTick()

      // Outer container uses flex-wrap
      const container = wrapper.find('.flex.flex-wrap.items-center.justify-between')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('flex-wrap')

      // Inner container groups label and chips together on left side
      const innerContainer = wrapper.find('.flex.flex-wrap.items-center.gap-2')
      expect(innerContainer.exists()).toBe(true)

      const text = innerContainer.text()
      expect(text).toContain('Active filters:')
      expect(text).toContain('"Noble"')
    })
  })
})
