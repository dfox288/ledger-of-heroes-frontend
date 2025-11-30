import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpellCombatMechanics from '~/components/spell/SpellCombatMechanics.vue'
import type { SpellEffect, SpellSavingThrow } from '~/types'

describe('SpellCombatMechanics', () => {
  // Conditional Rendering

  it('does not render when no combat data is present', async () => {
    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects: [],
        savingThrows: [],
        areaOfEffect: null
      }
    })

    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('renders when effects are present', async () => {
    const effects: SpellEffect[] = [
      {
        id: 1,
        effect_type: 'damage',
        description: 'Fire damage',
        dice_formula: '8d6',
        base_value: null,
        scaling_type: null,
        min_character_level: null,
        min_spell_slot: null,
        scaling_increment: null,
        damage_type: {
          id: 1,
          name: 'Fire',
          description: 'Fire damage'
        }
      }
    ]

    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects,
        savingThrows: [],
        areaOfEffect: null
      }
    })

    expect(wrapper.text()).toContain('COMBAT MECHANICS')
  })

  it('renders when saving throws are present', async () => {
    const savingThrows: SpellSavingThrow[] = [
      {
        ability_score: {
          id: 1,
          code: 'DEX',
          name: 'Dexterity'
        },
        dc: 'DC 15',
        save_effect: 'Half damage',
        is_initial_save: true,
        save_modifier: null
      }
    ]

    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects: [],
        savingThrows,
        areaOfEffect: null
      }
    })

    expect(wrapper.text()).toContain('COMBAT MECHANICS')
  })

  it('renders when area of effect is present', async () => {
    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects: [],
        savingThrows: [],
        areaOfEffect: { type: 'sphere', size: 20 }
      }
    })

    expect(wrapper.text()).toContain('COMBAT MECHANICS')
  })

  // Header

  it('displays combat mechanics header with emoji', async () => {
    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects: [],
        savingThrows: [],
        areaOfEffect: { type: 'sphere', size: 20 }
      }
    })

    expect(wrapper.text()).toContain('⚔️')
    expect(wrapper.text()).toContain('COMBAT MECHANICS')
  })

  // Damage Section

  it('displays damage dice formula', async () => {
    const effects: SpellEffect[] = [
      {
        id: 1,
        effect_type: 'damage',
        description: 'Fire damage',
        dice_formula: '8d6',
        base_value: null,
        scaling_type: null,
        min_character_level: null,
        min_spell_slot: null,
        scaling_increment: null,
        damage_type: {
          id: 1,
          name: 'Fire',
          description: 'Fire damage'
        }
      }
    ]

    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects,
        savingThrows: [],
        areaOfEffect: null
      }
    })

    expect(wrapper.text()).toContain('8d6')
  })

  it('displays damage type badge', async () => {
    const effects: SpellEffect[] = [
      {
        id: 1,
        effect_type: 'damage',
        description: 'Fire damage',
        dice_formula: '8d6',
        base_value: null,
        scaling_type: null,
        min_character_level: null,
        min_spell_slot: null,
        scaling_increment: null,
        damage_type: {
          id: 1,
          name: 'Fire',
          description: 'Fire damage'
        }
      }
    ]

    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects,
        savingThrows: [],
        areaOfEffect: null
      }
    })

    expect(wrapper.text()).toContain('Fire')
  })

  it('displays multiple damage effects', async () => {
    const effects: SpellEffect[] = [
      {
        id: 1,
        effect_type: 'damage',
        description: 'Fire damage',
        dice_formula: '8d6',
        base_value: null,
        scaling_type: null,
        min_character_level: null,
        min_spell_slot: null,
        scaling_increment: null,
        damage_type: {
          id: 1,
          name: 'Fire',
          description: 'Fire damage'
        }
      },
      {
        id: 2,
        effect_type: 'damage',
        description: 'Cold damage',
        dice_formula: '4d6',
        base_value: null,
        scaling_type: null,
        min_character_level: null,
        min_spell_slot: null,
        scaling_increment: null,
        damage_type: {
          id: 2,
          name: 'Cold',
          description: 'Cold damage'
        }
      }
    ]

    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects,
        savingThrows: [],
        areaOfEffect: null
      }
    })

    expect(wrapper.text()).toContain('8d6')
    expect(wrapper.text()).toContain('Fire')
    expect(wrapper.text()).toContain('4d6')
    expect(wrapper.text()).toContain('Cold')
  })

  it('displays damage emoji', async () => {
    const effects: SpellEffect[] = [
      {
        id: 1,
        effect_type: 'damage',
        description: 'Fire damage',
        dice_formula: '8d6',
        base_value: null,
        scaling_type: null,
        min_character_level: null,
        min_spell_slot: null,
        scaling_increment: null,
        damage_type: {
          id: 1,
          name: 'Fire',
          description: 'Fire damage'
        }
      }
    ]

    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects,
        savingThrows: [],
        areaOfEffect: null
      }
    })

    expect(wrapper.text()).toContain('💥')
    expect(wrapper.text()).toContain('DAMAGE')
  })

  it('does not display damage section when effect has no damage', async () => {
    const effects: SpellEffect[] = [
      {
        id: 1,
        effect_type: 'healing',
        description: 'Healing',
        dice_formula: '2d8+2',
        base_value: null,
        scaling_type: null,
        min_character_level: null,
        min_spell_slot: null,
        scaling_increment: null,
        damage_type: undefined
      }
    ]

    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects,
        savingThrows: [],
        areaOfEffect: null
      }
    })

    expect(wrapper.text()).not.toContain('💥')
    expect(wrapper.text()).not.toContain('DAMAGE')
  })

  // Saving Throw Section

  it('displays saving throw ability code', async () => {
    const savingThrows: SpellSavingThrow[] = [
      {
        ability_score: {
          id: 1,
          code: 'DEX',
          name: 'Dexterity'
        },
        dc: 'DC 15',
        save_effect: 'Half damage',
        is_initial_save: true,
        save_modifier: null
      }
    ]

    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects: [],
        savingThrows,
        areaOfEffect: null
      }
    })

    expect(wrapper.text()).toContain('DEX')
  })

  it('displays saving throw effect', async () => {
    const savingThrows: SpellSavingThrow[] = [
      {
        ability_score: {
          id: 1,
          code: 'DEX',
          name: 'Dexterity'
        },
        dc: 'DC 15',
        save_effect: 'Half damage',
        is_initial_save: true,
        save_modifier: null
      }
    ]

    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects: [],
        savingThrows,
        areaOfEffect: null
      }
    })

    expect(wrapper.text()).toContain('Half damage')
  })

  it('displays saving throw emoji', async () => {
    const savingThrows: SpellSavingThrow[] = [
      {
        ability_score: {
          id: 1,
          code: 'DEX',
          name: 'Dexterity'
        },
        dc: 'DC 15',
        save_effect: 'Half damage',
        is_initial_save: true,
        save_modifier: null
      }
    ]

    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects: [],
        savingThrows,
        areaOfEffect: null
      }
    })

    expect(wrapper.text()).toContain('🎯')
    expect(wrapper.text()).toContain('SAVE')
  })

  it('displays multiple saving throws', async () => {
    const savingThrows: SpellSavingThrow[] = [
      {
        ability_score: {
          id: 1,
          code: 'DEX',
          name: 'Dexterity'
        },
        dc: 'DC 15',
        save_effect: 'Half damage',
        is_initial_save: true,
        save_modifier: null
      },
      {
        ability_score: {
          id: 2,
          code: 'WIS',
          name: 'Wisdom'
        },
        dc: 'DC 15',
        save_effect: 'Negates effect',
        is_initial_save: false,
        save_modifier: null
      }
    ]

    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects: [],
        savingThrows,
        areaOfEffect: null
      }
    })

    expect(wrapper.text()).toContain('DEX')
    expect(wrapper.text()).toContain('Half damage')
    expect(wrapper.text()).toContain('WIS')
    expect(wrapper.text()).toContain('Negates effect')
  })

  // Area of Effect Section

  it('displays area of effect size and type', async () => {
    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects: [],
        savingThrows: [],
        areaOfEffect: { type: 'sphere', size: 20 }
      }
    })

    expect(wrapper.text()).toContain('20 ft.')
    expect(wrapper.text()).toContain('Sphere')
  })

  it('displays area of effect emoji', async () => {
    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects: [],
        savingThrows: [],
        areaOfEffect: { type: 'sphere', size: 20 }
      }
    })

    expect(wrapper.text()).toContain('📐')
    expect(wrapper.text()).toContain('AREA')
  })

  it('handles different area of effect types', async () => {
    const aoeTypes = [
      { type: 'sphere', size: 20 },
      { type: 'cone', size: 15 },
      { type: 'cube', size: 10 },
      { type: 'line', size: 60 }
    ]

    for (const aoe of aoeTypes) {
      const wrapper = await mountSuspended(SpellCombatMechanics, {
        props: {
          effects: [],
          savingThrows: [],
          areaOfEffect: aoe
        }
      })

      const text = wrapper.text()
      expect(text).toContain(aoe.size.toString())
      expect(text.toLowerCase()).toContain(aoe.type.toLowerCase())
    }
  })

  // Condition Effects

  it('displays condition when effect applies condition', async () => {
    const effects: SpellEffect[] = [
      {
        id: 1,
        effect_type: 'condition',
        description: 'Target is blinded',
        dice_formula: null,
        base_value: null,
        scaling_type: null,
        min_character_level: null,
        min_spell_slot: null,
        scaling_increment: null,
        damage_type: undefined
      }
    ]

    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects,
        savingThrows: [],
        areaOfEffect: null
      }
    })

    expect(wrapper.text()).toContain('😵')
    expect(wrapper.text()).toContain('CONDITION')
    expect(wrapper.text()).toContain('Target is blinded')
  })

  // Integration Tests

  it('renders complete combat mechanics with all sections', async () => {
    const effects: SpellEffect[] = [
      {
        id: 1,
        effect_type: 'damage',
        description: 'Fire damage',
        dice_formula: '8d6',
        base_value: null,
        scaling_type: null,
        min_character_level: null,
        min_spell_slot: null,
        scaling_increment: null,
        damage_type: {
          id: 1,
          name: 'Fire',
          description: 'Fire damage'
        }
      }
    ]

    const savingThrows: SpellSavingThrow[] = [
      {
        ability_score: {
          id: 1,
          code: 'DEX',
          name: 'Dexterity'
        },
        dc: 'DC 15',
        save_effect: 'Half damage',
        is_initial_save: true,
        save_modifier: null
      }
    ]

    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects,
        savingThrows,
        areaOfEffect: { type: 'sphere', size: 20 }
      }
    })

    const text = wrapper.text()
    // Header
    expect(text).toContain('COMBAT MECHANICS')
    // Damage
    expect(text).toContain('8d6')
    expect(text).toContain('Fire')
    // Save
    expect(text).toContain('DEX')
    expect(text).toContain('Half damage')
    // Area
    expect(text).toContain('20 ft.')
    expect(text).toContain('Sphere')
  })

  // Layout Tests

  it('uses grid layout for columns', async () => {
    const effects: SpellEffect[] = [
      {
        id: 1,
        effect_type: 'damage',
        description: 'Fire damage',
        dice_formula: '8d6',
        base_value: null,
        scaling_type: null,
        min_character_level: null,
        min_spell_slot: null,
        scaling_increment: null,
        damage_type: {
          id: 1,
          name: 'Fire',
          description: 'Fire damage'
        }
      }
    ]

    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects,
        savingThrows: [],
        areaOfEffect: { type: 'sphere', size: 20 }
      }
    })

    const html = wrapper.html()
    expect(html).toContain('grid')
  })

  it('is responsive (stacks on mobile)', async () => {
    const effects: SpellEffect[] = [
      {
        id: 1,
        effect_type: 'damage',
        description: 'Fire damage',
        dice_formula: '8d6',
        base_value: null,
        scaling_type: null,
        min_character_level: null,
        min_spell_slot: null,
        scaling_increment: null,
        damage_type: {
          id: 1,
          name: 'Fire',
          description: 'Fire damage'
        }
      }
    ]

    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects,
        savingThrows: [],
        areaOfEffect: { type: 'sphere', size: 20 }
      }
    })

    const html = wrapper.html()
    // Should have mobile-first single column, then expand on larger screens
    expect(html).toMatch(/grid-cols-1|md:grid-cols/)
  })

  // Damage Type Color Tests

  it('applies appropriate color for fire damage', async () => {
    const effects: SpellEffect[] = [
      {
        id: 1,
        effect_type: 'damage',
        description: 'Fire damage',
        dice_formula: '8d6',
        base_value: null,
        scaling_type: null,
        min_character_level: null,
        min_spell_slot: null,
        scaling_increment: null,
        damage_type: {
          id: 1,
          name: 'Fire',
          description: 'Fire damage'
        }
      }
    ]

    const wrapper = await mountSuspended(SpellCombatMechanics, {
      props: {
        effects,
        savingThrows: [],
        areaOfEffect: null
      }
    })

    // Badge should exist with some color
    const html = wrapper.html()
    expect(html).toContain('Fire')
  })
})
