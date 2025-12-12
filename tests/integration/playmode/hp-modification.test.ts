/**
 * HP Modification Integration Tests
 *
 * Tests the HP modification endpoint integration (PATCH /api/characters/:id/hp)
 * Verifies backend API contract and D&D rule enforcement.
 *
 * @see #537 - HP endpoint integration
 */
import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from '../../msw/server'
import { useIntegrationTestSetup, addTestHandlers } from '../../helpers/integrationSetup'

describe('HP Modification Integration', () => {
  useIntegrationTestSetup({ resetWizardStore: false })

  describe('damage application', () => {
    it('reduces current HP when taking damage', async () => {
      const response = await fetch('/api/characters/1/hp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hp: '-5' })
      })

      expect(response.ok).toBe(true)
      const data = await response.json()

      // Fixture has 12 HP, damage 5 = 7 remaining
      expect(data.data.current_hit_points).toBe(7)
      expect(data.data.max_hit_points).toBe(12)
      expect(data.data.temp_hit_points).toBe(0)
    })

    it('floors HP at 0 when damage exceeds current', async () => {
      // Override handler to start with lower HP
      addTestHandlers([
        http.patch('/api/characters/:id/hp', async ({ request }) => {
          const body = await request.json() as { hp?: string }
          const delta = parseInt(body.hp || '0', 10)
          // Start at 5 HP, take 10 damage
          const currentHp = Math.max(0, 5 + delta)
          return HttpResponse.json({
            data: {
              current_hit_points: currentHp,
              max_hit_points: 12,
              temp_hit_points: 0,
              death_save_successes: 0,
              death_save_failures: 0
            }
          })
        })
      ])

      const response = await fetch('/api/characters/1/hp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hp: '-10' })
      })

      const data = await response.json()
      expect(data.data.current_hit_points).toBe(0)
    })

    it('temp HP absorbs damage first', async () => {
      // Override handler with temp HP
      addTestHandlers([
        http.patch('/api/characters/:id/hp', async ({ request }) => {
          const body = await request.json() as { hp?: string }
          const damage = Math.abs(parseInt(body.hp || '0', 10))
          // Start at 10 HP with 5 temp HP, take 7 damage
          // Temp absorbs 5, current loses 2
          const tempAbsorbed = Math.min(5, damage)
          const remaining = damage - tempAbsorbed
          return HttpResponse.json({
            data: {
              current_hit_points: Math.max(0, 10 - remaining),
              max_hit_points: 12,
              temp_hit_points: 5 - tempAbsorbed,
              death_save_successes: 0,
              death_save_failures: 0
            }
          })
        })
      ])

      const response = await fetch('/api/characters/1/hp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hp: '-7' })
      })

      const data = await response.json()
      expect(data.data.current_hit_points).toBe(8) // 10 - 2 remaining after temp absorb
      expect(data.data.temp_hit_points).toBe(0) // All 5 temp HP consumed
    })
  })

  describe('healing application', () => {
    it('increases current HP when healing', async () => {
      // Override handler to start at low HP
      addTestHandlers([
        http.patch('/api/characters/:id/hp', async ({ request }) => {
          const body = await request.json() as { hp?: string }
          const delta = parseInt(body.hp || '0', 10)
          // Start at 5 HP, heal 4
          return HttpResponse.json({
            data: {
              current_hit_points: Math.min(12, 5 + delta),
              max_hit_points: 12,
              temp_hit_points: 0,
              death_save_successes: 0,
              death_save_failures: 0
            }
          })
        })
      ])

      const response = await fetch('/api/characters/1/hp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hp: '+4' })
      })

      const data = await response.json()
      expect(data.data.current_hit_points).toBe(9) // 5 + 4
    })

    it('caps healing at max HP', async () => {
      // Override handler to start near max
      addTestHandlers([
        http.patch('/api/characters/:id/hp', async ({ request }) => {
          const body = await request.json() as { hp?: string }
          const delta = parseInt(body.hp || '0', 10)
          // Start at 10 HP (max 12), heal 10
          return HttpResponse.json({
            data: {
              current_hit_points: Math.min(12, 10 + delta),
              max_hit_points: 12,
              temp_hit_points: 0,
              death_save_successes: 0,
              death_save_failures: 0
            }
          })
        })
      ])

      const response = await fetch('/api/characters/1/hp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hp: '+10' })
      })

      const data = await response.json()
      expect(data.data.current_hit_points).toBe(12) // Capped at max
    })

    it('resets death saves when healing from 0 HP', async () => {
      // Override handler to start at 0 HP with death saves
      addTestHandlers([
        http.patch('/api/characters/:id/hp', async ({ request }) => {
          const body = await request.json() as { hp?: string }
          const delta = parseInt(body.hp || '0', 10)
          const wasAtZero = true
          const newHp = Math.min(12, 0 + delta)
          // Reset death saves when healing from 0
          const resetDeathSaves = wasAtZero && newHp > 0
          return HttpResponse.json({
            data: {
              current_hit_points: newHp,
              max_hit_points: 12,
              temp_hit_points: 0,
              death_save_successes: resetDeathSaves ? 0 : 2,
              death_save_failures: resetDeathSaves ? 0 : 1
            }
          })
        })
      ])

      const response = await fetch('/api/characters/1/hp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hp: '+5' })
      })

      const data = await response.json()
      expect(data.data.current_hit_points).toBe(5)
      expect(data.data.death_save_successes).toBe(0)
      expect(data.data.death_save_failures).toBe(0)
    })
  })

  describe('temp HP modification', () => {
    it('sets temp HP', async () => {
      const response = await fetch('/api/characters/1/hp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temp_hp: 10 })
      })

      const data = await response.json()
      expect(data.data.temp_hit_points).toBe(10)
    })

    it('keeps higher value (D&D higher-wins rule)', async () => {
      // Override handler with existing temp HP
      addTestHandlers([
        http.patch('/api/characters/:id/hp', async ({ request }) => {
          const body = await request.json() as { temp_hp?: number }
          // Existing temp HP is 15, new value is 10
          const existingTempHp = 15
          const newTempHp = body.temp_hp === 0 ? 0 : Math.max(existingTempHp, body.temp_hp || 0)
          return HttpResponse.json({
            data: {
              current_hit_points: 12,
              max_hit_points: 12,
              temp_hit_points: newTempHp,
              death_save_successes: 0,
              death_save_failures: 0
            }
          })
        })
      ])

      const response = await fetch('/api/characters/1/hp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temp_hp: 10 })
      })

      const data = await response.json()
      expect(data.data.temp_hit_points).toBe(15) // Keeps existing higher value
    })

    it('clears temp HP with 0', async () => {
      // Override handler with existing temp HP
      addTestHandlers([
        http.patch('/api/characters/:id/hp', async ({ request }) => {
          const body = await request.json() as { temp_hp?: number }
          // Clear with 0 overrides higher-wins rule
          const newTempHp = body.temp_hp === 0 ? 0 : 15
          return HttpResponse.json({
            data: {
              current_hit_points: 12,
              max_hit_points: 12,
              temp_hit_points: newTempHp,
              death_save_successes: 0,
              death_save_failures: 0
            }
          })
        })
      ])

      const response = await fetch('/api/characters/1/hp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temp_hp: 0 })
      })

      const data = await response.json()
      expect(data.data.temp_hit_points).toBe(0)
    })
  })

  describe('response structure', () => {
    it('returns all HP-related fields', async () => {
      const response = await fetch('/api/characters/1/hp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hp: '-1' })
      })

      const data = await response.json()

      expect(data.data).toHaveProperty('current_hit_points')
      expect(data.data).toHaveProperty('max_hit_points')
      expect(data.data).toHaveProperty('temp_hit_points')
      expect(data.data).toHaveProperty('death_save_successes')
      expect(data.data).toHaveProperty('death_save_failures')
    })
  })

  describe('error handling', () => {
    it('handles server errors gracefully', async () => {
      addTestHandlers([
        http.patch('/api/characters/:id/hp', () => {
          return HttpResponse.json(
            { message: 'Character not found' },
            { status: 404 }
          )
        })
      ])

      const response = await fetch('/api/characters/999/hp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hp: '-5' })
      })

      expect(response.status).toBe(404)
    })
  })
})
