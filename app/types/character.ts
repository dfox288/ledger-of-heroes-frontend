// app/types/character.ts
/**
 * Character-related type definitions
 *
 * Types are derived from generated OpenAPI types where possible,
 * with local overrides for stricter typing or missing fields.
 */

import type { CharacterClass } from './api/entities'
import type { components } from './api/generated'

// =============================================================================
// Generated Type Aliases
// =============================================================================

/**
 * Character alignment values (D&D 5e standard alignments)
 *
 * Uses the alignment enum from the OpenAPI spec (CharacterStoreRequest).
 * The API defines all valid D&D 5e alignments including 'Unaligned'.
 */
export type CharacterAlignment = NonNullable<components['schemas']['CharacterStoreRequest']['alignment']>

/**
 * Character feature from API
 * @see CharacterFeatureResource in OpenAPI spec
 */
export type CharacterFeature = components['schemas']['CharacterFeatureResource']

/**
 * Character language from API
 * @see CharacterLanguageResource in OpenAPI spec
 */
export type CharacterLanguage = components['schemas']['CharacterLanguageResource']

/**
 * Character proficiency from API (skill or tool)
 * @see CharacterProficiencyResource in OpenAPI spec
 */
export type CharacterProficiency = components['schemas']['CharacterProficiencyResource']

/**
 * Character equipment item from API
 * @see CharacterEquipmentResource in OpenAPI spec
 */
export type CharacterEquipment = components['schemas']['CharacterEquipmentResource']

/**
 * Character spell from API
 * @see CharacterSpellResource in OpenAPI spec
 */
export type CharacterSpellFromAPI = components['schemas']['CharacterSpellResource']

/**
 * Extended CharacterSpell with compatibility aliases
 *
 * The API uses is_prepared/is_always_prepared, but some components
 * still use prepared/always_prepared. This type supports both.
 */
export interface CharacterSpell extends CharacterSpellFromAPI {
  /** @deprecated Use is_prepared instead */
  prepared?: boolean
  /** @deprecated Use is_always_prepared instead */
  always_prepared?: boolean
}

/**
 * Full character data from API
 * @see CharacterResource in OpenAPI spec
 */
export type Character = components['schemas']['CharacterResource']

/**
 * Character stats from /characters/{id}/stats endpoint
 * @see CharacterStatsResource in OpenAPI spec
 */
export type CharacterStatsFromAPI = components['schemas']['CharacterStatsResource']

// =============================================================================
// Extended Types (stricter than generated)
// =============================================================================

/**
 * Ability score codes used by the API
 */
export type AbilityScoreCode = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'

/**
 * Character stats with strongly-typed ability score keys
 *
 * Extends the generated type with stricter typing for ability_scores
 * and saving_throws (AbilityScoreCode keys instead of generic string).
 */
export interface CharacterStats extends Omit<CharacterStatsFromAPI, 'ability_scores' | 'saving_throws' | 'spellcasting'> {
  ability_scores: Record<AbilityScoreCode, { score: number | null, modifier: number | null }>
  saving_throws: Record<AbilityScoreCode, number | null>
  spellcasting: {
    ability: AbilityScoreCode
    ability_modifier: number
    spell_save_dc: number
    spell_attack_bonus: number
  } | null
}

// =============================================================================
// Local Types (not in OpenAPI spec)
// =============================================================================

/**
 * Ability scores for character creation (camelCase for form binding)
 */
export interface AbilityScores {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

/**
 * Character class entry for multiclass support
 * Stores class info and cached full data for UI
 */
export interface CharacterClassEntry {
  classId: number
  subclassId: number | null
  level: number
  isPrimary: boolean
  order: number
  /** Cached full class data for UI display */
  classData: CharacterClass | null
  /** Cached subclass data if selected */
  subclassData?: CharacterClass | null
}

/**
 * API response format for ability scores
 */
export interface AbilityScoresResponse {
  STR: number | null
  DEX: number | null
  CON: number | null
  INT: number | null
  WIS: number | null
  CHA: number | null
}

/**
 * Validation status from Character API
 */
export interface CharacterValidationStatus {
  is_complete: boolean
  missing: string[]
}

/**
 * Character summary (list view)
 */
export interface CharacterSummary {
  id: number
  name: string
  level: number
  is_complete: boolean
  race: { id: number, name: string, slug: string } | null
  class: { id: number, name: string, slug: string } | null
  background: { id: number, name: string, slug: string } | null
}

/**
 * Movement speeds from race
 */
export interface CharacterSpeeds {
  walk: number | null
  fly: number | null
  swim: number | null
  climb: number | null
}

/**
 * Skill with computed modifier for character sheet display
 */
export interface CharacterSkill {
  id: number
  name: string
  slug: string
  ability_code: AbilityScoreCode
  modifier: number
  proficient: boolean
  expertise: boolean
}

/**
 * Saving throw with computed values for character sheet display
 */
export interface CharacterSavingThrow {
  ability: AbilityScoreCode
  modifier: number
  proficient: boolean
}

/**
 * Skill reference data from /skills endpoint
 */
export interface SkillReference {
  id: number
  name: string
  slug: string
  ability_code: AbilityScoreCode
}

/**
 * Wizard step definition
 */
export interface WizardStep {
  id: number
  name: string
  label: string
  icon: string
  isComplete: boolean
  isActive: boolean
  isDisabled: boolean
}
