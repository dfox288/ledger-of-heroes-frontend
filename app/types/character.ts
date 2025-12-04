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
 */
export type CharacterAlignment
  = 'Lawful Good' | 'Neutral Good' | 'Chaotic Good'
    | 'Lawful Neutral' | 'True Neutral' | 'Chaotic Neutral'
    | 'Lawful Evil' | 'Neutral Evil' | 'Chaotic Evil'
    | 'Unaligned'

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
  /** Whether character currently has inspiration */
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
  saving_throws: Record<AbilityScoreCode, { modifier: number, proficient: boolean }>
  armor_class: number | null
  hit_points: {
    max: number | null
    current: number | null
    temporary: number
  }
  spellcasting: {
    ability: AbilityScoreCode
    save_dc: number
    attack_bonus: number
  } | null
  spell_slots: Record<string, number>
  preparation_limit: number | null
  prepared_spell_count: number
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
