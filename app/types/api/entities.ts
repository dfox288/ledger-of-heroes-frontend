import type { Source } from './common'

/**
 * Spell entity from D&D 5e API
 *
 * Used in: SpellCard, spell detail pages, tests
 * API endpoint: /api/v1/spells
 */
export interface Spell {
  id: number
  name: string
  slug: string
  level: number
  school?: {
    id: number
    code: string
    name: string
  }
  casting_time: string
  range: string
  description: string
  is_ritual: boolean
  needs_concentration: boolean
  sources?: Source[]
}

/**
 * Item entity from D&D 5e API
 *
 * Used in: ItemCard, item detail pages, tests
 * API endpoint: /api/v1/items
 */
export interface Item {
  id: number
  name: string
  slug: string
  rarity: string
  item_type?: {
    id: number
    name: string
  }
  is_magic: boolean
  requires_attunement: boolean
  cost_cp?: number
  weight?: number
  description?: string
  sources?: Source[]
}
