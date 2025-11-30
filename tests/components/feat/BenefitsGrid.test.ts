import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FeatBenefitsGrid from '~/components/feat/BenefitsGrid.vue'

describe('FeatBenefitsGrid', () => {
  it('renders ability score card when modifiers provided', async () => {
    const wrapper = await mountSuspended(FeatBenefitsGrid, {
      props: {
        abilityModifiers: [{ ability: 'Charisma', code: 'CHA', value: 1 }],
        grantedProficiencies: [],
        advantages: []
      }
    })

    expect(wrapper.text()).toContain('Ability Score')
    expect(wrapper.text()).toContain('+1 Charisma')
    expect(wrapper.text()).toContain('CHA')
  })

  it('hides ability score card when no modifiers', async () => {
    const wrapper = await mountSuspended(FeatBenefitsGrid, {
      props: {
        abilityModifiers: [],
        grantedProficiencies: [],
        advantages: []
      }
    })

    expect(wrapper.text()).not.toContain('Ability Score')
  })

  it('renders proficiency card when proficiencies provided', async () => {
    const wrapper = await mountSuspended(FeatBenefitsGrid, {
      props: {
        abilityModifiers: [],
        grantedProficiencies: [{ name: 'heavy armor', type: 'armor' }],
        advantages: []
      }
    })

    expect(wrapper.text()).toContain('Proficiency')
    expect(wrapper.text()).toContain('heavy armor')
  })

  it('hides proficiency card when no proficiencies', async () => {
    const wrapper = await mountSuspended(FeatBenefitsGrid, {
      props: {
        abilityModifiers: [],
        grantedProficiencies: [],
        advantages: []
      }
    })

    expect(wrapper.text()).not.toContain('Proficiency')
  })

  it('renders advantage card when conditions provided', async () => {
    const wrapper = await mountSuspended(FeatBenefitsGrid, {
      props: {
        abilityModifiers: [],
        grantedProficiencies: [],
        advantages: [{ effectType: 'advantage', description: 'CON saves for concentration' }]
      }
    })

    expect(wrapper.text()).toContain('Special Abilities')
    expect(wrapper.text()).toContain('CON saves for concentration')
  })

  it('hides advantage card when no advantages', async () => {
    const wrapper = await mountSuspended(FeatBenefitsGrid, {
      props: {
        abilityModifiers: [],
        grantedProficiencies: [],
        advantages: []
      }
    })

    expect(wrapper.text()).not.toContain('Special Abilities')
  })

  it('renders multiple ability modifiers', async () => {
    const wrapper = await mountSuspended(FeatBenefitsGrid, {
      props: {
        abilityModifiers: [
          { ability: 'Strength', code: 'STR', value: 1 },
          { ability: 'Dexterity', code: 'DEX', value: 1 }
        ],
        grantedProficiencies: [],
        advantages: []
      }
    })

    expect(wrapper.text()).toContain('+1 Strength')
    expect(wrapper.text()).toContain('+1 Dexterity')
    expect(wrapper.text()).toContain('STR')
    expect(wrapper.text()).toContain('DEX')
  })

  it('renders multiple proficiencies', async () => {
    const wrapper = await mountSuspended(FeatBenefitsGrid, {
      props: {
        abilityModifiers: [],
        grantedProficiencies: [
          { name: 'heavy armor', type: 'armor' },
          { name: 'longsword', type: 'weapon' }
        ],
        advantages: []
      }
    })

    expect(wrapper.text()).toContain('heavy armor')
    expect(wrapper.text()).toContain('longsword')
  })

  it('renders multiple advantages', async () => {
    const wrapper = await mountSuspended(FeatBenefitsGrid, {
      props: {
        abilityModifiers: [],
        grantedProficiencies: [],
        advantages: [
          { effectType: 'advantage', description: 'CON saves for concentration' },
          { effectType: 'special', description: 'Cast spells with hands full' }
        ]
      }
    })

    expect(wrapper.text()).toContain('CON saves for concentration')
    expect(wrapper.text()).toContain('Cast spells with hands full')
  })

  it('renders all three card types together', async () => {
    const wrapper = await mountSuspended(FeatBenefitsGrid, {
      props: {
        abilityModifiers: [{ ability: 'Charisma', code: 'CHA', value: 1 }],
        grantedProficiencies: [{ name: 'heavy armor', type: 'armor' }],
        advantages: [{ effectType: 'advantage', description: 'CON saves' }]
      }
    })

    expect(wrapper.text()).toContain('What You Get')
    expect(wrapper.text()).toContain('Ability Score')
    expect(wrapper.text()).toContain('Proficiency')
    expect(wrapper.text()).toContain('Special Abilities')
  })

  it('uses responsive grid layout', async () => {
    const wrapper = await mountSuspended(FeatBenefitsGrid, {
      props: {
        abilityModifiers: [{ ability: 'Charisma', code: 'CHA', value: 1 }],
        grantedProficiencies: [{ name: 'heavy armor', type: 'armor' }],
        advantages: [{ effectType: 'advantage', description: 'CON saves' }]
      }
    })

    // Check for grid classes
    const grid = wrapper.find('.grid')
    expect(grid.exists()).toBe(true)
    expect(grid.classes()).toContain('grid-cols-1')
    expect(grid.classes()).toContain('md:grid-cols-2')
    expect(grid.classes()).toContain('lg:grid-cols-3')
  })
})
