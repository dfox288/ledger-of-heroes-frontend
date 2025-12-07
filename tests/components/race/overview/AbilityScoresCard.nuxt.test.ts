import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import RaceOverviewAbilityScoresCard from '~/components/race/overview/AbilityScoresCard.vue'
import type { Modifier } from '~/types'

describe('RaceOverviewAbilityScoresCard', () => {
  const createModifier = (abilityCode: string, value: string, isChoice = false, condition: string | null = null): Modifier => ({
    id: Math.random(),
    modifier_category: 'ability_score',
    ability_score: {
      id: Math.random(),
      code: abilityCode,
      name: abilityCode,
      slug: abilityCode.toLowerCase(),
      description: `${abilityCode} ability`
    },
    value,
    is_choice: isChoice,
    condition,
    choice_count: null,
    choice_constraint: null,
    level: null
  })

  it('renders nothing when modifiers array is empty', async () => {
    const wrapper = await mountSuspended(RaceOverviewAbilityScoresCard, {
      props: { modifiers: [] }
    })

    expect(wrapper.text()).toBe('')
  })

  it('displays card header "Ability Score Increases"', async () => {
    const wrapper = await mountSuspended(RaceOverviewAbilityScoresCard, {
      props: {
        modifiers: [createModifier('STR', '2')]
      }
    })

    expect(wrapper.text()).toContain('Ability Score Increases')
  })

  it('displays single ability score modifier', async () => {
    const wrapper = await mountSuspended(RaceOverviewAbilityScoresCard, {
      props: {
        modifiers: [createModifier('STR', '2')]
      }
    })

    const text = wrapper.text()
    expect(text).toContain('STR')
    expect(text).toContain('+2')
  })

  it('displays multiple ability score modifiers', async () => {
    const wrapper = await mountSuspended(RaceOverviewAbilityScoresCard, {
      props: {
        modifiers: [
          createModifier('DEX', '2'),
          createModifier('INT', '1')
        ]
      }
    })

    const text = wrapper.text()
    expect(text).toContain('DEX')
    expect(text).toContain('+2')
    expect(text).toContain('INT')
    expect(text).toContain('+1')
  })

  it('displays "Your choice" for choice-based modifiers', async () => {
    const wrapper = await mountSuspended(RaceOverviewAbilityScoresCard, {
      props: {
        modifiers: [createModifier('STR', '1', true)]
      }
    })

    expect(wrapper.text()).toContain('Your choice')
  })

  it('handles mixed fixed and choice modifiers', async () => {
    const wrapper = await mountSuspended(RaceOverviewAbilityScoresCard, {
      props: {
        modifiers: [
          createModifier('DEX', '2', false),
          createModifier('INT', '1', true)
        ]
      }
    })

    const text = wrapper.text()
    expect(text).toContain('DEX')
    expect(text).toContain('+2')
    expect(text).toContain('Your choice')
    expect(text).toContain('+1')
  })

  it('displays condition when provided', async () => {
    const wrapper = await mountSuspended(RaceOverviewAbilityScoresCard, {
      props: {
        modifiers: [createModifier('STR', '1', false, 'When in sunlight')]
      }
    })

    expect(wrapper.text()).toContain('When in sunlight')
  })

  it('handles all six core abilities', async () => {
    const wrapper = await mountSuspended(RaceOverviewAbilityScoresCard, {
      props: {
        modifiers: [
          createModifier('STR', '1'),
          createModifier('DEX', '1'),
          createModifier('CON', '1'),
          createModifier('INT', '1'),
          createModifier('WIS', '1'),
          createModifier('CHA', '1')
        ]
      }
    })

    const text = wrapper.text()
    expect(text).toContain('STR')
    expect(text).toContain('DEX')
    expect(text).toContain('CON')
    expect(text).toContain('INT')
    expect(text).toContain('WIS')
    expect(text).toContain('CHA')
  })

  it('formats value with plus sign', async () => {
    const wrapper = await mountSuspended(RaceOverviewAbilityScoresCard, {
      props: {
        modifiers: [createModifier('STR', '2')]
      }
    })

    // Value should be displayed as "+2" not just "2"
    expect(wrapper.text()).toContain('+2')
  })

  it('renders ability score boxes with proper structure', async () => {
    const wrapper = await mountSuspended(RaceOverviewAbilityScoresCard, {
      props: {
        modifiers: [
          createModifier('STR', '2'),
          createModifier('DEX', '1')
        ]
      }
    })

    // Should have data-test attributes for each ability box
    const abilityBoxes = wrapper.findAll('[data-testid="ability-box"]')
    expect(abilityBoxes.length).toBe(2)
  })

  it('displays card icon', async () => {
    const wrapper = await mountSuspended(RaceOverviewAbilityScoresCard, {
      props: {
        modifiers: [createModifier('STR', '2')]
      }
    })

    // Should have an icon (arrow-trending-up for ability increases)
    // UIcon renders as a span with specific icon classes
    const html = wrapper.html()
    expect(html).toContain('i-heroicons-arrow-trending-up')
  })

  it('handles modifiers without ability_score gracefully', async () => {
    const invalidModifier: Modifier = {
      id: 1,
      modifier_category: 'ability_score',
      ability_score: undefined,
      value: '2',
      is_choice: false,
      condition: null,
      choice_count: null,
      choice_constraint: null,
      level: null
    }

    const wrapper = await mountSuspended(RaceOverviewAbilityScoresCard, {
      props: {
        modifiers: [invalidModifier]
      }
    })

    // Should render but not crash
    expect(wrapper.exists()).toBe(true)
  })

  it('applies primary color scheme to ability boxes', async () => {
    const wrapper = await mountSuspended(RaceOverviewAbilityScoresCard, {
      props: {
        modifiers: [createModifier('STR', '2')]
      }
    })

    const html = wrapper.html()
    // Should have primary background color classes
    expect(html).toContain('bg-primary')
  })

  it('displays multiple modifiers in flex row layout', async () => {
    const wrapper = await mountSuspended(RaceOverviewAbilityScoresCard, {
      props: {
        modifiers: [
          createModifier('STR', '2'),
          createModifier('DEX', '1'),
          createModifier('CON', '1')
        ]
      }
    })

    const abilityBoxes = wrapper.findAll('[data-testid="ability-box"]')
    expect(abilityBoxes.length).toBe(3)
  })

  it('handles subrace scenario with inherited modifiers', async () => {
    // High Elf scenario: +2 DEX from Elf parent, +1 INT from subrace
    const wrapper = await mountSuspended(RaceOverviewAbilityScoresCard, {
      props: {
        modifiers: [
          createModifier('DEX', '2'), // inherited
          createModifier('INT', '1') // subrace specific
        ]
      }
    })

    const text = wrapper.text()
    expect(text).toContain('DEX')
    expect(text).toContain('+2')
    expect(text).toContain('INT')
    expect(text).toContain('+1')
  })
})
