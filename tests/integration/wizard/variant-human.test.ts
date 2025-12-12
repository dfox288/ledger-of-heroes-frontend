/**
 * Variant Human Creation Flow - Integration Test
 *
 * Tests character creation with conditional feat step:
 * - Variant Human gets a bonus feat at level 1
 * - hasFeatChoices = true triggers feat step visibility
 * - Bonus skill proficiency from race
 *
 * Key differences from standard Human:
 * - hasFeatChoices = true (via raceGrantsBonusFeat)
 * - +1 to two abilities instead of +1 to all six
 * - Bonus skill proficiency
 *
 * This tests the conditional step visibility logic that makes
 * the feat step appear only for races that grant bonus feats.
 */

import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { server, http, HttpResponse } from '../../msw/server'
import { variantHumanFighterL1, variantHumanRaceWithModifiers } from '../../msw/fixtures/characters/variant-human-fighter-l1'
import { humanFighterL1 } from '../../msw/fixtures/characters/human-fighter-l1'

// Import step components
import StepFeats from '~/components/character/wizard/StepFeats.vue'

// Import store
import { useCharacterWizardStore } from '~/stores/characterWizard'

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
  const store = useCharacterWizardStore()
  store.reset()
})

// ════════════════════════════════════════════════════════════════
// API INTEGRATION TESTS
// ════════════════════════════════════════════════════════════════

describe('Variant Human - API Integration', () => {
  describe('Character Data', () => {
    it('Variant Human Fighter has expected character data', async () => {
      server.use(
        http.get('/api/characters/:id', ({ params }) => {
          if (params.id === variantHumanFighterL1.character.public_id) {
            return HttpResponse.json({ data: variantHumanFighterL1.character })
          }
          return HttpResponse.json({ error: 'Not found' }, { status: 404 })
        })
      )

      const response = await fetch(`/api/characters/${variantHumanFighterL1.character.public_id}`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.name).toBe('Marcus Ashford')
      expect(data.data.race.name).toBe('Human')
      expect(data.data.subrace.name).toBe('Variant Human')
      expect(data.data.class.name).toBe('Fighter')
      expect(data.data.status).toBe('draft')
    })

    it('has pending feat choice', async () => {
      server.use(
        http.get('/api/characters/:id/pending-choices', () => {
          return HttpResponse.json({ data: variantHumanFighterL1.pendingChoices })
        })
      )

      const response = await fetch(`/api/characters/${variantHumanFighterL1.character.id}/pending-choices`)
      const data = await response.json()

      expect(response.ok).toBe(true)

      const featChoice = data.data.choices.find(
        (c: { type: string; subtype?: string }) => c.type === 'feature' && c.subtype === 'feat'
      )
      expect(featChoice).toBeDefined()
      expect(featChoice.source_name).toBe('Variant Human')
    })
  })

  describe('Feat Selection API', () => {
    it('can resolve feat choice via API', async () => {
      const choiceId = 'feature|race|phb:variant-human|1|bonus_feat'
      const selectedFeat = 'phb:great-weapon-master'

      server.use(
        http.post('/api/characters/:id/choices/:choiceId', async ({ request }) => {
          const body = await request.json() as { selected?: string[] }
          return HttpResponse.json({
            data: {
              resolved: true,
              selected: body.selected
            }
          })
        })
      )

      const response = await fetch(`/api/characters/4/choices/${choiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: [selectedFeat] })
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.resolved).toBe(true)
      expect(data.data.selected).toContain(selectedFeat)
    })
  })

  describe('Bonus Skill API', () => {
    it('can resolve Variant Human skill choice via API', async () => {
      const choiceId = 'proficiency|race|phb:variant-human|1|skill_choice_1'
      const selectedSkill = 'perception'

      server.use(
        http.post('/api/characters/:id/choices/:choiceId', async ({ request }) => {
          const body = await request.json() as { selected?: string[] }
          return HttpResponse.json({
            data: {
              resolved: true,
              selected: body.selected
            }
          })
        })
      )

      const response = await fetch(`/api/characters/4/choices/${choiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: [selectedSkill] })
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.resolved).toBe(true)
    })
  })
})

// ════════════════════════════════════════════════════════════════
// STORE STATE TESTS
// ════════════════════════════════════════════════════════════════

