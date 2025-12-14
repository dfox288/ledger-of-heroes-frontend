// app/types/party.ts

/**
 * Character as represented in party context
 */
export interface PartyCharacter {
  id: number
  public_id: string
  name: string
  class_name: string
  level: number
  portrait: { thumb: string } | null
  /** Other parties this character belongs to */
  parties?: { id: number, name: string }[]
}

/**
 * Party list item (from GET /parties)
 */
export interface PartyListItem {
  id: number
  name: string
  description: string | null
  character_count: number
  created_at: string
}

/**
 * Full party with characters (from GET /parties/:id)
 */
export interface Party extends PartyListItem {
  characters: PartyCharacter[]
}

/**
 * Create/update party request body
 */
export interface PartyCreateRequest {
  name: string
  description?: string | null
}

/**
 * Add character to party request body
 */
export interface PartyAddCharacterRequest {
  character_id: number
}
