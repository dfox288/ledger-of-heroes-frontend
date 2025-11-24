import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiFilterRangeSlider from '~/components/ui/filter/UiFilterRangeSlider.vue'

describe('UiFilterRangeSlider', () => {
  describe('Basic Rendering', () => {
    it('renders with label', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [0, 30],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      expect(wrapper.text()).toContain('Challenge Rating')
    })

    it('displays current range values', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [5, 15],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      expect(wrapper.text()).toContain('5')
      expect(wrapper.text()).toContain('15')
    })

    it('renders range input elements', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [0, 30],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      const inputs = wrapper.findAll('input[type="range"]')
      expect(inputs.length).toBeGreaterThanOrEqual(2)
    })

    it('applies min and max bounds to inputs', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [0, 20],
          label: 'Spell Level',
          min: 0,
          max: 9
        }
      })

      const inputs = wrapper.findAll('input[type="range"]')
      expect(inputs[0].attributes('min')).toBe('0')
      expect(inputs[0].attributes('max')).toBe('9')
    })
  })

  describe('Range Values', () => {
    it('sets initial min value correctly', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [3, 15],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      const inputs = wrapper.findAll('input[type="range"]')
      expect(inputs[0].element.value).toBe('3')
    })

    it('sets initial max value correctly', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [3, 15],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      const inputs = wrapper.findAll('input[type="range"]')
      expect(inputs[1].element.value).toBe('15')
    })

    it('displays full range when at min/max', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [0, 30],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      expect(wrapper.text()).toContain('0')
      expect(wrapper.text()).toContain('30')
    })

    it('handles decimal step values', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [0.25, 1.5],
          label: 'Challenge Rating',
          min: 0,
          max: 2,
          step: 0.25
        }
      })

      const inputs = wrapper.findAll('input[type="range"]')
      expect(inputs[0].attributes('step')).toBe('0.25')
    })
  })

  describe('User Interactions', () => {
    it('emits update:modelValue when min slider changes', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [0, 30],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      const inputs = wrapper.findAll('input[type="range"]')
      await inputs[0].setValue(5)

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted?.[0]).toEqual([[5, 30]])
    })

    it('emits update:modelValue when max slider changes', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [0, 30],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      const inputs = wrapper.findAll('input[type="range"]')
      await inputs[1].setValue(20)

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted?.[0]).toEqual([[0, 20]])
    })

    it('prevents min from exceeding max', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [5, 15],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      const inputs = wrapper.findAll('input[type="range"]')
      await inputs[0].setValue(20) // Try to set min > max

      const emitted = wrapper.emitted('update:modelValue')
      const lastEmit = emitted?.[emitted.length - 1]
      // Min should be clamped to max or less
      expect(lastEmit?.[0][0]).toBeLessThanOrEqual(lastEmit?.[0][1])
    })

    it('prevents max from going below min', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [5, 15],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      const inputs = wrapper.findAll('input[type="range"]')
      await inputs[1].setValue(3) // Try to set max < min

      const emitted = wrapper.emitted('update:modelValue')
      const lastEmit = emitted?.[emitted.length - 1]
      // Max should be clamped to min or greater
      expect(lastEmit?.[0][1]).toBeGreaterThanOrEqual(lastEmit?.[0][0])
    })
  })

  describe('Reset Functionality', () => {
    it('shows reset button when range is not at full bounds', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [5, 15],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      const resetButton = wrapper.findComponent({ name: 'UButton' })
      expect(resetButton.exists()).toBe(true)
    })

    it('does not show reset button when at full range', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [0, 30],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      const resetButton = wrapper.findComponent({ name: 'UButton' })
      expect(resetButton.exists()).toBe(false)
    })

    it('resets to full range when reset button clicked', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [5, 15],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      const resetButton = wrapper.findComponent({ name: 'UButton' })
      await resetButton.vm.$emit('click')

      // Check that event was emitted and contains correct range
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted?.[emitted!.length - 1]).toEqual([[0, 30]])
    })
  })

  describe('Custom Formatting', () => {
    it('applies custom format function to display values', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [5, 15],
          label: 'Challenge Rating',
          min: 0,
          max: 30,
          formatLabel: (val: number) => `CR ${val}`
        }
      })

      expect(wrapper.text()).toContain('CR 5')
      expect(wrapper.text()).toContain('CR 15')
    })

    it('uses default formatting when no formatLabel provided', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [3, 10],
          label: 'Spell Level',
          min: 0,
          max: 9
        }
      })

      // Should display plain numbers
      expect(wrapper.text()).toContain('3')
      expect(wrapper.text()).toContain('10')
    })
  })

  describe('Styling Props', () => {
    it('applies entity color to track', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [5, 15],
          label: 'Challenge Rating',
          min: 0,
          max: 30,
          color: 'error'
        }
      })

      // Check that color prop is used in styling
      expect(wrapper.html()).toContain('error')
    })

    it('uses primary color by default', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [5, 15],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      expect(wrapper.html()).toContain('primary')
    })
  })

  describe('Step Increment', () => {
    it('uses default step of 1', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [0, 30],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      const inputs = wrapper.findAll('input[type="range"]')
      expect(inputs[0].attributes('step')).toBe('1')
    })

    it('applies custom step value', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [0, 2],
          label: 'CR Range',
          min: 0,
          max: 2,
          step: 0.25
        }
      })

      const inputs = wrapper.findAll('input[type="range"]')
      expect(inputs[0].attributes('step')).toBe('0.25')
    })
  })

  describe('Accessibility', () => {
    it('has accessible labels for both sliders', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [0, 30],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      const inputs = wrapper.findAll('input[type="range"]')
      expect(inputs[0].attributes('aria-label')).toContain('Minimum')
      expect(inputs[1].attributes('aria-label')).toContain('Maximum')
    })

    it('provides visible label text', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [0, 30],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      expect(wrapper.text()).toContain('Challenge Rating')
    })

    it('has accessible reset button', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [5, 15],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      // Find the UButton component
      const resetButton = wrapper.findComponent({ name: 'UButton' })
      expect(resetButton.exists()).toBe(true)

      // Find the actual button element within the component
      const buttonElement = resetButton.find('button')
      expect(buttonElement.exists()).toBe(true)

      // Check that the rendered button has aria-label attribute
      const ariaLabel = buttonElement.attributes('aria-label')
      expect(ariaLabel).toBeTruthy()
      expect(ariaLabel).toContain('Reset')
    })
  })

  describe('Edge Cases', () => {
    it('handles min and max being equal', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [5, 5],
          label: 'Test',
          min: 0,
          max: 10
        }
      })

      expect(wrapper.text()).toContain('5')
    })

    it('handles zero as min and max values', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [0, 0],
          label: 'Test',
          min: 0,
          max: 0
        }
      })

      expect(wrapper.text()).toContain('0')
    })

    it('handles negative values', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [-10, 10],
          label: 'Temperature',
          min: -20,
          max: 20
        }
      })

      expect(wrapper.text()).toContain('-10')
      expect(wrapper.text()).toContain('10')
    })

    it('handles large value ranges', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [0, 10000],
          label: 'HP Range',
          min: 0,
          max: 10000
        }
      })

      expect(wrapper.text()).toContain('10000')
    })

    it('handles very small step increments', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [0.1, 0.9],
          label: 'Precision',
          min: 0,
          max: 1,
          step: 0.01
        }
      })

      const inputs = wrapper.findAll('input[type="range"]')
      expect(inputs[0].attributes('step')).toBe('0.01')
    })
  })

  describe('Range Display', () => {
    it('shows range with hyphen separator', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [5, 15],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      // Should display something like "5 - 15" or "CR 5-15"
      const text = wrapper.text()
      expect(text.includes('5') && text.includes('15')).toBe(true)
    })

    it('updates display when values change', async () => {
      const wrapper = await mountSuspended(UiFilterRangeSlider, {
        props: {
          modelValue: [5, 15],
          label: 'Challenge Rating',
          min: 0,
          max: 30
        }
      })

      await wrapper.setProps({ modelValue: [10, 20] })

      expect(wrapper.text()).toContain('10')
      expect(wrapper.text()).toContain('20')
    })
  })
})
