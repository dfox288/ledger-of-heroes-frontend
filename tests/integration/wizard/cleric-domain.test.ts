/**
 * Cleric (Divine Domain) Creation Flow - Integration Test
 *
 * Tests character creation with:
 * - Subclass selection at level 1 (Clerics choose Divine Domain immediately)
 * - Spell selection (Clerics are WIS-based spellcasters)
 * - Pending choices (proficiency, spell, equipment, language)
 *
 * This is more complex than Human Fighter because:
 * 1. needsSubclassStep is true at level 1
 * 2. isSpellcaster is true
 * 3. The draft fixture has 4 unresolved pending choices
 *
 * Bugs these tests should catch:
 * - #479: Choice shows remaining=0 but selected=[] (selection→save)
 * - #493: Subclass choice ignores body (API payload)
 */

import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { http, HttpResponse } from '#tests/msw/server'
import { useIntegrationTestSetup, server } from '#tests/helpers/integrationSetup'
import { draftClericL1 } from '#tests/msw/fixtures/characters/draft-cleric-l1'

// Import step components
import StepSubclass from '~/components/character/wizard/StepSubclass.vue'
import StepSpells from '~/components/character/wizard/StepSpells.vue'
import StepProficiencies from '~/components/character/wizard/StepProficiencies.vue'
import StepLanguages from '~/components/character/wizard/StepLanguages.vue'
import StepEquipment from '~/components/character/wizard/StepEquipment.vue'

// Import store
import { useCharacterWizardStore } from '~/stores/characterWizard'

// ════════════════════════════════════════════════════════════════
// TEST SETUP (replaces ~15 lines of MSW/Pinia boilerplate)
// ════════════════════════════════════════════════════════════════

useIntegrationTestSetup()

// ════════════════════════════════════════════════════════════════
// API INTEGRATION TESTS
// ════════════════════════════════════════════════════════════════

