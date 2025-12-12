/**
 * MSW Setup Verification Test
 *
 * This test verifies that MSW is correctly intercepting API requests.
 * It uses $fetch directly (bypassing the existing vi.mock) to prove
 * that MSW is working at the network level.
 *
 * Run with: npm run test -- tests/integration/msw-setup.test.ts
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { server, http, HttpResponse } from '../msw/server'
import { humanFighterL1 } from '../msw/fixtures/characters/human-fighter-l1'
import { draftClericL1 } from '../msw/fixtures/characters/draft-cleric-l1'

// Start MSW server before tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

// Reset handlers after each test (clears any per-test overrides)
afterEach(() => {
  server.resetHandlers()
})

// Stop MSW server after all tests
afterAll(() => {
  server.close()
})

describe('MSW Integration', () => {
  describe('Server Setup', () => {
    it('MSW server starts without errors', () => {
      // If we got here, the server started successfully
      expect(true).toBe(true)
    })

    it('handlers are registered', () => {
      // The server should have handlers from our handlers/index.ts
      expect(server.listHandlers().length).toBeGreaterThan(0)
    })
  })

  describe('Character Endpoints', () => {
    it('GET /api/characters returns character list', async () => {
      const response = await fetch('/api/characters')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toHaveProperty('data')
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('GET /api/characters/:id returns fixture character', async () => {
      const response = await fetch(`/api/characters/${humanFighterL1.character.public_id}`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.name).toBe('Thorin Ironforge')
      expect(data.data.class.name).toBe('Fighter')
      expect(data.data.race.name).toBe('Human')
    })

    it('GET /api/characters/:id/stats returns character stats', async () => {
      const response = await fetch('/api/characters/1/stats')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.ability_scores).toHaveProperty('STR')
      expect(data.data.combat).toHaveProperty('armor_class')
    })

    it('GET /api/characters/:id/pending-choices returns choices', async () => {
      const response = await fetch('/api/characters/1/pending-choices')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data).toHaveProperty('choices')
    })

    it('returns 404 for unknown character', async () => {
      const response = await fetch('/api/characters/unknown-id-12345')

      expect(response.status).toBe(404)
    })
  })

  describe('Reference Endpoints', () => {
    it('GET /api/sources returns source list', async () => {
      const response = await fetch('/api/sources')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.some((s: { code: string }) => s.code === 'PHB')).toBe(true)
    })

    it('GET /api/races returns race list', async () => {
      const response = await fetch('/api/races')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.some((r: { name: string }) => r.name === 'Human')).toBe(true)
    })

    it('GET /api/classes returns class list', async () => {
      const response = await fetch('/api/classes')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.some((c: { name: string }) => c.name === 'Fighter')).toBe(true)
    })
  })

  describe('Handler Overrides', () => {
    it('can override handler for specific test', async () => {
      // Override the character endpoint for this test only
      server.use(
        http.get('/api/characters/:id', () => {
          return HttpResponse.json({
            data: {
              ...humanFighterL1.character,
              name: 'Override Test Character'
            }
          })
        })
      )

      const response = await fetch('/api/characters/1')
      const data = await response.json()

      expect(data.data.name).toBe('Override Test Character')
    })

    it('can simulate error responses', async () => {
      server.use(
        http.get('/api/characters/:id/stats', () => {
          return HttpResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )

      const response = await fetch('/api/characters/1/stats')

      expect(response.status).toBe(500)
    })

    it('can simulate network delay', async () => {
      server.use(
        http.get('/api/characters', async () => {
          // Simulate 100ms delay
          await new Promise(resolve => setTimeout(resolve, 100))
          return HttpResponse.json({ data: [] })
        })
      )

      const start = Date.now()
      await fetch('/api/characters')
      const elapsed = Date.now() - start

      expect(elapsed).toBeGreaterThanOrEqual(100)
    })
  })

  describe('Fixture Data Integrity', () => {
    it('humanFighterL1 fixture has all required fields', () => {
      expect(humanFighterL1.character).toHaveProperty('id')
      expect(humanFighterL1.character).toHaveProperty('public_id')
      expect(humanFighterL1.character).toHaveProperty('name')
      expect(humanFighterL1.character).toHaveProperty('race')
      expect(humanFighterL1.character).toHaveProperty('class')
      expect(humanFighterL1.character).toHaveProperty('ability_scores')
      expect(humanFighterL1.stats).toHaveProperty('ability_scores')
      expect(humanFighterL1.stats).toHaveProperty('combat')
      expect(humanFighterL1.summary).toHaveProperty('pending_choices')
    })

    it('draftClericL1 fixture has pending choices', () => {
      expect(draftClericL1.character.status).toBe('draft')
      expect(draftClericL1.pendingChoices.choices.length).toBeGreaterThan(0)

      // Verify choice types
      const choiceTypes = draftClericL1.pendingChoices.choices.map(c => c.type)
      expect(choiceTypes).toContain('proficiency')
      expect(choiceTypes).toContain('spell')
      expect(choiceTypes).toContain('equipment')
      expect(choiceTypes).toContain('language')
    })
  })
})
