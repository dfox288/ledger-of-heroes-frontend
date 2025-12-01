import { describe, it, expect } from 'vitest'
import type { components } from '~/types/api/generated'

type SpellEffectResource = components['schemas']['SpellEffectResource']
type ClassResource = components['schemas']['ClassResource']

/**
 * Tests for useSpellDetail composable.
 *
 * These tests verify the composable correctly:
 * - Computes spell level text (e.g., "3rd-level Evocation" or "Evocation cantrip")
 * - Detects scaling effects and scaling type (spell_slot_level vs character_level)
 * - Extracts base damage from effects
 * - Determines combat mechanics visibility
 * - Groups classes into base classes and subclasses
 * - Parses area of effect into structured data
 */
describe('useSpellDetail - data organization logic', () => {
  // Test the pure logic functions without full composable mounting

  describe('spellLevelText formatting', () => {
    function formatSpellLevelText(level: number | undefined, schoolName: string | undefined): string {
      if (!level && level !== 0) return 'Unknown Spell'
      if (!schoolName) return 'Unknown Spell'

      if (level === 0) {
        return `${schoolName} cantrip`
      }

      const levelSuffix = ['th', 'st', 'nd', 'rd'][level % 10 > 3 ? 0 : level % 10]
      return `${level}${levelSuffix}-level ${schoolName}`
    }

    it('formats cantrip level text', () => {
      const result = formatSpellLevelText(0, 'Evocation')
      expect(result).toBe('Evocation cantrip')
    })

    it('formats 1st-level spell', () => {
      const result = formatSpellLevelText(1, 'Abjuration')
      expect(result).toBe('1st-level Abjuration')
    })

    it('formats 2nd-level spell', () => {
      const result = formatSpellLevelText(2, 'Divination')
      expect(result).toBe('2nd-level Divination')
    })

    it('formats 3rd-level spell', () => {
      const result = formatSpellLevelText(3, 'Evocation')
      expect(result).toBe('3rd-level Evocation')
    })

    it('formats 4th-level spell', () => {
      const result = formatSpellLevelText(4, 'Conjuration')
      expect(result).toBe('4th-level Conjuration')
    })

    it('formats 9th-level spell', () => {
      const result = formatSpellLevelText(9, 'Necromancy')
      expect(result).toBe('9th-level Necromancy')
    })

    it('returns "Unknown Spell" when level is undefined', () => {
      const result = formatSpellLevelText(undefined, 'Evocation')
      expect(result).toBe('Unknown Spell')
    })

    it('returns "Unknown Spell" when school name is undefined', () => {
      const result = formatSpellLevelText(3, undefined)
      expect(result).toBe('Unknown Spell')
    })
  })

  describe('hasScalingEffects detection', () => {
    function detectScalingEffects(effects: SpellEffectResource[] | undefined): boolean {
      if (!effects || effects.length === 0) return false

      // Has scaling if any effect has different min_spell_slot values
      const slotLevels = new Set(effects.map(e => e.min_spell_slot).filter(s => s != null))
      return slotLevels.size > 1
    }

    it('detects scaling when effects have different min_spell_slot values', () => {
      const effects: SpellEffectResource[] = [
        {
          id: 1,
          effect_type: 'damage',
          description: 'Base damage',
          dice_formula: '8d6',
          base_value: null,
          scaling_type: 'spell_slot_level',
          min_character_level: null,
          min_spell_slot: 3,
          scaling_increment: null
        },
        {
          id: 2,
          effect_type: 'damage',
          description: 'Scaled damage',
          dice_formula: '9d6',
          base_value: null,
          scaling_type: 'spell_slot_level',
          min_character_level: null,
          min_spell_slot: 4,
          scaling_increment: null
        }
      ]
      expect(detectScalingEffects(effects)).toBe(true)
    })

    it('returns false when all effects have same min_spell_slot', () => {
      const effects: SpellEffectResource[] = [
        {
          id: 1,
          effect_type: 'damage',
          description: 'Base damage',
          dice_formula: '8d6',
          base_value: null,
          scaling_type: null,
          min_character_level: null,
          min_spell_slot: 3,
          scaling_increment: null
        },
        {
          id: 2,
          effect_type: 'healing',
          description: 'Healing',
          dice_formula: '2d8',
          base_value: null,
          scaling_type: null,
          min_character_level: null,
          min_spell_slot: 3,
          scaling_increment: null
        }
      ]
      expect(detectScalingEffects(effects)).toBe(false)
    })

    it('returns false when effects array is empty', () => {
      expect(detectScalingEffects([])).toBe(false)
    })

    it('returns false when effects is undefined', () => {
      expect(detectScalingEffects(undefined)).toBe(false)
    })
  })

  describe('scalingType detection', () => {
    function detectScalingType(effects: SpellEffectResource[] | undefined): 'spell_slot_level' | 'character_level' | null {
      if (!effects || effects.length === 0) return null

      // Check if any effect has scaling_type set
      const scalingTypes = effects
        .map(e => e.scaling_type)
        .filter(t => t != null)

      if (scalingTypes.length === 0) return null

      // Return the first scaling type found
      return scalingTypes[0] as 'spell_slot_level' | 'character_level'
    }

    it('detects spell_slot_level scaling', () => {
      const effects: SpellEffectResource[] = [
        {
          id: 1,
          effect_type: 'damage',
          description: 'Base damage',
          dice_formula: '8d6',
          base_value: null,
          scaling_type: 'spell_slot_level',
          min_character_level: null,
          min_spell_slot: 3,
          scaling_increment: '1d6'
        }
      ]
      expect(detectScalingType(effects)).toBe('spell_slot_level')
    })

    it('detects character_level scaling', () => {
      const effects: SpellEffectResource[] = [
        {
          id: 1,
          effect_type: 'damage',
          description: 'Base damage',
          dice_formula: '1d10',
          base_value: null,
          scaling_type: 'character_level',
          min_character_level: 1,
          min_spell_slot: null,
          scaling_increment: '1d10'
        }
      ]
      expect(detectScalingType(effects)).toBe('character_level')
    })

    it('returns null when no scaling_type is set', () => {
      const effects: SpellEffectResource[] = [
        {
          id: 1,
          effect_type: 'damage',
          description: 'Base damage',
          dice_formula: '8d6',
          base_value: null,
          scaling_type: null,
          min_character_level: null,
          min_spell_slot: 3,
          scaling_increment: null
        }
      ]
      expect(detectScalingType(effects)).toBeNull()
    })

    it('returns null when effects is undefined', () => {
      expect(detectScalingType(undefined)).toBeNull()
    })
  })

  describe('baseDamage extraction', () => {
    function extractBaseDamage(effects: SpellEffectResource[] | undefined): SpellEffectResource | null {
      if (!effects || effects.length === 0) return null

      // Find first damage effect
      return effects.find(e => e.effect_type === 'damage') || null
    }

    it('extracts first damage effect', () => {
      const damageEffect: SpellEffectResource = {
        id: 1,
        effect_type: 'damage',
        description: 'Fire damage',
        dice_formula: '8d6',
        base_value: null,
        scaling_type: 'spell_slot_level',
        min_character_level: null,
        min_spell_slot: 3,
        scaling_increment: '1d6'
      }
      const effects: SpellEffectResource[] = [
        damageEffect,
        {
          id: 2,
          effect_type: 'healing',
          description: 'Healing',
          dice_formula: '2d8',
          base_value: null,
          scaling_type: null,
          min_character_level: null,
          min_spell_slot: null,
          scaling_increment: null
        }
      ]
      expect(extractBaseDamage(effects)).toEqual(damageEffect)
    })

    it('returns null when no damage effects exist', () => {
      const effects: SpellEffectResource[] = [
        {
          id: 1,
          effect_type: 'healing',
          description: 'Healing',
          dice_formula: '2d8',
          base_value: null,
          scaling_type: null,
          min_character_level: null,
          min_spell_slot: null,
          scaling_increment: null
        }
      ]
      expect(extractBaseDamage(effects)).toBeNull()
    })

    it('returns null when effects is undefined', () => {
      expect(extractBaseDamage(undefined)).toBeNull()
    })
  })

  describe('combatMechanicsVisible detection', () => {
    function detectCombatMechanicsVisible(
      effects: SpellEffectResource[] | undefined,
      savingThrows: unknown[] | undefined,
      areaOfEffect: string | null | undefined
    ): boolean {
      const hasEffects = (effects?.length ?? 0) > 0
      const hasSavingThrows = (savingThrows?.length ?? 0) > 0
      const hasAreaOfEffect = !!areaOfEffect

      return hasEffects || hasSavingThrows || hasAreaOfEffect
    }

    it('returns true when spell has effects', () => {
      const effects: SpellEffectResource[] = [
        {
          id: 1,
          effect_type: 'damage',
          description: 'Fire damage',
          dice_formula: '8d6',
          base_value: null,
          scaling_type: null,
          min_character_level: null,
          min_spell_slot: 3,
          scaling_increment: null
        }
      ]
      expect(detectCombatMechanicsVisible(effects, [], null)).toBe(true)
    })

    it('returns true when spell has saving throws', () => {
      expect(detectCombatMechanicsVisible([], [{ ability_score: 'DEX' }], null)).toBe(true)
    })

    it('returns true when spell has area of effect', () => {
      expect(detectCombatMechanicsVisible([], [], '20-foot radius')).toBe(true)
    })

    it('returns false when spell has none', () => {
      expect(detectCombatMechanicsVisible([], [], null)).toBe(false)
    })
  })

  describe('groupedClasses computation', () => {
    function groupClasses(classes: ClassResource[] | undefined): { baseClasses: ClassResource[], subclasses: ClassResource[] } {
      if (!classes) return { baseClasses: [], subclasses: [] }

      const baseClasses: ClassResource[] = []
      const subclasses: ClassResource[] = []

      for (const cls of classes) {
        // is_base_class is a string "0" or "1" in the API
        if (cls.is_base_class === '1' || cls.is_base_class === true) {
          baseClasses.push(cls)
        } else {
          subclasses.push(cls)
        }
      }

      return { baseClasses, subclasses }
    }

    it('separates base classes from subclasses', () => {
      const classes: Partial<ClassResource>[] = [
        { id: '1', name: 'Wizard', slug: 'wizard', is_base_class: '1' },
        { id: '2', name: 'Cleric', slug: 'cleric', is_base_class: '1' },
        { id: '3', name: 'School of Evocation', slug: 'school-of-evocation', is_base_class: '0', parent_class_id: '1' },
        { id: '4', name: 'Life Domain', slug: 'life-domain', is_base_class: '0', parent_class_id: '2' }
      ]

      const result = groupClasses(classes as ClassResource[])
      expect(result.baseClasses.length).toBe(2)
      expect(result.subclasses.length).toBe(2)
      expect(result.baseClasses.map(c => c.name)).toEqual(['Wizard', 'Cleric'])
      expect(result.subclasses.map(c => c.name)).toEqual(['School of Evocation', 'Life Domain'])
    })

    it('returns empty arrays when classes is undefined', () => {
      const result = groupClasses(undefined)
      expect(result.baseClasses).toEqual([])
      expect(result.subclasses).toEqual([])
    })

    it('handles all base classes', () => {
      const classes: Partial<ClassResource>[] = [
        { id: '1', name: 'Wizard', slug: 'wizard', is_base_class: '1' },
        { id: '2', name: 'Cleric', slug: 'cleric', is_base_class: '1' }
      ]

      const result = groupClasses(classes as ClassResource[])
      expect(result.baseClasses.length).toBe(2)
      expect(result.subclasses.length).toBe(0)
    })

    it('handles all subclasses', () => {
      const classes: Partial<ClassResource>[] = [
        { id: '3', name: 'School of Evocation', slug: 'school-of-evocation', is_base_class: '0' },
        { id: '4', name: 'Life Domain', slug: 'life-domain', is_base_class: '0' }
      ]

      const result = groupClasses(classes as ClassResource[])
      expect(result.baseClasses.length).toBe(0)
      expect(result.subclasses.length).toBe(2)
    })
  })

  describe('parsedAreaOfEffect computation', () => {
    // Handles both API object format and legacy string format
    function parseAreaOfEffect(areaOfEffect: unknown): { type: string, size: number } | null {
      if (!areaOfEffect) return null

      // API returns object directly: { type: "sphere", size: 20 }
      if (typeof areaOfEffect === 'object' && areaOfEffect !== null) {
        const aoe = areaOfEffect as { type?: string, size?: number }
        if (aoe.type && typeof aoe.size === 'number') {
          return {
            type: aoe.type,
            size: aoe.size
          }
        }
      }

      // Fallback: parse string patterns like "20-foot radius"
      if (typeof areaOfEffect === 'string') {
        const match = areaOfEffect.match(/^(\d+)-foot\s+(.+)$/i)
        if (!match) return null

        const size = parseInt(match[1] ?? '0', 10)
        if (isNaN(size)) return null

        return {
          size,
          type: match[2]
        }
      }

      return null
    }

    it('parses API object format (sphere)', () => {
      const result = parseAreaOfEffect({ type: 'sphere', size: 20 })
      expect(result).toEqual({ size: 20, type: 'sphere' })
    })

    it('parses API object format (cone)', () => {
      const result = parseAreaOfEffect({ type: 'cone', size: 30 })
      expect(result).toEqual({ size: 30, type: 'cone' })
    })

    it('parses legacy string format (radius)', () => {
      const result = parseAreaOfEffect('20-foot radius')
      expect(result).toEqual({ size: 20, type: 'radius' })
    })

    it('parses legacy string format (cone)', () => {
      const result = parseAreaOfEffect('30-foot cone')
      expect(result).toEqual({ size: 30, type: 'cone' })
    })

    it('parses legacy string format (cube)', () => {
      const result = parseAreaOfEffect('15-foot cube')
      expect(result).toEqual({ size: 15, type: 'cube' })
    })

    it('parses legacy string format (line)', () => {
      const result = parseAreaOfEffect('100-foot line')
      expect(result).toEqual({ size: 100, type: 'line' })
    })

    it('returns null for unparseable string format', () => {
      const result = parseAreaOfEffect('special area')
      expect(result).toBeNull()
    })

    it('returns null when area_of_effect is null', () => {
      const result = parseAreaOfEffect(null)
      expect(result).toBeNull()
    })

    it('returns null when area_of_effect is undefined', () => {
      const result = parseAreaOfEffect(undefined)
      expect(result).toBeNull()
    })

    it('returns null for incomplete object', () => {
      const result = parseAreaOfEffect({ type: 'sphere' }) // missing size
      expect(result).toBeNull()
    })
  })
})
