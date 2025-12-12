/**
 * Rogue Level 4 - ASI/Feat Selection Integration Test
 *
 * Tests the level-up wizard flow for Rogue reaching level 4,
 * which triggers Ability Score Improvement or Feat selection.
 *
 * Key scenarios:
 * - ASI choice between +2 to one stat or +1 to two stats
 * - Alternative: Take a feat instead
 * - Level 4 is ASI level for ALL classes
 *
 * This is a critical milestone for character customization.
 */

import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { server, http, HttpResponse } from '../../msw/server'
import { halflingRogueL4 } from '../../msw/fixtures/characters'

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

describe('Rogue L4 - Level-Up API Integration', () => {
  describe('Level-Up Endpoint', () => {
    it('level-up returns asi_pending: true at L4', async () => {
      server.use(
        http.post('/api/characters/:id/classes/:classSlug/level-up', () => {
          return HttpResponse.json({ data: halflingRogueL4.levelUpResult })
        })
      )

      const response = await fetch('/api/characters/5/classes/phb:rogue/level-up', {
        method: 'POST'
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.new_level).toBe(4)
      expect(data.data.asi_pending).toBe(true)
    })

    it('level-up features include Ability Score Improvement', async () => {
      server.use(
        http.post('/api/characters/:id/classes/:classSlug/level-up', () => {
          return HttpResponse.json({ data: halflingRogueL4.levelUpResult })
        })
      )

      const response = await fetch('/api/characters/5/classes/phb:rogue/level-up', {
        method: 'POST'
      })
      const data = await response.json()

      expect(data.data.features_gained).toHaveLength(1)
      expect(data.data.features_gained[0].name).toBe('Ability Score Improvement')
    })

    it('level-up can return both HP and ASI pending', async () => {
      server.use(
        http.post('/api/characters/:id/classes/:classSlug/level-up', () => {
          return HttpResponse.json({ data: halflingRogueL4.levelUpResultAllPending })
        })
      )

      const response = await fetch('/api/characters/5/classes/phb:rogue/level-up', {
        method: 'POST'
      })
      const data = await response.json()

      expect(data.data.hp_choice_pending).toBe(true)
      expect(data.data.asi_pending).toBe(true)
    })
  })

  describe('Pending Choices Endpoint', () => {
    it('pending-choices includes ASI choice at L4', async () => {
      server.use(
        http.get('/api/characters/:id/pending-choices', () => {
          return HttpResponse.json({ data: halflingRogueL4.pendingChoices })
        })
      )

      const response = await fetch('/api/characters/5/pending-choices')
      const data = await response.json()

      const asiChoice = data.data.choices[0]
      expect(asiChoice.type).toBe('ability_score')
      expect(asiChoice.subtype).toBe('asi_or_feat')
      expect(asiChoice.level_granted).toBe(4)
    })

    it('ASI options include both ASI and feats', async () => {
      server.use(
        http.get('/api/characters/:id/pending-choices', () => {
          return HttpResponse.json({ data: halflingRogueL4.pendingChoices })
        })
      )

      const response = await fetch('/api/characters/5/pending-choices')
      const data = await response.json()

      const asiChoice = data.data.choices[0]
      const types = asiChoice.options.map((o: { type: string }) => o.type)

      // Has ASI option
      expect(types).toContain('asi')

      // Has feat options
      expect(types).toContain('feat')

      // Has popular rogue feats
      const slugs = asiChoice.options
        .filter((o: { type: string }) => o.type === 'feat')
        .map((o: { slug: string }) => o.slug)

      expect(slugs).toContain('phb:alert')
      expect(slugs).toContain('phb:lucky')
      expect(slugs).toContain('phb:mobile')
      expect(slugs).toContain('phb:skulker')
    })
  })

  describe('ASI Resolution Endpoint', () => {
    it('can resolve ASI choice with +2 to DEX', async () => {
      const choiceId = 'ability_score|class|phb:rogue|4|asi'

      server.use(
        http.post('/api/characters/:id/choices/:choiceId', async ({ request }) => {
          const body = await request.json() as { type?: string; ability_scores?: Record<string, number> }
          return HttpResponse.json({
            data: {
              resolved: true,
              type: body.type,
              ability_scores: body.ability_scores
            }
          })
        })
      )

      const response = await fetch(`/api/characters/5/choices/${encodeURIComponent(choiceId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'asi',
          ability_scores: { DEX: 2 } // +2 to DEX
        })
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.resolved).toBe(true)
      expect(data.data.ability_scores.DEX).toBe(2)
    })

    it('can resolve ASI choice with feat', async () => {
      const choiceId = 'ability_score|class|phb:rogue|4|asi'

      server.use(
        http.post('/api/characters/:id/choices/:choiceId', async ({ request }) => {
          const body = await request.json() as { type?: string; selected?: string }
          return HttpResponse.json({
            data: {
              resolved: true,
              type: body.type,
              selected: body.selected
            }
          })
        })
      )

      const response = await fetch(`/api/characters/5/choices/${encodeURIComponent(choiceId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feat',
          selected: 'phb:lucky'
        })
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.type).toBe('feat')
      expect(data.data.selected).toBe('phb:lucky')
    })
  })
})

// ════════════════════════════════════════════════════════════════
// STORE STATE TESTS
// ════════════════════════════════════════════════════════════════

describe('Rogue L4 - Store State', () => {
  describe('Level-Up Store with ASI', () => {
    it('stores level-up result with asi_pending: true', () => {
      const store = useCharacterLevelUpStore()

      store.levelUpResult = halflingRogueL4.levelUpResult

      expect(store.levelUpResult?.asi_pending).toBe(true)
      expect(store.isLevelUpInProgress).toBe(true)
    })

    it('isComplete is false when ASI pending', () => {
      const store = useCharacterLevelUpStore()

      store.levelUpResult = halflingRogueL4.levelUpResult
      store.pendingChoices = halflingRogueL4.pendingChoices.choices

      // ASI pending means not complete
      expect(store.isComplete).toBe(false)
    })

    it('isComplete is true after ASI resolved', () => {
      const store = useCharacterLevelUpStore()

      // Simulate resolved state
      store.levelUpResult = {
        ...halflingRogueL4.levelUpResult,
        asi_pending: false,
        hp_choice_pending: false
      }
      store.pendingChoices = []

      expect(store.isComplete).toBe(true)
    })
  })

  describe('Pending Choices State', () => {
    it('hasSubclassChoice is false (Rogue already has Thief)', () => {
      const store = useCharacterLevelUpStore()

      store.pendingChoices = halflingRogueL4.pendingChoices.choices

      expect(store.hasSubclassChoice).toBe(false)
    })

    it('hasSpellChoices is false (Rogue non-caster)', () => {
      const store = useCharacterLevelUpStore()

      store.pendingChoices = halflingRogueL4.pendingChoices.choices

      expect(store.hasSpellChoices).toBe(false)
    })
  })
})

// ════════════════════════════════════════════════════════════════
// FIXTURE VALIDATION TESTS
// ════════════════════════════════════════════════════════════════

describe('Rogue L4 - Fixture Validation', () => {
  describe('Character Data', () => {
    it('has correct level and class', () => {
      expect(halflingRogueL4.character.level).toBe(4)
      expect(halflingRogueL4.character.class.name).toBe('Rogue')
      expect(halflingRogueL4.character.class.hit_die).toBe(8)
    })

    it('has Thief subclass (selected at L3)', () => {
      expect(halflingRogueL4.character.subclass?.name).toBe('Thief')
      expect(halflingRogueL4.character.subclass?.slug).toBe('phb:thief')
    })

    it('has Lightfoot Halfling race/subrace', () => {
      expect(halflingRogueL4.character.race.name).toBe('Halfling')
      expect(halflingRogueL4.character.subrace?.name).toBe('Lightfoot')
    })

    it('has draft status due to pending ASI', () => {
      expect(halflingRogueL4.character.status).toBe('draft')
    })

    it('has correct HP for level 4 Rogue', () => {
      // L1: 8+2, L2-L4: 3×(5avg+2) = 10 + 21 = 31
      expect(halflingRogueL4.character.hit_points.max).toBe(31)
    })

    it('has DEX 18 (16 base + 2 Halfling)', () => {
      expect(halflingRogueL4.character.ability_scores.DEX).toBe(18)
      expect(halflingRogueL4.character.base_ability_scores.DEX).toBe(16)
    })
  })

  describe('Stats Resource', () => {
    it('has expertise in Stealth', () => {
      const stealth = halflingRogueL4.stats.skills.find(s => s.slug === 'stealth')
      expect(stealth?.modifier).toBe(10) // 4 DEX + 2×2 (expertise)
    })

    it('has DEX and INT saving throw proficiency', () => {
      expect(halflingRogueL4.stats.ability_scores.DEX.proficient).toBe(true)
      expect(halflingRogueL4.stats.ability_scores.INT.proficient).toBe(true)
    })

    it('has 4 hit dice', () => {
      expect(halflingRogueL4.stats.combat.hit_dice.total).toBe(4)
      expect(halflingRogueL4.stats.combat.hit_dice.die).toBe('d8')
    })

    it('has Halfling speed (25)', () => {
      expect(halflingRogueL4.stats.combat.speed).toBe(25)
    })

    it('has no spellcasting', () => {
      expect(halflingRogueL4.stats.spellcasting).toBeNull()
    })
  })

  describe('Level-Up Result', () => {
    it('shows L3 → L4 progression', () => {
      expect(halflingRogueL4.levelUpResult.previous_level).toBe(3)
      expect(halflingRogueL4.levelUpResult.new_level).toBe(4)
    })

    it('has ASI pending', () => {
      expect(halflingRogueL4.levelUpResult.asi_pending).toBe(true)
    })

    it('has Ability Score Improvement feature', () => {
      expect(halflingRogueL4.levelUpResult.features_gained[0].name).toBe('Ability Score Improvement')
    })
  })

  describe('Pending Choices', () => {
    it('has exactly one pending choice (ASI)', () => {
      expect(halflingRogueL4.pendingChoices.choices).toHaveLength(1)
      expect(halflingRogueL4.pendingChoices.choices[0].type).toBe('ability_score')
    })

    it('ASI choice has correct ID format', () => {
      const choice = halflingRogueL4.pendingChoices.choices[0]
      expect(choice.id).toBe('ability_score|class|phb:rogue|4|asi')
    })

    it('has many feat options', () => {
      const choice = halflingRogueL4.pendingChoices.choices[0]
      const featOptions = choice.options?.filter((o: { type?: string }) => o.type === 'feat')
      expect(featOptions?.length).toBeGreaterThan(20)
    })

    it('summary pending_choices matches', () => {
      expect(halflingRogueL4.summary.pending_choices.total).toBe(1)
      expect(halflingRogueL4.summary.pending_choices.ability_score).toBe(1)
    })
  })

  describe('Post-ASI State', () => {
    it('characterAfterAsi has DEX 20', () => {
      expect(halflingRogueL4.characterAfterAsi.ability_scores.DEX).toBe(20)
    })

    it('characterAfterAsi is complete', () => {
      expect(halflingRogueL4.characterAfterAsi.status).toBe('complete')
    })
  })
})

// ════════════════════════════════════════════════════════════════
// ASI LEVEL DOCUMENTATION TESTS
// ════════════════════════════════════════════════════════════════

describe('ASI Level Rules', () => {
  it('ASI occurs at levels 4, 8, 12, 16, 19 for most classes', () => {
    // This test documents the D&D 5e ASI schedule
    const asiLevels = [4, 8, 12, 16, 19]

    // Rogue L4 should have ASI
    expect(asiLevels).toContain(4)
    expect(halflingRogueL4.levelUpResult.asi_pending).toBe(true)
  })

  it('Rogue gets extra ASI at level 10 (documented)', () => {
    // Rogues get an extra ASI at level 10
    // Future fixture could test this
    const rogueAsiLevels = [4, 8, 10, 12, 16, 19]
    expect(rogueAsiLevels).toContain(10)
  })

  it('Fighter gets extra ASIs at 6 and 14 (documented)', () => {
    // Fighters get extra ASIs at levels 6 and 14
    // Future fixture could test this
    const fighterAsiLevels = [4, 6, 8, 12, 14, 16, 19]
    expect(fighterAsiLevels).toContain(6)
    expect(fighterAsiLevels).toContain(14)
  })
})
