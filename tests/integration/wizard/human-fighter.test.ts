/**
 * Human Fighter Creation Flow - Integration Test
 *
 * Tests the baseline character creation flow using MSW to mock API responses.
 * Human Fighter is the simplest happy path:
 * - No subrace selection (Human has no subraces)
 * - No subclass at level 1 (Fighter picks at level 3)
 * - No spells (Fighter is not a spellcaster)
 *
 * Test Strategy:
 * 1. API Layer: Use raw fetch() with MSW to test API contracts
 * 2. Store Layer: Test state transitions with Pinia
 * 3. Component Layer: Test structure and UI rendering
 *
 * This catches flow-related bugs like:
 * - #492: Ability scores double-count racial bonuses
 * - #479: Choice shows remaining=0 but selected=[]
 */

import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { http, HttpResponse } from '../../msw/server'
import { humanFighterL1 } from '../../msw/fixtures/characters/human-fighter-l1'
import { useIntegrationTestSetup, addTestHandlers, server } from '../../helpers/integrationSetup'

// Import step components for structure testing
import StepRace from '~/components/character/wizard/StepRace.vue'
import StepClass from '~/components/character/wizard/StepClass.vue'
import StepBackground from '~/components/character/wizard/StepBackground.vue'
import StepDetails from '~/components/character/wizard/StepDetails.vue'

// Import store for state verification
import { useCharacterWizardStore } from '~/stores/characterWizard'

// ════════════════════════════════════════════════════════════════
// TEST SETUP (replaces ~15 lines of boilerplate)
// ════════════════════════════════════════════════════════════════

useIntegrationTestSetup()

// ════════════════════════════════════════════════════════════════
// API INTEGRATION TESTS (using raw fetch with MSW)
// ════════════════════════════════════════════════════════════════

describe('Human Fighter - API Integration', () => {
  describe('Race Endpoints', () => {
    it('GET /api/races returns race list', async () => {
      const response = await fetch('/api/races')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toHaveProperty('data')
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data.some((r: { name: string }) => r.name === 'Human')).toBe(true)
    })

    it('GET /api/races/:slug returns single race', async () => {
      const response = await fetch('/api/races/phb:human')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.name).toBe('Human')
    })

    it('handles race source filtering', async () => {
      const response = await fetch('/api/races?filter=sources.code IN ["PHB"]')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.every((r: { sources: Array<{ code: string }> }) =>
        r.sources.some(s => s.code === 'PHB')
      )).toBe(true)
    })
  })

  describe('Class Endpoints', () => {
    it('GET /api/classes returns class list', async () => {
      const response = await fetch('/api/classes')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toHaveProperty('data')
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data.some((c: { name: string }) => c.name === 'Fighter')).toBe(true)
    })

    it('GET /api/classes/:slug returns single class', async () => {
      const response = await fetch('/api/classes/phb:fighter')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.name).toBe('Fighter')
      expect(data.data.hit_die).toBe(10)
      expect(data.data.subclass_level).toBe(3)
    })

    it('Fighter has no spellcasting ability', async () => {
      const response = await fetch('/api/classes/phb:fighter')
      const data = await response.json()

      expect(data.data.spellcasting_ability).toBeNull()
    })
  })

  describe('Background Endpoints', () => {
    it('GET /api/backgrounds returns background list', async () => {
      const response = await fetch('/api/backgrounds')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toHaveProperty('data')
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('GET /api/backgrounds/:slug returns single background', async () => {
      const response = await fetch('/api/backgrounds/phb:soldier')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.name).toBe('Soldier')
      expect(data.data.feature_name).toBe('Military Rank')
    })
  })

  describe('Character CRUD', () => {
    it('POST /api/characters creates new character', async () => {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Fighter' })
      })
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.data).toHaveProperty('id')
      expect(data.data).toHaveProperty('public_id')
      expect(data.data.status).toBe('draft')
    })

    it('PATCH /api/characters/:id updates character', async () => {
      const response = await fetch('/api/characters/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Fighter',
          race_id: 1,
          class_id: 1
        })
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.name).toBe('Updated Fighter')
    })

    it('GET /api/characters/:id/pending-choices returns choices', async () => {
      const response = await fetch('/api/characters/1/pending-choices')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data).toHaveProperty('choices')
      expect(Array.isArray(data.data.choices)).toBe(true)
    })

    it('POST /api/characters/:id/choices/:choiceId resolves choice', async () => {
      const response = await fetch('/api/characters/1/choices/test-choice-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: ['option1', 'option2'] })
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.resolved).toBe(true)
      expect(data.data.selected).toEqual(['option1', 'option2'])
    })
  })

  describe('Error Handling', () => {
    it('returns 404 for unknown character', async () => {
      const response = await fetch('/api/characters/unknown-id-99999')

      expect(response.status).toBe(404)
    })

    it('handles server errors gracefully', async () => {
      server.use(
        http.get('/api/races', () => {
          return HttpResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )

      const response = await fetch('/api/races')

      expect(response.status).toBe(500)
    })
  })
})

