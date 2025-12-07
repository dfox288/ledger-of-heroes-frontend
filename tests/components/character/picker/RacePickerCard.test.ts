// tests/components/character/picker/RacePickerCard.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import RacePickerCard from '~/components/character/picker/RacePickerCard.vue'
import { testPickerCardBehavior } from '../../../helpers/pickerCardBehavior'

const mockRace = {
  id: 1,
  name: 'Dwarf',
  slug: 'dwarf',
  size: { id: 2, name: 'Medium', code: 'M' },
  speed: 25,
  description: 'Bold and hardy, dwarves are known as skilled warriors.',
  subraces: [
    { id: 1, name: 'Hill Dwarf', slug: 'hill-dwarf' },
    { id: 2, name: 'Mountain Dwarf', slug: 'mountain-dwarf' }
  ],
  modifiers: [
    {
      id: 1,
      modifier_category: 'ability_score',
      ability_score: { id: 3, name: 'Constitution', code: 'CON' },
      value: 2
    }
  ]
}

describe('RacePickerCard', () => {
  // Test common picker card behavior
  testPickerCardBehavior({
    component: RacePickerCard,
    mockEntity: mockRace,
    entityName: 'Dwarf',
    propName: 'race'
  })

  describe('race-specific features', () => {
    it('shows size badge when size is provided', async () => {
      const wrapper = await mountSuspended(RacePickerCard, {
        props: { race: mockRace, selected: false }
      })
      expect(wrapper.text()).toContain('Medium')
    })

    it('shows subrace count badge when race has subraces', async () => {
      const wrapper = await mountSuspended(RacePickerCard, {
        props: { race: mockRace, selected: false }
      })
      expect(wrapper.text()).toContain('2 Subraces')
    })

    it('shows singular subrace text for one subrace', async () => {
      const raceWithOneSubrace = {
        ...mockRace,
        subraces: [{ id: 1, name: 'Hill Dwarf', slug: 'hill-dwarf' }]
      }
      const wrapper = await mountSuspended(RacePickerCard, {
        props: { race: raceWithOneSubrace, selected: false }
      })
      expect(wrapper.text()).toContain('1 Subrace')
      expect(wrapper.text()).not.toContain('1 Subraces')
    })

    it('does not show subrace badge when race has no subraces', async () => {
      const raceWithoutSubraces = { ...mockRace, subraces: [] }
      const wrapper = await mountSuspended(RacePickerCard, {
        props: { race: raceWithoutSubraces, selected: false }
      })
      expect(wrapper.text()).not.toContain('Subrace')
    })

    it('shows speed stat', async () => {
      const wrapper = await mountSuspended(RacePickerCard, {
        props: { race: mockRace, selected: false }
      })
      expect(wrapper.text()).toContain('25 ft')
    })

    it('shows ability modifiers', async () => {
      const wrapper = await mountSuspended(RacePickerCard, {
        props: { race: mockRace, selected: false }
      })
      expect(wrapper.text()).toContain('CON +2')
    })

    it('shows multiple ability modifiers separated by commas', async () => {
      const raceWithMultipleMods = {
        ...mockRace,
        modifiers: [
          {
            id: 1,
            modifier_category: 'ability_score',
            ability_score: { id: 3, name: 'Constitution', code: 'CON' },
            value: 2
          },
          {
            id: 2,
            modifier_category: 'ability_score',
            ability_score: { id: 1, name: 'Strength', code: 'STR' },
            value: 2
          }
        ]
      }
      const wrapper = await mountSuspended(RacePickerCard, {
        props: { race: raceWithMultipleMods, selected: false }
      })
      expect(wrapper.text()).toContain('CON +2')
      expect(wrapper.text()).toContain('STR +2')
    })

    it('does not show ability modifiers when none are present', async () => {
      const raceWithoutMods = { ...mockRace, modifiers: [] }
      const wrapper = await mountSuspended(RacePickerCard, {
        props: { race: raceWithoutMods, selected: false }
      })
      // Should not contain the modifier pattern
      expect(wrapper.text()).not.toMatch(/[A-Z]{3} \+\d/)
    })

    it('shows description when provided', async () => {
      const wrapper = await mountSuspended(RacePickerCard, {
        props: { race: mockRace, selected: false }
      })
      expect(wrapper.text()).toContain('Bold and hardy')
    })

    it('handles missing description gracefully', async () => {
      const raceWithoutDescription = { ...mockRace, description: undefined }
      const wrapper = await mountSuspended(RacePickerCard, {
        props: { race: raceWithoutDescription, selected: false }
      })
      expect(wrapper.html()).toBeTruthy()
    })

    it('handles missing size gracefully', async () => {
      const raceWithoutSize = { ...mockRace, size: undefined }
      const wrapper = await mountSuspended(RacePickerCard, {
        props: { race: raceWithoutSize, selected: false }
      })
      expect(wrapper.html()).toBeTruthy()
    })

    it('handles missing speed gracefully', async () => {
      const raceWithoutSpeed = { ...mockRace, speed: undefined }
      const wrapper = await mountSuspended(RacePickerCard, {
        props: { race: raceWithoutSpeed, selected: false }
      })
      expect(wrapper.html()).toBeTruthy()
    })

    it('filters out non-ability-score modifiers', async () => {
      const raceWithMixedMods = {
        ...mockRace,
        modifiers: [
          {
            id: 1,
            modifier_category: 'ability_score',
            ability_score: { id: 3, name: 'Constitution', code: 'CON' },
            value: 2
          },
          {
            id: 2,
            modifier_category: 'speed',
            ability_score: null,
            value: 5
          }
        ]
      }
      const wrapper = await mountSuspended(RacePickerCard, {
        props: { race: raceWithMixedMods, selected: false }
      })
      expect(wrapper.text()).toContain('CON +2')
      // Speed modifier should not appear in the ability modifiers display
    })
  })
})
