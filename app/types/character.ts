// app/types/character.ts

import type { CharacterClass } from './api/entities'
import type { components } from './api/generated'

/**
 * Ability scores for character creation
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
 * Character alignment values (D&D 5e standard alignments)
 *
 * Uses the alignment enum from the OpenAPI spec (CharacterStoreRequest).
 * The API defines all valid D&D 5e alignments including 'Unaligned'.
 *
 * @see {components['schemas']['CharacterStoreRequest']['alignment']} for API type
 */
export type CharacterAlignment = NonNullable<components['schemas']['CharacterStoreRequest']['alignment']>

/**
 * Ability score codes used by the API
 */
export type AbilityScoreCode = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'

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
 * Full character data from API
 */
export interface Character {
  id: number
  name: string
  level: number
  experience_points: number
  is_complete: boolean
  validation_status: CharacterValidationStatus
  ability_scores: AbilityScoresResponse
  modifiers: AbilityScoresResponse
  proficiency_bonus: number
  max_hit_points: number | null
  current_hit_points: number | null
  temp_hit_points: number
  armor_class: number | null
  alignment: CharacterAlignment | null
  /** Walking speed in feet (from race) */
  speed: number | null
  /** Size category name (from race) */
  size: string | null
  /** All movement types (from race) */
  speeds: CharacterSpeeds | null
  /** Whether character currently has inspiration (DM awarded) */
  has_inspiration: boolean
  race: { id: number, name: string, slug: string } | null
  /** @deprecated Legacy field for primary class. Use classes array instead */
  class: { id: number, name: string, slug: string } | null
  /** Multiclass support - array of character's classes */
  classes: components['schemas']['CharacterClassPivotResource'][]
  background: { id: number, name: string, slug: string } | null
  created_at: string
  updated_at: string
}

/**
 * Character stats from /characters/{id}/stats endpoint
 */
export interface CharacterStats {
  character_id: number
  level: number
  proficiency_bonus: number
  ability_scores: Record<AbilityScoreCode, { score: number, modifier: number }>
  saving_throws: Record<AbilityScoreCode, number>
  armor_class: number | null
  hit_points: {
    max: number | null
    current: number | null
    temporary: number
  }
  initiative_bonus: number
  passive_perception: number
  spellcasting: {
    ability: AbilityScoreCode
    spell_save_dc: number
    spell_attack_bonus: number
  } | null
  spell_slots: Record<string, number>
  preparation_limit: number | null
  prepared_spell_count: number
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
 * Character feature from API
 */
export interface CharacterFeature {
  id: number
  source: 'class' | 'race' | 'background'
  level_acquired: number
  feature_type: string
  uses_remaining: number | null
  max_uses: number | null
  has_limited_uses: boolean
  feature: {
    id: number
    name: string
    description: string
    category: string | null
  }
}

/**
 * Character equipment item from API
 */
export interface CharacterEquipment {
  id: number
  item: {
    id: number
    name: string
    slug: string
  } | null
  quantity: number
  equipped: boolean
  description: string | null
}

/**
 * Character language from API
 */
export interface CharacterLanguage {
  id: number
  source: string
  language: {
    id: number
    name: string
    slug: string
    script: string
  }
}

/**
 * Character spell from API
 */
export interface CharacterSpell {
  id: number
  spell: {
    id: number
    name: string
    slug: string
    level: number
    school: string
  }
  prepared: boolean
  always_prepared: boolean
  source: string
}

/**
 * Character proficiency from API (skill or tool)
 */
export interface CharacterProficiency {
  id: number
  source: string
  expertise: boolean
  skill?: {
    id: number
    name: string
    slug: string
    ability_code: AbilityScoreCode
  }
  proficiency_type?: {
    id: number
    name: string
    slug: string
    category: string
  }
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
