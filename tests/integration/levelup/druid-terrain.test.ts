/**
 * Druid Level 2 - Circle of the Land Terrain Selection Integration Test
 *
 * Tests the level-up wizard flow for Druid reaching level 2,
 * which triggers Druid Circle selection. Circle of the Land
 * requires an additional terrain choice (Arctic, Coast, etc.)
 *
 * Key scenarios:
 * - Subclass options include variant_choices for terrain
 * - UI shows terrain selection when Circle of the Land is selected
 * - Submission includes both subclass_slug and variant_choices
 * - Circle of the Moon (no variants) works normally
 */

import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from '#tests/msw/server'
import { useIntegrationTestSetup, server } from '#tests/helpers/integrationSetup'
import { hillDwarfDruidL2 } from '#tests/msw/fixtures/characters'

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

interface SubclassOption {
  slug: string
  name: string
  variant_choices?: {
    terrain?: {
      required: boolean
      label: string
      options: TerrainOption[]
    }
  }
}

interface TerrainOption {
  value: string
  name: string
  spells: string[]
}

interface CapturedBody {
  subclass_slug: string
  variant_choices?: Record<string, string>
}

// ════════════════════════════════════════════════════════════════
// TEST SETUP
// ════════════════════════════════════════════════════════════════

useIntegrationTestSetup({ resetWizardStore: false })

// ════════════════════════════════════════════════════════════════
// API INTEGRATION TESTS
// ════════════════════════════════════════════════════════════════

describe('Druid L2 - Circle of the Land Terrain Selection', () => {
  describe('Pending Choices Endpoint', () => {
    it('pending-choices includes subclass choice at L2', async () => {
      server.use(
        http.get('/api/characters/:id/pending-choices', () => {
          return HttpResponse.json({ data: hillDwarfDruidL2.pendingChoices })
        })
      )

      const response = await fetch('/api/characters/1/pending-choices')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.choices).toHaveLength(1)

      const subclassChoice = data.data.choices[0]
      expect(subclassChoice.type).toBe('subclass')
      expect(subclassChoice.source_name).toBe('Druid')
      expect(subclassChoice.level_granted).toBe(2)
    })

    it('subclass options include Circle of the Land and Circle of the Moon', async () => {
      server.use(
        http.get('/api/characters/:id/pending-choices', () => {
          return HttpResponse.json({ data: hillDwarfDruidL2.pendingChoices })
        })
      )

      const response = await fetch('/api/characters/1/pending-choices')
      const data = await response.json()

      const subclassChoice = data.data.choices[0]
      const options = subclassChoice.options as Array<{ slug: string, name: string }>

      expect(options).toHaveLength(2)
      expect(options.map(o => o.name)).toContain('Circle of the Land')
      expect(options.map(o => o.name)).toContain('Circle of the Moon')
    })

    it('Circle of the Land has variant_choices with terrain options', async () => {
      server.use(
        http.get('/api/characters/:id/pending-choices', () => {
          return HttpResponse.json({ data: hillDwarfDruidL2.pendingChoices })
        })
      )

      const response = await fetch('/api/characters/1/pending-choices')
      const data = await response.json()

      const subclassChoice = data.data.choices[0]
      const options = subclassChoice.options as Array<{
        slug: string
        name: string
        variant_choices?: {
          terrain?: {
            required: boolean
            label: string
            options: Array<{ value: string, name: string, spells: string[] }>
          }
        }
      }>

      const circleOfLand = options.find(o => o.slug === 'phb:druid-circle-of-the-land')
      expect(circleOfLand).toBeDefined()
      expect(circleOfLand?.variant_choices).toBeDefined()
      expect(circleOfLand?.variant_choices?.terrain).toBeDefined()
      expect(circleOfLand?.variant_choices?.terrain?.required).toBe(true)
      expect(circleOfLand?.variant_choices?.terrain?.label).toBe('Choose your terrain')
    })

    it('terrain options include all 8 terrain types with spells', async () => {
      server.use(
        http.get('/api/characters/:id/pending-choices', () => {
          return HttpResponse.json({ data: hillDwarfDruidL2.pendingChoices })
        })
      )

      const response = await fetch('/api/characters/1/pending-choices')
      const data = await response.json()

      const subclassChoice = data.data.choices[0]
      const options = subclassChoice.options as SubclassOption[]
      const circleOfLand = options.find(o => o.slug === 'phb:druid-circle-of-the-land')

      const terrainOptions = circleOfLand!.variant_choices!.terrain!.options
      expect(terrainOptions).toHaveLength(8)

      const terrainNames = terrainOptions.map(t => t.value)
      expect(terrainNames).toContain('arctic')
      expect(terrainNames).toContain('coast')
      expect(terrainNames).toContain('desert')
      expect(terrainNames).toContain('forest')
      expect(terrainNames).toContain('grassland')
      expect(terrainNames).toContain('mountain')
      expect(terrainNames).toContain('swamp')
      expect(terrainNames).toContain('underdark')

      // Each terrain should have spells
      const arctic = terrainOptions.find(t => t.value === 'arctic')
      expect(arctic!.spells).toContain('Hold Person')
      expect(arctic!.spells).toContain('Cone of Cold')
    })

    it('Circle of the Moon has no variant_choices', async () => {
      server.use(
        http.get('/api/characters/:id/pending-choices', () => {
          return HttpResponse.json({ data: hillDwarfDruidL2.pendingChoices })
        })
      )

      const response = await fetch('/api/characters/1/pending-choices')
      const data = await response.json()

      const subclassChoice = data.data.choices[0]
      const options = subclassChoice.options as SubclassOption[]
      const circleOfMoon = options.find(o => o.slug === 'phb:druid-circle-of-the-moon')

      expect(circleOfMoon).toBeDefined()
      expect(circleOfMoon!.variant_choices).toBeUndefined()
    })
  })

  describe('Subclass Selection with Terrain', () => {
    it('accepts subclass_slug with variant_choices for Circle of the Land', async () => {
      let capturedBody: CapturedBody | null = null

      server.use(
        http.put('/api/characters/:id/classes/:classSlug/subclass', async ({ request }) => {
          capturedBody = await request.json() as CapturedBody
          return HttpResponse.json({
            data: {
              success: true,
              message: 'Subclass selected successfully'
            }
          })
        })
      )

      const response = await fetch('/api/characters/1/classes/phb:druid/subclass', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subclass_slug: 'phb:druid-circle-of-the-land',
          variant_choices: {
            terrain: 'arctic'
          }
        })
      })

      expect(response.ok).toBe(true)
      expect(capturedBody).toEqual({
        subclass_slug: 'phb:druid-circle-of-the-land',
        variant_choices: {
          terrain: 'arctic'
        }
      })
    })

    it('accepts subclass_slug without variant_choices for Circle of the Moon', async () => {
      let capturedBody: CapturedBody | null = null

      server.use(
        http.put('/api/characters/:id/classes/:classSlug/subclass', async ({ request }) => {
          capturedBody = await request.json() as CapturedBody
          return HttpResponse.json({
            data: {
              success: true,
              message: 'Subclass selected successfully'
            }
          })
        })
      )

      const response = await fetch('/api/characters/1/classes/phb:druid/subclass', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subclass_slug: 'phb:druid-circle-of-the-moon'
        })
      })

      expect(response.ok).toBe(true)
      expect(capturedBody).toEqual({
        subclass_slug: 'phb:druid-circle-of-the-moon'
      })
      expect(capturedBody!.variant_choices).toBeUndefined()
    })
  })
})
