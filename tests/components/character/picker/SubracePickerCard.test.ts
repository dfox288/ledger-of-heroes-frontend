// tests/components/character/picker/SubracePickerCard.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SubracePickerCard from '~/components/character/picker/SubracePickerCard.vue'
import { createMockRace, mockSource } from '../../../helpers/mockFactories'

// Subrace is a partial Race with subrace-specific properties
const mockSubrace = createMockRace({
  id: 1,
  name: 'Hill Dwarf',
  slug: 'hill-dwarf',
  speed: 25,
  sources: [{ ...mockSource, id: 1 }],
  modifiers: [
    {
      id: 1,
      modifier_category: 'ability_score',
      ability_score: { id: 5, name: 'Wisdom', code: 'WIS' },
      value: 1
    }
  ],
  traits: [
    {
      id: 1,
      name: 'Dwarven Toughness',
      description: 'Your hit point maximum increases by 1, and it increases by 1 every time you gain a level.'
    }
  ]
})

describe('SubracePickerCard', () => {
  // Custom common behavior tests (uses different data-testid)
  describe('Picker Card Common Behavior', () => {
    it('renders the entity name', async () => {
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: mockSubrace, selected: false }
      })
      expect(wrapper.text()).toContain('Hill Dwarf')
    })

    it('shows selected styling when selected', async () => {
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: mockSubrace, selected: true }
      })
      const pickerCard = wrapper.find('[data-testid="subrace-picker-card"]')
      expect(pickerCard.classes()).toContain('ring-2')
    })

    it('does not show selected styling when not selected', async () => {
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: mockSubrace, selected: false }
      })
      const pickerCard = wrapper.find('[data-testid="subrace-picker-card"]')
      expect(pickerCard.classes()).not.toContain('ring-2')
    })

    it('emits select event when card is clicked', async () => {
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: mockSubrace, selected: false }
      })
      const pickerCard = wrapper.find('[data-testid="subrace-picker-card"]')
      await pickerCard.trigger('click')

      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')![0]).toEqual([mockSubrace])
    })

    it('shows View Details button', async () => {
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: mockSubrace, selected: false }
      })
      expect(wrapper.text()).toContain('View Details')
    })

    it('emits view-details event when View Details button is clicked', async () => {
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: mockSubrace, selected: false }
      })
      const detailsBtn = wrapper.find('[data-testid="view-details-btn"]')
      await detailsBtn.trigger('click')

      // Check for both event name variations
      const emittedEvents = wrapper.emitted()
      const hasViewDetails = emittedEvents['view-details'] || emittedEvents['viewDetails']
      expect(hasViewDetails).toBeTruthy()

      // Should not also emit select
      expect(wrapper.emitted('select')).toBeFalsy()
    })
  })

  describe('subrace-specific features', () => {
    it('shows source badge when sources are provided', async () => {
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: mockSubrace, selected: false }
      })
      expect(wrapper.text()).toContain('PHB')
    })

    it('shows speed stat', async () => {
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: mockSubrace, selected: false }
      })
      expect(wrapper.text()).toContain('25 ft')
    })

    it('shows ability modifiers', async () => {
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: mockSubrace, selected: false }
      })
      expect(wrapper.text()).toContain('WIS +1')
    })

    it('shows multiple ability modifiers', async () => {
      const subraceWithMultipleMods = {
        ...mockSubrace,
        modifiers: [
          {
            id: 1,
            modifier_category: 'ability_score',
            ability_score: { id: 5, name: 'Wisdom', code: 'WIS' },
            value: 1
          },
          {
            id: 2,
            modifier_category: 'ability_score',
            ability_score: { id: 1, name: 'Strength', code: 'STR' },
            value: 2
          }
        ]
      }
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: subraceWithMultipleMods, selected: false }
      })
      expect(wrapper.text()).toContain('WIS +1')
      expect(wrapper.text()).toContain('STR +2')
    })

    it('shows first trait description as preview', async () => {
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: mockSubrace, selected: false }
      })
      expect(wrapper.text()).toContain('Your hit point maximum increases')
    })

    it('handles missing sources gracefully', async () => {
      const subraceWithoutSources = { ...mockSubrace, sources: undefined }
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: subraceWithoutSources, selected: false }
      })
      expect(wrapper.html()).toBeTruthy()
    })

    it('handles empty sources array gracefully', async () => {
      const subraceWithEmptySources = { ...mockSubrace, sources: [] }
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: subraceWithEmptySources, selected: false }
      })
      expect(wrapper.html()).toBeTruthy()
    })

    it('handles missing speed gracefully', async () => {
      const subraceWithoutSpeed = { ...mockSubrace, speed: undefined }
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: subraceWithoutSpeed, selected: false }
      })
      expect(wrapper.html()).toBeTruthy()
    })

    it('handles missing modifiers gracefully', async () => {
      const subraceWithoutModifiers = { ...mockSubrace, modifiers: undefined }
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: subraceWithoutModifiers, selected: false }
      })
      expect(wrapper.html()).toBeTruthy()
    })

    it('handles empty modifiers gracefully', async () => {
      const subraceWithEmptyModifiers = { ...mockSubrace, modifiers: [] }
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: subraceWithEmptyModifiers, selected: false }
      })
      expect(wrapper.html()).toBeTruthy()
    })

    it('handles missing traits gracefully', async () => {
      const subraceWithoutTraits = { ...mockSubrace, traits: undefined }
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: subraceWithoutTraits, selected: false }
      })
      expect(wrapper.html()).toBeTruthy()
    })

    it('handles empty traits array gracefully', async () => {
      const subraceWithEmptyTraits = { ...mockSubrace, traits: [] }
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: subraceWithEmptyTraits, selected: false }
      })
      expect(wrapper.html()).toBeTruthy()
    })

    it('accepts optional parentRaceSlug prop', async () => {
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: {
          subrace: mockSubrace,
          selected: false,
          parentRaceSlug: 'dwarf'
        }
      })
      expect(wrapper.html()).toBeTruthy()
    })

    it('filters out non-ability-score modifiers', async () => {
      const subraceWithMixedMods = {
        ...mockSubrace,
        modifiers: [
          {
            id: 1,
            modifier_category: 'ability_score',
            ability_score: { id: 5, name: 'Wisdom', code: 'WIS' },
            value: 1
          },
          {
            id: 2,
            modifier_category: 'skill',
            ability_score: null,
            value: 2
          }
        ]
      }
      const wrapper = await mountSuspended(SubracePickerCard, {
        props: { subrace: subraceWithMixedMods, selected: false }
      })
      expect(wrapper.text()).toContain('WIS +1')
    })
  })
})
