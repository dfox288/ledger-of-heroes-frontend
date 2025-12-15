import { describe, it, expect } from 'vitest'
import {
  checkMulticlassEligibility,
  useMulticlassEligibility,
  type AbilityScoreMap,
  type MulticlassRequirements
} from '~/composables/useMulticlassEligibility'

// Standard ability score set for testing
const standardScores: AbilityScoreMap = {
  STR: 15,
  DEX: 14,
  CON: 13,
  INT: 12,
  WIS: 10,
  CHA: 8
}

// Low ability scores
const lowScores: AbilityScoreMap = {
  STR: 8,
  DEX: 8,
  CON: 8,
  INT: 8,
  WIS: 8,
  CHA: 8
}

// High ability scores
const highScores: AbilityScoreMap = {
  STR: 18,
  DEX: 18,
  CON: 18,
  INT: 18,
  WIS: 18,
  CHA: 18
}

describe('useMulticlassEligibility', () => {
  describe('checkMulticlassEligibility', () => {
    describe('no requirements', () => {
      it('returns eligible when requirements is null', () => {
        const result = checkMulticlassEligibility(standardScores, null)

        expect(result.eligible).toBe(true)
        expect(result.missingRequirements).toEqual([])
        expect(result.requirementText).toBe('')
      })

      it('returns eligible when requirements array is empty', () => {
        const requirements: MulticlassRequirements = {
          type: null,
          requirements: []
        }

        const result = checkMulticlassEligibility(standardScores, requirements)

        expect(result.eligible).toBe(true)
        expect(result.missingRequirements).toEqual([])
      })
    })

    describe('single requirement (type: null)', () => {
      it('returns eligible when requirement is met', () => {
        const requirements: MulticlassRequirements = {
          type: null,
          requirements: [{
            ability: { id: 1, code: 'STR', name: 'Strength' },
            ability_name: 'Strength',
            minimum_score: 13,
            is_alternative: false
          }]
        }

        const result = checkMulticlassEligibility(standardScores, requirements)

        expect(result.eligible).toBe(true)
        expect(result.missingRequirements).toEqual([])
        expect(result.requirementText).toBe('Requires Strength 13')
      })

      it('returns not eligible when requirement is not met', () => {
        const requirements: MulticlassRequirements = {
          type: null,
          requirements: [{
            ability: { id: 6, code: 'CHA', name: 'Charisma' },
            ability_name: 'Charisma',
            minimum_score: 13,
            is_alternative: false
          }]
        }

        const result = checkMulticlassEligibility(standardScores, requirements)

        expect(result.eligible).toBe(false)
        expect(result.missingRequirements).toEqual(['Charisma 13'])
        expect(result.requirementText).toBe('Requires Charisma 13')
      })

      it('returns eligible when score exactly meets minimum', () => {
        const requirements: MulticlassRequirements = {
          type: null,
          requirements: [{
            ability: { id: 1, code: 'STR', name: 'Strength' },
            ability_name: 'Strength',
            minimum_score: 15,
            is_alternative: false
          }]
        }

        const result = checkMulticlassEligibility(standardScores, requirements)

        expect(result.eligible).toBe(true)
      })
    })

    describe('AND requirements (type: "and")', () => {
      it('returns eligible when all requirements are met', () => {
        // Paladin-like requirements: STR 13 and CHA 13
        const requirements: MulticlassRequirements = {
          type: 'and',
          requirements: [
            {
              ability: { id: 1, code: 'STR', name: 'Strength' },
              ability_name: 'Strength',
              minimum_score: 13,
              is_alternative: false
            },
            {
              ability: { id: 2, code: 'DEX', name: 'Dexterity' },
              ability_name: 'Dexterity',
              minimum_score: 13,
              is_alternative: false
            }
          ]
        }

        const result = checkMulticlassEligibility(standardScores, requirements)

        expect(result.eligible).toBe(true)
        expect(result.missingRequirements).toEqual([])
        expect(result.requirementText).toBe('Requires Strength 13 and Dexterity 13')
      })

      it('returns not eligible when one requirement is not met', () => {
        const requirements: MulticlassRequirements = {
          type: 'and',
          requirements: [
            {
              ability: { id: 1, code: 'STR', name: 'Strength' },
              ability_name: 'Strength',
              minimum_score: 13,
              is_alternative: false
            },
            {
              ability: { id: 6, code: 'CHA', name: 'Charisma' },
              ability_name: 'Charisma',
              minimum_score: 13,
              is_alternative: false
            }
          ]
        }

        const result = checkMulticlassEligibility(standardScores, requirements)

        expect(result.eligible).toBe(false)
        expect(result.missingRequirements).toEqual(['Charisma 13'])
        expect(result.requirementText).toBe('Requires Strength 13 and Charisma 13')
      })

      it('returns not eligible when all requirements are not met', () => {
        const requirements: MulticlassRequirements = {
          type: 'and',
          requirements: [
            {
              ability: { id: 1, code: 'STR', name: 'Strength' },
              ability_name: 'Strength',
              minimum_score: 16,
              is_alternative: false
            },
            {
              ability: { id: 6, code: 'CHA', name: 'Charisma' },
              ability_name: 'Charisma',
              minimum_score: 13,
              is_alternative: false
            }
          ]
        }

        const result = checkMulticlassEligibility(standardScores, requirements)

        expect(result.eligible).toBe(false)
        expect(result.missingRequirements).toContain('Strength 16')
        expect(result.missingRequirements).toContain('Charisma 13')
        expect(result.missingRequirements).toHaveLength(2)
      })
    })

    describe('OR requirements (type: "or")', () => {
      it('returns eligible when first requirement is met', () => {
        // Fighter-like: STR 13 or DEX 13
        const requirements: MulticlassRequirements = {
          type: 'or',
          requirements: [
            {
              ability: { id: 1, code: 'STR', name: 'Strength' },
              ability_name: 'Strength',
              minimum_score: 13,
              is_alternative: true
            },
            {
              ability: { id: 2, code: 'DEX', name: 'Dexterity' },
              ability_name: 'Dexterity',
              minimum_score: 13,
              is_alternative: true
            }
          ]
        }

        const result = checkMulticlassEligibility(standardScores, requirements)

        expect(result.eligible).toBe(true)
        expect(result.missingRequirements).toEqual([])
        expect(result.requirementText).toBe('Requires Strength 13 or Dexterity 13')
      })

      it('returns eligible when second requirement is met', () => {
        const scoresOnlyDex: AbilityScoreMap = {
          STR: 8,
          DEX: 16,
          CON: 10,
          INT: 10,
          WIS: 10,
          CHA: 10
        }

        const requirements: MulticlassRequirements = {
          type: 'or',
          requirements: [
            {
              ability: { id: 1, code: 'STR', name: 'Strength' },
              ability_name: 'Strength',
              minimum_score: 13,
              is_alternative: true
            },
            {
              ability: { id: 2, code: 'DEX', name: 'Dexterity' },
              ability_name: 'Dexterity',
              minimum_score: 13,
              is_alternative: true
            }
          ]
        }

        const result = checkMulticlassEligibility(scoresOnlyDex, requirements)

        expect(result.eligible).toBe(true)
        expect(result.missingRequirements).toEqual([])
      })

      it('returns not eligible when no requirements are met', () => {
        const requirements: MulticlassRequirements = {
          type: 'or',
          requirements: [
            {
              ability: { id: 1, code: 'STR', name: 'Strength' },
              ability_name: 'Strength',
              minimum_score: 13,
              is_alternative: true
            },
            {
              ability: { id: 2, code: 'DEX', name: 'Dexterity' },
              ability_name: 'Dexterity',
              minimum_score: 13,
              is_alternative: true
            }
          ]
        }

        const result = checkMulticlassEligibility(lowScores, requirements)

        expect(result.eligible).toBe(false)
        expect(result.missingRequirements).toEqual(['Strength 13', 'Dexterity 13'])
        expect(result.requirementText).toBe('Requires Strength 13 or Dexterity 13')
      })
    })

    describe('real class examples', () => {
      it('Barbarian: STR 13', () => {
        const requirements: MulticlassRequirements = {
          type: null,
          requirements: [{
            ability: { id: 1, code: 'STR', name: 'Strength' },
            ability_name: 'Strength',
            minimum_score: 13,
            is_alternative: false
          }]
        }

        expect(checkMulticlassEligibility(standardScores, requirements).eligible).toBe(true)
        expect(checkMulticlassEligibility(lowScores, requirements).eligible).toBe(false)
      })

      it('Wizard: INT 13', () => {
        const requirements: MulticlassRequirements = {
          type: null,
          requirements: [{
            ability: { id: 4, code: 'INT', name: 'Intelligence' },
            ability_name: 'Intelligence',
            minimum_score: 13,
            is_alternative: false
          }]
        }

        // Standard scores have INT 12, should fail
        expect(checkMulticlassEligibility(standardScores, requirements).eligible).toBe(false)
        expect(checkMulticlassEligibility(highScores, requirements).eligible).toBe(true)
      })

      it('Paladin: STR 13 and CHA 13', () => {
        const requirements: MulticlassRequirements = {
          type: 'and',
          requirements: [
            {
              ability: { id: 1, code: 'STR', name: 'Strength' },
              ability_name: 'Strength',
              minimum_score: 13,
              is_alternative: false
            },
            {
              ability: { id: 6, code: 'CHA', name: 'Charisma' },
              ability_name: 'Charisma',
              minimum_score: 13,
              is_alternative: false
            }
          ]
        }

        // Standard scores have CHA 8, should fail
        expect(checkMulticlassEligibility(standardScores, requirements).eligible).toBe(false)
        expect(checkMulticlassEligibility(highScores, requirements).eligible).toBe(true)
      })

      it('Ranger: DEX 13 and WIS 13', () => {
        const requirements: MulticlassRequirements = {
          type: 'and',
          requirements: [
            {
              ability: { id: 2, code: 'DEX', name: 'Dexterity' },
              ability_name: 'Dexterity',
              minimum_score: 13,
              is_alternative: false
            },
            {
              ability: { id: 5, code: 'WIS', name: 'Wisdom' },
              ability_name: 'Wisdom',
              minimum_score: 13,
              is_alternative: false
            }
          ]
        }

        // Standard scores have DEX 14 but WIS 10, should fail
        const result = checkMulticlassEligibility(standardScores, requirements)
        expect(result.eligible).toBe(false)
        expect(result.missingRequirements).toEqual(['Wisdom 13'])
      })
    })
  })

  describe('useMulticlassEligibility composable', () => {
    it('returns checkEligibility function', () => {
      const { checkEligibility } = useMulticlassEligibility()

      expect(typeof checkEligibility).toBe('function')
    })

    it('checkEligibility works correctly', () => {
      const { checkEligibility } = useMulticlassEligibility()

      const requirements: MulticlassRequirements = {
        type: null,
        requirements: [{
          ability: { id: 1, code: 'STR', name: 'Strength' },
          ability_name: 'Strength',
          minimum_score: 13,
          is_alternative: false
        }]
      }

      const result = checkEligibility(standardScores, requirements)

      expect(result.eligible).toBe(true)
    })
  })
})
