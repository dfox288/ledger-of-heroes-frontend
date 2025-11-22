/**
 * Common API types shared across entities
 *
 * These types represent data structures returned by the D&D 5e API
 * and are used across multiple entity types.
 */

/**
 * Source book reference
 *
 * Appears in: Spells, Items, Races, Classes, Backgrounds, Feats
 * Used for: Citation and attribution of game content
 */
export interface Source {
  code: string
  name: string
  pages: string
}

/**
 * Ability score (STR, DEX, CON, INT, WIS, CHA)
 *
 * Used for: Modifiers, saving throws, skill checks
 */
export interface AbilityScore {
  id: number
  code: string
  name: string
}

/**
 * Skill reference
 *
 * Used in: Modifiers for skill-based bonuses/penalties
 */
export interface Skill {
  id: number
  name: string
}

/**
 * Character modifier (stat bonuses, penalties, etc.)
 *
 * Used in: Races, Feats, Items
 * Supports both fixed values and player choices
 */
export interface Modifier {
  id: number
  modifier_category: string
  ability_score?: AbilityScore | null
  skill?: Skill | null
  value: string | number
  condition?: string | null
  is_choice: boolean
  choice_count: number | null
  choice_constraint: string | null
}

/**
 * Tag for categorization and filtering
 *
 * Used across: All entity types
 * Enables cross-entity searching and organization
 */
export interface Tag {
  id: number
  name: string
  slug: string
  type: string | null
}