// ════════════════════════════════════════════════════════════════
// STORE STATE TESTS (Pinia store behavior)
// ════════════════════════════════════════════════════════════════

describe('Human Fighter - Store State', () => {
  describe('Initial State', () => {
    it('starts with null selections', () => {
      const store = useCharacterWizardStore()

      expect(store.selections.race).toBeNull()
      expect(store.selections.class).toBeNull()
      expect(store.selections.background).toBeNull()
      expect(store.selections.subrace).toBeNull()
      expect(store.selections.subclass).toBeNull()
    })

    it('starts with empty name', () => {
      const store = useCharacterWizardStore()

      expect(store.selections.name).toBe('')
    })

    it('starts with null alignment', () => {
      const store = useCharacterWizardStore()

      expect(store.selections.alignment).toBeNull()
    })
  })

  describe('Human Race Selection', () => {
    it('setting Human race updates store', () => {
      const store = useCharacterWizardStore()

      const humanRace = {
        id: 1,
        name: 'Human',
        slug: 'phb:human',
        speed: 30,
        size: { id: 1, name: 'Medium', code: 'M' },
        ability_bonuses: [
          { ability_score: { id: 1, code: 'STR', name: 'Strength' }, bonus: 1 }
        ],
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      store.selections.race = humanRace

      expect(store.selections.race?.name).toBe('Human')
      expect(store.selections.race?.slug).toBe('phb:human')
    })

    it('Human has no subraces - needsSubraceStep is false', () => {
      const store = useCharacterWizardStore()

      store.selections.race = {
        id: 1,
        name: 'Human',
        slug: 'phb:human',
        speed: 30,
        size: { id: 1, name: 'Medium', code: 'M' },
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
        // Note: no has_subraces or subraces property
      }

      expect(store.needsSubraceStep).toBe(false)
    })
  })

  describe('Fighter Class Selection', () => {
    it('setting Fighter class updates store', () => {
      const store = useCharacterWizardStore()

      const fighterClass = {
        id: 1,
        name: 'Fighter',
        slug: 'phb:fighter',
        hit_die: 10,
        primary_ability: { id: 1, code: 'STR', name: 'Strength' },
        spellcasting_ability: null,
        subclass_level: 3,
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      store.selections.class = fighterClass

      expect(store.selections.class?.name).toBe('Fighter')
      expect(store.selections.class?.hit_die).toBe(10)
    })

    it('Fighter at level 1 does not need subclass - needsSubclassStep is false', () => {
      const store = useCharacterWizardStore()

      store.selections.class = {
        id: 1,
        name: 'Fighter',
        slug: 'phb:fighter',
        hit_die: 10,
        primary_ability: { id: 1, code: 'STR', name: 'Strength' },
        spellcasting_ability: null,
        subclass_level: 3, // Fighter picks at level 3
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      expect(store.needsSubclassStep).toBe(false)
    })

    it('Fighter is not a spellcaster - isSpellcaster is false', () => {
      const store = useCharacterWizardStore()

      store.selections.class = {
        id: 1,
        name: 'Fighter',
        slug: 'phb:fighter',
        hit_die: 10,
        primary_ability: { id: 1, code: 'STR', name: 'Strength' },
        spellcasting_ability: null, // No spellcasting
        subclass_level: 3,
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      expect(store.isSpellcaster).toBe(false)
    })
  })

  describe('Background Selection', () => {
    it('setting Soldier background updates store', () => {
      const store = useCharacterWizardStore()

      store.selections.background = {
        id: 2,
        name: 'Soldier',
        slug: 'phb:soldier',
        feature_name: 'Military Rank',
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      expect(store.selections.background?.name).toBe('Soldier')
      expect(store.selections.background?.feature_name).toBe('Military Rank')
    })
  })

  describe('Complete Human Fighter Flow', () => {
    it('can set all selections for complete character', () => {
      const store = useCharacterWizardStore()

      // Set race
      store.selections.race = {
        id: 1,
        name: 'Human',
        slug: 'phb:human',
        speed: 30,
        size: { id: 1, name: 'Medium', code: 'M' },
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      // Set class
      store.selections.class = {
        id: 1,
        name: 'Fighter',
        slug: 'phb:fighter',
        hit_die: 10,
        primary_ability: { id: 1, code: 'STR', name: 'Strength' },
        spellcasting_ability: null,
        subclass_level: 3,
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      // Set background
      store.selections.background = {
        id: 2,
        name: 'Soldier',
        slug: 'phb:soldier',
        feature_name: 'Military Rank',
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      // Set name
      store.selections.name = 'Thorin Ironforge'
      store.selections.alignment = 'Lawful Good'

      // Verify all selections
      expect(store.selections.race?.name).toBe('Human')
      expect(store.selections.class?.name).toBe('Fighter')
      expect(store.selections.background?.name).toBe('Soldier')
      expect(store.selections.name).toBe('Thorin Ironforge')
      expect(store.selections.alignment).toBe('Lawful Good')

      // Verify no subrace/subclass needed
      expect(store.needsSubraceStep).toBe(false)
      expect(store.needsSubclassStep).toBe(false)
      expect(store.isSpellcaster).toBe(false)
    })

    it('reset clears all selections', () => {
      const store = useCharacterWizardStore()

      // Set some values
      store.selections.race = { id: 1, name: 'Human', slug: 'phb:human' } as any
      store.selections.name = 'Test Character'

      // Reset
      store.reset()

      // Verify cleared
      expect(store.selections.race).toBeNull()
      expect(store.selections.name).toBe('')
    })
  })
})

// ════════════════════════════════════════════════════════════════
// COMPONENT STRUCTURE TESTS
// ════════════════════════════════════════════════════════════════

describe('Human Fighter - Component Structure', () => {
  describe('StepRace Component', () => {
    it('renders step header', async () => {
      const wrapper = await mountSuspended(StepRace)

      expect(wrapper.text()).toContain('Choose Your Race')
    })

    it('renders search input', async () => {
      const wrapper = await mountSuspended(StepRace)

      const searchInput = wrapper.find('input[placeholder*="Search"]')
      expect(searchInput.exists()).toBe(true)
    })

    it('renders continue button', async () => {
      const wrapper = await mountSuspended(StepRace)

      const buttons = wrapper.findAll('button')
      const continueButton = buttons.find(b =>
        b.text().toLowerCase().includes('continue')
      )
      expect(continueButton).toBeDefined()
    })
  })

  describe('StepClass Component', () => {
    it('renders step header', async () => {
      const wrapper = await mountSuspended(StepClass)

      expect(wrapper.text()).toContain('Choose Your Class')
    })

    it('renders search input', async () => {
      const wrapper = await mountSuspended(StepClass)

      const searchInput = wrapper.find('input[placeholder*="Search"]')
      expect(searchInput.exists()).toBe(true)
    })
  })

  describe('StepBackground Component', () => {
    it('renders step header', async () => {
      const wrapper = await mountSuspended(StepBackground)

      expect(wrapper.text()).toContain('Choose Your Background')
    })

    it('renders search input', async () => {
      const wrapper = await mountSuspended(StepBackground)

      const searchInput = wrapper.find('input[placeholder*="Search"]')
      expect(searchInput.exists()).toBe(true)
    })
  })

  describe('StepDetails Component', () => {
    it('renders step header', async () => {
      const wrapper = await mountSuspended(StepDetails)

      expect(wrapper.text()).toContain('Character Details')
    })

    it('renders name input', async () => {
      const wrapper = await mountSuspended(StepDetails)

      const nameInput = wrapper.find('input[type="text"]')
      expect(nameInput.exists()).toBe(true)
    })

    it('renders alignment select', async () => {
      const wrapper = await mountSuspended(StepDetails)

      const alignmentSelect = wrapper.find('[data-testid="alignment-select"]')
      expect(alignmentSelect.exists()).toBe(true)
    })
  })
})

// ════════════════════════════════════════════════════════════════
// FIXTURE VALIDATION TESTS
// ════════════════════════════════════════════════════════════════

describe('Human Fighter - Fixture Validation', () => {
  describe('humanFighterL1 Fixture', () => {
    it('has correct character structure', () => {
      expect(humanFighterL1.character.name).toBe('Thorin Ironforge')
      expect(humanFighterL1.character.level).toBe(1)
      expect(humanFighterL1.character.status).toBe('complete')
    })

    it('has Human race', () => {
      expect(humanFighterL1.character.race.name).toBe('Human')
      expect(humanFighterL1.character.race.slug).toBe('phb:human')
      expect(humanFighterL1.character.subrace).toBeNull()
    })

    it('has Fighter class', () => {
      expect(humanFighterL1.character.class.name).toBe('Fighter')
      expect(humanFighterL1.character.class.slug).toBe('phb:fighter')
      expect(humanFighterL1.character.class.hit_die).toBe(10)
      expect(humanFighterL1.character.subclass).toBeNull()
    })

    it('has Soldier background', () => {
      expect(humanFighterL1.character.background.name).toBe('Soldier')
      expect(humanFighterL1.character.background.slug).toBe('phb:soldier')
    })

    it('has correct ability scores', () => {
      const { ability_scores } = humanFighterL1.character
      expect(ability_scores.STR).toBe(16)
      expect(ability_scores.DEX).toBe(14)
      expect(ability_scores.CON).toBe(15)
      expect(ability_scores.INT).toBe(10)
      expect(ability_scores.WIS).toBe(12)
      expect(ability_scores.CHA).toBe(9)
    })

    it('has base ability scores (before racial bonuses)', () => {
      const { base_ability_scores } = humanFighterL1.character
      expect(base_ability_scores.STR).toBe(15)
      expect(base_ability_scores.DEX).toBe(13)
      expect(base_ability_scores.CON).toBe(14)
      expect(base_ability_scores.INT).toBe(9)
      expect(base_ability_scores.WIS).toBe(11)
      expect(base_ability_scores.CHA).toBe(8)
    })

    it('racial bonuses are correctly applied (+1 to all for Human)', () => {
      const { ability_scores, base_ability_scores } = humanFighterL1.character

      // Human gets +1 to all ability scores
      expect(ability_scores.STR - base_ability_scores.STR).toBe(1)
      expect(ability_scores.DEX - base_ability_scores.DEX).toBe(1)
      expect(ability_scores.CON - base_ability_scores.CON).toBe(1)
      expect(ability_scores.INT - base_ability_scores.INT).toBe(1)
      expect(ability_scores.WIS - base_ability_scores.WIS).toBe(1)
      expect(ability_scores.CHA - base_ability_scores.CHA).toBe(1)
    })
  })

  describe('Stats Resource', () => {
    it('has correct ability score modifiers', () => {
      const { ability_scores } = humanFighterL1.stats

      // STR 16 = +3 modifier
      expect(ability_scores.STR.score).toBe(16)
      expect(ability_scores.STR.modifier).toBe(3)

      // DEX 14 = +2 modifier
      expect(ability_scores.DEX.score).toBe(14)
      expect(ability_scores.DEX.modifier).toBe(2)
    })

    it('has correct saving throw proficiencies', () => {
      const { ability_scores } = humanFighterL1.stats

      // Fighter proficient in STR and CON saves
      expect(ability_scores.STR.proficient).toBe(true)
      expect(ability_scores.CON.proficient).toBe(true)
      expect(ability_scores.DEX.proficient).toBe(false)
    })

    it('has correct combat stats', () => {
      expect(humanFighterL1.stats.combat.armor_class).toBe(16)
      expect(humanFighterL1.stats.combat.initiative).toBe(2) // DEX mod
      expect(humanFighterL1.stats.combat.proficiency_bonus).toBe(2)
    })

    it('has no spellcasting (Fighter is martial)', () => {
      expect(humanFighterL1.stats.spellcasting).toBeNull()
    })
  })

  describe('Pending Choices', () => {
    it('complete character has no pending choices', () => {
      expect(humanFighterL1.pendingChoices.choices).toHaveLength(0)
    })

    it('summary shows zero pending choices', () => {
      const { pending_choices } = humanFighterL1.summary

      expect(pending_choices.total).toBe(0)
      expect(pending_choices.proficiency).toBe(0)
      expect(pending_choices.equipment).toBe(0)
      expect(pending_choices.spell).toBe(0)
      expect(pending_choices.language).toBe(0)
    })
  })
})
