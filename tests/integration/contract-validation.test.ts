/**
 * API Contract Validation Tests
 *
 * This test file validates that fixture data structures match the expected
 * API types from generated.ts. It catches drift between fixtures and the
 * actual API schema, complementing TypeScript's compile-time checks with
 * runtime validation.
 *
 * Why this matters:
 * - TypeScript compile-time checks can be bypassed by loose types or `any`
 * - Runtime validation catches structural issues that slip through
 * - Clear test failures when API evolves but fixtures don't
 *
 * Run with: npm run test -- tests/integration/contract-validation.test.ts
 */

import { describe, it, expect } from 'vitest'

// Import all fixtures
import {
  humanFighterL1,
  draftClericL1,
  highElfWizardL1,
  variantHumanFighterL1,
  humanFighterL3,
  highElfWizardL2,
  halflingRogueL4
} from '#tests/msw/fixtures/characters'

// ════════════════════════════════════════════════════════════════════════════
// SHAPE VALIDATORS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Validates that an object has all required fields with correct types.
 * Returns array of validation errors (empty if valid).
 */
function validateShape(
  obj: Record<string, unknown>,
  schema: Record<string, string | string[]>,
  path = ''
): string[] {
  const errors: string[] = []

  for (const [field, expectedType] of Object.entries(schema)) {
    const fullPath = path ? `${path}.${field}` : field
    const value = obj[field]
    const actualType = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value

    // Handle multiple allowed types (e.g., ['string', 'null'])
    const allowedTypes = Array.isArray(expectedType) ? expectedType : [expectedType]

    if (!allowedTypes.includes(actualType)) {
      errors.push(`${fullPath}: expected ${allowedTypes.join(' | ')}, got ${actualType}`)
    }
  }

  return errors
}

/**
 * Validates CharacterResource shape
 *
 * Based on components['schemas']['CharacterResource'] from generated.ts
 * Note: Using fixture structure (which may differ from latest API)
 */
function validateCharacterShape(character: Record<string, unknown>): string[] {
  const errors: string[] = []

  // Required top-level fields
  const requiredFields: Record<string, string | string[]> = {
    id: 'number',
    public_id: 'string',
    name: 'string',
    level: 'number',
    experience_points: 'number',
    status: 'string',
    proficiency_bonus: 'number',
    armor_class: 'number',
    speed: 'number',
    created_at: 'string',
    updated_at: 'string'
  }

  errors.push(...validateShape(character, requiredFields))

  // Nested objects
  if (character.race && typeof character.race === 'object') {
    errors.push(...validateShape(character.race as Record<string, unknown>, {
      id: 'number',
      name: 'string',
      slug: 'string'
    }, 'race'))
  }

  if (character.class && typeof character.class === 'object') {
    errors.push(...validateShape(character.class as Record<string, unknown>, {
      id: 'number',
      name: 'string',
      slug: 'string',
      hit_die: 'number'
    }, 'class'))
  }

  if (character.background && typeof character.background === 'object') {
    errors.push(...validateShape(character.background as Record<string, unknown>, {
      id: 'number',
      name: 'string',
      slug: 'string'
    }, 'background'))
  }

  // Ability scores (required nested object)
  if (character.ability_scores && typeof character.ability_scores === 'object') {
    const abilityScores = character.ability_scores as Record<string, unknown>
    const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
    for (const ability of abilities) {
      if (typeof abilityScores[ability] !== 'number') {
        errors.push(`ability_scores.${ability}: expected number, got ${typeof abilityScores[ability]}`)
      }
    }
  } else {
    errors.push('ability_scores: expected object, got ' + typeof character.ability_scores)
  }

  // Base ability scores (required nested object)
  if (character.base_ability_scores && typeof character.base_ability_scores === 'object') {
    const baseScores = character.base_ability_scores as Record<string, unknown>
    const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
    for (const ability of abilities) {
      if (typeof baseScores[ability] !== 'number') {
        errors.push(`base_ability_scores.${ability}: expected number, got ${typeof baseScores[ability]}`)
      }
    }
  } else {
    errors.push('base_ability_scores: expected object, got ' + typeof character.base_ability_scores)
  }

  // Hit points (required nested object)
  if (character.hit_points && typeof character.hit_points === 'object') {
    errors.push(...validateShape(character.hit_points as Record<string, unknown>, {
      current: 'number',
      max: 'number',
      temporary: 'number'
    }, 'hit_points'))
  } else {
    errors.push('hit_points: expected object, got ' + typeof character.hit_points)
  }

  return errors
}

