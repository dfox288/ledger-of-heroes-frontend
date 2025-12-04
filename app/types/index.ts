/**
 * Centralized type exports
 *
 * Import types using: import type { Source, AbilityScore } from '~/types'
 *
 * This barrel file provides a single import point for all shared types,
 * making it easy to use types across the application.
 */

// API types
// Generated API types (for taxonomy pages)
import type { components } from './api/generated'

export type { Source, EntitySource, AbilityScore, Modifier, Tag } from './api/common'
export type { Spell, Item, Race, CharacterClass, Background, Feat, Monster, Rarity, ArmorType, MonsterType, Alignment } from './api/entities'
export type Condition = components['schemas']['ConditionResource']
export type DamageType = components['schemas']['DamageTypeResource']
export type ItemType = components['schemas']['ItemTypeResource']
export type Language = components['schemas']['LanguageResource']
export type ProficiencyType = components['schemas']['ProficiencyTypeResource']
export type Size = components['schemas']['SizeResource']
export type Skill = components['schemas']['SkillResource']
export type SpellSchool = components['schemas']['SpellSchoolResource']
export type SpellEffect = components['schemas']['SpellEffectResource']
export type SpellSavingThrow = components['schemas']['SavingThrowResource']
export type CharacterSpell = components['schemas']['CharacterSpellResource']
export type { components }

// Search types
export type { SearchResult, SearchResultData, EntityType, SearchOptions, SearchEntity, Class } from './search'

// Character types
export * from './character'

// Language choices types
export * from './languageChoices'

// API Response types
export interface ApiListResponse<T = unknown> {
  data: T[]
  meta?: {
    total: number
    from: number
    to: number
    current_page: number
    last_page: number
    per_page: number
  }
}

export interface ApiSingleResponse<T = unknown> {
  data: T
}
