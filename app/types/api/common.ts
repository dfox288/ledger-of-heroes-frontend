import type { components } from './generated'

/**
 * Common API types shared across entities
 *
 * These types extend or alias generated types from OpenAPI spec.
 */

/**
 * Source book reference
 *
 * Appears in: Spells, Items, Races, Classes, Backgrounds, Feats
 * Used for: Citation and attribution of game content
 *
 * @see {components['schemas']['EntitySourceResource']} for generated type
 */
export type Source = components['schemas']['EntitySourceResource']

/**
 * Ability score (STR, DEX, CON, INT, WIS, CHA)
 *
 * Used for: Modifiers, saving throws, skill checks
 *
 * @see {components['schemas']['AbilityScoreResource']} for generated type
 */
export type AbilityScore = components['schemas']['AbilityScoreResource']

/**
 * Skill reference
 *
 * Used in: Modifiers for skill-based bonuses/penalties
 *
 * @see {components['schemas']['SkillResource']} for generated type
 */
export type Skill = components['schemas']['SkillResource']

/**
 * Character modifier (stat bonuses, penalties, etc.)
 *
 * Used in: Races, Feats, Items
 * Supports both fixed values and player choices
 *
 * @see {components['schemas']['ModifierResource']} for generated type
 */
export type Modifier = components['schemas']['ModifierResource']

/**
 * Tag for categorization and filtering
 *
 * Used across: All entity types
 * Enables cross-entity searching and organization
 *
 * @see {components['schemas']['TagResource']} for generated type
 */
export type Tag = components['schemas']['TagResource']
