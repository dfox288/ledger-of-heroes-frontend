// tests/components/character/picker/SizePickerCard.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SizePickerCard from '~/components/character/picker/SizePickerCard.vue'

// Mock size options from backend
const mockSmallSize = {
  id: 2,
  code: 'S',
  name: 'Small'
}

const mockMediumSize = {
  id: 3,
  code: 'M',
  name: 'Medium'
}

describe('SizePickerCard', () => {
  describe('rendering', () => {
    it('renders the size name', async () => {
      const wrapper = await mountSuspended(SizePickerCard, {
        props: { size: mockSmallSize, selected: false }
      })
      expect(wrapper.text()).toContain('Small')
    })

    it('renders the size code badge', async () => {
      const wrapper = await mountSuspended(SizePickerCard, {
        props: { size: mockSmallSize, selected: false }
      })
      expect(wrapper.text()).toContain('S')
    })

    it('renders description for Small size', async () => {
      const wrapper = await mountSuspended(SizePickerCard, {
        props: { size: mockSmallSize, selected: false }
      })
      expect(wrapper.text()).toContain('Smaller stature')
    })

    it('renders description for Medium size', async () => {
      const wrapper = await mountSuspended(SizePickerCard, {
        props: { size: mockMediumSize, selected: false }
      })
      expect(wrapper.text()).toContain('Standard humanoid size')
    })
  })

  describe('selection state', () => {
    it('shows selected styling when selected', async () => {
      const wrapper = await mountSuspended(SizePickerCard, {
        props: { size: mockSmallSize, selected: true }
      })
      const pickerCard = wrapper.find('[data-testid="size-picker-card"]')
      expect(pickerCard.classes()).toContain('ring-2')
    })

    it('does not show selected styling when not selected', async () => {
      const wrapper = await mountSuspended(SizePickerCard, {
        props: { size: mockSmallSize, selected: false }
      })
      const pickerCard = wrapper.find('[data-testid="size-picker-card"]')
      expect(pickerCard.classes()).not.toContain('ring-2')
    })

    it('shows checkmark badge when selected', async () => {
      const wrapper = await mountSuspended(SizePickerCard, {
        props: { size: mockSmallSize, selected: true }
      })
      // Look for the success badge with checkmark icon
      const badge = wrapper.find('.absolute.top-2.right-2')
      expect(badge.exists()).toBe(true)
    })

    it('hides checkmark badge when not selected', async () => {
      const wrapper = await mountSuspended(SizePickerCard, {
        props: { size: mockSmallSize, selected: false }
      })
      // The checkmark container should not exist when not selected
      const badge = wrapper.find('.absolute.top-2.right-2')
      expect(badge.exists()).toBe(false)
    })
  })

  describe('interactions', () => {
    it('emits select event when card is clicked', async () => {
      const wrapper = await mountSuspended(SizePickerCard, {
        props: { size: mockSmallSize, selected: false }
      })
      const pickerCard = wrapper.find('[data-testid="size-picker-card"]')
      await pickerCard.trigger('click')

      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')![0]).toEqual([mockSmallSize])
    })

    it('emits select event with Medium size when clicked', async () => {
      const wrapper = await mountSuspended(SizePickerCard, {
        props: { size: mockMediumSize, selected: false }
      })
      const pickerCard = wrapper.find('[data-testid="size-picker-card"]')
      await pickerCard.trigger('click')

      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')![0]).toEqual([mockMediumSize])
    })

    it('emits select event even when already selected', async () => {
      const wrapper = await mountSuspended(SizePickerCard, {
        props: { size: mockSmallSize, selected: true }
      })
      const pickerCard = wrapper.find('[data-testid="size-picker-card"]')
      await pickerCard.trigger('click')

      expect(wrapper.emitted('select')).toBeTruthy()
    })
  })

  describe('icon display', () => {
    it('renders an icon in the circular container', async () => {
      const wrapper = await mountSuspended(SizePickerCard, {
        props: { size: mockSmallSize, selected: false }
      })
      // Icon should be inside the rounded-full container
      const iconContainer = wrapper.find('.rounded-full')
      expect(iconContainer.exists()).toBe(true)
    })

    it('renders icon for both Small and Medium sizes', async () => {
      const smallWrapper = await mountSuspended(SizePickerCard, {
        props: { size: mockSmallSize, selected: false }
      })
      const mediumWrapper = await mountSuspended(SizePickerCard, {
        props: { size: mockMediumSize, selected: false }
      })

      // Both should have an icon container
      expect(smallWrapper.find('.rounded-full').exists()).toBe(true)
      expect(mediumWrapper.find('.rounded-full').exists()).toBe(true)
    })
  })
})
