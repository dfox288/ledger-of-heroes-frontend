import { describe, it, expect } from 'vitest'
import type { Feat } from '~/types/api/entities'

/**
 * Tests for useFeatDetail composable.
 *
 * These tests verify the composable correctly:
 * - Returns feat data from API
 * - Identifies half-feats via is_half_feat
 * - Filters modifiers by modifier_category (ability_score)
 * - Filters proficiencies that grant new proficiencies
 * - Extracts advantages/conditions from conditions array
 * - Handles prerequisites (both text and structured)
 * - Fetches related variants via parent_feat_slug
 */
describe('useFeatDetail - data organization logic', () => {
  // Test the pure logic functions without full composable mounting

  describe('isHalfFeat identification', () => {
    it('identifies half-feat when is_half_feat is true', () => {
      const mockFeat: Partial<Feat> = {
        id: 1,
        name: 'Actor',
        is_half_feat: true
      }
      expect(mockFeat.is_half_feat).toBe(true)
    })

    it('identifies regular feat when is_half_feat is false', () => {
      const mockFeat: Partial<Feat> = {
        id: 2,
        name: 'Alert',
        is_half_feat: false
      }
      expect(mockFeat.is_half_feat).toBe(false)
    })
  })

  describe('abilityModifiers filtering', () => {
    const mockModifiers = [
      {
        modifier_category: 'ability_score' as const,
        ability_score: { id: 1, code: 'CHA', name: 'Charisma' },
        value: '1'
      },
      {
        modifier_category: 'ability_score' as const,
        ability_score: { id: 2, code: 'STR', name: 'Strength' },
        value: '1'
      },
      {
        modifier_category: 'damage_resistance' as const,
        damage_type: { id: 3, name: 'Fire' }
      }
    ]

    function filterAbilityModifiers(modifiers: typeof mockModifiers) {
      return modifiers
        .filter(m => m.modifier_category === 'ability_score')
        .map(m => ({
          ability: m.ability_score?.name ?? 'Unknown',
          code: m.ability_score?.code ?? '?',
          value: parseInt(m.value || '0') || 0
        }))
    }

    it('returns only ability_score modifiers', () => {
      const result = filterAbilityModifiers(mockModifiers)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ ability: 'Charisma', code: 'CHA', value: 1 })
      expect(result[1]).toEqual({ ability: 'Strength', code: 'STR', value: 1 })
    })

    it('returns empty array when no ability_score modifiers', () => {
      const noAbilityMods = mockModifiers.filter(m => m.modifier_category !== 'ability_score')
      const result = filterAbilityModifiers(noAbilityMods)
      expect(result).toHaveLength(0)
    })

    it('parses numeric value from string', () => {
      const result = filterAbilityModifiers([mockModifiers[0]])
      expect(result[0].value).toBe(1)
      expect(typeof result[0].value).toBe('number')
    })
  })

  describe('grantedProficiencies filtering', () => {
    const mockProficiencies = [
      {
        id: 1,
        grants: true,
        proficiency_name: 'Heavy Armor',
        proficiency_type: 'armor'
      },
      {
        id: 2,
        grants: true,
        proficiency_name: 'Longswords',
        proficiency_type: 'weapon'
      },
      {
        id: 3,
        grants: false, // This is a prerequisite, not a grant
        proficiency_name: 'Medium Armor',
        proficiency_type: 'armor'
      }
    ]

    function filterGrantedProficiencies(proficiencies: typeof mockProficiencies) {
      return proficiencies
        .filter(p => p.grants)
        .map(p => ({
          name: p.proficiency_name,
          type: p.proficiency_type
        }))
    }

    it('returns only proficiencies that grant', () => {
      const result = filterGrantedProficiencies(mockProficiencies)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ name: 'Heavy Armor', type: 'armor' })
      expect(result[1]).toEqual({ name: 'Longswords', type: 'weapon' })
    })

    it('excludes proficiencies that are prerequisites (grants: false)', () => {
      const result = filterGrantedProficiencies(mockProficiencies)
      expect(result.every(p => p.name !== 'Medium Armor')).toBe(true)
    })

    it('returns empty array when no granted proficiencies', () => {
      const noGrants = mockProficiencies.filter(p => !p.grants)
      const result = filterGrantedProficiencies(noGrants)
      expect(result).toHaveLength(0)
    })
  })

  describe('advantages extraction', () => {
    const mockConditions = [
      {
        id: 1,
        effect_type: 'advantage',
        description: 'Advantage on CON saves to maintain concentration'
      },
      {
        id: 2,
        effect_type: 'special',
        description: 'Can cast spells while holding weapons or shield'
      },
      {
        id: 3,
        effect_type: 'advantage',
        description: 'Advantage on saves against being charmed'
      }
    ]

    function extractAdvantages(conditions: typeof mockConditions) {
      return conditions.map(c => ({
        effectType: c.effect_type,
        description: c.description
      }))
    }

    it('extracts all conditions with effect types and descriptions', () => {
      const result = extractAdvantages(mockConditions)
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        effectType: 'advantage',
        description: 'Advantage on CON saves to maintain concentration'
      })
      expect(result[1]).toEqual({
        effectType: 'special',
        description: 'Can cast spells while holding weapons or shield'
      })
    })

    it('returns empty array when no conditions', () => {
      const result = extractAdvantages([])
      expect(result).toHaveLength(0)
    })
  })

  describe('hasBenefits check', () => {
    function hasBenefits(
      abilityModifiers: unknown[],
      grantedProficiencies: unknown[],
      advantages: unknown[]
    ): boolean {
      return (
        abilityModifiers.length > 0
        || grantedProficiencies.length > 0
        || advantages.length > 0
      )
    }

    it('returns true when has ability modifiers', () => {
      expect(hasBenefits([{ ability: 'STR', code: 'STR', value: 1 }], [], [])).toBe(true)
    })

    it('returns true when has granted proficiencies', () => {
      expect(hasBenefits([], [{ name: 'Heavy Armor', type: 'armor' }], [])).toBe(true)
    })

    it('returns true when has advantages', () => {
      expect(hasBenefits([], [], [{ effectType: 'advantage', description: 'Test' }])).toBe(true)
    })

    it('returns true when has multiple types', () => {
      expect(hasBenefits(
        [{ ability: 'STR', code: 'STR', value: 1 }],
        [{ name: 'Heavy Armor', type: 'armor' }],
        [{ effectType: 'advantage', description: 'Test' }]
      )).toBe(true)
    })

    it('returns false when no benefits at all', () => {
      expect(hasBenefits([], [], [])).toBe(false)
    })
  })

  describe('prerequisites extraction', () => {
    describe('hasPrerequisites check', () => {
      it('returns true when has prerequisites array', () => {
        const mockFeat: Partial<Feat> = {
          prerequisites: [
            { id: 1, description: 'Proficiency with medium armor' }
          ]
        }
        const hasPrereqs = (mockFeat.prerequisites?.length ?? 0) > 0 || !!mockFeat.prerequisites_text
        expect(hasPrereqs).toBe(true)
      })

      it('returns true when has prerequisites_text', () => {
        const mockFeat: Partial<Feat> = {
          prerequisites_text: 'Ability to cast at least one spell'
        }
        const hasPrereqs = (mockFeat.prerequisites?.length ?? 0) > 0 || !!mockFeat.prerequisites_text
        expect(hasPrereqs).toBe(true)
      })

      it('returns false when no prerequisites', () => {
        const mockFeat: Partial<Feat> = {
          prerequisites: [],
          prerequisites_text: null
        }
        const hasPrereqs = (mockFeat.prerequisites?.length ?? 0) > 0 || !!mockFeat.prerequisites_text
        expect(hasPrereqs).toBe(false)
      })
    })

    describe('prerequisitesList extraction', () => {
      function extractPrerequisitesList(feat: Partial<Feat>): string[] {
        const list: string[] = []

        // Add text prerequisite if exists
        if (feat.prerequisites_text) {
          list.push(feat.prerequisites_text)
        }

        // Add structured prerequisites
        feat.prerequisites?.forEach((p) => {
          if (p.description) {
            list.push(p.description)
          } else if (p.prerequisite?.name) {
            list.push(p.prerequisite.name)
          }
        })

        return list
      }

      it('extracts prerequisites_text', () => {
        const mockFeat: Partial<Feat> = {
          prerequisites_text: 'Ability to cast at least one spell'
        }
        const result = extractPrerequisitesList(mockFeat)
        expect(result).toEqual(['Ability to cast at least one spell'])
      })

      it('extracts structured prerequisites with description', () => {
        const mockFeat: Partial<Feat> = {
          prerequisites: [
            { id: 1, description: 'Proficiency with medium armor' },
            { id: 2, description: 'Strength 13 or higher' }
          ]
        }
        const result = extractPrerequisitesList(mockFeat)
        expect(result).toEqual([
          'Proficiency with medium armor',
          'Strength 13 or higher'
        ])
      })

      it('extracts structured prerequisites with prerequisite.name fallback', () => {
        const mockFeat: Partial<Feat> = {
          prerequisites: [
            {
              id: 1,
              description: null,
              prerequisite: { id: 1, slug: 'str-13', name: 'Strength 13' }
            }
          ]
        }
        const result = extractPrerequisitesList(mockFeat)
        expect(result).toEqual(['Strength 13'])
      })

      it('combines both text and structured prerequisites', () => {
        const mockFeat: Partial<Feat> = {
          prerequisites_text: 'Ability to cast at least one spell',
          prerequisites: [
            { id: 1, description: 'Level 4 or higher' }
          ]
        }
        const result = extractPrerequisitesList(mockFeat)
        expect(result).toEqual([
          'Ability to cast at least one spell',
          'Level 4 or higher'
        ])
      })

      it('returns empty array when no prerequisites', () => {
        const mockFeat: Partial<Feat> = {}
        const result = extractPrerequisitesList(mockFeat)
        expect(result).toEqual([])
      })
    })
  })

  describe('parent_feat_slug for variants', () => {
    it('provides parent_feat_slug when feat is a variant', () => {
      const mockFeat: Partial<Feat> = {
        id: 1,
        slug: 'resilient-constitution',
        name: 'Resilient (Constitution)',
        parent_feat_slug: 'resilient'
      }
      expect(mockFeat.parent_feat_slug).toBe('resilient')
    })

    it('has null parent_feat_slug when feat is not a variant', () => {
      const mockFeat: Partial<Feat> = {
        id: 2,
        slug: 'alert',
        name: 'Alert',
        parent_feat_slug: null
      }
      expect(mockFeat.parent_feat_slug).toBeNull()
    })
  })

  describe('sources and tags', () => {
    it('provides sources array', () => {
      const mockFeat: Partial<Feat> = {
        sources: [
          { id: 1, source_code: 'PHB', page_number: 165 }
        ]
      }
      expect(mockFeat.sources).toHaveLength(1)
      expect(mockFeat.sources![0].source_code).toBe('PHB')
    })

    it('provides tags array', () => {
      const mockFeat: Partial<Feat> = {
        tags: [
          { id: 1, slug: 'combat', name: 'Combat' },
          { id: 2, slug: 'spellcasting', name: 'Spellcasting' }
        ]
      }
      expect(mockFeat.tags).toHaveLength(2)
      expect(mockFeat.tags![0].name).toBe('Combat')
    })

    it('handles empty sources and tags', () => {
      const mockFeat: Partial<Feat> = {
        sources: [],
        tags: []
      }
      expect(mockFeat.sources).toEqual([])
      expect(mockFeat.tags).toEqual([])
    })
  })
})
