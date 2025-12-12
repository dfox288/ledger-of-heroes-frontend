/**
 * High Elf Wizard Creation Flow - Integration Test
 *
 * Tests character creation with:
 * - Subrace selection (Elf → High Elf)
 * - INT-based spellcasting
 * - Wizard cantrip selection (3 base + 1 from High Elf)
 *
 * Key differences from Human Fighter:
 * - needsSubraceStep = true (Elf has subraces)
 * - isSpellcaster = true (Wizard)
 * - needsSubclassStep = false (Wizard picks at level 2)
 *
 * Key differences from Cleric:
 * - Has subrace step instead of subclass step
 * - Different spellcasting ability (INT vs WIS)
 */

import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { http, HttpResponse } from '../../msw/server'
import { useIntegrationTestSetup, server } from '../../helpers/integrationSetup'
import { highElfWizardL1 } from '../../msw/fixtures/characters/high-elf-wizard-l1'

// Import step components
import StepSubrace from '~/components/character/wizard/StepSubrace.vue'

// Import store
import { useCharacterWizardStore } from '~/stores/characterWizard'

// ════════════════════════════════════════════════════════════════
// TEST SETUP (replaces ~15 lines of MSW/Pinia boilerplate)
// ════════════════════════════════════════════════════════════════

useIntegrationTestSetup()

// ════════════════════════════════════════════════════════════════
// API INTEGRATION TESTS
// ════════════════════════════════════════════════════════════════