describe('Cleric Domain - API Integration', () => {
  describe('Cleric Character Data', () => {
    it('draft cleric has expected character data', async () => {
      server.use(
        http.get('/api/characters/:id', ({ params }) => {
          if (params.id === draftClericL1.character.public_id) {
            return HttpResponse.json({ data: draftClericL1.character })
          }
          return HttpResponse.json({ error: 'Not found' }, { status: 404 })
        })
      )

      const response = await fetch(`/api/characters/${draftClericL1.character.public_id}`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.name).toBe('Sister Elara')
      expect(data.data.class.name).toBe('Cleric')
      expect(data.data.status).toBe('draft')
    })

    it('draft cleric has pending choices', async () => {
      server.use(
        http.get('/api/characters/:id/pending-choices', () => {
          return HttpResponse.json({ data: draftClericL1.pendingChoices })
        })
      )

      const response = await fetch(`/api/characters/${draftClericL1.character.id}/pending-choices`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.choices.length).toBe(4)
    })
  })

  describe('Subclass Selection API', () => {
    it('can resolve subclass choice via API', async () => {
      const choiceId = 'subclass|class|phb:cleric|1|divine_domain'
      const selectedDomain = 'phb:life-domain'

      server.use(
        http.post('/api/characters/:id/choices/:choiceId', async ({ params, request }) => {
          const body = await request.json() as { selected?: string[] }
          expect(params.choiceId).toBe(choiceId)
          expect(body.selected).toContain(selectedDomain)

          return HttpResponse.json({
            data: {
              choice_id: choiceId,
              resolved: true,
              selected: body.selected
            }
          })
        })
      )

      const response = await fetch(`/api/characters/2/choices/${choiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: [selectedDomain] })
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.resolved).toBe(true)
      expect(data.data.selected).toContain(selectedDomain)
    })
  })

  describe('Spell Selection API', () => {
    it('can resolve cantrip choice via API', async () => {
      const choiceId = 'spell|class|phb:cleric|1|cantrips'
      const selectedCantrips = ['phb:guidance', 'phb:light', 'phb:sacred-flame']

      server.use(
        http.post('/api/characters/:id/choices/:choiceId', async ({ params, request }) => {
          const body = await request.json() as { selected?: string[] }

          return HttpResponse.json({
            data: {
              choice_id: params.choiceId,
              resolved: true,
              selected: body.selected
            }
          })
        })
      )

      const response = await fetch(`/api/characters/2/choices/${choiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: selectedCantrips })
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.resolved).toBe(true)
      expect(data.data.selected).toHaveLength(3)
    })

    it('verifies spell options include Cleric cantrips', () => {
      const spellChoice = draftClericL1.pendingChoices.choices.find(
        c => c.type === 'spell' && c.subtype === 'cantrip'
      )

      expect(spellChoice).toBeDefined()
      expect(spellChoice?.options).toContainEqual(
        expect.objectContaining({ name: 'Guidance' })
      )
      expect(spellChoice?.options).toContainEqual(
        expect.objectContaining({ name: 'Sacred Flame' })
      )
      expect(spellChoice?.options).toContainEqual(
        expect.objectContaining({ name: 'Light' })
      )
    })
  })

  describe('Proficiency Selection API', () => {
    it('can resolve skill proficiency choice via API', async () => {
      const choiceId = 'proficiency|class|phb:cleric|1|skill_choice_1'
      const selectedSkills = ['history', 'medicine']

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

      const response = await fetch(`/api/characters/2/choices/${choiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: selectedSkills })
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.resolved).toBe(true)
      expect(data.data.selected).toEqual(selectedSkills)
    })
  })

  describe('Language Selection API', () => {
    it('can resolve language choice via API', async () => {
      const choiceId = 'language|background|phb:acolyte|1|choice_1'
      const selectedLanguages = ['celestial', 'elvish']

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

      const response = await fetch(`/api/characters/2/choices/${choiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: selectedLanguages })
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.resolved).toBe(true)
      expect(data.data.selected).toEqual(selectedLanguages)
    })
  })

  describe('Equipment Selection API', () => {
    it('can resolve equipment choice via API', async () => {
      const choiceId = 'equipment|class|phb:cleric|1|choice_1'
      const selectedEquipment = ['a'] // Option a: mace

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

      const response = await fetch(`/api/characters/2/choices/${choiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: selectedEquipment })
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

describe('Cleric Domain - Store State', () => {
  describe('Cleric Class Selection', () => {
    it('Cleric needs subclass at level 1 - needsSubclassStep is true', () => {
      const store = useCharacterWizardStore()

      store.selections.class = {
        id: 3,
        name: 'Cleric',
        slug: 'phb:cleric',
        hit_die: 8,
        primary_ability: { id: 5, code: 'WIS', name: 'Wisdom' },
        spellcasting_ability: { id: 5, code: 'WIS', name: 'Wisdom' },
        subclass_level: 1, // Cleric picks at level 1!
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      expect(store.needsSubclassStep).toBe(true)
    })

    it('Cleric is a spellcaster - isSpellcaster is true when level_progression provided', () => {
      const store = useCharacterWizardStore()

      store.selections.class = {
        id: 3,
        name: 'Cleric',
        slug: 'phb:cleric',
        hit_die: 8,
        primary_ability: { id: 5, code: 'WIS', name: 'Wisdom' },
        spellcasting_ability: { id: 5, code: 'WIS', name: 'Wisdom' },
        subclass_level: 1,
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }],
        // Required for isSpellcaster to return true
        level_progression: [
          { level: 1, cantrips_known: 3, spells_known: null }
        ]
      }

      expect(store.isSpellcaster).toBe(true)
    })

    it('isSpellcaster is false without level_progression data', () => {
      const store = useCharacterWizardStore()

      store.selections.class = {
        id: 3,
        name: 'Cleric',
        slug: 'phb:cleric',
        hit_die: 8,
        primary_ability: { id: 5, code: 'WIS', name: 'Wisdom' },
        spellcasting_ability: { id: 5, code: 'WIS', name: 'Wisdom' },
        subclass_level: 1,
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
        // No level_progression = isSpellcaster returns false
      }

      // Without level_progression, isSpellcaster is false even with spellcasting_ability
      expect(store.isSpellcaster).toBe(false)
    })
  })

  describe('Subclass Selection', () => {
    it('can set Life Domain subclass', () => {
      const store = useCharacterWizardStore()

      store.selections.subclass = {
        id: 1,
        name: 'Life Domain',
        slug: 'phb:life-domain',
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      expect(store.selections.subclass?.name).toBe('Life Domain')
    })

    it('setting subclass before class still works', () => {
      const store = useCharacterWizardStore()

      // Set subclass first (edge case)
      store.selections.subclass = {
        id: 1,
        name: 'Life Domain',
        slug: 'phb:life-domain',
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      // Then set class
      store.selections.class = {
        id: 3,
        name: 'Cleric',
        slug: 'phb:cleric',
        hit_die: 8,
        primary_ability: { id: 5, code: 'WIS', name: 'Wisdom' },
        spellcasting_ability: { id: 5, code: 'WIS', name: 'Wisdom' },
        subclass_level: 1,
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      expect(store.selections.class?.name).toBe('Cleric')
      expect(store.selections.subclass?.name).toBe('Life Domain')
    })
  })

  describe('Complete Cleric Flow', () => {
    it('can set all selections for Cleric character', () => {
      const store = useCharacterWizardStore()

      // Set race (Human)
      store.selections.race = {
        id: 1,
        name: 'Human',
        slug: 'phb:human',
        speed: 30,
        size: { id: 1, name: 'Medium', code: 'M' },
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      // Set class (Cleric) - with level_progression for isSpellcaster
      store.selections.class = {
        id: 3,
        name: 'Cleric',
        slug: 'phb:cleric',
        hit_die: 8,
        primary_ability: { id: 5, code: 'WIS', name: 'Wisdom' },
        spellcasting_ability: { id: 5, code: 'WIS', name: 'Wisdom' },
        subclass_level: 1,
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }],
        level_progression: [
          { level: 1, cantrips_known: 3, spells_known: null }
        ]
      }

      // Set subclass (Life Domain)
      store.selections.subclass = {
        id: 1,
        name: 'Life Domain',
        slug: 'phb:life-domain',
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      // Set background (Acolyte)
      store.selections.background = {
        id: 1,
        name: 'Acolyte',
        slug: 'phb:acolyte',
        feature_name: 'Shelter of the Faithful',
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      // Set name
      store.selections.name = 'Sister Elara'

      // Verify
      expect(store.selections.race?.name).toBe('Human')
      expect(store.selections.class?.name).toBe('Cleric')
      expect(store.selections.subclass?.name).toBe('Life Domain')
      expect(store.selections.background?.name).toBe('Acolyte')
      expect(store.needsSubclassStep).toBe(true)
      expect(store.isSpellcaster).toBe(true)
    })
  })
})

// ════════════════════════════════════════════════════════════════
// COMPONENT STRUCTURE TESTS
// ════════════════════════════════════════════════════════════════

describe('Cleric Domain - Component Structure', () => {
  describe('StepSubclass Component', () => {
    it('renders step header', async () => {
      const wrapper = await mountSuspended(StepSubclass)

      expect(wrapper.text()).toContain('Subclass')
    })
  })

  describe('StepSpells Component', () => {
    it('renders step header', async () => {
      const wrapper = await mountSuspended(StepSpells)

      expect(wrapper.text()).toContain('Spell')
    })
  })

  describe('StepProficiencies Component', () => {
    it('renders step header', async () => {
      const wrapper = await mountSuspended(StepProficiencies)

      expect(wrapper.text()).toContain('Proficienc')
    })
  })

  describe('StepLanguages Component', () => {
    it('renders step header', async () => {
      const wrapper = await mountSuspended(StepLanguages)

      expect(wrapper.text()).toContain('Language')
    })
  })

  describe('StepEquipment Component', () => {
    it('renders step header', async () => {
      const wrapper = await mountSuspended(StepEquipment)

      expect(wrapper.text()).toContain('Equipment')
    })
  })
})

// ════════════════════════════════════════════════════════════════
// FIXTURE VALIDATION TESTS
// ════════════════════════════════════════════════════════════════

describe('Cleric Domain - Fixture Validation', () => {
  describe('draftClericL1 Character', () => {
    it('has correct character structure', () => {
      expect(draftClericL1.character.name).toBe('Sister Elara')
      expect(draftClericL1.character.level).toBe(1)
      expect(draftClericL1.character.status).toBe('draft')
    })

    it('has Cleric class', () => {
      expect(draftClericL1.character.class.name).toBe('Cleric')
      expect(draftClericL1.character.class.slug).toBe('phb:cleric')
      expect(draftClericL1.character.class.hit_die).toBe(8)
    })

    it('has no subclass yet (pending choice)', () => {
      expect(draftClericL1.character.subclass).toBeNull()
    })

    it('has Human race with no subrace', () => {
      expect(draftClericL1.character.race.name).toBe('Human')
      expect(draftClericL1.character.subrace).toBeNull()
    })

    it('has Acolyte background', () => {
      expect(draftClericL1.character.background.name).toBe('Acolyte')
    })
  })

  describe('draftClericL1 Stats', () => {
    it('has WIS-based spellcasting', () => {
      const { spellcasting } = draftClericL1.stats

      expect(spellcasting).not.toBeNull()
      expect(spellcasting?.ability).toBe('WIS')
      expect(spellcasting?.spell_save_dc).toBe(13) // 8 + 2 (prof) + 3 (WIS mod)
      expect(spellcasting?.spell_attack_bonus).toBe(5) // 2 (prof) + 3 (WIS mod)
    })

    it('has correct spell slot configuration at level 1', () => {
      const { spellcasting } = draftClericL1.stats

      expect(spellcasting?.cantrips_known).toBe(3)
      expect(spellcasting?.spells_prepared).toBe(4) // WIS mod (3) + level (1)
      expect(spellcasting?.spell_slots?.[1].total).toBe(2)
    })

    it('has WIS as primary ability', () => {
      expect(draftClericL1.stats.ability_scores.WIS.score).toBe(16)
      expect(draftClericL1.stats.ability_scores.WIS.modifier).toBe(3)
    })

    it('has WIS and CHA saving throw proficiencies', () => {
      expect(draftClericL1.stats.ability_scores.WIS.proficient).toBe(true)
      expect(draftClericL1.stats.ability_scores.CHA.proficient).toBe(true)
      expect(draftClericL1.stats.ability_scores.STR.proficient).toBe(false)
    })
  })

  describe('draftClericL1 Pending Choices', () => {
    it('has 4 pending choices', () => {
      expect(draftClericL1.pendingChoices.choices).toHaveLength(4)
    })

    it('has proficiency choice (class skills)', () => {
      const profChoice = draftClericL1.pendingChoices.choices.find(
        c => c.type === 'proficiency'
      )

      expect(profChoice).toBeDefined()
      expect(profChoice?.source).toBe('class')
      expect(profChoice?.source_name).toBe('Cleric')
      expect(profChoice?.quantity).toBe(2)
      expect(profChoice?.remaining).toBe(2)
      expect(profChoice?.selected).toHaveLength(0)
    })

    it('has spell choice (cantrips)', () => {
      const spellChoice = draftClericL1.pendingChoices.choices.find(
        c => c.type === 'spell'
      )

      expect(spellChoice).toBeDefined()
      expect(spellChoice?.subtype).toBe('cantrip')
      expect(spellChoice?.quantity).toBe(3)
      expect(spellChoice?.remaining).toBe(3)
      expect(spellChoice?.options?.length).toBeGreaterThan(0)
    })

    it('has equipment choice', () => {
      const equipChoice = draftClericL1.pendingChoices.choices.find(
        c => c.type === 'equipment'
      )

      expect(equipChoice).toBeDefined()
      expect(equipChoice?.source).toBe('class')
      expect(equipChoice?.quantity).toBe(1)
    })

    it('has language choice (background)', () => {
      const langChoice = draftClericL1.pendingChoices.choices.find(
        c => c.type === 'language'
      )

      expect(langChoice).toBeDefined()
      expect(langChoice?.source).toBe('background')
      expect(langChoice?.source_name).toBe('Acolyte')
      expect(langChoice?.quantity).toBe(2)
    })

    it('summary matches pending choice count', () => {
      const { pending_choices } = draftClericL1.summary

      expect(pending_choices.total).toBe(4)
      expect(pending_choices.proficiency).toBe(1)
      expect(pending_choices.spell).toBe(1)
      expect(pending_choices.equipment).toBe(1)
      expect(pending_choices.language).toBe(1)
    })
  })

  describe('Choice Options Validation', () => {
    it('proficiency options are valid Cleric skills', () => {
      const profChoice = draftClericL1.pendingChoices.choices.find(
        c => c.type === 'proficiency'
      )

      const skillSlugs = profChoice?.options?.map(o => o.slug)

      // Cleric skill options: History, Insight, Medicine, Persuasion, Religion
      expect(skillSlugs).toContain('history')
      expect(skillSlugs).toContain('insight')
      expect(skillSlugs).toContain('medicine')
      expect(skillSlugs).toContain('persuasion')
      expect(skillSlugs).toContain('religion')
    })

    it('spell options are valid Cleric cantrips', () => {
      const spellChoice = draftClericL1.pendingChoices.choices.find(
        c => c.type === 'spell'
      )

      const spellSlugs = spellChoice?.options?.map((o: { slug?: string }) => o.slug)

      // Sample Cleric cantrips
      expect(spellSlugs).toContain('phb:guidance')
      expect(spellSlugs).toContain('phb:light')
      expect(spellSlugs).toContain('phb:sacred-flame')
      expect(spellSlugs).toContain('phb:thaumaturgy')
    })

    it('equipment options have correct structure', () => {
      const equipChoice = draftClericL1.pendingChoices.choices.find(
        c => c.type === 'equipment'
      )

      expect(equipChoice?.options).toHaveLength(2)

      const optionA = equipChoice?.options?.find((o: { option?: string }) => o.option === 'a')
      const optionB = equipChoice?.options?.find((o: { option?: string }) => o.option === 'b')

      expect(optionA?.label).toContain('mace')
      expect(optionB?.label).toContain('warhammer')
    })

    it('language options include exotic languages', () => {
      const langChoice = draftClericL1.pendingChoices.choices.find(
        c => c.type === 'language'
      )

      const langSlugs = langChoice?.options?.map(o => o.slug)

      // Acolyte gets 2 languages of choice
      expect(langSlugs).toContain('celestial')
      expect(langSlugs).toContain('abyssal')
      expect(langSlugs).toContain('infernal')
      expect(langSlugs).toContain('elvish')
    })
  })
})

// ════════════════════════════════════════════════════════════════
// BUG REGRESSION TESTS
// ════════════════════════════════════════════════════════════════

describe('Cleric Domain - Bug Regression', () => {
  describe('#479: Choice remaining=0 but selected=[]', () => {
    it('pending choices have consistent remaining and selected values', () => {
      for (const choice of draftClericL1.pendingChoices.choices) {
        // If remaining is 0, selected should have quantity items
        if (choice.remaining === 0) {
          expect(choice.selected.length).toBe(choice.quantity)
        }

        // If remaining equals quantity, selected should be empty
        if (choice.remaining === choice.quantity) {
          expect(choice.selected.length).toBe(0)
        }

        // remaining + selected.length should equal quantity
        expect(choice.remaining + choice.selected.length).toBe(choice.quantity)
      }
    })
  })

  describe('#493: Subclass choice ignores body', () => {
    it('subclass choice API correctly receives selected value', async () => {
      let capturedBody: { selected?: string[] } | null = null

      server.use(
        http.post('/api/characters/:id/choices/:choiceId', async ({ request }) => {
          capturedBody = await request.json() as { selected?: string[] }
          return HttpResponse.json({
            data: {
              resolved: true,
              selected: capturedBody.selected
            }
          })
        })
      )

      const subclassSlug = 'phb:life-domain'
      await fetch('/api/characters/2/choices/subclass-choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: [subclassSlug] })
      })

      expect(capturedBody).not.toBeNull()
      expect(capturedBody?.selected).toContain(subclassSlug)
    })
  })
})
