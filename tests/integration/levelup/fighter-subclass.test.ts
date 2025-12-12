/**
 * Fighter Level 3 - Subclass Selection Integration Test
 *
 * Tests the level-up wizard flow for Fighter reaching level 3,
 * which triggers Martial Archetype (subclass) selection.
 *
 * Key scenarios:
 * - Level-up API returns subclass pending
 * - Pending choices include subclass options
 * - Store state reflects subclass step visibility
 */

import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { server, http, HttpResponse } from '../../msw/server'
import { humanFighterL3 } from '../../msw/fixtures/characters'

// Import store
import { useCharacterLevelUpStore } from '~/stores/characterLevelUp'

// ════════════════════════════════════════════════════════════════
// MSW SERVER SETUP
// ════════════════════════════════════════════════════════════════

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

// ════════════════════════════════════════════════════════════════
// PINIA SETUP
// ════════════════════════════════════════════════════════════════

beforeEach(() => {
  setActivePinia(createPinia())
})

// ════════════════════════════════════════════════════════════════
// API INTEGRATION TESTS
// ════════════════════════════════════════════════════════════════

describe('Fighter L3 - Level-Up API Integration', () => {
  describe('Level-Up Endpoint', () => {
    it('level-up returns subclass pending in features_gained', async () => {
      server.use(
        http.post('/api/characters/:id/classes/:classSlug/level-up', () => {
          return HttpResponse.json({ data: humanFighterL3.levelUpResult })
        })
      )

      const response = await fetch('/api/characters/1/classes/phb:fighter/level-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.new_level).toBe(3)
      expect(data.data.features_gained).toHaveLength(1)
      expect(data.data.features_gained[0].name).toBe('Martial Archetype')
      expect(data.data.asi_pending).toBe(false) // No ASI at L3
    })

    it('level-up can return hp_choice_pending', async () => {
      server.use(
        http.post('/api/characters/:id/classes/:classSlug/level-up', () => {
          return HttpResponse.json({ data: humanFighterL3.levelUpResultHpPending })
        })
      )

      const response = await fetch('/api/characters/1/classes/phb:fighter/level-up', {
        method: 'POST'
      })
      const data = await response.json()

      expect(data.data.hp_choice_pending).toBe(true)
      expect(data.data.hp_increase).toBe(0) // Not yet determined
    })
  })

  describe('Pending Choices Endpoint', () => {
    it('pending-choices includes subclass choice at L3', async () => {
      server.use(
        http.get('/api/characters/:id/pending-choices', () => {
          return HttpResponse.json({ data: humanFighterL3.pendingChoices })
        })
      )

      const response = await fetch('/api/characters/1/pending-choices')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.choices).toHaveLength(1)

      const subclassChoice = data.data.choices[0]
      expect(subclassChoice.type).toBe('subclass')
      expect(subclassChoice.source_name).toBe('Fighter')
      expect(subclassChoice.level_granted).toBe(3)
    })

    it('subclass options include Champion, Battle Master, Eldritch Knight', async () => {
      server.use(
        http.get('/api/characters/:id/pending-choices', () => {
          return HttpResponse.json({ data: humanFighterL3.pendingChoices })
        })
      )

      const response = await fetch('/api/characters/1/pending-choices')
      const data = await response.json()

      const subclassChoice = data.data.choices[0]
      const slugs = subclassChoice.options.map((o: { slug: string }) => o.slug)

      expect(slugs).toContain('phb:champion')
      expect(slugs).toContain('phb:battle-master')
      expect(slugs).toContain('phb:eldritch-knight')
    })
  })

  describe('Subclass Selection Endpoint', () => {
    it('can resolve subclass choice', async () => {
      const choiceId = 'subclass|class|phb:fighter|3|martial_archetype'

      server.use(
        http.post('/api/characters/:id/choices/:choiceId', async ({ request }) => {
          const body = await request.json() as { selected?: string[] }
          return HttpResponse.json({
            data: {
              choice_id: choiceId,
              resolved: true,
              selected: body.selected
            }
          })
        })
      )

      const response = await fetch(`/api/characters/1/choices/${encodeURIComponent(choiceId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: ['phb:champion'] })
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.resolved).toBe(true)
      expect(data.data.selected).toContain('phb:champion')
    })
  })
})

// ════════════════════════════════════════════════════════════════
// STORE STATE TESTS
// ════════════════════════════════════════════════════════════════

describe('Fighter L3 - Store State', () => {
  describe('Level-Up Store Initialization', () => {
    it('can open wizard with character data', () => {
      const store = useCharacterLevelUpStore()

      store.openWizard(
        humanFighterL3.character.id,
        humanFighterL3.character.public_id,
        [{ slug: 'phb:fighter', name: 'Fighter', level: 2 }],
        2 // Current level before level-up
      )

      expect(store.characterId).toBe(1)
      expect(store.publicId).toBe('iron-phoenix-X7k2')
      expect(store.totalLevel).toBe(2)
      expect(store.isOpen).toBe(true)
    })

    it('single class character is not multiclass', () => {
      const store = useCharacterLevelUpStore()

      store.openWizard(
        humanFighterL3.character.id,
        humanFighterL3.character.public_id,
        [{ slug: 'phb:fighter', name: 'Fighter', level: 2 }],
        2
      )

      expect(store.isMulticlass).toBe(false)
    })
  })

  describe('Pending Choices State', () => {
    it('hasSubclassChoice is true when subclass choice pending', () => {
      const store = useCharacterLevelUpStore()

      store.pendingChoices = humanFighterL3.pendingChoices.choices

      expect(store.hasSubclassChoice).toBe(true)
    })

    it('hasFeatureChoices is false (no fighting style at L3)', () => {
      const store = useCharacterLevelUpStore()

      store.pendingChoices = humanFighterL3.pendingChoices.choices

      expect(store.hasFeatureChoices).toBe(false)
    })

    it('hasSpellChoices is false (Fighter non-caster)', () => {
      const store = useCharacterLevelUpStore()

      store.pendingChoices = humanFighterL3.pendingChoices.choices

      expect(store.hasSpellChoices).toBe(false)
    })
  })

  describe('Level-Up Result State', () => {
    it('stores level-up result after API call', () => {
      const store = useCharacterLevelUpStore()

      store.levelUpResult = humanFighterL3.levelUpResult

      expect(store.levelUpResult?.new_level).toBe(3)
      expect(store.levelUpResult?.asi_pending).toBe(false)
      expect(store.isLevelUpInProgress).toBe(true)
    })

    it('isComplete is true when no HP/ASI pending AND pendingChoices empty', () => {
      const store = useCharacterLevelUpStore()

      store.levelUpResult = humanFighterL3.levelUpResult
      store.pendingChoices = [] // Subclass already resolved

      expect(store.isComplete).toBe(true)
    })

    it('isComplete is false when pendingChoices has items', () => {
      const store = useCharacterLevelUpStore()

      store.levelUpResult = humanFighterL3.levelUpResult // hp_choice_pending: false, asi_pending: false
      store.pendingChoices = humanFighterL3.pendingChoices.choices // Has subclass pending

      expect(store.isComplete).toBe(false)
    })

    it('isComplete is false when hp_choice_pending', () => {
      const store = useCharacterLevelUpStore()

      store.levelUpResult = humanFighterL3.levelUpResultHpPending
      store.pendingChoices = []

      expect(store.isComplete).toBe(false)
    })
  })
})

// ════════════════════════════════════════════════════════════════
// FIXTURE VALIDATION TESTS
// ════════════════════════════════════════════════════════════════

describe('Fighter L3 - Fixture Validation', () => {
  describe('Character Data', () => {
    it('has correct level and class', () => {
      expect(humanFighterL3.character.level).toBe(3)
      expect(humanFighterL3.character.class.name).toBe('Fighter')
      expect(humanFighterL3.character.class.hit_die).toBe(10)
    })

    it('has draft status due to pending subclass', () => {
      expect(humanFighterL3.character.status).toBe('draft')
      expect(humanFighterL3.character.subclass).toBeNull()
    })

    it('has correct HP for level 3 Fighter', () => {
      // L1: 10+2, L2: 6avg+2, L3: 6avg+2 = 12 + 8 + 8 = 28
      expect(humanFighterL3.character.hit_points.max).toBe(28)
      expect(humanFighterL3.stats.combat.hit_dice.total).toBe(3)
    })
  })

  describe('Level-Up Result', () => {
    it('shows L2 → L3 progression', () => {
      expect(humanFighterL3.levelUpResult.previous_level).toBe(2)
      expect(humanFighterL3.levelUpResult.new_level).toBe(3)
    })

    it('has Martial Archetype feature', () => {
      expect(humanFighterL3.levelUpResult.features_gained).toHaveLength(1)
      expect(humanFighterL3.levelUpResult.features_gained[0].name).toBe('Martial Archetype')
    })

    it('has no ASI at level 3', () => {
      expect(humanFighterL3.levelUpResult.asi_pending).toBe(false)
    })

    it('Fighter has no spell slots', () => {
      expect(humanFighterL3.levelUpResult.spell_slots).toEqual({})
    })
  })

  describe('Pending Choices', () => {
    it('has exactly one pending choice (subclass)', () => {
      expect(humanFighterL3.pendingChoices.choices).toHaveLength(1)
      expect(humanFighterL3.pendingChoices.choices[0].type).toBe('subclass')
    })

    it('subclass choice has correct ID format', () => {
      const choice = humanFighterL3.pendingChoices.choices[0]
      expect(choice.id).toBe('subclass|class|phb:fighter|3|martial_archetype')
    })

    it('summary pending_choices matches', () => {
      expect(humanFighterL3.summary.pending_choices.total).toBe(1)
      expect(humanFighterL3.summary.pending_choices.feature).toBe(1)
    })
  })
})
