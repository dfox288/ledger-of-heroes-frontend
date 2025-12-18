/**
 * DM Screen API Types
 *
 * Types for the party stats endpoint used by the DM Screen feature.
 * Based on GET /api/v1/parties/{id}/stats response.
 */

import type { Counter } from '~/types/character'

export interface CharacterHitPoints {
  current: number
  max: number
  temp: number
}

export interface DmScreenSpeeds {
  walk: number
  fly: number | null
  swim: number | null
  climb: number | null
}

export interface CharacterDeathSaves {
  successes: number
  failures: number
}

export interface CharacterConcentration {
  active: boolean
  spell: string | null
}

export interface CharacterCombat {
  initiative_modifier: number
  speeds: DmScreenSpeeds
  death_saves: CharacterDeathSaves
  concentration: CharacterConcentration
}

export interface CharacterSenses {
  passive_perception: number
  passive_investigation: number
  passive_insight: number
  darkvision: number | null
}

export interface CharacterCapabilities {
  languages: string[]
  size: string
  tool_proficiencies: string[]
}

export interface CharacterArmor {
  name: string
  type: string
  stealth_disadvantage: boolean
}

export interface DmScreenWeapon {
  name: string
  damage: string
  range: string | null
}

export interface DmScreenEquipment {
  armor: CharacterArmor | null
  weapons: DmScreenWeapon[]
  shield: boolean
}

export interface CharacterSavingThrows {
  STR: number
  DEX: number
  CON: number
  INT: number
  WIS: number
  CHA: number
}

export interface DmScreenCondition {
  name: string
  slug: string
  level: number | null
}

export interface DmScreenSpellSlotLevel {
  current: number
  max: number
}

export type DmScreenSpellSlots = Record<string, DmScreenSpellSlotLevel>

export interface DmScreenCharacter {
  id: number
  public_id: string
  name: string
  total_level: number
  class_name: string
  hit_points: CharacterHitPoints
  armor_class: number
  proficiency_bonus: number
  combat: CharacterCombat
  senses: CharacterSenses
  capabilities: CharacterCapabilities
  equipment: DmScreenEquipment
  saving_throws: CharacterSavingThrows
  conditions: DmScreenCondition[]
  spell_slots: DmScreenSpellSlots
  counters: Counter[]
}

export interface DmScreenPartySummary {
  all_languages: string[]
  darkvision_count: number
  no_darkvision: string[]
  has_healer: boolean
  healers: string[]
  has_detect_magic: boolean
  has_dispel_magic: boolean
  has_counterspell: boolean
}

export interface DmScreenPartyInfo {
  id: number
  name: string
  description: string | null
}

export interface DmScreenPartyStats {
  party: DmScreenPartyInfo
  characters: DmScreenCharacter[]
  party_summary: DmScreenPartySummary
}

// ============================================================================
// Encounter Monster Types
// ============================================================================

// Monster action for quick combat reference
export interface EncounterMonsterAction {
  name: string
  damage: string | null
  attack_bonus: number | null
  description: string
  action_type: string
  recharge: string | null
  sort_order: number
}

// Nested monster data from compendium
export interface EncounterMonsterData {
  name: string
  slug: string
  armor_class: number
  hit_points: {
    average: number
    formula: string
  }
  speed: {
    walk: number | null
    fly: number | null
    swim: number | null
    climb: number | null
  }
  challenge_rating: string
  actions: EncounterMonsterAction[]
}

// Monster instance in an encounter
export interface EncounterMonster {
  id: number
  monster_id: number
  label: string
  current_hp: number
  max_hp: number
  monster: EncounterMonsterData
}

// Combatant union type for initiative tracking
export type Combatant
  = | { type: 'character', key: string, data: DmScreenCharacter }
    | { type: 'monster', key: string, data: EncounterMonster }

// ============================================================================
// Encounter Preset Types
// ============================================================================

/**
 * Monster entry in a preset (just ID and quantity, no instance data)
 */
export interface PresetMonster {
  monster_id: number
  monster_name: string
  quantity: number
  challenge_rating: string
}

/**
 * Saved encounter preset for quick loading
 * Stored via backend API at /parties/{party}/encounter-presets
 */
export interface EncounterPreset {
  id: number
  name: string
  monsters: PresetMonster[]
  created_at: string
  updated_at: string
}
