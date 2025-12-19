// tests/components/character/sheet/ConcentrationIndicator.test.ts
/**
 * Tests for ConcentrationIndicator component
 *
 * Displays active spell concentration in the spells page stats bar.
 *
 * @see Issue #783, #792
 */
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ConcentrationIndicator from '~/components/character/sheet/ConcentrationIndicator.vue'

const mockConcentration = {
  spellId: 123,
  spellName: 'Bless',
  spellSlug: 'phb:bless'
}

describe('ConcentrationIndicator', () => {
  describe('when not concentrating', () => {
    it('renders nothing when concentration is null', async () => {
      const wrapper = await mountSuspended(ConcentrationIndicator, {
        props: {
          concentration: null,
          canEdit: true
        }
      })

      expect(wrapper.text()).toBe('')
    })
  })

  describe('when concentrating', () => {
    it('displays the spell name', async () => {
      const wrapper = await mountSuspended(ConcentrationIndicator, {
        props: {
          concentration: mockConcentration,
          canEdit: false
        }
      })

      expect(wrapper.text()).toContain('Bless')
    })

    it('shows concentration label', async () => {
      const wrapper = await mountSuspended(ConcentrationIndicator, {
        props: {
          concentration: mockConcentration,
          canEdit: false
        }
      })

      expect(wrapper.text()).toMatch(/concentrat/i)
    })

    it('emits viewSpell when spell name is clicked', async () => {
      const wrapper = await mountSuspended(ConcentrationIndicator, {
        props: {
          concentration: mockConcentration,
          canEdit: false
        }
      })

      const spellLink = wrapper.find('[data-testid="concentration-spell-link"]')
      await spellLink.trigger('click')

      expect(wrapper.emitted('viewSpell')).toBeTruthy()
      expect(wrapper.emitted('viewSpell')![0]).toEqual(['phb:bless'])
    })

    it('has accessible aria-label on spell link', async () => {
      const wrapper = await mountSuspended(ConcentrationIndicator, {
        props: {
          concentration: mockConcentration,
          canEdit: false
        }
      })

      const spellLink = wrapper.find('[data-testid="concentration-spell-link"]')
      expect(spellLink.attributes('aria-label')).toBe('View Bless details')
    })
  })

  describe('clear button (play mode)', () => {
    it('shows clear button when canEdit is true', async () => {
      const wrapper = await mountSuspended(ConcentrationIndicator, {
        props: {
          concentration: mockConcentration,
          canEdit: true
        }
      })

      const clearBtn = wrapper.find('[data-testid="concentration-clear-btn"]')
      expect(clearBtn.exists()).toBe(true)
    })

    it('hides clear button when canEdit is false', async () => {
      const wrapper = await mountSuspended(ConcentrationIndicator, {
        props: {
          concentration: mockConcentration,
          canEdit: false
        }
      })

      const clearBtn = wrapper.find('[data-testid="concentration-clear-btn"]')
      expect(clearBtn.exists()).toBe(false)
    })

    it('emits clear when clear button is clicked', async () => {
      const wrapper = await mountSuspended(ConcentrationIndicator, {
        props: {
          concentration: mockConcentration,
          canEdit: true
        }
      })

      const clearBtn = wrapper.find('[data-testid="concentration-clear-btn"]')
      await clearBtn.trigger('click')

      expect(wrapper.emitted('clear')).toBeTruthy()
    })

    it('has accessible aria-label on clear button', async () => {
      const wrapper = await mountSuspended(ConcentrationIndicator, {
        props: {
          concentration: mockConcentration,
          canEdit: true
        }
      })

      const clearBtn = wrapper.find('[data-testid="concentration-clear-btn"]')
      expect(clearBtn.attributes('aria-label')).toBe('End concentration')
    })
  })
})
