import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { Race } from '~/types'
import RaceCard from '~/components/race/RaceCard.vue'

describe('RaceCard', () => {
  const mockRace: Race = {
    id: 1,
    name: 'Elf',
    slug: 'elf',
    size: {
      id: 3,
      name: 'Medium',
      code: 'M'
    },
    speed: 30,
    parent_race_id: null,
    parent_race: null,
    subraces: [
      { id: 2, slug: 'high-elf', name: 'High Elf' },
      { id: 3, slug: 'wood-elf', name: 'Wood Elf' }
    ],
    modifiers: [
      {
        modifier_category: 'ability_score',
        ability_score: { id: 2, code: 'DEX', name: 'Dexterity' },
        value: 2
      }
    ],
    traits: [
      { id: 1, name: 'Darkvision' },
      { id: 2, name: 'Keen Senses' },
      { id: 3, name: 'Fey Ancestry' }
    ],
    description: 'Elves are a magical people of otherworldly grace, living in the world but not entirely part of it.',
    sources: [
      { code: 'PHB', name: 'Player\'s Handbook', pages: '21' }
    ]
  }

  // Race-specific tests (domain logic)
  it('renders race name', async () => {
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: mockRace }
    })

    expect(wrapper.text()).toContain('Elf')
  })

  it('renders size when provided', async () => {
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: mockRace }
    })

    expect(wrapper.text()).toContain('Medium')
  })

  it('handles missing size gracefully', async () => {
    const raceWithoutSize = { ...mockRace, size: undefined }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: raceWithoutSize }
    })

    expect(wrapper.text()).toContain('Elf')
    expect(wrapper.text()).not.toContain('Medium')
  })

  it('renders speed', async () => {
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: mockRace }
    })

    expect(wrapper.text()).toContain('30 ft')
  })

  it('shows race badge when parent_race is explicitly null', async () => {
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: mockRace }
    })

    expect(wrapper.text()).toContain('Race')
  })

  it('shows subrace badge when parent_race exists', async () => {
    const subrace = {
      ...mockRace,
      parent_race_id: 1,
      parent_race: {
        id: 1,
        slug: 'elf',
        name: 'Elf',
        speed: 30
      },
      subraces: undefined
    }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: subrace }
    })

    expect(wrapper.text()).toContain('Subrace')
  })

  it('displays parent race name when parent_race exists', async () => {
    const subrace = {
      ...mockRace,
      name: 'Hill Dwarf',
      slug: 'dwarf-hill',
      description: 'As a hill dwarf, you have keen senses, deep intuition, and remarkable resilience.',
      parent_race_id: 37,
      parent_race: {
        id: 37,
        slug: 'dwarf',
        name: 'Dwarf',
        speed: 25
      },
      subraces: undefined
    }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: subrace }
    })

    // Should show parent race name label
    expect(wrapper.text()).toMatch(/Parent Race|Base Race|Subrace of/i)
    // Should show parent race name "Dwarf"
    expect(wrapper.html()).toContain('Dwarf')
    // Should also show subrace name
    expect(wrapper.text()).toContain('Hill Dwarf')
  })

  it('does not show parent race name when parent_race is null', async () => {
    const baseRace = {
      ...mockRace,
      parent_race: null
    }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: baseRace }
    })

    // Should only show race name, not any parent indicator
    expect(wrapper.text()).toContain('Elf')
    // Should not have duplicate "Elf" text from parent display
    const matches = wrapper.text().match(/Elf/g)
    expect(matches?.length).toBeLessThanOrEqual(2) // Name + possibly in description
  })

  it('does not show parent race name when parent_race is undefined (list view)', async () => {
    const listRace = {
      ...mockRace,
      parent_race: undefined
    }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: listRace }
    })

    // Should only show race name
    expect(wrapper.text()).toContain('Elf')
  })

  it('hides race/subrace type badge when parent_race is undefined (list view)', async () => {
    const listRace = {
      ...mockRace,
      parent_race: undefined,
      subraces: [] // Use empty array to avoid "Subraces" count badge
    }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: listRace }
    })

    // When parent_race is undefined, neither "Race" nor "Subrace" type badge should show
    // But we may still see "Subraces" from the count badge, so we need more specific checks
    const html = wrapper.html()
    // Look for the specific badge elements with "Race" or "Subrace" (not "Subraces")
    expect(html.includes('>Race<')).toBe(false)
    expect(html.includes('>Subrace<')).toBe(false)
  })

  it('displays ability modifiers summary', async () => {
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: mockRace }
    })

    expect(wrapper.text()).toContain('DEX +2')
  })

  it('handles multiple ability modifiers', async () => {
    const multiModRace = {
      ...mockRace,
      modifiers: [
        {
          modifier_category: 'ability_score',
          ability_score: { id: 2, code: 'DEX', name: 'Dexterity' },
          value: 2
        },
        {
          modifier_category: 'ability_score',
          ability_score: { id: 3, code: 'CON', name: 'Constitution' },
          value: 1
        }
      ]
    }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: multiModRace }
    })

    const text = wrapper.text()
    expect(text).toContain('DEX +2')
    expect(text).toContain('CON +1')
  })

  it('limits ability modifiers display to 3', async () => {
    const manyModsRace = {
      ...mockRace,
      modifiers: [
        { modifier_category: 'ability_score', ability_score: { id: 1, code: 'STR', name: 'Strength' }, value: 1 },
        { modifier_category: 'ability_score', ability_score: { id: 2, code: 'DEX', name: 'Dexterity' }, value: 1 },
        { modifier_category: 'ability_score', ability_score: { id: 3, code: 'CON', name: 'Constitution' }, value: 1 },
        { modifier_category: 'ability_score', ability_score: { id: 4, code: 'INT', name: 'Intelligence' }, value: 1 }
      ]
    }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: manyModsRace }
    })

    const text = wrapper.text()
    // Should show first 3 modifiers
    expect(text).toContain('STR +1')
    expect(text).toContain('DEX +1')
    expect(text).toContain('CON +1')
    // Should not show the 4th modifier
    expect(text).not.toContain('INT +1')
  })

  it('shows "+1 more" suffix when more than 3 ability modifiers exist', async () => {
    const fourModsRace = {
      ...mockRace,
      modifiers: [
        { modifier_category: 'ability_score', ability_score: { id: 1, code: 'STR', name: 'Strength' }, value: 2 },
        { modifier_category: 'ability_score', ability_score: { id: 2, code: 'DEX', name: 'Dexterity' }, value: 1 },
        { modifier_category: 'ability_score', ability_score: { id: 3, code: 'CON', name: 'Constitution' }, value: 1 },
        { modifier_category: 'ability_score', ability_score: { id: 4, code: 'INT', name: 'Intelligence' }, value: 1 }
      ]
    }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: fourModsRace }
    })

    const text = wrapper.text()
    expect(text).toContain('STR +2')
    expect(text).toContain('DEX +1')
    expect(text).toContain('CON +1')
    expect(text).toContain('+1 more')
  })

  it('shows "+2 more" suffix when 5 ability modifiers exist', async () => {
    const fiveModsRace = {
      ...mockRace,
      modifiers: [
        { modifier_category: 'ability_score', ability_score: { id: 1, code: 'STR', name: 'Strength' }, value: 1 },
        { modifier_category: 'ability_score', ability_score: { id: 2, code: 'DEX', name: 'Dexterity' }, value: 1 },
        { modifier_category: 'ability_score', ability_score: { id: 3, code: 'CON', name: 'Constitution' }, value: 1 },
        { modifier_category: 'ability_score', ability_score: { id: 4, code: 'INT', name: 'Intelligence' }, value: 1 },
        { modifier_category: 'ability_score', ability_score: { id: 5, code: 'WIS', name: 'Wisdom' }, value: 1 }
      ]
    }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: fiveModsRace }
    })

    const text = wrapper.text()
    expect(text).toContain('+2 more')
  })

  it('shows all ability modifiers when exactly 3 exist', async () => {
    const threeModsRace = {
      ...mockRace,
      modifiers: [
        { modifier_category: 'ability_score', ability_score: { id: 1, code: 'STR', name: 'Strength' }, value: 2 },
        { modifier_category: 'ability_score', ability_score: { id: 2, code: 'DEX', name: 'Dexterity' }, value: 1 },
        { modifier_category: 'ability_score', ability_score: { id: 3, code: 'CON', name: 'Constitution' }, value: 1 }
      ]
    }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: threeModsRace }
    })

    const text = wrapper.text()
    expect(text).toContain('STR +2')
    expect(text).toContain('DEX +1')
    expect(text).toContain('CON +1')
    expect(text).not.toContain('more')
  })

  it('shows single ability modifier without "more" suffix', async () => {
    const oneModRace = {
      ...mockRace,
      modifiers: [
        { modifier_category: 'ability_score', ability_score: { id: 1, code: 'STR', name: 'Strength' }, value: 2 }
      ]
    }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: oneModRace }
    })

    const text = wrapper.text()
    expect(text).toContain('STR +2')
    expect(text).not.toContain('more')
  })

  it('filters out non-ability-score modifiers', async () => {
    const mixedModsRace = {
      ...mockRace,
      modifiers: [
        { modifier_category: 'ability_score', ability_score: { id: 2, code: 'DEX', name: 'Dexterity' }, value: 2 },
        { modifier_category: 'speed', value: 5 }
      ]
    }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: mixedModsRace }
    })

    expect(wrapper.text()).toContain('DEX +2')
  })

  it('hides ability modifiers when none present', async () => {
    const noModsRace = { ...mockRace, modifiers: [] }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: noModsRace }
    })

    const text = wrapper.text()
    expect(text).not.toContain('+')
  })

  it('shows traits count badge when traits exist', async () => {
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: mockRace }
    })

    expect(wrapper.text()).toContain('3 Traits')
  })

  it('uses singular form for single trait', async () => {
    const oneTraitRace = {
      ...mockRace,
      traits: [{ id: 1, name: 'Darkvision' }]
    }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: oneTraitRace }
    })

    expect(wrapper.text()).toContain('1 Trait')
  })

  it('hides traits badge when no traits', async () => {
    const noTraitsRace = { ...mockRace, traits: [] }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: noTraitsRace }
    })

    expect(wrapper.text()).not.toContain('Trait')
  })

  it('shows subraces count badge when subraces exist', async () => {
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: mockRace }
    })

    expect(wrapper.text()).toContain('2 Subraces')
  })

  it('uses singular form for single subrace', async () => {
    const oneSubraceRace = {
      ...mockRace,
      subraces: [{ id: 2, slug: 'high-elf', name: 'High Elf' }]
    }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: oneSubraceRace }
    })

    expect(wrapper.text()).toContain('1 Subrace')
  })

  it('hides subraces badge when no subraces', async () => {
    const noSubracesRace = { ...mockRace, subraces: [] }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: noSubracesRace }
    })

    expect(wrapper.text()).not.toContain('Subrace')
  })

  it('renders description when provided', async () => {
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: mockRace }
    })

    expect(wrapper.text()).toContain('Elves are a magical people')
  })

  it('shows default description when not provided', async () => {
    const raceWithoutDescription = { ...mockRace, description: undefined }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: raceWithoutDescription }
    })

    expect(wrapper.text()).toContain('A playable race for D&D 5e characters')
  })

  it('displays all key information in organized layout', async () => {
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: mockRace }
    })

    const text = wrapper.text()
    expect(text).toContain('Elf')
    expect(text).toContain('Medium')
    expect(text).toContain('30 ft')
    expect(text).toContain('DEX +2')
    expect(text).toContain('3 Traits')
    expect(text).toContain('2 Subraces')
  })

  it.each([
    [{ code: 'S', name: 'Small' }],
    [{ code: 'M', name: 'Medium' }],
    [{ code: 'L', name: 'Large' }]
  ])('handles different size codes: %s', async (size) => {
    const sizedRace = { ...mockRace, size: { id: 1, ...size } }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: sizedRace }
    })

    expect(wrapper.text()).toContain(size.name)
  })

  it('handles races with all optional fields', async () => {
    const fullRace = {
      ...mockRace,
      size: { id: 1, code: 'M', name: 'Medium' },
      parent_race: null,
      modifiers: [{ modifier_type: 'ability_score', ability_score: { id: 1, code: 'STR', name: 'Strength' }, value: 2 }],
      traits: [{ id: 1, name: 'Darkvision' }],
      subraces: [{ id: 2, slug: 'high-elf', name: 'High Elf' }],
      description: 'Full race description',
      sources: [{ code: 'PHB', name: 'Player\'s Handbook', pages: '21' }]
    }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: fullRace }
    })

    expect(wrapper.html()).toBeTruthy()
  })

  it('handles races with minimal fields', async () => {
    const minimalRace = {
      id: 1,
      name: 'Human',
      slug: 'human',
      speed: 30
    }
    const wrapper = await mountSuspended(RaceCard, {
      props: { race: minimalRace }
    })

    expect(wrapper.text()).toContain('Human')
    expect(wrapper.text()).toContain('30 ft')
  })
})
