import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import StepProficiencies from '~/components/character/wizard/StepProficiencies.vue'
import { testWizardStepBehavior, mountWizardStep } from '../../../helpers/wizardStepBehavior'
import { wizardMockClasses, wizardMockRaces, wizardMockBackgrounds } from '../../../helpers/mockFactories'

// Run shared behavior tests
testWizardStepBehavior({
  component: StepProficiencies,
  stepTitle: 'Proficiencies',
  expectedHeading: 'Your Proficiencies'
})

describe('StepProficiencies - Specific Behavior', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('displays proficiency heading', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
          store.selections.race = wizardMockRaces.elf
        }
      })

      const text = wrapper.text()
      expect(text).toContain('Your Proficiencies')
      expect(text).toContain('proficiencies from class, race, and background')
    })

    it('shows loading state while fetching proficiency choices', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.loadingChoices !== undefined || vm.loadingChoices === false).toBe(true)
    })
  })

  describe('Granted Proficiencies Display', () => {
    it('has grantedBySource computed property', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.grantedBySource).toBeDefined()
      expect(Array.isArray(vm.grantedBySource)).toBe(true)
    })

    it('groups proficiencies by type', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.groupGrantedProficiencies).toBe('function')

      // Test with sample proficiencies
      const testProfs = [
        { id: 1, proficiency_type: 'armor', proficiency_name: 'Heavy Armor', is_choice: false },
        { id: 2, proficiency_type: 'weapon', proficiency_name: 'Longsword', is_choice: false },
        { id: 3, proficiency_type: 'armor', proficiency_name: 'Light Armor', is_choice: false }
      ]
      const grouped = vm.groupGrantedProficiencies(testProfs)
      expect(Array.isArray(grouped)).toBe(true)
    })

    it('provides proficiency type labels', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getProficiencyTypeLabel('armor')).toBe('Armor')
      expect(vm.getProficiencyTypeLabel('weapon')).toBe('Weapons')
      expect(vm.getProficiencyTypeLabel('tool')).toBe('Tools')
      expect(vm.getProficiencyTypeLabel('saving_throw')).toBe('Saving Throws')
      expect(vm.getProficiencyTypeLabel('skill')).toBe('Skills')
    })

    it('provides proficiency type icons', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getProficiencyTypeIcon('armor')).toContain('shield')
      expect(vm.getProficiencyTypeIcon('weapon')).toContain('bolt')
      expect(vm.getProficiencyTypeIcon('tool')).toContain('wrench')
    })
  })

  describe('Proficiency Choices', () => {
    it('tracks local selections for proficiency choices', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.localSelections).toBeDefined()
      expect(vm.localSelections instanceof Map).toBe(true)
    })

    it('tracks selected count per choice', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.getSelectedCount).toBe('function')
      expect(vm.getSelectedCount('nonexistent')).toBe(0)
    })

    it('checks if option is selected', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.isOptionSelected).toBe('function')
      expect(vm.isOptionSelected('choice-1', 'option-1')).toBe(false)
    })

    it('handles option toggle selection', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.handleOptionToggle).toBe('function')
    })
  })

  describe('Choice Labels', () => {
    it('generates labels for skill choices', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getChoiceLabel({ subtype: 'skill', quantity: 2 })).toBe('Choose 2 skills')
      expect(vm.getChoiceLabel({ subtype: 'skill', quantity: 1 })).toBe('Choose 1 skill')
    })

    it('generates labels for tool choices', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getChoiceLabel({ subtype: 'tool', quantity: 1 })).toBe('Choose 1 tool')
    })

    it('generates labels for weapon choices', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getChoiceLabel({ subtype: 'weapon', quantity: 1 })).toBe('Choose 1 weapon')
    })

    it('generates labels for armor choices', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getChoiceLabel({ subtype: 'armor', quantity: 2 })).toBe('Choose 2 armor types')
    })

    it('generates default proficiency label', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getChoiceLabel({ quantity: 1 })).toBe('Choose 1 proficiency')
      expect(vm.getChoiceLabel({ quantity: 2 })).toBe('Choose 2 proficiencies')
    })
  })

  describe('Options Loading', () => {
    it('has fetchOptionsIfNeeded function available', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      // Function is provided by useWizardChoiceSelection composable
      expect(typeof vm.fetchOptionsIfNeeded).toBe('function')
    })

    it('has isOptionsLoading function available', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      // Function is provided by useWizardChoiceSelection composable
      expect(typeof vm.isOptionsLoading).toBe('function')
    })

    it('checks if options are loading for a choice', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.isOptionsLoading).toBe('function')
      expect(vm.isOptionsLoading({ id: 'test' })).toBe(false)
    })

    it('has getDisplayOptions function available', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      // Function is provided by useWizardChoiceSelection composable
      expect(typeof vm.getDisplayOptions).toBe('function')
    })
  })

  describe('Display Options Helper', () => {
    it('transforms skill options to display format', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.getDisplayOptions).toBe('function')
    })

    it('transforms options with inline data to display format', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any

      // Test inline options transformation (actual format from API)
      const choiceWithOptions = {
        id: 'test',
        options: [
          { slug: 'athletics', name: 'Athletics' },
          { full_slug: 'core:stealth', name: 'Stealth' }
        ]
      }

      const result = vm.getDisplayOptions(choiceWithOptions)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Athletics')
      expect(result[1].name).toBe('Stealth')
    })
  })

  describe('Validation', () => {
    it('tracks whether all proficiency choices are complete', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.allProficiencyChoicesComplete).toBe('boolean')
    })

    it('returns true when no choices exist', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      // When choicesByType.proficiencies is empty, all are "complete"
      expect(vm.allProficiencyChoicesComplete).toBe(true)
    })
  })

  describe('Continue Flow', () => {
    it('has handleContinue method', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.handleContinue).toBe('function')
    })

    it('tracks saving state', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.isSaving).toBe(false)
    })

    it('has continue button', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const button = wrapper.find('[data-testid="continue-btn"]')
      expect(button.exists()).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('tracks choices error state', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.choicesError === null || typeof vm.choicesError === 'string').toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('has descriptive heading', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const heading = wrapper.find('h2')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toBe('Your Proficiencies')
    })

    it('has instructional text', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const text = wrapper.text()
      expect(text).toContain('Review your proficiencies')
    })
  })

  describe('Proficiency Name Display', () => {
    it('gets proficiency name from proficiency_name field', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getGrantedProficiencyName({ proficiency_name: 'Heavy Armor' })).toBe('Heavy Armor')
    })

    it('falls back to proficiency_type_detail.name', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getGrantedProficiencyName({
        proficiency_type_detail: { name: 'Longsword' }
      })).toBe('Longsword')
    })

    it('returns Unknown when no name available', async () => {
      const { wrapper } = await mountWizardStep(StepProficiencies, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getGrantedProficiencyName({})).toBe('Unknown')
    })
  })
})
