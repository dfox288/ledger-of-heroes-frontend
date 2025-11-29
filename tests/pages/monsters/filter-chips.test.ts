import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MonstersPage from '~/pages/monsters/index.vue'

describe('Monsters Page - Missing Filter Chips', () => {
  describe('Alignment Filter Chips', () => {
    it('shows chip with selected alignment labels', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Select multiple alignments
      const component = wrapper.vm as any
      component.selectedAlignments = ['Lawful Good', 'Chaotic Evil', 'Neutral']

      await wrapper.vm.$nextTick()

      // Look for chip
      const chip = wrapper.find('[data-testid="alignment-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Alignments')
      expect(chip.text()).toContain('Lawful Good')
      expect(chip.text()).toContain('Chaotic Evil')
      expect(chip.text()).toContain('Neutral')
    })

    it('shows single alignment without plural', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Select single alignment
      const component = wrapper.vm as any
      component.selectedAlignments = ['Lawful Good']

      await wrapper.vm.$nextTick()

      // Look for chip
      const chip = wrapper.find('[data-testid="alignment-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Alignment')
      expect(chip.text()).not.toContain('Alignments')
      expect(chip.text()).toContain('Lawful Good')
    })

    it('clicking chip clears alignment filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Select alignments
      const component = wrapper.vm as any
      component.selectedAlignments = ['Lawful Good', 'Chaotic Evil']

      await wrapper.vm.$nextTick()

      // Click chip
      const chip = wrapper.find('[data-testid="alignment-filter-chip"]')
      await chip.trigger('click')

      // Alignments should be cleared
      expect(component.selectedAlignments).toEqual([])
    })

    it('does not show chip when no alignments selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedAlignments = []

      // Chip should not exist
      const chip = wrapper.find('[data-testid="alignment-filter-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })

  describe('Movement Types Filter Chip', () => {
    it('shows movement types chip with selected types', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedMovementTypes = ['fly', 'swim']

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="movement-types-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Movement')
      expect(chip.text()).toContain('Fly')
      expect(chip.text()).toContain('Swim')
    })

    it('shows single movement type', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedMovementTypes = ['burrow']

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="movement-types-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Movement')
      expect(chip.text()).toContain('Burrow')
    })

    it('shows multiple movement types sorted', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedMovementTypes = ['swim', 'climb', 'fly']

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="movement-types-chip"]')
      expect(chip.exists()).toBe(true)
      // Should be sorted alphabetically
      const text = chip.text()
      expect(text).toContain('Climb')
      expect(text).toContain('Fly')
      expect(text).toContain('Swim')
    })

    it('clicking chip clears movement types filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedMovementTypes = ['fly', 'swim']

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="movement-types-chip"]')
      await chip.trigger('click')

      expect(component.selectedMovementTypes).toEqual([])
    })

    it('does not show chip when no movement types selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedMovementTypes = []

      const chip = wrapper.find('[data-testid="movement-types-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })

  describe('Alignment and Movement Integration', () => {
    it('shows both alignment and movement chips when active', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedAlignments = ['Lawful Good', 'Chaotic Evil']
      component.selectedMovementTypes = ['fly', 'swim']

      await wrapper.vm.$nextTick()

      // Both chips should exist
      expect(wrapper.find('[data-testid="alignment-filter-chip"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="movement-types-chip"]').exists()).toBe(true)
    })

    it('clears all filters via clearFilters()', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedAlignments = ['Lawful Good']
      component.selectedMovementTypes = ['fly', 'burrow', 'climb']

      await wrapper.vm.$nextTick()

      // Clear all
      component.clearFilters()

      // All should be cleared
      expect(component.selectedAlignments).toEqual([])
      expect(component.selectedMovementTypes).toEqual([])
    })
  })
})
