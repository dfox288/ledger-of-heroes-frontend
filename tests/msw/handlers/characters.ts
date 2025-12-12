/**
 * Character API Handlers
 *
 * MSW handlers for character-related endpoints.
 * These intercept requests to /api/characters/* and return fixture data.
 */

import { http, HttpResponse } from 'msw'
import { humanFighterL1 } from '../fixtures/characters/human-fighter-l1'

// Base URL for API requests (matches Nitro server routes)
const API_BASE = '/api'

export const characterHandlers = [
  // GET /api/characters - List all characters
  http.get(`${API_BASE}/characters`, () => {
    return HttpResponse.json({
      data: [humanFighterL1.character],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 1
      }
    })
  }),

  // POST /api/characters - Create a new character
  http.post(`${API_BASE}/characters`, async ({ request }) => {
    const body = await request.json() as { name?: string }
    return HttpResponse.json({
      data: {
        id: 999,
        public_id: 'test-character-abc1',
        name: body.name || 'New Character',
        level: 1,
        status: 'draft'
      }
    }, { status: 201 })
  }),

  // GET /api/characters/:id - Get character details
  http.get(`${API_BASE}/characters/:id`, ({ params }) => {
    const { id } = params
    // Return the fixture character (in real tests, you'd look up by ID)
    if (id === humanFighterL1.character.public_id || id === String(humanFighterL1.character.id)) {
      return HttpResponse.json({ data: humanFighterL1.character })
    }
    return HttpResponse.json({ error: 'Character not found' }, { status: 404 })
  }),

  // PATCH /api/characters/:id - Update character
  http.patch(`${API_BASE}/characters/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      data: {
        ...humanFighterL1.character,
        ...body
      }
    })
  }),

  // DELETE /api/characters/:id - Delete character
  http.delete(`${API_BASE}/characters/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // GET /api/characters/:id/stats - Character stats
  http.get(`${API_BASE}/characters/:id/stats`, () => {
    return HttpResponse.json({ data: humanFighterL1.stats })
  }),

  // GET /api/characters/:id/summary - Character summary
  http.get(`${API_BASE}/characters/:id/summary`, () => {
    return HttpResponse.json({ data: humanFighterL1.summary })
  }),

  // GET /api/characters/:id/pending-choices - Pending choices for wizard
  http.get(`${API_BASE}/characters/:id/pending-choices`, () => {
    return HttpResponse.json({ data: humanFighterL1.pendingChoices })
  }),

  // POST /api/characters/:id/choices/:choiceId - Resolve a choice
  http.post(`${API_BASE}/characters/:id/choices/:choiceId`, async ({ params, request }) => {
    const { choiceId } = params
    const body = await request.json() as { selected?: string[] }

    // Return updated pending choices (simulating choice resolution)
    return HttpResponse.json({
      data: {
        choice_id: choiceId,
        resolved: true,
        selected: body.selected || []
      }
    })
  }),

  // GET /api/characters/:id/level-up - Level up info
  http.get(`${API_BASE}/characters/:id/level-up`, () => {
    return HttpResponse.json({
      data: {
        current_level: 1,
        new_level: 2,
        hit_die: 'd10',
        hp_options: {
          average: 6,
          roll_max: 10
        },
        new_features: [],
        pending_choices: []
      }
    })
  }),

  // POST /api/characters/:id/level-up - Apply level up
  http.post(`${API_BASE}/characters/:id/level-up`, async ({ request }) => {
    const body = await request.json() as { hp_method?: string; hp_value?: number }
    return HttpResponse.json({
      data: {
        success: true,
        new_level: 2,
        hp_gained: body.hp_value || 6
      }
    })
  })
]
