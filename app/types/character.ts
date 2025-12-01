// app/types/character.ts

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
  race: { id: number, name: string, slug: string } | null
  class: { id: number, name: string, slug: string } | null
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
