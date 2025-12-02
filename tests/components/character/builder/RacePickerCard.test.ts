// tests/components/character/builder/RacePickerCard.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import RacePickerCard from '~/components/character/builder/RacePickerCard.vue'
import type { Race } from '~/types'

const mockRace: Race = {
  id: 1,
  name: 'Dwarf',
  slug: 'dwarf',
  speed: 25,
  size: { id: 1, code: 'M', name: 'Medium' },
  modifiers: [
    { id: 1, value: 2, modifier_category: 'ability_score', ability_score: { id: 1, code: 'CON', name: 'Constitution' } }
  ],
  sources: []
} as Race

const mockRaceWithSubraces: Race = {
  ...mockRace,
  id: 2,
  name: 'Elf',
  slug: 'elf',
  subraces: [
    { id: 3, name: 'High Elf', slug: 'high-elf' },
    { id: 4, name: 'Wood Elf', slug: 'wood-elf' }
  ]
} as Race

describe('RacePickerCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the race name', async () => {
    const wrapper = await mountSuspended(RacePickerCard, {
      props: { race: mockRace, selected: false }
    })
    expect(wrapper.text()).toContain('Dwarf')
  })

  it('shows selected styling when selected', async () => {
    const wrapper = await mountSuspended(RacePickerCard, {
      props: { race: mockRace, selected: true }
    })
    expect(wrapper.find('[data-testid="picker-card"]').classes()).toContain('ring-2')
  })

  it('does not show selected styling when not selected', async () => {
    const wrapper = await mountSuspended(RacePickerCard, {
      props: { race: mockRace, selected: false }
    })
    expect(wrapper.find('[data-testid="picker-card"]').classes()).not.toContain('ring-2')
  })

  it('emits select event when card is clicked', async () => {
    const wrapper = await mountSuspended(RacePickerCard, {
      props: { race: mockRace, selected: false }
    })
    await wrapper.find('[data-testid="picker-card"]').trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')![0]).toEqual([mockRace])
  })

  it('shows View Details button', async () => {
    const wrapper = await mountSuspended(RacePickerCard, {
      props: { race: mockRace, selected: false }
    })
    expect(wrapper.text()).toContain('View Details')
  })

  it('emits view-details event when View Details button is clicked', async () => {
    const wrapper = await mountSuspended(RacePickerCard, {
      props: { race: mockRace, selected: false }
    })
    await wrapper.find('[data-testid="view-details-btn"]').trigger('click')
    expect(wrapper.emitted('view-details')).toBeTruthy()
    expect(wrapper.emitted('select')).toBeFalsy() // Should not also emit select
  })

  it('shows subrace count badge when race has subraces', async () => {
    const wrapper = await mountSuspended(RacePickerCard, {
      props: { race: mockRaceWithSubraces, selected: false }
    })
    expect(wrapper.text()).toContain('2 Subraces')
  })
})
