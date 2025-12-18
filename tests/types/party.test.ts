// tests/types/party.test.ts
import { describe, it, expect } from 'vitest'
import type { Party, PartyCharacter, PartyListItem } from '~/types'

describe('Party Types', () => {
  it('has correct Party shape', () => {
    const party: Party = {
      id: 1,
      name: 'Dragon Heist Campaign',
      description: 'Weekly Thursday game',
      character_count: 4,
      characters: [],
      created_at: '2025-01-01T00:00:00Z'
    }
    expect(party.id).toBe(1)
    expect(party.name).toBe('Dragon Heist Campaign')
  })

  it('has correct PartyCharacter shape', () => {
    const character: PartyCharacter = {
      id: 1,
      public_id: 'brave-falcon-x7Kp',
      name: 'Thorin Ironforge',
      class_name: 'Fighter',
      total_level: 5,
      portrait: { thumb: '/images/portrait.jpg' },
      parties: [{ id: 1, name: 'Dragon Heist' }]
    }
    expect(character.public_id).toBe('brave-falcon-x7Kp')
  })

  it('has correct PartyListItem shape', () => {
    const item: PartyListItem = {
      id: 1,
      name: 'Dragon Heist',
      description: null,
      character_count: 4,
      created_at: '2025-01-01T00:00:00Z'
    }
    expect(item.character_count).toBe(4)
  })
})
