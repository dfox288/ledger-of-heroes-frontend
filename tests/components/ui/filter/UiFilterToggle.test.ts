import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiFilterToggle from '~/components/ui/filter/UiFilterToggle.vue'

describe('UiFilterToggle', () => {
  describe('Basic Rendering', () => {
    it('renders with label', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: null,
          label: 'Concentration'
        }
      })

      expect(wrapper.text()).toContain('Concentration')
    })

    it('renders three option buttons by default', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: null,
          label: 'Concentration'
        }
      })

      const buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(3)
    })

    it('renders custom option labels', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: null,
          label: 'Filter',
          options: [
            { value: null, label: 'Any' },
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' }
          ]
        }
      })

      expect(wrapper.text()).toContain('Any')
      expect(wrapper.text()).toContain('Active')
      expect(wrapper.text()).toContain('Inactive')
    })
  })

  describe('State Management', () => {
    it('highlights the active option when value is null', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: null,
          label: 'Concentration'
        }
      })

      const buttons = wrapper.findAll('button')
      const allButton = buttons[0]

      // Active button should have primary color classes
      expect(allButton.classes()).toContain('bg-primary-500')
    })

    it('highlights the active option when value is "true"', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: 'true',
          label: 'Concentration'
        }
      })

      const buttons = wrapper.findAll('button')
      const yesButton = buttons[1]

      expect(yesButton.classes()).toContain('bg-primary-500')
    })

    it('highlights the active option when value is "false"', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: 'false',
          label: 'Concentration'
        }
      })

      const buttons = wrapper.findAll('button')
      const noButton = buttons[2]

      expect(noButton.classes()).toContain('bg-primary-500')
    })

    it('applies neutral color to inactive options', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: 'true',
          label: 'Concentration'
        }
      })

      const buttons = wrapper.findAll('button')
      const allButton = buttons[0]
      const noButton = buttons[2]

      // Unselected buttons use bg-white in light mode
      expect(allButton.classes()).toContain('bg-white')
      expect(noButton.classes()).toContain('bg-white')
    })
  })

  describe('User Interactions', () => {
    it('emits update:modelValue when clicking "All" option', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: 'true',
          label: 'Concentration'
        }
      })

      const buttons = wrapper.findAll('button')
      await buttons[0].trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
    })

    it('emits update:modelValue when clicking "Yes" option', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: null,
          label: 'Concentration'
        }
      })

      const buttons = wrapper.findAll('button')
      await buttons[1].trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['true'])
    })

    it('emits update:modelValue when clicking "No" option', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: null,
          label: 'Concentration'
        }
      })

      const buttons = wrapper.findAll('button')
      await buttons[2].trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['false'])
    })

    it('emits change event with new value', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: null,
          label: 'Concentration'
        }
      })

      const buttons = wrapper.findAll('button')
      await buttons[1].trigger('click')

      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('change')?.[0]).toEqual(['true'])
    })
  })

  describe('Custom Options', () => {
    it('supports custom value types', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: 1,
          label: 'Status',
          options: [
            { value: null, label: 'All' },
            { value: 1, label: 'Active' },
            { value: 0, label: 'Inactive' }
          ]
        }
      })

      const buttons = wrapper.findAll('button')
      const activeButton = buttons[1]

      expect(activeButton.classes()).toContain('bg-primary-500')
    })

    it('handles boolean true/false values', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: true,
          label: 'Active',
          options: [
            { value: null, label: 'All' },
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
          ]
        }
      })

      const buttons = wrapper.findAll('button')
      await buttons[2].trigger('click')

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })
  })

  describe('Styling Props', () => {
    it('uses primary color for selected options', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: 'true',
          label: 'Concentration',
          color: 'success' // Note: color prop exists but not currently implemented
        }
      })

      const buttons = wrapper.findAll('button')
      const yesButton = buttons[1]

      // Currently uses bg-primary-500 regardless of color prop
      expect(yesButton.classes()).toContain('bg-primary-500')
    })

    it('uses small text size for all buttons', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: null,
          label: 'Concentration',
          size: 'sm' // Note: size prop exists but not currently implemented
        }
      })

      const buttons = wrapper.findAll('button')
      // Currently uses text-xs regardless of size prop
      expect(buttons[0].classes()).toContain('text-xs')
    })
  })

  describe('Accessibility', () => {
    it('renders buttons with proper ARIA attributes', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: 'true',
          label: 'Concentration'
        }
      })

      const buttons = wrapper.findAll('button')
      const yesButton = buttons[1]

      expect(yesButton.attributes('aria-pressed')).toBe('true')
    })

    it('marks inactive buttons as not pressed', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: 'true',
          label: 'Concentration'
        }
      })

      const buttons = wrapper.findAll('button')
      const allButton = buttons[0]
      const noButton = buttons[2]

      expect(allButton.attributes('aria-pressed')).toBe('false')
      expect(noButton.attributes('aria-pressed')).toBe('false')
    })

    it('has descriptive accessible labels', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: null,
          label: 'Concentration'
        }
      })

      const buttons = wrapper.findAll('button')
      expect(buttons[0].attributes('aria-label')).toContain('All')
      expect(buttons[1].attributes('aria-label')).toContain('Yes')
      expect(buttons[2].attributes('aria-label')).toContain('No')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined modelValue', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: undefined,
          label: 'Concentration'
        }
      })

      const buttons = wrapper.findAll('button')
      const allButton = buttons[0]

      // Should default to "All" being active
      expect(allButton.classes()).toContain('bg-primary-500')
    })

    it('handles missing options prop with sensible defaults', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: null,
          label: 'Test'
        }
      })

      const buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(3)
      expect(wrapper.text()).toContain('All')
      expect(wrapper.text()).toContain('Yes')
      expect(wrapper.text()).toContain('No')
    })

    it('handles empty label gracefully', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: null,
          label: ''
        }
      })

      // Should still render buttons even without label
      const buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(3)
    })
  })

  describe('Disabled State', () => {
    it('disables all buttons when disabled prop is true', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: null,
          label: 'Concentration',
          disabled: true
        }
      })

      const buttons = wrapper.findAll('button')
      buttons.forEach((button) => {
        expect(button.attributes('disabled')).toBeDefined()
      })
    })

    it('does not emit events when disabled', async () => {
      const wrapper = await mountSuspended(UiFilterToggle, {
        props: {
          modelValue: null,
          label: 'Concentration',
          disabled: true
        }
      })

      const buttons = wrapper.findAll('button')
      await buttons[1].trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
  })
})
