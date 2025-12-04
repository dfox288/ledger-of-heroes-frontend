// tests/components/character/builder/RacePickerCard.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import RacePickerCard from '~/components/character/builder/RacePickerCard.vue'
import { createMockRace } from '../../../helpers/mockFactories'
import { testPickerCardBehavior } from '../../../helpers/pickerCardBehavior'

const mockRace = createMockRace({
  name: 'Dwarf',
  slug: 'dwarf',
  speed: 25,
  subraces: []
})

const mockRaceWithSubraces = createMockRace({
  name: 'Elf',
  slug: 'elf'
  // Uses default subraces from factory (High Elf, Wood Elf)
})

describe('RacePickerCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Test common picker card behavior
  testPickerCardBehavior({
    component: RacePickerCard,
    mockEntity: mockRace,
    entityName: 'Dwarf',
    propName: 'race'
  })

  // Race-specific tests
  describe('Race-specific behavior', () => {
    it('shows subrace count badge when race has subraces', async () => {
      const wrapper = await mountSuspended(RacePickerCard, {
        props: { race: mockRaceWithSubraces, selected: false }
      })
      expect(wrapper.text()).toContain('2 Subraces')
    })
  })
})
