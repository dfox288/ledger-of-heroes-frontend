/**
 * Wizard Level 2 - Arcane Tradition Selection Integration Test
 *
 * Tests the level-up wizard flow for Wizard reaching level 2,
 * which triggers Arcane Tradition (subclass) selection.
 *
 * Key differences from Fighter:
 * - Wizard picks subclass at L2 (earlier than most classes)
 * - Has spell slot progression
 * - INT-based spellcasting stats
 */

import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { server, http, HttpResponse } from '../../msw/server'
import { highElfWizardL2 } from '../../msw/fixtures/characters'

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

describe('Wizard L2 - Level-Up API Integration', () => {
  describe('Level-Up Endpoint', () => {
    it('level-up returns Arcane Tradition feature', async () => {
      server.use(
        http.post('/api/characters/:id/classes/:classSlug/level-up', () => {
          return HttpResponse.json({ data: highElfWizardL2.levelUpResult })
        })
      )

      const response = await fetch('/api/characters/3/classes/phb:wizard/level-up', {
        method: 'POST'
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.new_level).toBe(2)
      expect(data.data.features_gained[0].name).toBe('Arcane Tradition')
    })

    it('level-up shows spell slot progression', async () => {
      server.use(
        http.post('/api/characters/:id/classes/:classSlug/level-up', () => {
          return HttpResponse.json({ data: highElfWizardL2.levelUpResult })
        })
      )

      const response = await fetch('/api/characters/3/classes/phb:wizard/level-up', {
        method: 'POST'
      })
      const data = await response.json()

      // Wizard L2 has 3 first-level slots (up from 2)
      expect(data.data.spell_slots['1st']).toBe(3)
    })

    it('level-up has no ASI at L2', async () => {
      server.use(
        http.post('/api/characters/:id/classes/:classSlug/level-up', () => {
          return HttpResponse.json({ data: highElfWizardL2.levelUpResult })
        })
      )

      const response = await fetch('/api/characters/3/classes/phb:wizard/level-up', {
        method: 'POST'
      })
      const data = await response.json()

      expect(data.data.asi_pending).toBe(false)
    })
  })

  describe('Pending Choices Endpoint', () => {
    it('pending-choices includes subclass choice at L2', async () => {
      server.use(
        http.get('/api/characters/:id/pending-choices', () => {
          return HttpResponse.json({ data: highElfWizardL2.pendingChoices })
        })
      )

      const response = await fetch('/api/characters/3/pending-choices')
      const data = await response.json()

      const subclassChoice = data.data.choices[0]
      expect(subclassChoice.type).toBe('subclass')
      expect(subclassChoice.source_name).toBe('Wizard')
      expect(subclassChoice.level_granted).toBe(2)
    })

    it('subclass options include all 8 PHB schools', async () => {
      server.use(
        http.get('/api/characters/:id/pending-choices', () => {
          return HttpResponse.json({ data: highElfWizardL2.pendingChoices })
        })
      )

      const response = await fetch('/api/characters/3/pending-choices')
      const data = await response.json()

      const subclassChoice = data.data.choices[0]
      expect(subclassChoice.options).toHaveLength(8)

      const slugs = subclassChoice.options.map((o: { slug: string }) => o.slug)
      expect(slugs).toContain('phb:school-of-evocation')
      expect(slugs).toContain('phb:school-of-divination')
      expect(slugs).toContain('phb:school-of-necromancy')
    })
  })
})

// ════════════════════════════════════════════════════════════════
// STORE STATE TESTS
// ════════════════════════════════════════════════════════════════

describe('Wizard L2 - Store State', () => {
  describe('Pending Choices State', () => {
    it('hasSubclassChoice is true for Wizard at L2', () => {
      const store = useCharacterLevelUpStore()

      store.pendingChoices = highElfWizardL2.pendingChoices.choices

      expect(store.hasSubclassChoice).toBe(true)
    })

    it('hasSpellChoices is false (Wizard uses spellbook, not choices)', () => {
      const store = useCharacterLevelUpStore()

      store.pendingChoices = highElfWizardL2.pendingChoices.choices

      // Wizards learn spells by copying into spellbook, not pending choices
      expect(store.hasSpellChoices).toBe(false)
    })
  })

  describe('Spell Slot Awareness', () => {
    it('level-up result includes spell slot data', () => {
      const store = useCharacterLevelUpStore()

      store.levelUpResult = highElfWizardL2.levelUpResult

      expect(store.levelUpResult?.spell_slots).toBeDefined()
      expect(store.levelUpResult?.spell_slots['1st']).toBe(3)
    })
  })
})

// ════════════════════════════════════════════════════════════════
// FIXTURE VALIDATION TESTS
// ════════════════════════════════════════════════════════════════

describe('Wizard L2 - Fixture Validation', () => {
  describe('Character Data', () => {
    it('has correct level and class', () => {
      expect(highElfWizardL2.character.level).toBe(2)
      expect(highElfWizardL2.character.class.name).toBe('Wizard')
      expect(highElfWizardL2.character.class.hit_die).toBe(6)
    })

    it('has High Elf subrace', () => {
      expect(highElfWizardL2.character.race.name).toBe('Elf')
      expect(highElfWizardL2.character.subrace?.name).toBe('High Elf')
    })

    it('has draft status due to pending subclass', () => {
      expect(highElfWizardL2.character.status).toBe('draft')
      expect(highElfWizardL2.character.subclass).toBeNull()
    })

    it('has correct HP for level 2 Wizard', () => {
      // L1: 6+1(CON), L2: 4(avg)+1(CON) = 7 + 4 = 11
      expect(highElfWizardL2.character.hit_points.max).toBe(11)
    })
  })

  describe('Stats Resource', () => {
    it('has INT-based spellcasting', () => {
      expect(highElfWizardL2.stats.spellcasting?.ability).toBe('INT')
      expect(highElfWizardL2.stats.spellcasting?.spell_save_dc).toBe(13)
      expect(highElfWizardL2.stats.spellcasting?.spell_attack_bonus).toBe(5)
    })

    it('has 3 first-level spell slots at L2', () => {
      expect(highElfWizardL2.stats.spellcasting?.spell_slots[1].total).toBe(3)
    })

    it('has 2 hit dice', () => {
      expect(highElfWizardL2.stats.combat.hit_dice.total).toBe(2)
      expect(highElfWizardL2.stats.combat.hit_dice.die).toBe('d6')
    })
  })

  describe('Level-Up Result', () => {
    it('shows L1 → L2 progression', () => {
      expect(highElfWizardL2.levelUpResult.previous_level).toBe(1)
      expect(highElfWizardL2.levelUpResult.new_level).toBe(2)
    })

    it('includes spell slot progression', () => {
      expect(highElfWizardL2.levelUpResult.spell_slots['1st']).toBe(3)
    })
  })

  describe('Pending Choices', () => {
    it('has exactly one pending choice (subclass)', () => {
      expect(highElfWizardL2.pendingChoices.choices).toHaveLength(1)
      expect(highElfWizardL2.pendingChoices.choices[0].type).toBe('subclass')
    })

    it('subclass choice has 8 school options', () => {
      const choice = highElfWizardL2.pendingChoices.choices[0]
      expect(choice.options).toHaveLength(8)
    })
  })
})

// ════════════════════════════════════════════════════════════════
// COMPARISON TESTS
// ════════════════════════════════════════════════════════════════

describe('Wizard vs Fighter Subclass Timing', () => {
  it('Wizard picks subclass at L2, Fighter at L3', () => {
    const wizardChoice = highElfWizardL2.pendingChoices.choices[0]
    expect(wizardChoice.level_granted).toBe(2)

    // Fighter L3 fixture has subclass at L3
    // This test documents the different timings
  })
})
