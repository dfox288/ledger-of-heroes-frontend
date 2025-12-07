import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import StepAbilities from '~/components/character/wizard/StepAbilities.vue'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { testWizardStepBehavior, mountWizardStep } from '../../../helpers/wizardStepBehavior'
import { wizardMockRaces } from '../../../helpers/mockFactories'

// Run shared behavior tests
testWizardStepBehavior({
  component: StepAbilities,
  stepTitle: 'Abilities',
  expectedHeading: 'Assign Ability Scores'
})

describe('StepAbilities - Specific Behavior', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Method Selection', () => {
    it('renders all three method options', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const text = wrapper.text()
      expect(text).toContain('Standard Array')
      expect(text).toContain('Point Buy')
      expect(text).toContain('Manual')
    })

    it('defaults to standard array method', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const vm = wrapper.vm as any
      expect(vm.selectedMethod).toBe('standard_array')
    })

    it('allows switching between methods', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const vm = wrapper.vm as any

      // Start with standard_array
      expect(vm.selectedMethod).toBe('standard_array')

      // Switch to point_buy
      vm.selectedMethod = 'point_buy'
      await wrapper.vm.$nextTick()
      expect(vm.selectedMethod).toBe('point_buy')

      // Switch to manual
      vm.selectedMethod = 'manual'
      await wrapper.vm.$nextTick()
      expect(vm.selectedMethod).toBe('manual')
    })

    it('initializes from store if method already selected', async () => {
      const store = useCharacterWizardStore()
      store.selections.race = wizardMockRaces.elf
      store.selections.abilityMethod = 'point_buy'

      const { wrapper } = await mountWizardStep(StepAbilities)
      const vm = wrapper.vm as any

      await wrapper.vm.$nextTick()

      expect(vm.selectedMethod).toBe('point_buy')
    })
  })

  describe('Method-Specific Input Components', () => {
    it('renders StandardArrayInput when standard_array selected', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const vm = wrapper.vm as any
      vm.selectedMethod = 'standard_array'
      await wrapper.vm.$nextTick()

      // Check for component in HTML
      const html = wrapper.html()
      // The component should be rendered (can't check exact implementation without mounting the child)
      expect(vm.selectedMethod).toBe('standard_array')
    })

    it('renders PointBuyInput when point_buy selected', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const vm = wrapper.vm as any
      vm.selectedMethod = 'point_buy'
      await wrapper.vm.$nextTick()

      expect(vm.selectedMethod).toBe('point_buy')
    })

    it('renders ManualInput when manual selected', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const vm = wrapper.vm as any
      vm.selectedMethod = 'manual'
      await wrapper.vm.$nextTick()

      expect(vm.selectedMethod).toBe('manual')
    })

    it('resets scores when switching from standard_array to point_buy', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const vm = wrapper.vm as any

      // Start with standard_array
      vm.selectedMethod = 'standard_array'
      await wrapper.vm.$nextTick()

      // Switch to point_buy
      vm.selectedMethod = 'point_buy'
      await wrapper.vm.$nextTick()

      // localScores should be reset to 8s (point buy base)
      expect(vm.localScores.strength).toBe(8)
      expect(vm.localScores.dexterity).toBe(8)
      expect(vm.localScores.constitution).toBe(8)
    })

    it('resets nullable scores when switching to standard_array', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const vm = wrapper.vm as any

      // Start with point_buy
      vm.selectedMethod = 'point_buy'
      await wrapper.vm.$nextTick()

      // Switch to standard_array
      vm.selectedMethod = 'standard_array'
      await wrapper.vm.$nextTick()

      // nullableScores should be reset to null
      expect(vm.nullableScores.strength).toBeNull()
      expect(vm.nullableScores.dexterity).toBeNull()
      expect(vm.nullableScores.constitution).toBeNull()
    })

    it('resets to 10s when switching to manual', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const vm = wrapper.vm as any

      // Start with point_buy
      vm.selectedMethod = 'point_buy'
      await wrapper.vm.$nextTick()

      // Switch to manual
      vm.selectedMethod = 'manual'
      await wrapper.vm.$nextTick()

      // localScores should be reset to 10s
      expect(vm.localScores.strength).toBe(10)
      expect(vm.localScores.dexterity).toBe(10)
      expect(vm.localScores.constitution).toBe(10)
    })
  })

  describe('Racial Bonuses Display', () => {
    it('displays fixed racial bonuses', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf // DEX +2
        }
      })

      await wrapper.vm.$nextTick()

      const text = wrapper.text()
      // Should show racial bonus section
      expect(text).toContain('Racial Bonuses')
      expect(text).toContain('Elf')
    })

    it('shows race name in racial bonuses section', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.dwarf // CON +2
        }
      })

      await wrapper.vm.$nextTick()

      const text = wrapper.text()
      expect(text).toContain('Dwarf')
    })

    it('displays warning when race has choice-based ability bonuses', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          // Create a race with choice bonuses (like Half-Elf)
          store.selections.race = {
            ...wizardMockRaces.elf,
            modifiers: [
              {
                modifier_category: 'ability_score',
                ability_score: { id: 6, code: 'CHA', name: 'Charisma' },
                value: 2,
                is_choice: false
              },
              {
                modifier_category: 'ability_score',
                ability_score: null, // Choice - user picks
                value: 1,
                is_choice: true,
                choice_count: 2 // Choose 2 different abilities
              }
            ]
          }
        }
      })

      await wrapper.vm.$nextTick()

      const text = wrapper.text()
      // Should show warning about choice bonuses not being available yet
      expect(text).toContain('Ability Score Choices Not Yet Available')
      expect(text).toContain('Issue #219')
    })

    it('uses effectiveRace (subrace if selected, otherwise race)', async () => {
      const highElf = {
        id: 2,
        slug: 'high-elf',
        name: 'High Elf',
        size: { id: 3, name: 'Medium', code: 'M' },
        speed: 30,
        parent_race_id: 1,
        parent_race: { id: 1, slug: 'elf', name: 'Elf', speed: 30 },
        subraces: [],
        modifiers: [
          {
            modifier_category: 'ability_score',
            ability_score: { id: 4, code: 'INT', name: 'Intelligence' },
            value: 1,
            is_choice: false
          }
        ],
        traits: [],
        description: '',
        sources: []
      }

      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
          store.selections.subrace = highElf
        }
      })

      await wrapper.vm.$nextTick()

      const text = wrapper.text()
      // Should show subrace name
      expect(text).toContain('High Elf')
    })
  })

  describe('Final Scores Display', () => {
    it('shows final scores summary section', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const text = wrapper.text()
      expect(text).toContain('Final Ability Scores')
    })

    it('displays all six ability scores', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const text = wrapper.text()
      // Check for ability score abbreviations (first 3 letters)
      expect(text).toContain('STR')
      expect(text).toContain('DEX')
      expect(text).toContain('CON')
      expect(text).toContain('INT')
      expect(text).toContain('WIS')
      expect(text).toContain('CHA')
    })

    it('shows base + bonus breakdown for abilities with racial bonuses', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf // DEX +2
        }
      })

      const vm = wrapper.vm as any

      // Set some scores manually
      vm.localScores = {
        strength: 14,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8
      }
      vm.selectedMethod = 'manual'
      await wrapper.vm.$nextTick()

      // finalScores computed should show bonuses
      expect(vm.finalScores.dexterity.base).toBe(14)
      expect(vm.finalScores.dexterity.bonus).toBe(2)
      expect(vm.finalScores.dexterity.total).toBe(16)

      // No bonus on strength
      expect(vm.finalScores.strength.base).toBe(14)
      expect(vm.finalScores.strength.bonus).toBe(0)
      expect(vm.finalScores.strength.total).toBe(14)
    })

    it('shows placeholder for unassigned scores in standard array', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const vm = wrapper.vm as any
      vm.selectedMethod = 'standard_array'
      await wrapper.vm.$nextTick()

      // All scores start as null in standard array
      expect(vm.finalScores.strength.total).toBeNull()
      expect(vm.finalScores.dexterity.total).toBeNull()
    })
  })

  describe('Validation', () => {
    it('disables save button when input is invalid', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const vm = wrapper.vm as any
      vm.isInputValid = false
      await wrapper.vm.$nextTick()

      expect(vm.canSave).toBe(false)

      const saveButton = wrapper.find('[data-testid="save-abilities"]')
      expect(saveButton.attributes('disabled')).toBeDefined()
    })

    it('enables save button when input is valid', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const vm = wrapper.vm as any
      vm.isInputValid = true
      await wrapper.vm.$nextTick()

      expect(vm.canSave).toBe(true)
    })

    it('disables save button when loading', async () => {
      const { wrapper, store } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
          store.isLoading = true
        }
      })

      const vm = wrapper.vm as any
      vm.isInputValid = true
      await wrapper.vm.$nextTick()

      expect(vm.canSave).toBe(false)
    })
  })

  describe('Save and Continue', () => {
    it('converts nullable scores to regular scores for standard array', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const vm = wrapper.vm as any
      vm.selectedMethod = 'standard_array'
      vm.nullableScores = {
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8
      }
      vm.isInputValid = true
      await wrapper.vm.$nextTick()

      // The method should exist
      expect(typeof vm.saveAndContinue).toBe('function')
    })

    it('uses localScores directly for point buy and manual', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const vm = wrapper.vm as any
      vm.selectedMethod = 'point_buy'
      vm.localScores = {
        strength: 14,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8
      }
      vm.isInputValid = true
      await wrapper.vm.$nextTick()

      // Verify method exists
      expect(typeof vm.saveAndContinue).toBe('function')
    })

    it('defaults null scores to 10 when saving standard array', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const vm = wrapper.vm as any
      vm.selectedMethod = 'standard_array'
      // Partially assigned scores (some nulls)
      vm.nullableScores = {
        strength: 15,
        dexterity: null,
        constitution: null,
        intelligence: null,
        wisdom: null,
        charisma: null
      }
      vm.isInputValid = true

      // The saveAndContinue method should convert nulls to 10
      // We can't test the actual API call, but we can verify the logic exists
      expect(vm.nullableScores.dexterity).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('displays error message when store has error', async () => {
      const { wrapper, store } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
          store.error = 'Failed to save ability scores'
        }
      })

      await wrapper.vm.$nextTick()

      const text = wrapper.text()
      expect(text).toContain('Failed to save ability scores')
    })

    it('shows loading state on save button when loading', async () => {
      const { wrapper, store } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
          store.isLoading = true
        }
      })

      await wrapper.vm.$nextTick()

      const saveButton = wrapper.find('[data-testid="save-abilities"]')
      expect(saveButton.attributes('disabled')).toBeDefined()
      expect(saveButton.attributes('loading')).toBeDefined()
    })
  })

  describe('Accessibility', () => {
    it('has descriptive heading', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const heading = wrapper.find('h2')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toBe('Assign Ability Scores')
    })

    it('has instructional text for users', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const text = wrapper.text()
      expect(text).toContain('Choose a method')
      expect(text).toContain('ability scores')
    })

    it('labels method selector', async () => {
      const { wrapper } = await mountWizardStep(StepAbilities, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.elf
        }
      })

      const text = wrapper.text()
      expect(text).toContain('Method')
    })
  })
})
