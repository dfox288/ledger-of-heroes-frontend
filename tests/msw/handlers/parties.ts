/**
 * MSW handlers for party endpoints
 */
import { http, HttpResponse } from 'msw'
import type { PartyListItem, Party } from '~/types'

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
  })
]
