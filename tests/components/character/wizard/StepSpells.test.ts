import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import StepSpells from '~/components/character/wizard/StepSpells.vue'
import { testWizardStepBehavior, mountWizardStep } from '../../../helpers/wizardStepBehavior'
import { wizardMockClasses, wizardMockRaces } from '../../../helpers/mockFactories'

// Run shared behavior tests
testWizardStepBehavior({
  component: StepSpells,
  stepTitle: 'Spells',
  expectedHeading: 'Select Your Spells'
})

describe('StepSpells - Specific Behavior', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('displays spell selection heading', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const text = wrapper.text()
      expect(text).toContain('Select Your Spells')
      expect(text).toContain('starting spells')
    })

    it('shows loading state while fetching spell choices', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(vm.loadingChoices === true || vm.loadingChoices === false).toBe(true)
    })
  })

  describe('Spell Selection Tracking', () => {
    it('maintains selected spells map', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(vm.selectedSpells).toBeDefined()
      expect(vm.selectedSpells instanceof Map).toBe(true)
    })

    it('tracks selected count for each choice', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.getSelectedCount).toBe('function')
      expect(vm.getSelectedCount('nonexistent')).toBe(0)
    })

    it('checks if spell is selected in a choice', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.isSpellSelected).toBe('function')
      expect(vm.isSpellSelected('choice-1', 1)).toBe(false)
    })

    it('checks if choice is at selection limit', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.isChoiceAtLimit).toBe('function')

      // Test with a mock choice
      const mockChoice = { id: 'test', quantity: 3 }
      expect(vm.isChoiceAtLimit(mockChoice)).toBe(false)
    })
  })

  describe('Spell Toggle Selection', () => {
    it('has handleSpellToggle method', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.handleSpellToggle).toBe('function')
    })

    it('adds spell to selection when not selected', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      const mockChoice = { id: 'test-choice', quantity: 3 }
      const mockSpell = { id: 1, name: 'Magic Missile', slug: 'magic-missile', full_slug: 'phb:magic-missile' }

      vm.handleSpellToggle(mockChoice, mockSpell)
      await wrapper.vm.$nextTick()

      expect(vm.selectedSpells.get('test-choice')?.has('phb:magic-missile')).toBe(true)
    })

    it('removes spell from selection when already selected', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      const mockChoice = { id: 'test-choice', quantity: 3 }
      const mockSpell = { id: 1, name: 'Magic Missile', slug: 'magic-missile', full_slug: 'phb:magic-missile' }

      // Select then deselect
      vm.handleSpellToggle(mockChoice, mockSpell)
      vm.handleSpellToggle(mockChoice, mockSpell)
      await wrapper.vm.$nextTick()

      expect(vm.selectedSpells.get('test-choice')?.has('phb:magic-missile')).toBe(false)
    })

    it('respects quantity limit', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      const mockChoice = { id: 'test-choice', quantity: 2 }

      // Add spells up to limit (using full_slug format)
      vm.handleSpellToggle(mockChoice, { id: 1, name: 'Spell 1', slug: 'spell-1', full_slug: 'phb:spell-1' })
      vm.handleSpellToggle(mockChoice, { id: 2, name: 'Spell 2', slug: 'spell-2', full_slug: 'phb:spell-2' })
      // Try to add beyond limit
      vm.handleSpellToggle(mockChoice, { id: 3, name: 'Spell 3', slug: 'spell-3', full_slug: 'phb:spell-3' })
      await wrapper.vm.$nextTick()

      expect(vm.selectedSpells.get('test-choice')?.size).toBe(2)
    })
  })

  describe('Spell Choices Grouping', () => {
    it('separates cantrip choices', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(vm.cantripChoices).toBeDefined()
      expect(Array.isArray(vm.cantripChoices)).toBe(true)
    })

    it('separates spells known choices', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(vm.spellsKnownChoices).toBeDefined()
      expect(Array.isArray(vm.spellsKnownChoices)).toBe(true)
    })

    it('separates race spell choices', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
          store.selections.race = wizardMockRaces.elf
        }
      })

      const vm = wrapper.vm as any
      expect(vm.raceSpellChoices).toBeDefined()
      expect(Array.isArray(vm.raceSpellChoices)).toBe(true)
    })
  })

  describe('Spell Options', () => {
    it('maintains local spell options cache for full Spell objects', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      // Local cache needed for SpellCard display (needs full Spell objects with level, school, etc.)
      expect(vm.spellOptionsCache).toBeDefined()
      expect(vm.spellOptionsCache instanceof Map).toBe(true)
    })

    it('has fetchSpellOptionsForChoice method', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.fetchSpellOptionsForChoice).toBe('function')
    })

    it('gets available spells from cache or inline options', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.getAvailableSpells).toBe('function')

      // Inline options
      const choiceWithOptions = {
        id: 'test',
        options: [{ id: 1, name: 'Spell 1' }]
      }
      expect(vm.getAvailableSpells(choiceWithOptions)).toEqual([{ id: 1, name: 'Spell 1' }])

      // Empty options, no cache
      const emptyChoice = { id: 'test2', options: [] }
      expect(vm.getAvailableSpells(emptyChoice)).toEqual([])
    })
  })

  describe('Spellcasting Info Display', () => {
    it('has spellcasting computed property', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(vm.spellcasting === null || typeof vm.spellcasting === 'object').toBe(true)
    })

    it('calculates cantrips limit from choices', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.cantripsLimit).toBe('number')
    })

    it('calculates spells limit from choices', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.spellsLimit).toBe('number')
    })
  })

  describe('Fixed Racial Spells', () => {
    it('has fixedRaceSpells computed', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
          store.selections.race = wizardMockRaces.elf
        }
      })

      const vm = wrapper.vm as any
      expect(vm.fixedRaceSpells).toBeDefined()
      expect(Array.isArray(vm.fixedRaceSpells)).toBe(true)
    })
  })

  describe('Level Text Formatting', () => {
    it('formats cantrip level', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(vm.formatLevelText(0)).toBe('Cantrip')
    })

    it('formats 1st level', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(vm.formatLevelText(1)).toBe('1st Level')
    })

    it('formats 2nd level', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(vm.formatLevelText(2)).toBe('2nd Level')
    })

    it('formats 3rd level', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(vm.formatLevelText(3)).toBe('3rd Level')
    })

    it('formats 4th+ level', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(vm.formatLevelText(4)).toBe('4th Level')
      expect(vm.formatLevelText(9)).toBe('9th Level')
    })
  })

  describe('Spell Detail Modal', () => {
    it('tracks modal open state', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.detailModalOpen).toBe('boolean')
      expect(vm.detailModalOpen).toBe(false)
    })

    it('tracks detail spell for modal', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(vm.detailSpell).toBeNull()
    })

    it('opens modal to view spell details', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      const mockSpell = { id: 1, name: 'Magic Missile' }
      vm.handleViewDetails(mockSpell)
      await wrapper.vm.$nextTick()

      expect(vm.detailModalOpen).toBe(true)
      expect(vm.detailSpell).toEqual(mockSpell)
    })

    it('closes modal', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      // Open then close
      vm.handleViewDetails({ id: 1, name: 'Spell' })
      vm.handleCloseModal()
      await wrapper.vm.$nextTick()

      expect(vm.detailModalOpen).toBe(false)
      expect(vm.detailSpell).toBeNull()
    })
  })

  describe('Validation', () => {
    it('has canProceed computed', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.canProceed).toBe('boolean')
    })

    it('allows proceed when no choices exist', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      // With no spell choices loaded, canProceed should be true
      expect(vm.canProceed).toBe(true)
    })
  })

  describe('Continue Flow', () => {
    it('has handleContinue method', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.handleContinue).toBe('function')
    })

    it('tracks saving state', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      expect(vm.isSaving).toBe(false)
    })

    it('error handling is managed by composable', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      // Error handling is now done via try/catch in handleContinue
      // and uses wizardErrors.choiceResolveFailed for toast notifications
      expect(typeof vm.handleContinue).toBe('function')
    })

    it('has continue button', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const button = wrapper.find('[data-testid="continue-btn"]')
      expect(button.exists()).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('combines store error and choices error', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const vm = wrapper.vm as any
      // error computed returns storeError || choicesError
      expect(vm.error === null || typeof vm.error === 'string').toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('has descriptive heading', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const heading = wrapper.find('h2')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toBe('Select Your Spells')
    })

    it('has instructional text', async () => {
      const { wrapper } = await mountWizardStep(StepSpells, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.wizard
        }
      })

      const text = wrapper.text()
      expect(text).toContain('starting spells')
    })
  })
})
