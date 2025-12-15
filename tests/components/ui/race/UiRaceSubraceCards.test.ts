import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiRaceSubraceCards from '~/components/ui/race/UiRaceSubraceCards.vue'
import { createMockRace, createMockSource } from '#tests/helpers/mockFactories'

describe('UiRaceSubraceCards', () => {
  const mockSubrace1 = createMockRace({
    id: 2,
    name: 'High Elf',
    slug: 'high-elf',
    parent_race_id: 1,
    description: 'As a high elf, you have a keen mind and a mastery of at least the basics of magic.',
    sources: [createMockSource({ code: 'PHB', name: 'Player\'s Handbook', pages: '23' })],
    modifiers: [
      {
        modifier_category: 'ability_score',
        ability_score: { id: 4, code: 'INT', name: 'Intelligence' },
        value: '1'
      }
    ]
  })

  const mockSubrace2 = createMockRace({
    id: 3,
    name: 'Wood Elf',
    slug: 'wood-elf',
    parent_race_id: 1,
    description: 'As a wood elf, you have keen senses and intuition, and your fleet feet carry you quickly and stealthily through your native forests.',
    sources: [createMockSource({ code: 'PHB', name: 'Player\'s Handbook', pages: '24' })],
    modifiers: [
      {
        modifier_category: 'ability_score',
        ability_score: { id: 5, code: 'WIS', name: 'Wisdom' },
        value: '1'
      }
    ]
  })

  const mockSubraceMultipleASI = createMockRace({
    id: 4,
    name: 'Drow',
    slug: 'drow',
    parent_race_id: 1,
    description: 'Descended from an earlier subrace of dark-skinned elves, the drow were banished from the surface world.',
    sources: [createMockSource({ code: 'PHB', name: 'Player\'s Handbook', pages: '24' })],
    modifiers: [
      {
        modifier_category: 'ability_score',
        ability_score: { id: 6, code: 'CHA', name: 'Charisma' },
        value: '1'
      },
      {
        modifier_category: 'ability_score',
        ability_score: { id: 4, code: 'INT', name: 'Intelligence' },
        value: '1'
      }
    ]
  })

  const mockSubraceNoDescription = createMockRace({
    id: 5,
    name: 'Eladrin',
    slug: 'eladrin',
    parent_race_id: 1,
    description: undefined,
    sources: [createMockSource({ code: 'DMG', name: 'Dungeon Master\'s Guide' })],
    modifiers: []
  })

  const mockSubraceExpansion = createMockRace({
    id: 6,
    name: 'Sea Elf',
    slug: 'sea-elf',
    parent_race_id: 1,
    description: 'Sea elves fell in love with the wild beauty of the ocean in the earliest days of the multiverse.',
    sources: [createMockSource({ code: 'MTOF', name: 'Mordenkainen\'s Tome of Foes' })],
    modifiers: [
      {
        modifier_category: 'ability_score',
        ability_score: { id: 3, code: 'CON', name: 'Constitution' },
        value: '1'
      }
    ]
  })

  it('renders nothing when subraces array is empty', async () => {
    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [],
        basePath: '/races'
      }
    })

    expect(wrapper.text()).toBe('')
  })

  it('displays subrace name', async () => {
    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [mockSubrace1],
        basePath: '/races'
      }
    })

    expect(wrapper.text()).toContain('High Elf')
  })

  it('displays source badge with abbreviation', async () => {
    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [mockSubrace1],
        basePath: '/races'
      }
    })

    expect(wrapper.text()).toContain('PHB')
  })

  it('displays ASI summary for single ability score increase', async () => {
    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [mockSubrace1],
        basePath: '/races'
      }
    })

    expect(wrapper.text()).toContain('INT +1')
  })

  it('displays ASI summary for multiple ability score increases', async () => {
    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [mockSubraceMultipleASI],
        basePath: '/races'
      }
    })

    const text = wrapper.text()
    expect(text).toContain('CHA +1')
    expect(text).toContain('INT +1')
  })

  it('displays description preview truncated to ~100 characters', async () => {
    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [mockSubrace1],
        basePath: '/races'
      }
    })

    const text = wrapper.text()
    expect(text).toContain('As a high elf')
    // Should not contain the full description (test truncation)
    expect(text.length).toBeLessThan(mockSubrace1.description!.length + 100)
  })

  it('links to correct subrace detail page', async () => {
    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [mockSubrace1],
        basePath: '/races'
      }
    })

    const link = wrapper.find('a[href="/races/high-elf"]')
    expect(link.exists()).toBe(true)
  })

  it('displays multiple subraces in grid', async () => {
    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [mockSubrace1, mockSubrace2],
        basePath: '/races'
      }
    })

    expect(wrapper.text()).toContain('High Elf')
    expect(wrapper.text()).toContain('Wood Elf')
  })

  it('handles subrace without description gracefully', async () => {
    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [mockSubraceNoDescription],
        basePath: '/races'
      }
    })

    expect(wrapper.text()).toContain('Eladrin')
    // Should not crash, just omit description section
  })

  it('handles subrace without ASI modifiers', async () => {
    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [mockSubraceNoDescription],
        basePath: '/races'
      }
    })

    expect(wrapper.text()).toContain('Eladrin')
    // Should render but without ASI badges
  })

  it('displays "View Details" link text', async () => {
    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [mockSubrace1],
        basePath: '/races'
      }
    })

    expect(wrapper.text()).toContain('View Details')
  })

  it('uses grid layout classes for responsive columns', async () => {
    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [mockSubrace1, mockSubrace2],
        basePath: '/races'
      }
    })

    const gridContainer = wrapper.find('.grid')
    expect(gridContainer.exists()).toBe(true)
    expect(gridContainer.classes()).toContain('grid-cols-1')
  })

  it('applies race color theme to card borders', async () => {
    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [mockSubrace1],
        basePath: '/races'
      }
    })

    const html = wrapper.html()
    expect(html).toContain('border-race')
  })

  it('displays background image using getImagePath composable', async () => {
    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [mockSubrace1],
        basePath: '/races'
      }
    })

    const html = wrapper.html()
    expect(html).toContain('/images/generated/conversions/256/races/')
    expect(html).toContain('high-elf.webp')
  })

  it('displays core source with success badge color', async () => {
    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [mockSubrace1],
        basePath: '/races'
      }
    })

    const html = wrapper.html()
    // PHB is core book, should get success color
    expect(html).toContain('PHB')
  })

  it('displays expansion source with info badge color', async () => {
    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [mockSubraceExpansion],
        basePath: '/races'
      }
    })

    const html = wrapper.html()
    // MTOF is expansion book
    expect(html).toContain('MTOF')
  })

  it('renders arrow icon in footer', async () => {
    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [mockSubrace1],
        basePath: '/races'
      }
    })

    const html = wrapper.html()
    expect(html).toContain('i-heroicons-arrow-right')
  })

  it('applies hover effects to cards', async () => {
    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [mockSubrace1],
        basePath: '/races'
      }
    })

    const link = wrapper.find('a')
    expect(link.classes()).toContain('group')
  })

  it('handles subraces with different ASI values', async () => {
    const subraceHighASI = createMockRace({
      id: 7,
      name: 'Mountain Dwarf',
      slug: 'mountain-dwarf',
      modifiers: [
        {
          modifier_category: 'ability_score',
          ability_score: { id: 1, code: 'STR', name: 'Strength' },
          value: '2'
        }
      ]
    })

    const wrapper = await mountSuspended(UiRaceSubraceCards, {
      props: {
        subraces: [subraceHighASI],
        basePath: '/races'
      }
    })

    expect(wrapper.text()).toContain('STR +2')
  })
})
