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
 * Character note from API
 * @see CharacterNoteResource in OpenAPI spec
 */
export type CharacterNote = components['schemas']['CharacterNoteResource']

/**
 * Character notes grouped by category from API
 * @see CharacterNotesGroupedResource in OpenAPI spec
 */
export type CharacterNotesGrouped = components['schemas']['CharacterNotesGroupedResource']

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
 * Full character data from API with public_id
 *
 * The base CharacterResource is extended with public_id which is used
 * for URL-safe, human-readable character identifiers.
 *
 * @see CharacterResource in OpenAPI spec
 */
export type Character = components['schemas']['CharacterResource'] & {
  /**
   * URL-safe, human-readable character identifier
   * Format: {adjective}-{noun}-{suffix} (e.g., "shadow-warden-q3x9")
   * Used in URLs instead of numeric ID for better UX
   */
  public_id: string
}

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
 * Damage defense trait (resistance, immunity, vulnerability)
 */
export interface DamageDefense {
  /** Damage type (e.g., "Poison", "Fire") */
  type: string
  /** Optional conditional text (e.g., "from nonmagical attacks") */
  condition: string | null
  /** Source of the trait (e.g., "Dwarf", "Red Dragon") */
  source: string
}

/**
 * Condition advantage trait (advantage on saves against conditions)
 */
export interface ConditionAdvantage {
  /** Condition name (e.g., "Poisoned", "Charmed") */
  condition: string
  /** Effect description (e.g., "Advantage on saving throws") */
  effect: string
  /** Source of the trait (e.g., "Dwarf", "Elf") */
  source: string
}

/**
 * Condition immunity trait (immune to specific conditions)
 */
export interface ConditionImmunity {
  /** Condition name (e.g., "Poisoned", "Charmed") */
  condition: string
  /** Effect description (e.g., "Immune to condition") */
  effect: string
  /** Source of the trait (e.g., "Dwarf", "Elf") */
  source: string
}

/**
 * Skill advantage trait (advantage on skill checks)
 *
 * Note: Not in OpenAPI spec yet. Type defined manually based on API response.
 * @see https://github.com/dfox288/ledger-of-heroes/issues/433
 */
export interface SkillAdvantage {
  /** Skill name (e.g., "Deception", "Performance") */
  skill: string
  /** Skill slug for matching (e.g., "deception", "performance") */
  skill_slug: string
  /** Optional condition text (e.g., "related to stonework"). Null = unconditional. */
  condition: string | null
  /** Source of the advantage (e.g., "Actor", "Stonecunning") */
  source: string
}

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
  damage_resistances: DamageDefense[]
  damage_immunities: DamageDefense[]
  damage_vulnerabilities: DamageDefense[]
  condition_advantages: ConditionAdvantage[]
  condition_immunities: ConditionImmunity[]
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
 *
 * Note: Uses slug-based references for portability (see #318)
 * The API returns both the slug reference AND resolved data (or null if dangling)
 */
export interface CharacterClassEntry {
  /** Full slug reference (e.g., "phb:fighter") - always present */
  classSlug: string
  /** Full slug reference for subclass (e.g., "phb:champion") */
  subclassSlug: string | null
  level: number
  isPrimary: boolean
  order: number
  /** Indicates if the class reference couldn't be resolved */
  isDangling?: boolean
  /** Cached full class data for UI display (null if dangling) */
  classData: CharacterClass | null
  /** Cached subclass data if selected (null if dangling) */
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
 *
 * Note: Uses slug-based references for portability (see #318)
 * Entity data may be null if the reference is dangling (sourcebook removed)
 */
export interface CharacterSummary {
  id: number
  public_id: string
  name: string
  level: number
  is_complete: boolean
  /** Resolved race data (null if dangling) */
  race: { id: number, name: string, slug: string } | null
  /** Race slug reference (always present if race was set) */
  race_slug: string | null
  /** Indicates if race reference couldn't be resolved */
  race_is_dangling?: boolean
  /** Resolved primary class data (null if dangling) */
  class: { id: number, name: string, slug: string } | null
  /** Resolved background data (null if dangling) */
  background: { id: number, name: string, slug: string } | null
  /** Background slug reference (always present if background was set) */
  background_slug: string | null
  /** Indicates if background reference couldn't be resolved */
  background_is_dangling?: boolean
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
 * Character currency (coin purse)
 */
export interface CharacterCurrency {
  pp: number
  gp: number
  ep: number
  sp: number
  cp: number
}

/**
 * Standard spell slots by level
 */
export interface StandardSpellSlots {
  '1st': number
  '2nd': number
  '3rd': number
  '4th': number
  '5th': number
  '6th': number
  '7th': number
  '8th': number
  '9th': number
}

/**
 * Pact magic slots (Warlock)
 */
export interface PactSpellSlots {
  slots: number
  level: number
}

/**
 * Character spell slots structure
 */
export interface CharacterSpellSlots {
  standard: StandardSpellSlots
  pact: PactSpellSlots | null
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

// =============================================================================
// Level-Up Types
// =============================================================================

/**
 * Result from level-up API call
 *
 * Returned by POST /characters/{id}/classes/{classSlug}/level-up
 */
export interface LevelUpResult {
  previous_level: number
  new_level: number
  hp_increase: number
  new_max_hp: number
  features_gained: Array<{
    id: number
    name: string
    description: string | null
  }>
  spell_slots: Record<string, number>
  asi_pending: boolean
  hp_choice_pending: boolean
}

/**
 * Level-up wizard step definition
 *
 * Similar to WizardStep but with dynamic visibility based on level-up result
 */
export interface LevelUpStep {
  name: string
  label: string
  icon: string
  visible: () => boolean
  shouldSkip?: () => boolean
}
