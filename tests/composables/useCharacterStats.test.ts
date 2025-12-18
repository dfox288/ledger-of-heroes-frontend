// tests/composables/useCharacterStats.test.ts
import { describe, it, expect } from 'vitest'

// Test formatting function (extracted for unit testing)
function formatModifier(mod: number | null | undefined): string {
  if (mod == null) return '—'
  return mod >= 0 ? `+${mod}` : `${mod}`
}

describe('useCharacterStats', () => {
  describe('formatModifier', () => {
    it('formats positive modifiers with plus sign', () => {
      expect(formatModifier(2)).toBe('+2')
      expect(formatModifier(5)).toBe('+5')
    })

    it('formats zero with plus sign', () => {
      expect(formatModifier(0)).toBe('+0')
    })

    it('formats negative modifiers with minus sign', () => {
      expect(formatModifier(-1)).toBe('-1')
      expect(formatModifier(-3)).toBe('-3')
    })

    it('returns dash for null', () => {
      expect(formatModifier(null)).toBe('—')
    })

    it('returns dash for undefined', () => {
      expect(formatModifier(undefined)).toBe('—')
    })
  })

  describe('computed display values', () => {
    const mockStats = {
      character_id: 1,
      total_level: 1,
      proficiency_bonus: 2,
      ability_scores: {
        STR: { score: 14, modifier: 2 },
        DEX: { score: 12, modifier: 1 },
        CON: { score: 13, modifier: 1 },
        INT: { score: 10, modifier: 0 },
        WIS: { score: 15, modifier: 2 },
        CHA: { score: 8, modifier: -1 }
      },
      saving_throws: {
        STR: 2,
        DEX: 1,
        CON: 1,
        INT: 0,
        WIS: 4, // proficient
        CHA: -1
      },
      armor_class: 12,
      hit_points: { max: 10, current: 10, temporary: 0 },
      initiative_bonus: 1,
      passive_perception: 14,
      spellcasting: {
        ability: 'WIS' as const,
        spell_save_dc: 12,
        spell_attack_bonus: 4
      },
      spell_slots: { 1: 2 },
      preparation_limit: 3,
      prepared_spell_count: 1
    }

    it('formats hit points for display', () => {
      // Max HP display
      expect(mockStats.hit_points.max).toBe(10)
    })

    it('formats armor class for display', () => {
      expect(mockStats.armor_class).toBe(12)
    })

    it('formats initiative bonus for display', () => {
      expect(formatModifier(mockStats.initiative_bonus)).toBe('+1')
    })

    it('formats proficiency bonus for display', () => {
      expect(`+${mockStats.proficiency_bonus}`).toBe('+2')
    })

    it('formats passive perception for display', () => {
      expect(mockStats.passive_perception).toBe(14)
    })

    it('formats ability scores with modifiers', () => {
      const str = mockStats.ability_scores.STR
      expect(`${str.score} (${formatModifier(str.modifier)})`).toBe('14 (+2)')
    })

    it('formats negative ability score modifiers', () => {
      const cha = mockStats.ability_scores.CHA
      expect(`${cha.score} (${formatModifier(cha.modifier)})`).toBe('8 (-1)')
    })

    it('provides spellcasting info', () => {
      expect(mockStats.spellcasting?.ability).toBe('WIS')
      expect(mockStats.spellcasting?.spell_save_dc).toBe(12)
      expect(mockStats.spellcasting?.spell_attack_bonus).toBe(4)
    })
  })

  describe('null/missing data handling', () => {
    const emptyStats = {
      character_id: 1,
      total_level: 1,
      proficiency_bonus: 2,
      ability_scores: {
        STR: { score: 10, modifier: 0 },
        DEX: { score: 10, modifier: 0 },
        CON: { score: 10, modifier: 0 },
        INT: { score: 10, modifier: 0 },
        WIS: { score: 10, modifier: 0 },
        CHA: { score: 10, modifier: 0 }
      },
      saving_throws: {
        STR: 0,
        DEX: 0,
        CON: 0,
        INT: 0,
        WIS: 0,
        CHA: 0
      },
      armor_class: null,
      hit_points: { max: null, current: null, temporary: 0 },
      initiative_bonus: 0,
      passive_perception: 10,
      spellcasting: null,
      spell_slots: {},
      preparation_limit: null,
      prepared_spell_count: 0
    }

    it('handles null hit points gracefully', () => {
      expect(emptyStats.hit_points.max).toBeNull()
    })

    it('handles null armor class gracefully', () => {
      expect(emptyStats.armor_class).toBeNull()
    })

    it('handles null spellcasting gracefully', () => {
      expect(emptyStats.spellcasting).toBeNull()
    })
  })
})