describe('Variant Human - Store State', () => {
  describe('hasFeatChoices Detection', () => {
    it('hasFeatChoices is true when race has bonus_feat modifier', () => {
      const store = useCharacterWizardStore()

      // Set race with bonus_feat modifier (Variant Human)
      store.selections.race = variantHumanRaceWithModifiers as any

      // hasFeatChoices checks raceGrantsBonusFeat which looks at modifiers
      expect(store.hasFeatChoices).toBe(true)
    })

    it('hasFeatChoices is false for standard Human (no bonus_feat modifier)', () => {
      const store = useCharacterWizardStore()

      // Standard Human - no bonus_feat modifier
      store.selections.race = {
        id: 1,
        name: 'Human',
        slug: 'phb:human',
        speed: 30,
        size: { id: 1, name: 'Medium', code: 'M' },
        modifiers: [
          // Standard Human has +1 to all abilities, no feat
          { modifier_category: 'ability_score', modifier_type: 'bonus', value: 1 }
        ],
        sources: [{ code: 'PHB', name: "Player's Handbook" }]
      }

      expect(store.hasFeatChoices).toBe(false)
    })

    it('raceGrantsBonusFeat detects bonus_feat modifier', () => {
      const store = useCharacterWizardStore()

      // Set Variant Human with modifiers
      store.selections.race = variantHumanRaceWithModifiers as any

      expect(store.raceGrantsBonusFeat).toBe(true)
    })
  })

  describe('Variant Human vs Standard Human', () => {
    it('Variant Human has different ability bonuses than standard Human', () => {
      // Standard Human: +1 to all six ability scores (sum = 6)
      const standardHuman = humanFighterL1.character
      const standardBonuses =
        (standardHuman.ability_scores.STR - standardHuman.base_ability_scores.STR) +
        (standardHuman.ability_scores.DEX - standardHuman.base_ability_scores.DEX) +
        (standardHuman.ability_scores.CON - standardHuman.base_ability_scores.CON) +
        (standardHuman.ability_scores.INT - standardHuman.base_ability_scores.INT) +
        (standardHuman.ability_scores.WIS - standardHuman.base_ability_scores.WIS) +
        (standardHuman.ability_scores.CHA - standardHuman.base_ability_scores.CHA)

      expect(standardBonuses).toBe(6) // +1 to all six

      // Variant Human: +1 to two ability scores (sum = 2)
      const variantHuman = variantHumanFighterL1.character
      const variantBonuses =
        (variantHuman.ability_scores.STR - variantHuman.base_ability_scores.STR) +
        (variantHuman.ability_scores.DEX - variantHuman.base_ability_scores.DEX) +
        (variantHuman.ability_scores.CON - variantHuman.base_ability_scores.CON) +
        (variantHuman.ability_scores.INT - variantHuman.base_ability_scores.INT) +
        (variantHuman.ability_scores.WIS - variantHuman.base_ability_scores.WIS) +
        (variantHuman.ability_scores.CHA - variantHuman.base_ability_scores.CHA)

      expect(variantBonuses).toBe(2) // +1 to two chosen abilities
    })
  })

  describe('Subrace Recognition', () => {
    it('Variant Human is stored as subrace of Human', () => {
      expect(variantHumanFighterL1.character.race.name).toBe('Human')
      expect(variantHumanFighterL1.character.subrace?.name).toBe('Variant Human')
    })
  })
})

// ════════════════════════════════════════════════════════════════
// COMPONENT STRUCTURE TESTS
// ════════════════════════════════════════════════════════════════

describe('Variant Human - Component Structure', () => {
  describe('StepFeats Component', () => {
    it('renders step header', async () => {
      const wrapper = await mountSuspended(StepFeats)

      expect(wrapper.text()).toContain('Feat')
    })
  })
})

// ════════════════════════════════════════════════════════════════
// FIXTURE VALIDATION TESTS
// ════════════════════════════════════════════════════════════════

