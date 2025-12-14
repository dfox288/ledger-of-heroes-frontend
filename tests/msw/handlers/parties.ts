/**
 * MSW handlers for party endpoints
 */
import { http, HttpResponse } from 'msw'
import type { PartyListItem, Party } from '~/types'
import type { EncounterMonster } from '~/types/dm-screen'
import {
  mockEncounterMonsters,
  goblinTemplate,
  bugbearTemplate,
  createEncounterMonster
} from '../fixtures/encounter-monsters'

const mockParties: PartyListItem[] = [
  {
    id: 1,
    name: 'Dragon Heist Campaign',
    description: 'Weekly Thursday game',
    character_count: 4,
    created_at: '2025-01-01T00:00:00Z'
  }
]

const mockParty: Party = {
  ...mockParties[0],
  characters: []
}

export const partyHandlers = [
  // List parties
  http.get('/api/parties', () => {
    return HttpResponse.json({ data: mockParties })
  }),

  // Get party
  http.get('/api/parties/:id', ({ params }) => {
    const id = Number(params.id)
    if (id === 1) {
      return HttpResponse.json({ data: mockParty })
    }
    return HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),

  // Create party
  http.post('/api/parties', async ({ request }) => {
    const body = await request.json() as { name: string, description?: string }
    return HttpResponse.json({
      data: {
        id: 99,
        name: body.name,
        description: body.description || null,
        character_count: 0,
        created_at: new Date().toISOString()
      }
    }, { status: 201 })
  }),

  // Update party
  http.put('/api/parties/:id', async ({ request }) => {
    const body = await request.json() as { name: string, description?: string }
    return HttpResponse.json({
      data: {
        id: 1,
        name: body.name,
        description: body.description || null,
        character_count: 4,
        created_at: '2025-01-01T00:00:00Z'
      }
    })
  }),

  // Delete party
  http.delete('/api/parties/:id', () => {
    return HttpResponse.json({ message: 'Party deleted' })
  }),

  // Add character to party
  http.post('/api/parties/:id/characters', () => {
    return HttpResponse.json({ message: 'Character added to party' }, { status: 201 })
  }),

  // Remove character from party
  http.delete('/api/parties/:id/characters/:characterId', () => {
    return HttpResponse.json({ message: 'Character removed from party' })
  }),

  // ============================================================================
  // Encounter Monster Endpoints
  // ============================================================================

  // List encounter monsters for a party
  http.get('/api/parties/:id/monsters', () => {
    return HttpResponse.json({ data: mockEncounterMonsters })
  }),

  // Add monster(s) to encounter
  http.post('/api/parties/:id/monsters', async ({ request }) => {
    const body = await request.json() as { monster_id: number, quantity: number }
    const quantity = body.quantity || 1

    // Select template based on monster_id (simplified mock logic)
    const template = body.monster_id === 42 ? goblinTemplate : bugbearTemplate
    const baseName = template.name

    // Find existing count for this monster type
    const existingCount = mockEncounterMonsters.filter(
      m => m.monster.name === baseName
    ).length

    const newMonsters: EncounterMonster[] = []
    for (let i = 0; i < quantity; i++) {
      const label = `${baseName} ${existingCount + i + 1}`
      const monster = createEncounterMonster(body.monster_id, template, label)
      newMonsters.push(monster)
      mockEncounterMonsters.push(monster)
    }

    return HttpResponse.json({ data: newMonsters }, { status: 201 })
  }),

  // Update monster instance (HP, label)
  http.patch('/api/parties/:id/monsters/:monsterId', async ({ params, request }) => {
    const monsterId = Number(params.monsterId)
    const body = await request.json() as { current_hp?: number, label?: string }

    const monster = mockEncounterMonsters.find(m => m.id === monsterId)
    if (!monster) {
      return HttpResponse.json({ error: 'Monster not found' }, { status: 404 })
    }

    if (body.current_hp !== undefined) {
      monster.current_hp = body.current_hp
    }
    if (body.label !== undefined) {
      monster.label = body.label
    }

    return HttpResponse.json({ data: monster })
  }),

  // Remove single monster instance
  http.delete('/api/parties/:id/monsters/:monsterId', ({ params }) => {
    const monsterId = Number(params.monsterId)
    const index = mockEncounterMonsters.findIndex(m => m.id === monsterId)

    if (index === -1) {
      return HttpResponse.json({ error: 'Monster not found' }, { status: 404 })
    }

    mockEncounterMonsters.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // Clear all monsters (end encounter)
  http.delete('/api/parties/:id/monsters', () => {
    mockEncounterMonsters.length = 0
    return HttpResponse.json({ success: true })
  })
]
