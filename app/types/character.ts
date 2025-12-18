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
 *
 * Extended with feat-specific fields not yet in generated types:
 * - prerequisite: Feat prerequisites (e.g., "Proficiency with heavy armor")
 *
 * @see CharacterFeatureResource in OpenAPI spec
 * @see Issue #619 - Features endpoint enrichment
 */
export type CharacterFeature = Omit<components['schemas']['CharacterFeatureResource'], 'feature'> & {
  feature: components['schemas']['CharacterFeatureResource']['feature'] & {
    /** Feat prerequisite (e.g., "Str 13", "Proficiency with heavy armor") */
    prerequisite?: string | null
    /** Feat slug for linking to compendium */
    slug?: string
  } | null
}

/**
 * Selected optional feature (infusion, invocation, metamagic, etc.)
 *
 * Returned in `feature_selections` on CharacterResource.
 * These are user-selected class features like Artificer infusions,
 * Warlock invocations, Sorcerer metamagic, etc.
 *
 * @see Issue #710 - Backend implementation
 * @see Issue #712 - Frontend display
 */
export interface FeatureSelection {
  /** Feature display name */
  feature: string
  /** Feature slug for linking (e.g., "tce:armor-of-magical-strength") */
  feature_slug: string
  /** Feature type for grouping (e.g., "artificer_infusion", "eldritch_invocation") */
  feature_type: string
  /** Class name that grants this feature */
  class: string
  /** Class slug (e.g., "erlw:artificer") */
  class_slug: string
  /** Subclass name if granted by subclass */
  subclass_name: string | null
  /** Level when this feature was acquired */
  level_acquired: number
  /** Whether this feature is orphaned (class no longer supports it) */
  is_dangling: boolean
}

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
 * Extended with is_attuned field from expanded equipment slots (PR #154)
 * @see CharacterEquipmentResource in OpenAPI spec
 */
export type CharacterEquipment = components['schemas']['CharacterEquipmentResource'] & {
  /** Attunement status for magic items (separated from location in expanded slot system) */
  is_attuned?: boolean
  /** Currency items (gold, silver, etc.) - should be filtered from equipment display */
  is_currency?: boolean
}

/**
 * Character spell from API
 * @see CharacterSpellResource in OpenAPI spec
 */
export type CharacterSpellFromAPI = components['schemas']['CharacterSpellResource']

/**
 * Character spell data from API
 *
 * Extended with class_slug for multiclass spellcasting support.
 * The class_slug field identifies which class granted the spell.
 *
 * @see CharacterSpellResource in OpenAPI spec
 * @see Issue #631 - Multiclass spellcasting support
 */
export type CharacterSpell = CharacterSpellFromAPI & {
  /**
   * Class slug identifying which class granted this spell
   * e.g., "phb:wizard", "phb:cleric"
   * Used for filtering spells by class in multiclass UI
   */
  class_slug: string | null
}

/**
 * Full character data from API
 *
 * Extends CharacterResource with corrected types for fields where
 * the OpenAPI spec differs from actual API responses.
 *
 * @see CharacterResource in OpenAPI spec
 */
export type Character = Omit<components['schemas']['CharacterResource'], 'counters' | 'senses'> & {
  /**
   * Character senses from race (Darkvision, Blindsight, etc.)
   * Override: Generated type has slug/range_feet, API returns type/range
   * @see Issue #648
   */
  senses?: CharacterSense[]

  /**
   * Class resource counters (Rage, Ki Points, Bardic Inspiration, etc.)
   * Override: Generated type has string, API returns Counter[]
   * @see Issue #632
   */
  counters?: Counter[]
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
 * Preparation method for spellcasting classes
 *
 * Determines UI behavior for spell management:
 * - 'known': Spells permanently known, no preparation needed (Bard, Sorcerer, Warlock, Ranger)
 * - 'spellbook': Wizard-style (learns into book, prepares subset)
 * - 'prepared': Prepares from full class list daily (Cleric, Druid, Paladin)
 * - 'mixed': Multiclass with different methods (top-level only, use per-class for UI)
 * - null: Non-spellcaster
 *
 * @see Issue #676 - Spell preparation UI differentiation
 */
export type PreparationMethod = 'known' | 'spellbook' | 'prepared' | 'mixed' | null

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
 * Condition disadvantage trait (disadvantage on saves against conditions)
 */
export interface ConditionDisadvantage {
  /** Condition name (e.g., "Stunned", "Paralyzed") */
  condition: string
  /** Effect description (e.g., "Disadvantage on saving throws") */
  effect: string
  /** Source of the trait (e.g., "Sunlight Sensitivity", "Curse") */
  source: string
}

/**
 * Active condition on a character (e.g., Poisoned, Exhaustion level 2)
 */
export interface CharacterCondition {
  id: number
  condition: {
    id: number
    name: string
    slug: string
  }
  condition_slug: string
  is_dangling: boolean
  level: number | null
  source: string | null
  duration: string | null
  is_exhaustion: boolean
  exhaustion_warning: string | null
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
 * Per-class spellcasting information
 *
 * For multiclass characters, each spellcasting class has its own stats.
 * API returns spellcasting keyed by class slug (e.g., "phb:wizard").
 *
 * @see Issue #631 - Multiclass spellcasting support
 */
export interface ClassSpellcastingInfo {
  /** Spellcasting ability code (INT, WIS, CHA, etc.) */
  ability: AbilityScoreCode
  /** Ability modifier used for spellcasting */
  ability_modifier: number
  /** Spell save DC = 8 + proficiency + ability modifier */
  spell_save_dc: number
  /** Spell attack bonus = proficiency + ability modifier */
  spell_attack_bonus: number
  /**
   * Preparation method for this class's spellcasting
   * @see Issue #676
   */
  preparation_method?: PreparationMethod
}

/**
 * Character stats with strongly-typed ability score keys
 *
 * Extends the generated type with stricter typing for ability_scores
 * and saving_throws (AbilityScoreCode keys instead of generic string).
 *
 * Note: spellcasting is keyed by class slug (e.g., "phb:wizard") to support
 * multiclass characters with different spellcasting abilities per class.
 *
 * @see Issue #631 - Multiclass spellcasting support
 */
export interface CharacterStats extends Omit<CharacterStatsFromAPI, 'ability_scores' | 'saving_throws' | 'spellcasting' | 'weapons' | 'spell_slots'> {
  ability_scores: Record<AbilityScoreCode, { score: number | null, modifier: number | null }>
  saving_throws: Record<AbilityScoreCode, { modifier: number | null, proficient: boolean, total: number | null } | null>
  /**
   * Spellcasting stats keyed by class slug
   *
   * Single-class caster: { "phb:wizard": { ability: "INT", ... } }
   * Multiclass caster: { "phb:wizard": {...}, "phb:cleric": {...} }
   * Non-caster: null or empty object
   */
  spellcasting: Record<string, ClassSpellcastingInfo> | null
  damage_resistances: DamageDefense[]
  damage_immunities: DamageDefense[]
  damage_vulnerabilities: DamageDefense[]
  condition_advantages: ConditionAdvantage[]
  condition_disadvantages: ConditionDisadvantage[]
  condition_immunities: ConditionImmunity[]
  // Override weapons to use our local type with optional (not all responses include it)
  weapons?: CharacterWeapon[]
  // Override spell_slots - generated type has incorrect Record<string, never> for slots
  // Use our local SpellSlotsResponse type which has proper slot structure
  spell_slots: SpellSlotsResponse | Record<string, number> | number[] | null
}

// =============================================================================
// Local Types (not in OpenAPI spec)
// =============================================================================

/**
 * Character sense (Darkvision, Blindsight, etc.)
 * Matches EntitySenseResource from API
 * @see Issue #648
 */
export interface CharacterSense {
  /** Sense type identifier (e.g., "darkvision", "blindsight") */
  type: string
  /** Display name (e.g., "Darkvision", "Blindsight") */
  name: string
  /** Range in feet */
  range: number
  /** Whether the sense has limitations */
  is_limited: boolean
  /** Additional notes about the sense */
  notes: string | null
}

/**
 * Attunement slot tracking for magic items
 * @see Issue #649
 */
export interface AttunementSlots {
  /** Number of attunement slots currently in use */
  used: number
  /** Maximum attunement slots (typically 3, can be increased by class features) */
  max: number
}

/**
 * Class resource counter (Rage, Ki Points, Bardic Inspiration, etc.)
 *
 * Updated for counter system refactor (#725):
 * - Counters now stored in dedicated table instead of embedded in features
 * - Uses numeric `id` for API routing (slug removed)
 * - `source_slug` identifies the source entity (was `source`)
 *
 * @see Issue #632 - Original implementation
 * @see Issue #725 - Counter system refactor
 */
export interface Counter {
  id: number
  name: string
  current: number
  max: number
  reset_on: 'short_rest' | 'long_rest' | null
  source_type: string
  source_slug: string
  unlimited: boolean
}

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
  /** Character portrait media */
  portrait: {
    original: string
    thumb: string
    medium: string
    is_uploaded: boolean
  } | null
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
 * Spell slot state for play mode tracking
 * Tracks both total and spent for each level
 */
export interface SpellSlotState {
  level: number
  total: number
  spent: number
  slotType: 'standard' | 'pact_magic'
}

/**
 * API response from PATCH spell-slots endpoint
 */
export interface SpellSlotUpdateResponse {
  data: {
    level: number
    total: number
    spent: number
    available: number
    slot_type: 'standard' | 'pact_magic'
  }
}

/**
 * Single spell slot level from /stats endpoint (new format)
 * @see Issue #618
 */
export interface SpellSlotLevel {
  total: number
  spent: number
  available: number
}

/**
 * Pact magic slots for Warlocks from /stats endpoint (new format)
 * @see Issue #618
 */
export interface PactMagicSlots {
  level: number
  total: number
  spent: number
  available: number
}

/**
 * Per-class preparation limit for multiclass spellcasters
 *
 * Multiclass characters have separate preparation limits per class:
 * - Wizard: level + INT mod
 * - Cleric: level + WIS mod
 *
 * @see Issue #631 - Multiclass spellcasting support
 * @see Issue #715 - Per-class preparation limits
 */
export interface ClassPreparationLimit {
  /** Maximum spells this class can prepare */
  limit: number
  /** Currently prepared spells for this class */
  prepared: number
}

/**
 * Spell slots response from /spell-slots endpoint
 *
 * Breaking change from backend PR #184:
 * - Old format: { "1": 4, "2": 3 } (level -> total)
 * - New format: { slots: { "1": { total, spent, available } }, pact_magic: ... }
 *
 * Extended with per-class preparation limits for multiclass support:
 * - preparation_limit: Combined total for single-class/multiclass
 * - preparation_limits: Per-class breakdown (e.g., { "phb:wizard": { limit: 5, prepared: 3 } })
 *
 * @see Issue #618
 * @see Issue #631 - Multiclass spellcasting support
 */
export interface SpellSlotsResponse {
  slots: Record<string, SpellSlotLevel>
  pact_magic: PactMagicSlots | null
  /** Combined preparation limit (all classes) */
  preparation_limit: number | null
  /** Total prepared count across all classes */
  prepared_count: number
  /** Per-class preparation limits (for multiclass spellcasters) */
  preparation_limits?: Record<string, ClassPreparationLimit>
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
  /** Rogue's Reliable Talent - treat d20 rolls of 9 or lower as 10 for proficient skills */
  has_reliable_talent: boolean
  /** Minimum d20 roll (e.g., 10 for Reliable Talent/Silver Tongue), null if no minimum */
  minimum_roll: number | null
  /** Guaranteed minimum total result (minimum_roll + modifier), null if no minimum */
  minimum_total: number | null
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
  ability_score: {
    id: number
    code: AbilityScoreCode
    name: string
  }
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

/**
 * Weapon data from character stats endpoint
 * Used in Battle Tab for attack/damage display
 */
export interface CharacterWeapon {
  /** Weapon name (e.g., "Longbow", "Shortsword") */
  name: string
  /** Damage dice (e.g., "1d8", "2d6") */
  damage_dice: string
  /** Flat attack bonus from magic/features */
  attack_bonus: number
  /** Flat damage bonus from magic/features */
  damage_bonus: number
  /** Ability used for attack (STR or DEX typically) */
  ability_used: AbilityScoreCode
  /** Whether character is proficient with this weapon */
  is_proficient: boolean
}

/**
 * Character XP data from /characters/{id}/xp endpoint
 * @see Issue #653 - XP progress display
 */
export interface CharacterXpData {
  /** Current experience points */
  experience_points: number
  /** Current character level */
  level: number
  /** XP threshold for next level (null at max level) */
  next_level_xp: number | null
  /** XP remaining until next level */
  xp_to_next_level: number
  /** Progress percentage toward next level (0-100) */
  xp_progress_percent: number
  /** Whether character is at max level (20) */
  is_max_level: boolean
}
