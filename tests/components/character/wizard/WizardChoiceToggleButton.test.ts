// tests/components/character/wizard/WizardChoiceToggleButton.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import WizardChoiceToggleButton from '~/components/character/wizard/WizardChoiceToggleButton.vue'

describe('WizardChoiceToggleButton', () => {
  const defaultProps = {
    name: 'Common',
    selected: false,
    disabled: false
  }

  describe('rendering', () => {
    it('displays the option name', async () => {
      const wrapper = await mountSuspended(WizardChoiceToggleButton, {
        props: defaultProps
      })

      expect(wrapper.text()).toContain('Common')
    })

    it('shows selected state with check icon', async () => {
      const wrapper = await mountSuspended(WizardChoiceToggleButton, {
        props: { ...defaultProps, selected: true }
      })

      expect(wrapper.find('[data-testid="toggle-check-icon"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="toggle-empty-circle"]').exists()).toBe(false)
    })

    it('shows unselected state with empty circle', async () => {
      const wrapper = await mountSuspended(WizardChoiceToggleButton, {
        props: { ...defaultProps, selected: false }
      })

      expect(wrapper.find('[data-testid="toggle-check-icon"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="toggle-empty-circle"]').exists()).toBe(true)
    })

    it('shows disabled reason when provided', async () => {
      const wrapper = await mountSuspended(WizardChoiceToggleButton, {
        props: {
          ...defaultProps,
          disabled: true,
          disabledReason: 'Already known'
        }
      })

      expect(wrapper.text()).toContain('Already known')
    })

    it('renders subtitle slot content', async () => {
      const wrapper = await mountSuspended(WizardChoiceToggleButton, {
        props: defaultProps,
        slots: {
          subtitle: '<span data-testid="subtitle-content">Script: Common</span>'
        }
      })

      expect(wrapper.find('[data-testid="subtitle-content"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Script: Common')
    })
  })

  describe('styling', () => {
    it('applies selected styling when selected', async () => {
      const wrapper = await mountSuspended(WizardChoiceToggleButton, {
        props: { ...defaultProps, selected: true }
      })

      const button = wrapper.find('button')
      expect(button.classes()).toContain('border-primary')
      expect(button.classes()).toContain('bg-primary/10')
    })

    it('applies disabled styling when disabled', async () => {
      const wrapper = await mountSuspended(WizardChoiceToggleButton, {
        props: { ...defaultProps, disabled: true }
      })

      const button = wrapper.find('button')
      expect(button.classes()).toContain('opacity-50')
      expect(button.classes()).toContain('cursor-not-allowed')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('applies hover styling when not selected or disabled', async () => {
      const wrapper = await mountSuspended(WizardChoiceToggleButton, {
        props: defaultProps
      })

      const button = wrapper.find('button')
      expect(button.classes()).toContain('hover:border-primary/50')
    })
  })

  describe('interaction', () => {
    it('emits toggle event when clicked', async () => {
      const wrapper = await mountSuspended(WizardChoiceToggleButton, {
        props: defaultProps
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('toggle')).toBeTruthy()
      expect(wrapper.emitted('toggle')).toHaveLength(1)
    })

    it('does not emit toggle event when disabled', async () => {
      const wrapper = await mountSuspended(WizardChoiceToggleButton, {
        props: { ...defaultProps, disabled: true }
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('toggle')).toBeFalsy()
    })
  })

  describe('custom icon states', () => {
    it('shows custom icon when provided', async () => {
      const wrapper = await mountSuspended(WizardChoiceToggleButton, {
        props: {
          ...defaultProps,
          customIcon: 'i-heroicons-check-circle-solid',
          customIconClass: 'text-success'
        }
      })

      const customIcon = wrapper.find('[data-testid="toggle-custom-icon"]')
      expect(customIcon.exists()).toBe(true)
    })
  })
})
