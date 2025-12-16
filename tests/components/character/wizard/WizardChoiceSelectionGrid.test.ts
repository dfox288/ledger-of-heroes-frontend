// tests/components/character/wizard/WizardChoiceSelectionGrid.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import WizardChoiceSelectionGrid from '~/components/character/wizard/WizardChoiceSelectionGrid.vue'

describe('WizardChoiceSelectionGrid', () => {
  const defaultProps = {
    label: 'Choose 2 languages',
    quantity: 2,
    selectedCount: 1
  }

  describe('rendering', () => {
    it('displays the label', async () => {
      const wrapper = await mountSuspended(WizardChoiceSelectionGrid, {
        props: defaultProps
      })

      expect(wrapper.text()).toContain('Choose 2 languages')
    })

    it('displays selection count badge', async () => {
      const wrapper = await mountSuspended(WizardChoiceSelectionGrid, {
        props: defaultProps
      })

      expect(wrapper.text()).toContain('1/2')
      expect(wrapper.text()).toContain('selected')
    })

    it('shows success color when selection is complete', async () => {
      const wrapper = await mountSuspended(WizardChoiceSelectionGrid, {
        props: { ...defaultProps, selectedCount: 2 }
      })

      const badge = wrapper.findComponent({ name: 'UBadge' })
      expect(badge.props('color')).toBe('success')
    })

    it('shows neutral color when selection is incomplete', async () => {
      const wrapper = await mountSuspended(WizardChoiceSelectionGrid, {
        props: { ...defaultProps, selectedCount: 1 }
      })

      const badge = wrapper.findComponent({ name: 'UBadge' })
      expect(badge.props('color')).toBe('neutral')
    })

    it('renders default slot content in grid', async () => {
      const wrapper = await mountSuspended(WizardChoiceSelectionGrid, {
        props: defaultProps,
        slots: {
          default: '<button data-testid="option-1">Option 1</button><button data-testid="option-2">Option 2</button>'
        }
      })

      expect(wrapper.find('[data-testid="option-1"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="option-2"]').exists()).toBe(true)
    })

    it('applies grid layout classes', async () => {
      const wrapper = await mountSuspended(WizardChoiceSelectionGrid, {
        props: defaultProps,
        slots: {
          default: '<div>Option</div>'
        }
      })

      const grid = wrapper.find('[data-testid="choice-grid"]')
      expect(grid.classes()).toContain('grid')
      expect(grid.classes()).toContain('grid-cols-2')
    })
  })

  describe('loading state', () => {
    it('shows loading indicator when loading prop is true', async () => {
      const wrapper = await mountSuspended(WizardChoiceSelectionGrid, {
        props: { ...defaultProps, loading: true }
      })

      expect(wrapper.find('[data-testid="choice-grid-loading"]').exists()).toBe(true)
    })

    it('hides grid content when loading', async () => {
      const wrapper = await mountSuspended(WizardChoiceSelectionGrid, {
        props: { ...defaultProps, loading: true },
        slots: {
          default: '<div data-testid="option">Option</div>'
        }
      })

      expect(wrapper.find('[data-testid="option"]').exists()).toBe(false)
    })
  })

  describe('custom grid columns', () => {
    it('accepts custom grid column classes', async () => {
      const wrapper = await mountSuspended(WizardChoiceSelectionGrid, {
        props: {
          ...defaultProps,
          gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        },
        slots: {
          default: '<div>Option</div>'
        }
      })

      const grid = wrapper.find('[data-testid="choice-grid"]')
      expect(grid.classes()).toContain('grid-cols-1')
      expect(grid.classes()).toContain('sm:grid-cols-2')
      expect(grid.classes()).toContain('lg:grid-cols-3')
    })
  })
})
