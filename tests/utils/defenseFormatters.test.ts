import { describe, it, expect } from 'vitest'
import {
  formatDamageDefense,
  formatConditionAdvantage,
  formatConditionDisadvantage,
  formatConditionImmunity
} from '~/utils/defenseFormatters'

describe('formatDamageDefense', () => {
  it('formats basic damage defense with type and source', () => {
    const defense = { type: 'Fire', condition: null, source: 'Red Dragonborn' }
    expect(formatDamageDefense(defense)).toBe('Fire (Red Dragonborn)')
  })

  it('includes condition text when present', () => {
    const defense = {
      type: 'Bludgeoning',
      condition: 'from nonmagical attacks',
      source: 'Barbarian Rage'
    }
    expect(formatDamageDefense(defense)).toBe('Bludgeoning (Barbarian Rage) - from nonmagical attacks')
  })

  it('handles empty condition string as no condition', () => {
    const defense = { type: 'Poison', condition: '', source: 'Dwarf' }
    expect(formatDamageDefense(defense)).toBe('Poison (Dwarf)')
  })
})

describe('formatConditionAdvantage', () => {
  it('formats condition advantage with vs prefix', () => {
    const advantage = { condition: 'Poisoned', effect: 'Advantage on saving throws', source: 'Dwarf' }
    expect(formatConditionAdvantage(advantage)).toBe('vs Poisoned (Dwarf)')
  })

  it('handles various condition names', () => {
    const advantage = { condition: 'Charmed', effect: 'Advantage on saving throws', source: 'Elf' }
    expect(formatConditionAdvantage(advantage)).toBe('vs Charmed (Elf)')
  })
})

describe('formatConditionDisadvantage', () => {
  it('formats condition disadvantage with vs prefix', () => {
    const disadvantage = { condition: 'Stunned', effect: 'Disadvantage on saving throws', source: 'Curse' }
    expect(formatConditionDisadvantage(disadvantage)).toBe('vs Stunned (Curse)')
  })

  it('handles sunlight sensitivity pattern', () => {
    const disadvantage = {
      condition: 'Attack rolls in sunlight',
      effect: 'Disadvantage',
      source: 'Sunlight Sensitivity'
    }
    expect(formatConditionDisadvantage(disadvantage)).toBe('vs Attack rolls in sunlight (Sunlight Sensitivity)')
  })
})

describe('formatConditionImmunity', () => {
  it('formats condition immunity without vs prefix', () => {
    const immunity = { condition: 'Poisoned', effect: 'Immune to condition', source: 'Dwarf' }
    expect(formatConditionImmunity(immunity)).toBe('Poisoned (Dwarf)')
  })

  it('handles sleep immunity pattern', () => {
    const immunity = { condition: 'Sleep', effect: 'Immune to magical sleep', source: 'Elf' }
    expect(formatConditionImmunity(immunity)).toBe('Sleep (Elf)')
  })
})