/**
 * Validates CharacterStatsResource shape
 *
 * Based on components['schemas']['CharacterStatsResource'] from generated.ts
 */
function validateStatsShape(stats: Record<string, unknown>): string[] {
  const errors: string[] = []

  // ability_scores - nested object with ability codes
  if (stats.ability_scores && typeof stats.ability_scores === 'object') {
    const abilityScores = stats.ability_scores as Record<string, unknown>
    const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
    for (const ability of abilities) {
      const abilityData = abilityScores[ability] as Record<string, unknown> | undefined
      if (!abilityData || typeof abilityData !== 'object') {
        errors.push(`ability_scores.${ability}: expected object, got ${typeof abilityData}`)
      } else {
        if (typeof abilityData.score !== 'number') {
          errors.push(`ability_scores.${ability}.score: expected number, got ${typeof abilityData.score}`)
        }
        if (typeof abilityData.modifier !== 'number') {
          errors.push(`ability_scores.${ability}.modifier: expected number, got ${typeof abilityData.modifier}`)
        }
      }
    }
  } else {
    errors.push('ability_scores: expected object, got ' + typeof stats.ability_scores)
  }

  // skills - array of skill objects
  if (Array.isArray(stats.skills)) {
    for (let i = 0; i < stats.skills.length; i++) {
      const skill = stats.skills[i] as Record<string, unknown>
      if (typeof skill.name !== 'string') {
        errors.push(`skills[${i}].name: expected string, got ${typeof skill.name}`)
      }
      if (typeof skill.ability !== 'string') {
        errors.push(`skills[${i}].ability: expected string, got ${typeof skill.ability}`)
      }
      if (typeof skill.modifier !== 'number') {
        errors.push(`skills[${i}].modifier: expected number, got ${typeof skill.modifier}`)
      }
      if (typeof skill.proficient !== 'boolean') {
        errors.push(`skills[${i}].proficient: expected boolean, got ${typeof skill.proficient}`)
      }
    }
  } else {
    errors.push('skills: expected array, got ' + typeof stats.skills)
  }

  // combat - nested object
  if (stats.combat && typeof stats.combat === 'object') {
    errors.push(...validateShape(stats.combat as Record<string, unknown>, {
      armor_class: 'number',
      initiative: 'number',
      speed: 'number',
      proficiency_bonus: 'number'
    }, 'combat'))

    // combat.hit_points
    const combat = stats.combat as Record<string, unknown>
    if (combat.hit_points && typeof combat.hit_points === 'object') {
      errors.push(...validateShape(combat.hit_points as Record<string, unknown>, {
        current: 'number',
        max: 'number',
        temporary: 'number'
      }, 'combat.hit_points'))
    }

    // combat.hit_dice
    if (combat.hit_dice && typeof combat.hit_dice === 'object') {
      errors.push(...validateShape(combat.hit_dice as Record<string, unknown>, {
        total: 'number',
        remaining: 'number',
        die: 'string'
      }, 'combat.hit_dice'))
    }
  } else {
    errors.push('combat: expected object, got ' + typeof stats.combat)
  }

  // passive_scores - nested object
  if (stats.passive_scores && typeof stats.passive_scores === 'object') {
    errors.push(...validateShape(stats.passive_scores as Record<string, unknown>, {
      perception: 'number',
      investigation: 'number',
      insight: 'number'
    }, 'passive_scores'))
  } else {
    errors.push('passive_scores: expected object, got ' + typeof stats.passive_scores)
  }

  // proficiencies - nested object with arrays
  if (stats.proficiencies && typeof stats.proficiencies === 'object') {
    const proficiencies = stats.proficiencies as Record<string, unknown>
    const categories = ['armor', 'weapons', 'tools', 'languages']
    for (const category of categories) {
      if (!Array.isArray(proficiencies[category])) {
        errors.push(`proficiencies.${category}: expected array, got ${typeof proficiencies[category]}`)
      }
    }
  } else {
    errors.push('proficiencies: expected object, got ' + typeof stats.proficiencies)
  }

  // spellcasting - object or null
  if (stats.spellcasting !== null && stats.spellcasting !== undefined) {
    if (typeof stats.spellcasting !== 'object') {
      errors.push('spellcasting: expected object or null, got ' + typeof stats.spellcasting)
    } else {
      const spellcasting = stats.spellcasting as Record<string, unknown>
      errors.push(...validateShape(spellcasting, {
        ability: 'string',
        spell_save_dc: 'number',
        spell_attack_bonus: 'number'
      }, 'spellcasting'))
    }
  }

  return errors
}