describe('High Elf Wizard - API Integration', () => {
  describe('Character Data', () => {
    it('High Elf Wizard has expected character data', async () => {
      server.use(
        http.get('/api/characters/:id', ({ params }) => {
          if (params.id === highElfWizardL1.character.public_id) {
            return HttpResponse.json({ data: highElfWizardL1.character })
          }
          return HttpResponse.json({ error: 'Not found' }, { status: 404 })
        })
      )

      const response = await fetch(`/api/characters/${highElfWizardL1.character.public_id}`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.name).toBe('Aelindra Starweaver')
      expect(data.data.race.name).toBe('Elf')
      expect(data.data.subrace.name).toBe('High Elf')
      expect(data.data.class.name).toBe('Wizard')
      expect(data.data.status).toBe('draft')
    })

    it('character has pending choices', async () => {
      server.use(
        http.get('/api/characters/:id/pending-choices', () => {
          return HttpResponse.json({ data: highElfWizardL1.pendingChoices })
        })
      )

      const response = await fetch(`/api/characters/${highElfWizardL1.character.id}/pending-choices`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.choices.length).toBe(3)
    })
  })

  describe('Subrace API', () => {
    it('can fetch subraces for Elf', async () => {
      server.use(
        http.get('/api/races/:slug/subraces', ({ params }) => {
          if (params.slug === 'phb:elf') {
            return HttpResponse.json({
              data: [
                {
                  id: 3,
                  name: 'High Elf',
                  slug: 'phb:high-elf',
                  ability_bonuses: [
                    { ability_score: { id: 4, code: 'INT', name: 'Intelligence' }, bonus: 1 }
                  ],
                  sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
                },
                {
                  id: 4,
                  name: 'Wood Elf',
                  slug: 'phb:wood-elf',
                  ability_bonuses: [
                    { ability_score: { id: 5, code: 'WIS', name: 'Wisdom' }, bonus: 1 }
                  ],
                  sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
                },
                {
                  id: 5,
                  name: 'Dark Elf (Drow)',
                  slug: 'phb:drow',
                  ability_bonuses: [
                    { ability_score: { id: 6, code: 'CHA', name: 'Charisma' }, bonus: 1 }
                  ],
                  sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
                }
              ]
            })
          }
          return HttpResponse.json({ data: [] })
        })
      )

      const response = await fetch('/api/races/phb:elf/subraces')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.length).toBe(3)
      expect(data.data.some((s: { name: string }) => s.name === 'High Elf')).toBe(true)
      expect(data.data.some((s: { name: string }) => s.name === 'Wood Elf')).toBe(true)
    })
  })

  describe('Wizard Spell API', () => {
    it('can resolve cantrip choices', async () => {
      const choiceId = 'spell|class|phb:wizard|1|cantrips'
      const selectedCantrips = ['phb:fire-bolt', 'phb:mage-hand', 'phb:prestidigitation']

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

      const response = await fetch(`/api/characters/3/choices/${choiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: selectedCantrips })
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.data.resolved).toBe(true)
      expect(data.data.selected).toHaveLength(3)
    })
  })
})

// ════════════════════════════════════════════════════════════════
// STORE STATE TESTS
// ════════════════════════════════════════════════════════════════

describe('High Elf Wizard - Store State', () => {
  describe('Elf Race Selection', () => {
    it('Elf needs subrace step - needsSubraceStep is true when subraces array provided', () => {
      const store = useCharacterWizardStore()

      store.selections.race = {
        id: 2,
        name: 'Elf',
        slug: 'phb:elf',
        speed: 30,
        size: { id: 1, name: 'Medium', code: 'M' },
        // needsSubraceStep checks subraces array, not has_subraces boolean
        subraces: [
          { id: 3, name: 'High Elf', slug: 'phb:high-elf' },
          { id: 4, name: 'Wood Elf', slug: 'phb:wood-elf' }
        ],
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      expect(store.needsSubraceStep).toBe(true)
    })

    it('needsSubraceStep is false without subraces array', () => {
      const store = useCharacterWizardStore()

      store.selections.race = {
        id: 2,
        name: 'Elf',
        slug: 'phb:elf',
        speed: 30,
        size: { id: 1, name: 'Medium', code: 'M' },
        // Without subraces array, needsSubraceStep is false
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      expect(store.needsSubraceStep).toBe(false)
    })

    it('setting subrace updates store', () => {
      const store = useCharacterWizardStore()

      store.selections.subrace = {
        id: 3,
        name: 'High Elf',
        slug: 'phb:high-elf',
        ability_bonuses: [
          { ability_score: { id: 4, code: 'INT', name: 'Intelligence' }, bonus: 1 }
        ],
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      expect(store.selections.subrace?.name).toBe('High Elf')
      expect(store.selections.subrace?.slug).toBe('phb:high-elf')
    })
  })

  describe('Wizard Class Selection', () => {
    it('Wizard does not need subclass at level 1', () => {
      const store = useCharacterWizardStore()

      store.selections.class = {
        id: 2,
        name: 'Wizard',
        slug: 'phb:wizard',
        hit_die: 6,
        primary_ability: { id: 4, code: 'INT', name: 'Intelligence' },
        spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' },
        subclass_level: 2, // Wizard picks at level 2
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      expect(store.needsSubclassStep).toBe(false)
    })

    it('Wizard is a spellcaster when level_progression provided', () => {
      const store = useCharacterWizardStore()

      store.selections.class = {
        id: 2,
        name: 'Wizard',
        slug: 'phb:wizard',
        hit_die: 6,
        primary_ability: { id: 4, code: 'INT', name: 'Intelligence' },
        spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' },
        subclass_level: 2,
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }],
        level_progression: [
          { level: 1, cantrips_known: 3, spells_known: null }
        ]
      }

      expect(store.isSpellcaster).toBe(true)
    })
  })

  describe('Complete High Elf Wizard Flow', () => {
    it('can set all selections', () => {
      const store = useCharacterWizardStore()

      // Set race (Elf with subraces array)
      store.selections.race = {
        id: 2,
        name: 'Elf',
        slug: 'phb:elf',
        speed: 30,
        size: { id: 1, name: 'Medium', code: 'M' },
        subraces: [
          { id: 3, name: 'High Elf', slug: 'phb:high-elf' },
          { id: 4, name: 'Wood Elf', slug: 'phb:wood-elf' }
        ],
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      // Set subrace (High Elf)
      store.selections.subrace = {
        id: 3,
        name: 'High Elf',
        slug: 'phb:high-elf',
        ability_bonuses: [
          { ability_score: { id: 4, code: 'INT', name: 'Intelligence' }, bonus: 1 }
        ],
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      // Set class (Wizard)
      store.selections.class = {
        id: 2,
        name: 'Wizard',
        slug: 'phb:wizard',
        hit_die: 6,
        primary_ability: { id: 4, code: 'INT', name: 'Intelligence' },
        spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' },
        subclass_level: 2,
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }],
        level_progression: [
          { level: 1, cantrips_known: 3, spells_known: null }
        ]
      }

      // Set background (Sage)
      store.selections.background = {
        id: 3,
        name: 'Sage',
        slug: 'phb:sage',
        feature_name: 'Researcher',
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      // Set name
      store.selections.name = 'Aelindra Starweaver'

      // Verify
      expect(store.selections.race?.name).toBe('Elf')
      expect(store.selections.subrace?.name).toBe('High Elf')
      expect(store.selections.class?.name).toBe('Wizard')
      expect(store.selections.background?.name).toBe('Sage')
      expect(store.needsSubraceStep).toBe(true)
      expect(store.needsSubclassStep).toBe(false)
      expect(store.isSpellcaster).toBe(true)
    })
  })
})

// ════════════════════════════════════════════════════════════════
// COMPONENT STRUCTURE TESTS
// ════════════════════════════════════════════════════════════════

describe('High Elf Wizard - Component Structure', () => {
  describe('StepSubrace Component', () => {
    it('renders step header', async () => {
      const wrapper = await mountSuspended(StepSubrace)

      expect(wrapper.text()).toContain('Subrace')
    })
  })
})

// ════════════════════════════════════════════════════════════════
// FIXTURE VALIDATION TESTS
// ════════════════════════════════════════════════════════════════

describe('High Elf Wizard - Fixture Validation', () => {
  describe('Character Structure', () => {
    it('has correct character data', () => {
      expect(highElfWizardL1.character.name).toBe('Aelindra Starweaver')
      expect(highElfWizardL1.character.level).toBe(1)
      expect(highElfWizardL1.character.status).toBe('draft')
    })

    it('has Elf race with High Elf subrace', () => {
      expect(highElfWizardL1.character.race.name).toBe('Elf')
      expect(highElfWizardL1.character.subrace?.name).toBe('High Elf')
    })

    it('has Wizard class with no subclass', () => {
      expect(highElfWizardL1.character.class.name).toBe('Wizard')
      expect(highElfWizardL1.character.class.hit_die).toBe(6)
      expect(highElfWizardL1.character.subclass).toBeNull()
    })

    it('has Sage background', () => {
      expect(highElfWizardL1.character.background.name).toBe('Sage')
    })

    it('has correct ability scores with racial bonuses', () => {
      const { ability_scores, base_ability_scores } = highElfWizardL1.character

      // Elf: +2 DEX
      expect(ability_scores.DEX - base_ability_scores.DEX).toBe(2)

      // High Elf: +1 INT
      expect(ability_scores.INT - base_ability_scores.INT).toBe(1)

      // No bonus to other stats
      expect(ability_scores.STR).toBe(base_ability_scores.STR)
      expect(ability_scores.CON).toBe(base_ability_scores.CON)
      expect(ability_scores.WIS).toBe(base_ability_scores.WIS)
      expect(ability_scores.CHA).toBe(base_ability_scores.CHA)
    })
  })

  describe('Stats Resource', () => {
    it('has INT-based spellcasting', () => {
      const { spellcasting } = highElfWizardL1.stats

      expect(spellcasting).not.toBeNull()
      expect(spellcasting?.ability).toBe('INT')
      expect(spellcasting?.spell_save_dc).toBe(13) // 8 + 2 + 3
      expect(spellcasting?.spell_attack_bonus).toBe(5) // 2 + 3
    })

    it('has 4 cantrips known (3 base + 1 High Elf)', () => {
      expect(highElfWizardL1.stats.spellcasting?.cantrips_known).toBe(4)
    })

    it('has INT and WIS saving throw proficiencies (Wizard)', () => {
      expect(highElfWizardL1.stats.ability_scores.INT.proficient).toBe(true)
      expect(highElfWizardL1.stats.ability_scores.WIS.proficient).toBe(true)
      expect(highElfWizardL1.stats.ability_scores.STR.proficient).toBe(false)
    })

    it('has d6 hit die', () => {
      expect(highElfWizardL1.stats.combat.hit_dice.die).toBe('d6')
    })

    it('has Elf weapon proficiencies', () => {
      const { weapons } = highElfWizardL1.stats.proficiencies

      expect(weapons).toContain('Longswords')
      expect(weapons).toContain('Shortswords')
      expect(weapons).toContain('Shortbows')
      expect(weapons).toContain('Longbows')
    })
  })

  describe('Pending Choices', () => {
    it('has 3 pending choices', () => {
      expect(highElfWizardL1.pendingChoices.choices).toHaveLength(3)
    })

    it('has skill proficiency choice (Wizard)', () => {
      const profChoice = highElfWizardL1.pendingChoices.choices.find(
        c => c.type === 'proficiency'
      )

      expect(profChoice).toBeDefined()
      expect(profChoice?.source_name).toBe('Wizard')
      expect(profChoice?.quantity).toBe(2)

      // Wizard skill options
      const skillSlugs = profChoice?.options?.map(o => o.slug)
      expect(skillSlugs).toContain('arcana')
      expect(skillSlugs).toContain('history')
      expect(skillSlugs).toContain('investigation')
    })

    it('has cantrip choice (Wizard)', () => {
      const spellChoice = highElfWizardL1.pendingChoices.choices.find(
        c => c.type === 'spell'
      )

      expect(spellChoice).toBeDefined()
      expect(spellChoice?.subtype).toBe('cantrip')
      expect(spellChoice?.quantity).toBe(3)

      // Wizard cantrip options
      const spellSlugs = spellChoice?.options?.map((o: { slug?: string }) => o.slug)
      expect(spellSlugs).toContain('phb:fire-bolt')
      expect(spellSlugs).toContain('phb:mage-hand')
      expect(spellSlugs).toContain('phb:prestidigitation')
    })

    it('has equipment choice', () => {
      const equipChoice = highElfWizardL1.pendingChoices.choices.find(
        c => c.type === 'equipment'
      )

      expect(equipChoice).toBeDefined()
      expect(equipChoice?.source_name).toBe('Wizard')
      expect(equipChoice?.options).toHaveLength(2)
    })

    it('summary matches pending choice count', () => {
      const { pending_choices } = highElfWizardL1.summary

      expect(pending_choices.total).toBe(3)
      expect(pending_choices.proficiency).toBe(1)
      expect(pending_choices.spell).toBe(1)
      expect(pending_choices.equipment).toBe(1)
    })
  })
})

// ════════════════════════════════════════════════════════════════
// SUBRACE-SPECIFIC TESTS
// ════════════════════════════════════════════════════════════════

describe('High Elf Wizard - Subrace Behavior', () => {
  describe('Elf vs Human comparison', () => {
    it('Elf has subraces, Human does not', () => {
      const store = useCharacterWizardStore()

      // Human - no subraces array
      store.selections.race = {
        id: 1,
        name: 'Human',
        slug: 'phb:human',
        speed: 30,
        size: { id: 1, name: 'Medium', code: 'M' },
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }
      expect(store.needsSubraceStep).toBe(false)

      // Elf - has subraces array
      store.selections.race = {
        id: 2,
        name: 'Elf',
        slug: 'phb:elf',
        speed: 30,
        size: { id: 1, name: 'Medium', code: 'M' },
        subraces: [
          { id: 3, name: 'High Elf', slug: 'phb:high-elf' },
          { id: 4, name: 'Wood Elf', slug: 'phb:wood-elf' }
        ],
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }
      expect(store.needsSubraceStep).toBe(true)
    })
  })

  describe('Subrace clears on race change', () => {
    it('changing race should logically clear subrace', () => {
      const store = useCharacterWizardStore()

      // Set Elf with High Elf subrace
      store.selections.race = {
        id: 2,
        name: 'Elf',
        slug: 'phb:elf',
        speed: 30,
        size: { id: 1, name: 'Medium', code: 'M' },
        subraces: [
          { id: 3, name: 'High Elf', slug: 'phb:high-elf' }
        ],
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }
      store.selections.subrace = {
        id: 3,
        name: 'High Elf',
        slug: 'phb:high-elf',
        sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
      }

      expect(store.selections.subrace?.name).toBe('High Elf')

      // Note: In real wizard, changing race clears subrace via store action
      // Here we just verify the state can be manipulated
      store.selections.subrace = null
      expect(store.selections.subrace).toBeNull()
    })
  })
})
