import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModifiersDisplay from '~/components/ui/ModifiersDisplay.vue'

describe('ModifiersDisplay', () => {
  const abilityScoreModifiers = [
    {
      id: 1,
      modifier_category: 'ability_score',
      ability_score: {
        id: 1,
        code: 'STR',
        name: 'Strength'
      },
      value: '2',
      condition: null,
      is_choice: false,
      choice_count: null,
      choice_constraint: null
    },
    {
      id: 2,
      modifier_category: 'ability_score',
      ability_score: {
        id: 6,
        code: 'CHA',
        name: 'Charisma'
      },
      value: '1',
      condition: null,
      is_choice: false,
      choice_count: null,
      choice_constraint: null
    }
  ]

  const genericModifiers = [
    {
      id: 3,
      modifier_category: 'speed',
      ability_score: null,
      value: '10',
      condition: 'while not wearing armor',
      is_choice: false,
      choice_count: null,
      choice_constraint: null
    }
  ]

  // Choice data now passed via separate 'choices' prop using EntityChoice structure
  const abilityScoreChoice = {
    id: 4,
    choice_type: 'ability_score',
    quantity: 2,
    constraint: 'different',
    description: null,
    options: []
  }

  it('renders nothing when modifiers is empty array', () => {
    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: [] }
    })

    const container = wrapper.find('[data-testid="modifiers-container"]')
    expect(container.exists()).toBe(false)
  })

  it('renders nothing when modifiers is undefined', () => {
    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: undefined }
    })

    const container = wrapper.find('[data-testid="modifiers-container"]')
    expect(container.exists()).toBe(false)
  })

  it('displays ability score modifiers with name and code', () => {
    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: abilityScoreModifiers }
    })

    expect(wrapper.text()).toContain('Strength (STR): +2')
    expect(wrapper.text()).toContain('Charisma (CHA): +1')
  })

  it('formats positive values with plus sign', () => {
    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: abilityScoreModifiers }
    })

    expect(wrapper.text()).toContain('+2')
    expect(wrapper.text()).toContain('+1')
  })

  it('displays negative values correctly', () => {
    const negativeModifier = [{
      id: 4,
      modifier_category: 'ability_score',
      ability_score: {
        id: 2,
        code: 'DEX',
        name: 'Dexterity'
      },
      value: '-2',
      condition: null,
      is_choice: false,
      choice_count: null,
      choice_constraint: null
    }]

    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: negativeModifier }
    })

    expect(wrapper.text()).toContain('Dexterity (DEX): -2')
  })

  it('displays generic modifiers with category name', () => {
    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: genericModifiers }
    })

    expect(wrapper.text()).toContain('speed: +10')
  })

  it('displays condition text when present', () => {
    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: genericModifiers }
    })

    expect(wrapper.text()).toContain('while not wearing armor')
  })

  it('renders multiple modifiers correctly', () => {
    const mixed = [...abilityScoreModifiers, ...genericModifiers]
    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: mixed }
    })

    const items = wrapper.findAll('[data-testid="modifier-item"]')
    expect(items.length).toBe(3)
  })

  it('handles modifiers without condition', () => {
    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: abilityScoreModifiers }
    })

    // Should not show condition text for modifiers without conditions
    expect(wrapper.text()).not.toContain('while not wearing armor')
  })

  it('handles mixed ability score and generic modifiers', () => {
    const mixed = [
      {
        id: 1,
        modifier_category: 'ability_score',
        ability_score: {
          id: 1,
          code: 'STR',
          name: 'Strength'
        },
        value: '2',
        condition: null,
        is_choice: false,
        choice_count: null,
        choice_constraint: null
      },
      {
        id: 2,
        modifier_category: 'movement',
        ability_score: null,
        value: '5',
        condition: 'in difficult terrain',
        is_choice: false,
        choice_count: null,
        choice_constraint: null
      }
    ]

    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: mixed }
    })

    expect(wrapper.text()).toContain('Strength (STR): +2')
    expect(wrapper.text()).toContain('movement: +5')
    expect(wrapper.text()).toContain('in difficult terrain')
  })

  // TESTS FOR CHOICE MODIFIERS (using new 'choices' prop)
  it('displays CHOICE badge when choices are provided', () => {
    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: [], choices: [abilityScoreChoice] }
    })

    expect(wrapper.text()).toContain('CHOICE')
  })

  it('displays choice description with count and constraint', () => {
    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: [], choices: [abilityScoreChoice] }
    })

    expect(wrapper.text()).toContain('Choose 2 different ability scores')
  })

  it('handles choice with singular count', () => {
    const singleChoice = {
      id: 5,
      choice_type: 'ability_score',
      quantity: 1,
      constraint: null,
      description: null,
      options: []
    }

    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: [], choices: [singleChoice] }
    })

    expect(wrapper.text()).toContain('Choose 1 ability score')
  })

  it('does not show CHOICE badge when only fixed modifiers provided', () => {
    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: abilityScoreModifiers }
    })

    expect(wrapper.text()).not.toContain('CHOICE')
  })

  it('handles mixed fixed modifiers and choices', () => {
    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: abilityScoreModifiers, choices: [abilityScoreChoice] }
    })

    // Fixed modifiers display normally
    expect(wrapper.text()).toContain('Strength (STR): +2')
    // Choices show badge and description
    expect(wrapper.text()).toContain('CHOICE')
    expect(wrapper.text()).toContain('Choose 2 different ability scores')
  })

  // NEW TESTS FOR ADVANTAGE/DISADVANTAGE (non-numeric values)
  it('displays disadvantage modifier correctly', () => {
    const disadvantageModifier = [{
      id: 498,
      modifier_category: 'skill',
      ability_score: {
        id: 2,
        code: 'DEX',
        name: 'Dexterity'
      },
      skill: {
        id: 17,
        name: 'Stealth'
      },
      value: 'disadvantage',
      condition: null,
      is_choice: false,
      choice_count: null,
      choice_constraint: null
    }]

    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: disadvantageModifier }
    })

    expect(wrapper.text()).toContain('Stealth')
    expect(wrapper.text()).toContain('DEX')
    expect(wrapper.text()).toContain('disadvantage')
  })

  it('displays advantage modifier correctly', () => {
    const advantageModifier = [{
      id: 500,
      modifier_category: 'skill',
      ability_score: {
        id: 3,
        code: 'WIS',
        name: 'Wisdom'
      },
      skill: {
        id: 10,
        name: 'Perception'
      },
      value: 'advantage',
      condition: null,
      is_choice: false,
      choice_count: null,
      choice_constraint: null
    }]

    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: advantageModifier }
    })

    expect(wrapper.text()).toContain('Perception')
    expect(wrapper.text()).toContain('WIS')
    expect(wrapper.text()).toContain('advantage')
  })

  it('does not add +/- signs to advantage/disadvantage values', () => {
    const modifier = [{
      id: 498,
      modifier_category: 'skill',
      ability_score: {
        id: 2,
        code: 'DEX',
        name: 'Dexterity'
      },
      skill: {
        id: 17,
        name: 'Stealth'
      },
      value: 'disadvantage',
      condition: null,
      is_choice: false,
      choice_count: null,
      choice_constraint: null
    }]

    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: modifier }
    })

    // Should not have +disadvantage or -disadvantage
    expect(wrapper.text()).not.toContain('+disadvantage')
    expect(wrapper.text()).not.toContain('-disadvantage')
    expect(wrapper.text()).toContain('disadvantage')
  })

  it('handles mixed numeric and non-numeric modifier values', () => {
    const mixed = [
      {
        id: 1,
        modifier_category: 'ability_score',
        ability_score: {
          id: 1,
          code: 'STR',
          name: 'Strength'
        },
        value: '2',
        condition: null,
        is_choice: false,
        choice_count: null,
        choice_constraint: null
      },
      {
        id: 2,
        modifier_category: 'skill',
        ability_score: {
          id: 2,
          code: 'DEX',
          name: 'Dexterity'
        },
        skill: {
          id: 17,
          name: 'Stealth'
        },
        value: 'disadvantage',
        condition: null,
        is_choice: false,
        choice_count: null,
        choice_constraint: null
      }
    ]

    const wrapper = mount(ModifiersDisplay, {
      props: { modifiers: mixed }
    })

    // Numeric modifier formatted with +
    expect(wrapper.text()).toContain('Strength (STR): +2')
    // Non-numeric modifier displayed as-is
    expect(wrapper.text()).toContain('Stealth')
    expect(wrapper.text()).toContain('disadvantage')
  })
})