describe('Variant Human - Fixture Validation', () => {
  describe('Character Structure', () => {
    it('has correct character data', () => {
      expect(variantHumanFighterL1.character.name).toBe('Marcus Ashford')
      expect(variantHumanFighterL1.character.level).toBe(1)
      expect(variantHumanFighterL1.character.status).toBe('draft')
    })

    it('has Human race with Variant Human subrace', () => {
      expect(variantHumanFighterL1.character.race.name).toBe('Human')
      expect(variantHumanFighterL1.character.subrace?.name).toBe('Variant Human')
    })

    it('has Fighter class', () => {
      expect(variantHumanFighterL1.character.class.name).toBe('Fighter')
      expect(variantHumanFighterL1.character.class.hit_die).toBe(10)
    })

    it('has Soldier background', () => {
      expect(variantHumanFighterL1.character.background.name).toBe('Soldier')
    })

    it('has +1 to only two ability scores (Variant Human)', () => {
      const { ability_scores, base_ability_scores } = variantHumanFighterL1.character

      // Count how many abilities got bonuses
      let bonusCount = 0
      if (ability_scores.STR > base_ability_scores.STR) bonusCount++
      if (ability_scores.DEX > base_ability_scores.DEX) bonusCount++
      if (ability_scores.CON > base_ability_scores.CON) bonusCount++
      if (ability_scores.INT > base_ability_scores.INT) bonusCount++
      if (ability_scores.WIS > base_ability_scores.WIS) bonusCount++
      if (ability_scores.CHA > base_ability_scores.CHA) bonusCount++

      expect(bonusCount).toBe(2) // Variant Human gets +1 to two abilities
    })
  })

  describe('Pending Choices', () => {
    it('has 3 pending choices', () => {
      expect(variantHumanFighterL1.pendingChoices.choices).toHaveLength(3)
    })

    it('has feat choice (Variant Human bonus feat)', () => {
      const featChoice = variantHumanFighterL1.pendingChoices.choices.find(
        c => c.type === 'feature' && c.subtype === 'feat'
      )

      expect(featChoice).toBeDefined()
      expect(featChoice?.source).toBe('race')
      expect(featChoice?.source_name).toBe('Variant Human')
      expect(featChoice?.quantity).toBe(1)

      // Should include various feats
      const featSlugs = featChoice?.options?.map(o => o.slug)
      expect(featSlugs).toContain('phb:alert')
      expect(featSlugs).toContain('phb:lucky')
      expect(featSlugs).toContain('phb:great-weapon-master')
      expect(featSlugs).toContain('phb:sentinel')
    })

    it('has skill proficiency choice (Variant Human bonus skill)', () => {
      const skillChoice = variantHumanFighterL1.pendingChoices.choices.find(
        c => c.type === 'proficiency' && c.source === 'race'
      )

      expect(skillChoice).toBeDefined()
      expect(skillChoice?.source_name).toBe('Variant Human')
      expect(skillChoice?.quantity).toBe(1)

      // Should include all skills
      const skillSlugs = skillChoice?.options?.map(o => o.slug)
      expect(skillSlugs).toContain('athletics')
      expect(skillSlugs).toContain('perception')
      expect(skillSlugs).toContain('stealth')
    })

    it('has equipment choice (Fighter)', () => {
      const equipChoice = variantHumanFighterL1.pendingChoices.choices.find(
        c => c.type === 'equipment'
      )

      expect(equipChoice).toBeDefined()
      expect(equipChoice?.source_name).toBe('Fighter')
    })

    it('summary reflects pending feat choice', () => {
      const { pending_choices } = variantHumanFighterL1.summary

      expect(pending_choices.total).toBe(3)
      expect(pending_choices.feature).toBe(1) // Bonus feat
      expect(pending_choices.proficiency).toBe(1) // Bonus skill
      expect(pending_choices.equipment).toBe(1)
    })
  })

  describe('Race Modifiers', () => {
    it('Variant Human has bonus_feat modifier', () => {
      const bonusFeatModifier = variantHumanRaceWithModifiers.modifiers.find(
        m => m.modifier_category === 'bonus_feat'
      )

      expect(bonusFeatModifier).toBeDefined()
      expect(bonusFeatModifier?.modifier_type).toBe('grant')
      expect(bonusFeatModifier?.value).toBe(1)
    })

    it('Variant Human has two ability score modifiers', () => {
      const abilityModifiers = variantHumanRaceWithModifiers.modifiers.filter(
        m => m.modifier_category === 'ability_score'
      )

      expect(abilityModifiers).toHaveLength(2)
    })

    it('Variant Human has skill proficiency choice modifier', () => {
      const skillModifier = variantHumanRaceWithModifiers.modifiers.find(
        m => m.modifier_category === 'skill_proficiency'
      )

      expect(skillModifier).toBeDefined()
      expect(skillModifier?.modifier_type).toBe('choice')
    })
  })
})

// ════════════════════════════════════════════════════════════════
// CONDITIONAL STEP VISIBILITY TESTS
// ════════════════════════════════════════════════════════════════

describe('Variant Human - Conditional Step Visibility', () => {
  describe('Feat Step Should Appear', () => {
    it('standard Human does NOT trigger feat step', () => {
      const store = useCharacterWizardStore()

      // Standard Human with no bonus_feat modifier
      store.selections.race = {
        id: 1,
        name: 'Human',
        slug: 'phb:human',
        speed: 30,
        size: { id: 1, name: 'Medium', code: 'M' },
        sources: [{ code: 'PHB', name: "Player's Handbook" }]
        // No modifiers = no feat
      }

      expect(store.hasFeatChoices).toBe(false)
    })

    it('Variant Human DOES trigger feat step', () => {
      const store = useCharacterWizardStore()

      // Variant Human with bonus_feat modifier
      store.selections.race = variantHumanRaceWithModifiers as any

      expect(store.hasFeatChoices).toBe(true)
    })

    it('Custom Lineage would also trigger feat step', () => {
      const store = useCharacterWizardStore()

      // Custom Lineage (from Tasha's) also grants bonus feat
      store.selections.race = {
        id: 100,
        name: 'Custom Lineage',
        slug: 'tce:custom-lineage',
        speed: 30,
        size: { id: 1, name: 'Medium', code: 'M' },
        modifiers: [
          { modifier_category: 'bonus_feat', modifier_type: 'grant', value: 1 }
        ],
        sources: [{ code: 'TCE', name: "Tasha's Cauldron of Everything" }]
      }

      expect(store.raceGrantsBonusFeat).toBe(true)
      expect(store.hasFeatChoices).toBe(true)
    })
  })
})