/**
 * Validates CharacterSummaryResource shape
 *
 * Based on fixture structure (simplified from API)
 */
function validateSummaryShape(summary: Record<string, unknown>): string[] {
  const errors: string[] = []

  // Required top-level fields
  const requiredFields: Record<string, string | string[]> = {
    id: 'number',
    public_id: 'string',
    name: 'string',
    level: 'number',
    race: 'string',
    class: 'string',
    status: 'string'
  }

  errors.push(...validateShape(summary, requiredFields))

  // pending_choices - nested object with counts
  if (summary.pending_choices && typeof summary.pending_choices === 'object') {
    const pendingChoices = summary.pending_choices as Record<string, unknown>
    const choiceTypes = ['total', 'proficiency', 'equipment', 'spell', 'language', 'ability_score', 'feature', 'fighting_style', 'expertise']
    for (const choiceType of choiceTypes) {
      if (typeof pendingChoices[choiceType] !== 'number') {
        errors.push(`pending_choices.${choiceType}: expected number, got ${typeof pendingChoices[choiceType]}`)
      }
    }
  } else {
    errors.push('pending_choices: expected object, got ' + typeof summary.pending_choices)
  }

  return errors
}

/**
 * Validates PendingChoiceResource shape
 *
 * Based on components['schemas']['PendingChoiceResource'] from generated.ts
 */
function validatePendingChoiceShape(choice: Record<string, unknown>): string[] {
  const requiredFields: Record<string, string | string[]> = {
    id: 'string',
    type: 'string',
    source: 'string',
    source_name: 'string',
    level_granted: 'number',
    required: 'boolean',
    quantity: 'number',
    remaining: 'number'
  }

  const errors = validateShape(choice, requiredFields)

  // selected - array of strings
  if (!Array.isArray(choice.selected)) {
    errors.push('selected: expected array, got ' + typeof choice.selected)
  }

  // options - array (can contain various option shapes)
  if (!Array.isArray(choice.options)) {
    errors.push('options: expected array, got ' + typeof choice.options)
  }

  return errors
}

