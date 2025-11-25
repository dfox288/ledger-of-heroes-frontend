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

      await wrapper.vm.$nextTick()

      // Chip should not exist
      const chip = wrapper.find('[data-testid="alignment-filter-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })

  describe('Has Fly Filter Chip', () => {
    it('shows "Has Fly: Yes" chip when filter is "1"', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasFly = '1'

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-fly-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Has Fly: Yes')
      expect(chip.text()).toContain('✕')
    })

    it('shows "Has Fly: No" chip when filter is "0"', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasFly = '0'

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-fly-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Has Fly: No')
      expect(chip.text()).toContain('✕')
    })

    it('clicking chip clears has fly filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasFly = '1'

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-fly-chip"]')
      await chip.trigger('click')

      expect(component.hasFly).toBeNull()
    })

    it('does not show chip when filter is null', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasFly = null

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-fly-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })

  describe('Has Swim Filter Chip', () => {
    it('shows "Has Swim: Yes" chip when filter is "1"', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasSwim = '1'

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-swim-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Has Swim: Yes')
      expect(chip.text()).toContain('✕')
    })

    it('shows "Has Swim: No" chip when filter is "0"', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasSwim = '0'

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-swim-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Has Swim: No')
      expect(chip.text()).toContain('✕')
    })

    it('clicking chip clears has swim filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasSwim = '1'

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-swim-chip"]')
      await chip.trigger('click')

      expect(component.hasSwim).toBeNull()
    })

    it('does not show chip when filter is null', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasSwim = null

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-swim-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })

  describe('Has Burrow Filter Chip', () => {
    it('shows "Has Burrow: Yes" chip when filter is "1"', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasBurrow = '1'

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-burrow-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Has Burrow: Yes')
      expect(chip.text()).toContain('✕')
    })

    it('shows "Has Burrow: No" chip when filter is "0"', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasBurrow = '0'

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-burrow-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Has Burrow: No')
      expect(chip.text()).toContain('✕')
    })

    it('clicking chip clears has burrow filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasBurrow = '1'

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-burrow-chip"]')
      await chip.trigger('click')

      expect(component.hasBurrow).toBeNull()
    })

    it('does not show chip when filter is null', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasBurrow = null

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-burrow-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })

  describe('Has Climb Filter Chip', () => {
    it('shows "Has Climb: Yes" chip when filter is "1"', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasClimb = '1'

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-climb-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Has Climb: Yes')
      expect(chip.text()).toContain('✕')
    })

    it('shows "Has Climb: No" chip when filter is "0"', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasClimb = '0'

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-climb-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Has Climb: No')
      expect(chip.text()).toContain('✕')
    })

    it('clicking chip clears has climb filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasClimb = '1'

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-climb-chip"]')
      await chip.trigger('click')

      expect(component.hasClimb).toBeNull()
    })

    it('does not show chip when filter is null', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.hasClimb = null

      await wrapper.vm.$nextTick()

      const chip = wrapper.find('[data-testid="has-climb-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })

  describe('All Missing Chips Integration', () => {
    it('shows all 5 missing filter chips when active', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedAlignments = ['Lawful Good', 'Chaotic Evil']
      component.hasFly = '1'
      component.hasSwim = '0'
      component.hasBurrow = '1'
      component.hasClimb = '0'

      await wrapper.vm.$nextTick()

      // All 5 chips should exist
      expect(wrapper.find('[data-testid="alignment-filter-chip"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="has-fly-chip"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="has-swim-chip"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="has-burrow-chip"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="has-climb-chip"]').exists()).toBe(true)
    })

    it('clears all missing filters via clearFilters()', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedAlignments = ['Lawful Good']
      component.hasFly = '1'
      component.hasSwim = '1'
      component.hasBurrow = '1'
      component.hasClimb = '1'

      await wrapper.vm.$nextTick()

      // Clear all
      component.clearFilters()
      await wrapper.vm.$nextTick()

      // All should be cleared
      expect(component.selectedAlignments).toEqual([])
      expect(component.hasFly).toBeNull()
      expect(component.hasSwim).toBeNull()
      expect(component.hasBurrow).toBeNull()
      expect(component.hasClimb).toBeNull()
    })
  })
})
