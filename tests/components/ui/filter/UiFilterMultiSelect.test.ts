import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiFilterMultiSelect from '~/components/ui/filter/UiFilterMultiSelect.vue'

describe('UiFilterMultiSelect', () => {
  const defaultOptions = [
    { value: 'fire', label: 'Fire' },
    { value: 'cold', label: 'Cold' },
    { value: 'lightning', label: 'Lightning' },
    { value: 'thunder', label: 'Thunder' },
    { value: 'acid', label: 'Acid' },
    { value: 'poison', label: 'Poison' }
  ]

  describe('Basic Rendering', () => {
    it('renders with label', async () => {
      const wrapper = await mountSuspended(UiFilterMultiSelect, {
        props: {
          modelValue: [],
          label: 'Damage Types',
          options: defaultOptions
        }
      })

      expect(wrapper.text()).toContain('Damage Types')
    })

    it('handles empty options array', async () => {
      const wrapper = await mountSuspended(UiFilterMultiSelect, {
        props: {
          modelValue: [],
          label: 'Empty',
          options: []
        }
      })

      expect(wrapper.text()).toContain('Empty')
    })
  })

  describe('User Interactions', () => {
    it('emits update:modelValue when USelectMenu changes', async () => {
      const wrapper = await mountSuspended(UiFilterMultiSelect, {
        props: {
          modelValue: [],
          label: 'Damage Types',
          options: defaultOptions
        }
      })

      const selectMenu = wrapper.findComponent({ name: 'USelectMenu' })
      await selectMenu.vm.$emit('update:modelValue', ['fire'])

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted?.[0]).toEqual([['fire']])
    })

    it('handles adding multiple items to selection', async () => {
      const wrapper = await mountSuspended(UiFilterMultiSelect, {
        props: {
          modelValue: ['fire'],
          label: 'Damage Types',
          options: defaultOptions
        }
      })

      const selectMenu = wrapper.findComponent({ name: 'USelectMenu' })
      await selectMenu.vm.$emit('update:modelValue', ['fire', 'cold'])

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted?.[0]).toEqual([['fire', 'cold']])
    })

    it('handles removing items from selection', async () => {
      const wrapper = await mountSuspended(UiFilterMultiSelect, {
        props: {
          modelValue: ['fire', 'cold'],
          label: 'Damage Types',
          options: defaultOptions
        }
      })

      const selectMenu = wrapper.findComponent({ name: 'USelectMenu' })
      await selectMenu.vm.$emit('update:modelValue', ['cold'])

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted?.[0]).toEqual([['cold']])
    })

    it('handles null selection from USelectMenu', async () => {
      const wrapper = await mountSuspended(UiFilterMultiSelect, {
        props: {
          modelValue: ['fire'],
          label: 'Damage Types',
          options: defaultOptions
        }
      })

      const selectMenu = wrapper.findComponent({ name: 'USelectMenu' })
      await selectMenu.vm.$emit('update:modelValue', null)

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted?.[0]).toEqual([[]])
    })
  })

  describe('Clear Functionality', () => {
    it('emits empty array when clear button clicked', async () => {
      const wrapper = await mountSuspended(UiFilterMultiSelect, {
        props: {
          modelValue: ['fire', 'cold', 'lightning'],
          label: 'Damage Types',
          options: defaultOptions
        }
      })

      const clearButton = wrapper.findComponent({ name: 'UButton' })
      // Emit the click event directly from the button component
      await clearButton.vm.$emit('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted?.[0]).toEqual([[]])
    })
  })

  describe('Styling Props', () => {
    it('displays count in badge', async () => {
      const wrapper = await mountSuspended(UiFilterMultiSelect, {
        props: {
          modelValue: ['fire', 'cold', 'lightning'],
          label: 'Damage Types',
          options: defaultOptions
        }
      })

      const badge = wrapper.findComponent({ name: 'UBadge' })
      expect(badge.text()).toBe('3')
    })
  })

  describe('Accessibility', () => {
    it('provides accessible label', async () => {
      const wrapper = await mountSuspended(UiFilterMultiSelect, {
        props: {
          modelValue: [],
          label: 'Damage Types',
          options: defaultOptions
        }
      })

      expect(wrapper.text()).toContain('Damage Types')
    })
  })

  describe('Edge Cases', () => {
    it('handles selecting all options', async () => {
      const wrapper = await mountSuspended(UiFilterMultiSelect, {
        props: {
          modelValue: ['fire', 'cold', 'lightning', 'thunder', 'acid', 'poison'],
          label: 'Damage Types',
          options: defaultOptions
        }
      })

      const badge = wrapper.findComponent({ name: 'UBadge' })
      expect(badge.text()).toBe('6')
    })

    it('handles rapid selection changes', async () => {
      const wrapper = await mountSuspended(UiFilterMultiSelect, {
        props: {
          modelValue: [],
          label: 'Damage Types',
          options: defaultOptions
        }
      })

      const selectMenu = wrapper.findComponent({ name: 'USelectMenu' })

      await selectMenu.vm.$emit('update:modelValue', ['fire'])
      await selectMenu.vm.$emit('update:modelValue', ['fire', 'cold'])
      await selectMenu.vm.$emit('update:modelValue', ['fire', 'cold', 'lightning'])

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toHaveLength(3)
      expect(emitted?.[2]).toEqual([['fire', 'cold', 'lightning']])
    })
  })

  describe('Props Configuration', () => {
    it('uses custom placeholder', async () => {
      const wrapper = await mountSuspended(UiFilterMultiSelect, {
        props: {
          modelValue: [],
          label: 'Damage Types',
          options: defaultOptions,
          placeholder: 'Choose damage types...'
        }
      })

      // Verify component receives the placeholder prop
      expect(wrapper.props('placeholder')).toBe('Choose damage types...')
    })
  })
})