// ════════════════════════════════════════════════════════════════════════════
// CONTRACT VALIDATION TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('API Contract Validation', () => {
  describe('CharacterResource Shape', () => {
    const fixtures = [
      { name: 'humanFighterL1', data: humanFighterL1 },
      { name: 'draftClericL1', data: draftClericL1 },
      { name: 'highElfWizardL1', data: highElfWizardL1 },
      { name: 'variantHumanFighterL1', data: variantHumanFighterL1 },
      { name: 'humanFighterL3', data: humanFighterL3 },
      { name: 'highElfWizardL2', data: highElfWizardL2 },
      { name: 'halflingRogueL4', data: halflingRogueL4 }
    ]

    for (const { name, data } of fixtures) {
      it(`${name}.character has valid CharacterResource shape`, () => {
        const errors = validateCharacterShape(data.character as unknown as Record<string, unknown>)
        expect(errors, `Validation errors in ${name}.character:\n${errors.join('\n')}`).toHaveLength(0)
      })
    }
  })

  describe('CharacterStatsResource Shape', () => {
    const fixtures = [
      { name: 'humanFighterL1', data: humanFighterL1 },
      { name: 'draftClericL1', data: draftClericL1 },
      { name: 'highElfWizardL1', data: highElfWizardL1 },
      { name: 'variantHumanFighterL1', data: variantHumanFighterL1 },
      { name: 'humanFighterL3', data: humanFighterL3 },
      { name: 'highElfWizardL2', data: highElfWizardL2 },
      { name: 'halflingRogueL4', data: halflingRogueL4 }
    ]

    for (const { name, data } of fixtures) {
      it(`${name}.stats has valid CharacterStatsResource shape`, () => {
        const errors = validateStatsShape(data.stats as unknown as Record<string, unknown>)
        expect(errors, `Validation errors in ${name}.stats:\n${errors.join('\n')}`).toHaveLength(0)
      })
    }
  })

  describe('CharacterSummaryResource Shape', () => {
    const fixtures = [
      { name: 'humanFighterL1', data: humanFighterL1 },
      { name: 'draftClericL1', data: draftClericL1 },
      { name: 'highElfWizardL1', data: highElfWizardL1 },
      { name: 'variantHumanFighterL1', data: variantHumanFighterL1 },
      { name: 'humanFighterL3', data: humanFighterL3 },
      { name: 'highElfWizardL2', data: highElfWizardL2 },
      { name: 'halflingRogueL4', data: halflingRogueL4 }
    ]

    for (const { name, data } of fixtures) {
      it(`${name}.summary has valid CharacterSummaryResource shape`, () => {
        const errors = validateSummaryShape(data.summary as unknown as Record<string, unknown>)
        expect(errors, `Validation errors in ${name}.summary:\n${errors.join('\n')}`).toHaveLength(0)
      })
    }
  })

  describe('PendingChoiceResource Shape', () => {
    it('draftClericL1 pending choices have valid shape', () => {
      for (let i = 0; i < draftClericL1.pendingChoices.choices.length; i++) {
        const choice = draftClericL1.pendingChoices.choices[i]
        const errors = validatePendingChoiceShape(choice as unknown as Record<string, unknown>)
        expect(errors, `Validation errors in choice[${i}]:\n${errors.join('\n')}`).toHaveLength(0)
      }
    })

    it('halflingRogueL4 pending choices have valid shape', () => {
      for (let i = 0; i < halflingRogueL4.pendingChoices.choices.length; i++) {
        const choice = halflingRogueL4.pendingChoices.choices[i]
        const errors = validatePendingChoiceShape(choice as unknown as Record<string, unknown>)
        expect(errors, `Validation errors in choice[${i}]:\n${errors.join('\n')}`).toHaveLength(0)
      }
    })
  })

  describe('Field Type Validation', () => {
    it('ability scores are all numbers between 1-30', () => {
      const fixtures = [humanFighterL1, draftClericL1, highElfWizardL1, variantHumanFighterL1, humanFighterL3, highElfWizardL2, halflingRogueL4]

      for (const fixture of fixtures) {
        const abilities = Object.values(fixture.character.ability_scores)
        for (const score of abilities) {
          expect(score).toBeTypeOf('number')
          expect(score).toBeGreaterThanOrEqual(1)
          expect(score).toBeLessThanOrEqual(30)
        }
      }
    })

    it('levels are positive integers', () => {
      const fixtures = [humanFighterL1, draftClericL1, highElfWizardL1, variantHumanFighterL1, humanFighterL3, highElfWizardL2, halflingRogueL4]

      for (const fixture of fixtures) {
        expect(fixture.character.level).toBeTypeOf('number')
        expect(fixture.character.level).toBeGreaterThanOrEqual(1)
        expect(fixture.character.level).toBeLessThanOrEqual(20)
        expect(Number.isInteger(fixture.character.level)).toBe(true)
      }
    })

    it('hit die values are valid D&D values', () => {
      const validHitDice = [6, 8, 10, 12]
      const fixtures = [humanFighterL1, draftClericL1, highElfWizardL1, variantHumanFighterL1, humanFighterL3, highElfWizardL2, halflingRogueL4]

      for (const fixture of fixtures) {
        expect(validHitDice).toContain(fixture.character.class.hit_die)
      }
    })

    it('proficiency bonus matches level', () => {
      // D&D 5e proficiency bonus formula: 2 + floor((level - 1) / 4)
      const fixtures = [
        { fixture: humanFighterL1, expectedBonus: 2 }, // Level 1
        { fixture: draftClericL1, expectedBonus: 2 }, // Level 1
        { fixture: humanFighterL3, expectedBonus: 2 }, // Level 3
        { fixture: halflingRogueL4, expectedBonus: 2 } // Level 4
      ]

      for (const { fixture, expectedBonus } of fixtures) {
        expect(fixture.character.proficiency_bonus).toBe(expectedBonus)
      }
    })

    it('status values are valid enum values', () => {
      const validStatuses = ['draft', 'complete']
      const fixtures = [humanFighterL1, draftClericL1, highElfWizardL1, variantHumanFighterL1, humanFighterL3, highElfWizardL2, halflingRogueL4]

      for (const fixture of fixtures) {
        expect(validStatuses).toContain(fixture.character.status)
      }
    })

    it('slugs follow the expected format', () => {
      // Slugs should be in format "source:entity-name" (e.g., "phb:human")
      const slugPattern = /^[a-z0-9-]+:[a-z0-9-]+$/
      const fixtures = [humanFighterL1, draftClericL1, highElfWizardL1, variantHumanFighterL1, humanFighterL3, highElfWizardL2, halflingRogueL4]

      for (const fixture of fixtures) {
        expect(fixture.character.race.slug).toMatch(slugPattern)
        expect(fixture.character.class.slug).toMatch(slugPattern)
        expect(fixture.character.background.slug).toMatch(slugPattern)
      }
    })

    it('public_id follows the expected format', () => {
      // public_id format: {adjective}-{noun}-{suffix}
      const publicIdPattern = /^[a-z]+-[a-z]+-[A-Za-z0-9]{4}$/
      const fixtures = [humanFighterL1, draftClericL1, highElfWizardL1, variantHumanFighterL1, humanFighterL3, highElfWizardL2, halflingRogueL4]

      for (const fixture of fixtures) {
        expect(fixture.character.public_id).toMatch(publicIdPattern)
      }
    })
  })

  describe('Consistency Validation', () => {
    it('summary.id matches character.id', () => {
      const fixtures = [humanFighterL1, draftClericL1, highElfWizardL1, variantHumanFighterL1, humanFighterL3, highElfWizardL2, halflingRogueL4]

      for (const fixture of fixtures) {
        expect(fixture.summary.id).toBe(fixture.character.id)
      }
    })

    it('summary.public_id matches character.public_id', () => {
      const fixtures = [humanFighterL1, draftClericL1, highElfWizardL1, variantHumanFighterL1, humanFighterL3, highElfWizardL2, halflingRogueL4]

      for (const fixture of fixtures) {
        expect(fixture.summary.public_id).toBe(fixture.character.public_id)
      }
    })

    it('summary.level matches character.level', () => {
      const fixtures = [humanFighterL1, draftClericL1, highElfWizardL1, variantHumanFighterL1, humanFighterL3, highElfWizardL2, halflingRogueL4]

      for (const fixture of fixtures) {
        expect(fixture.summary.level).toBe(fixture.character.level)
      }
    })

    it('summary.status matches character.status', () => {
      const fixtures = [humanFighterL1, draftClericL1, highElfWizardL1, variantHumanFighterL1, humanFighterL3, highElfWizardL2, halflingRogueL4]

      for (const fixture of fixtures) {
        expect(fixture.summary.status).toBe(fixture.character.status)
      }
    })

    it('stats ability scores match character ability scores', () => {
      const fixtures = [humanFighterL1, draftClericL1, highElfWizardL1, variantHumanFighterL1, humanFighterL3, highElfWizardL2, halflingRogueL4]

      for (const fixture of fixtures) {
        const abilities: Array<'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'> = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
        for (const ability of abilities) {
          expect(fixture.stats.ability_scores[ability].score).toBe(fixture.character.ability_scores[ability])
        }
      }
    })

    it('combat.armor_class matches character.armor_class', () => {
      const fixtures = [humanFighterL1, draftClericL1, highElfWizardL1, variantHumanFighterL1, humanFighterL3, highElfWizardL2, halflingRogueL4]

      for (const fixture of fixtures) {
        expect(fixture.stats.combat.armor_class).toBe(fixture.character.armor_class)
      }
    })

    it('combat.speed matches character.speed', () => {
      const fixtures = [humanFighterL1, draftClericL1, highElfWizardL1, variantHumanFighterL1, humanFighterL3, highElfWizardL2, halflingRogueL4]

      for (const fixture of fixtures) {
        expect(fixture.stats.combat.speed).toBe(fixture.character.speed)
      }
    })

    it('complete characters have zero pending choices', () => {
      const completeFixtures = [humanFighterL1, highElfWizardL1, variantHumanFighterL1]

      for (const fixture of completeFixtures) {
        if (fixture.character.status === 'complete') {
          expect(fixture.pendingChoices.choices).toHaveLength(0)
          expect(fixture.summary.pending_choices.total).toBe(0)
        }
      }
    })

    it('draft characters have pending choices', () => {
      const draftFixtures = [draftClericL1, halflingRogueL4]

      for (const fixture of draftFixtures) {
        if (fixture.character.status === 'draft') {
          expect(fixture.pendingChoices.choices.length).toBeGreaterThan(0)
          expect(fixture.summary.pending_choices.total).toBeGreaterThan(0)
        }
      }
    })
  })

  describe('D&D 5e Rules Validation', () => {
    it('ability score modifiers are correctly calculated', () => {
      // Modifier = floor((score - 10) / 2)
      const fixtures = [humanFighterL1, draftClericL1, highElfWizardL1, variantHumanFighterL1, humanFighterL3, highElfWizardL2, halflingRogueL4]

      for (const fixture of fixtures) {
        const abilities: Array<'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'> = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
        for (const ability of abilities) {
          const score = fixture.stats.ability_scores[ability].score
          const expectedModifier = Math.floor((score - 10) / 2)
          expect(fixture.stats.ability_scores[ability].modifier).toBe(expectedModifier)
        }
      }
    })

    it('passive perception is calculated correctly', () => {
      // Passive Perception = 10 + Perception modifier
      const fixtures = [humanFighterL1, draftClericL1]

      for (const fixture of fixtures) {
        const perceptionSkill = fixture.stats.skills.find(s => s.slug === 'perception')
        if (perceptionSkill) {
          const expectedPassive = 10 + perceptionSkill.modifier
          expect(fixture.stats.passive_scores.perception).toBe(expectedPassive)
        }
      }
    })

    it('initiative equals DEX modifier', () => {
      const fixtures = [humanFighterL1, draftClericL1, highElfWizardL1, variantHumanFighterL1, humanFighterL3, highElfWizardL2, halflingRogueL4]

      for (const fixture of fixtures) {
        expect(fixture.stats.combat.initiative).toBe(fixture.stats.ability_scores.DEX.modifier)
      }
    })

    it('spellcasters have spellcasting stats', () => {
      // Cleric and Wizard are spellcasters
      const spellcasters = [draftClericL1, highElfWizardL1, highElfWizardL2]

      for (const fixture of spellcasters) {
        expect(fixture.stats.spellcasting).not.toBeNull()
        expect(fixture.stats.spellcasting?.ability).toBeDefined()
        expect(fixture.stats.spellcasting?.spell_save_dc).toBeDefined()
        expect(fixture.stats.spellcasting?.spell_attack_bonus).toBeDefined()
      }
    })

    it('non-spellcasters have null spellcasting', () => {
      // Fighter and Rogue (at low levels) are not spellcasters
      const nonSpellcasters = [humanFighterL1, humanFighterL3, halflingRogueL4]

      for (const fixture of nonSpellcasters) {
        expect(fixture.stats.spellcasting).toBeNull()
      }
    })
  })
})
