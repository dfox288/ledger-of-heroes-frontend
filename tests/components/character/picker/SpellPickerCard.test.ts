// tests/components/character/picker/SpellPickerCard.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpellPickerCard from '~/components/character/picker/SpellPickerCard.vue'

const mockSpell = {
  id: 1,
  name: 'Fireball',
  slug: 'fireball',
  level: 3,
  school: { id: 5, name: 'Evocation', code: 'EV' },
  needs_concentration: false,
  is_ritual: false
}

const mockCantrip = {
  id: 2,
  name: 'Light',
  slug: 'light',
  level: 0,
  school: { id: 5, name: 'Evocation', code: 'EV' },
  needs_concentration: false,
  is_ritual: false
}

describe('SpellPickerCard', () => {
  describe('common behavior', () => {
    it('renders the spell name', async () => {
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: mockSpell, selected: false }
      })
      expect(wrapper.text()).toContain('Fireball')
    })

    it('shows selected styling when selected', async () => {
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: mockSpell, selected: true }
      })
      const spellCard = wrapper.find('[data-testid="spell-card"]')
      expect(spellCard.classes()).toContain('ring-2')
    })

    it('does not show selected styling when not selected', async () => {
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: mockSpell, selected: false }
      })
      const spellCard = wrapper.find('[data-testid="spell-card"]')
      expect(spellCard.classes()).not.toContain('ring-2')
    })

    it('emits toggle event when card is clicked', async () => {
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: mockSpell, selected: false }
      })
      const spellCard = wrapper.find('[data-testid="spell-card"]')
      await spellCard.trigger('click')

      expect(wrapper.emitted('toggle')).toBeTruthy()
      expect(wrapper.emitted('toggle')![0]).toEqual([mockSpell])
    })

    it('shows View Details button', async () => {
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: mockSpell, selected: false }
      })
      expect(wrapper.text()).toContain('View Details')
    })

    it('emits view-details event when View Details button is clicked', async () => {
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: mockSpell, selected: false }
      })
      const detailsBtn = wrapper.find('[data-testid="view-details-btn"]')
      await detailsBtn.trigger('click')

      // Check for both event name variations
      const emittedEvents = wrapper.emitted()
      const hasViewDetails = emittedEvents['view-details'] || emittedEvents['viewDetails']
      expect(hasViewDetails).toBeTruthy()

      // Should not also emit toggle
      expect(wrapper.emitted('toggle')).toBeFalsy()
    })

    it('shows selected checkmark when selected', async () => {
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: mockSpell, selected: true }
      })
      const selectedCheck = wrapper.find('[data-testid="selected-check"]')
      expect(selectedCheck.exists()).toBe(true)
    })

    it('does not show selected checkmark when not selected', async () => {
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: mockSpell, selected: false }
      })
      const selectedCheck = wrapper.find('[data-testid="selected-check"]')
      expect(selectedCheck.exists()).toBe(false)
    })
  })

  describe('disabled behavior', () => {
    it('does not emit toggle when disabled', async () => {
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: mockSpell, selected: false, disabled: true }
      })
      const spellCard = wrapper.find('[data-testid="spell-card"]')
      await spellCard.trigger('click')

      expect(wrapper.emitted('toggle')).toBeFalsy()
    })

    it('shows disabled styling when disabled', async () => {
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: mockSpell, selected: false, disabled: true }
      })
      const spellCard = wrapper.find('[data-testid="spell-card"]')
      expect(spellCard.classes()).toContain('opacity-50')
      expect(spellCard.classes()).toContain('cursor-not-allowed')
    })

    it('does not show disabled styling when not disabled', async () => {
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: mockSpell, selected: false, disabled: false }
      })
      const spellCard = wrapper.find('[data-testid="spell-card"]')
      expect(spellCard.classes()).not.toContain('opacity-50')
    })

    it('defaults disabled to false', async () => {
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: mockSpell, selected: false }
      })
      const spellCard = wrapper.find('[data-testid="spell-card"]')
      expect(spellCard.classes()).not.toContain('opacity-50')
    })
  })

  describe('spell level display', () => {
    it('shows "Cantrip" for level 0', async () => {
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: mockCantrip, selected: false }
      })
      expect(wrapper.text()).toContain('Cantrip')
    })

    it('shows "1st" for level 1', async () => {
      const spell = { ...mockSpell, level: 1 }
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell, selected: false }
      })
      expect(wrapper.text()).toContain('1st')
    })

    it('shows "2nd" for level 2', async () => {
      const spell = { ...mockSpell, level: 2 }
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell, selected: false }
      })
      expect(wrapper.text()).toContain('2nd')
    })

    it('shows "3rd" for level 3', async () => {
      const spell = { ...mockSpell, level: 3 }
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell, selected: false }
      })
      expect(wrapper.text()).toContain('3rd')
    })

    it('shows "4th" for level 4', async () => {
      const spell = { ...mockSpell, level: 4 }
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell, selected: false }
      })
      expect(wrapper.text()).toContain('4th')
    })

    it('shows "9th" for level 9', async () => {
      const spell = { ...mockSpell, level: 9 }
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell, selected: false }
      })
      expect(wrapper.text()).toContain('9th')
    })
  })

  describe('spell school display', () => {
    it('shows spell school name', async () => {
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: mockSpell, selected: false }
      })
      expect(wrapper.text()).toContain('Evocation')
    })

    it('handles missing school gracefully', async () => {
      const spellWithoutSchool = { ...mockSpell, school: undefined }
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: spellWithoutSchool, selected: false }
      })
      expect(wrapper.html()).toBeTruthy()
    })

    it('displays different schools correctly', async () => {
      const necromancySpell = {
        ...mockSpell,
        school: { id: 7, name: 'Necromancy', code: 'N' }
      }
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: necromancySpell, selected: false }
      })
      expect(wrapper.text()).toContain('Necromancy')
    })
  })

  describe('concentration and ritual badges', () => {
    it('shows concentration badge when needs_concentration is true', async () => {
      const concentrationSpell = { ...mockSpell, needs_concentration: true }
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: concentrationSpell, selected: false }
      })
      expect(wrapper.text()).toContain('Concentration')
    })

    it('does not show concentration badge when needs_concentration is false', async () => {
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: mockSpell, selected: false }
      })
      expect(wrapper.text()).not.toContain('Concentration')
    })

    it('shows ritual badge when is_ritual is true', async () => {
      const ritualSpell = { ...mockSpell, is_ritual: true }
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: ritualSpell, selected: false }
      })
      expect(wrapper.text()).toContain('Ritual')
    })

    it('does not show ritual badge when is_ritual is false', async () => {
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: mockSpell, selected: false }
      })
      expect(wrapper.text()).not.toContain('Ritual')
    })

    it('shows both concentration and ritual badges when applicable', async () => {
      const complexSpell = {
        ...mockSpell,
        needs_concentration: true,
        is_ritual: true
      }
      const wrapper = await mountSuspended(SpellPickerCard, {
        props: { spell: complexSpell, selected: false }
      })
      expect(wrapper.text()).toContain('Concentration')
      expect(wrapper.text()).toContain('Ritual')
    })
  })

  describe('school color mapping', () => {
    const schoolColors = [
      { code: 'A', name: 'Abjuration' },
      { code: 'C', name: 'Conjuration' },
      { code: 'D', name: 'Divination' },
      { code: 'EN', name: 'Enchantment' },
      { code: 'EV', name: 'Evocation' },
      { code: 'I', name: 'Illusion' },
      { code: 'N', name: 'Necromancy' },
      { code: 'T', name: 'Transmutation' }
    ]

    schoolColors.forEach(({ code, name }) => {
      it(`renders ${name} school correctly`, async () => {
        const spell = {
          ...mockSpell,
          school: { id: 1, name, code }
        }
        const wrapper = await mountSuspended(SpellPickerCard, {
          props: { spell, selected: false }
        })
        expect(wrapper.text()).toContain(name)
      })
    })
  })
})
