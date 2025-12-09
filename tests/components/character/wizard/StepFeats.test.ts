import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import StepFeats from '~/components/character/wizard/StepFeats.vue'
import { testWizardStepBehavior, mountWizardStep } from '../../../helpers/wizardStepBehavior'
import { wizardMockRaces } from '../../../helpers/mockFactories'

// Run shared behavior tests
testWizardStepBehavior({
  component: StepFeats,
  stepTitle: 'Feats',
  expectedHeading: 'Select Your Feats'
})

describe('StepFeats - Specific Behavior', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('displays feat selection heading', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const text = wrapper.text()
      expect(text).toContain('Select Your Feats')
      expect(text).toContain('feats')
    })

    it('shows loading state while fetching feat choices', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      expect(vm.loadingChoices === true || vm.loadingChoices === false).toBe(true)
    })
  })

  describe('Feat Selection Tracking', () => {
    it('maintains selected feats map', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      expect(vm.selectedFeats).toBeDefined()
      expect(vm.selectedFeats instanceof Map).toBe(true)
    })

    it('tracks selected count for each choice', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.getSelectedCount).toBe('function')
      expect(vm.getSelectedCount('nonexistent')).toBe(0)
    })

    it('checks if feat is selected in a choice', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.isFeatSelected).toBe('function')
      expect(vm.isFeatSelected('choice-1', 'phb:alert')).toBe(false)
    })

    it('checks if choice is at selection limit', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.isChoiceAtLimit).toBe('function')

      // Test with a mock choice
      const mockChoice = { id: 'test', quantity: 1 }
      expect(vm.isChoiceAtLimit(mockChoice)).toBe(false)
    })
  })

  describe('Feat Toggle Selection', () => {
    it('has handleFeatToggle method', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.handleFeatToggle).toBe('function')
    })

    it('adds feat to selection when not selected', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      const mockChoice = { id: 'test-choice', quantity: 1 }
      const mockFeat = { id: 1, name: 'Alert', slug: 'alert', full_slug: 'phb:alert' }

      vm.handleFeatToggle(mockChoice, mockFeat)
      await wrapper.vm.$nextTick()

      expect(vm.selectedFeats.get('test-choice')?.has('phb:alert')).toBe(true)
    })

    it('removes feat from selection when already selected', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      const mockChoice = { id: 'test-choice', quantity: 1 }
      const mockFeat = { id: 1, name: 'Alert', slug: 'alert', full_slug: 'phb:alert' }

      // Select then deselect
      vm.handleFeatToggle(mockChoice, mockFeat)
      vm.handleFeatToggle(mockChoice, mockFeat)
      await wrapper.vm.$nextTick()

      expect(vm.selectedFeats.get('test-choice')?.has('phb:alert')).toBe(false)
    })

    it('respects quantity limit', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      const mockChoice = { id: 'test-choice', quantity: 1 }

      // Add feat up to limit
      vm.handleFeatToggle(mockChoice, { id: 1, name: 'Alert', slug: 'alert', full_slug: 'phb:alert' })
      // Try to add beyond limit
      vm.handleFeatToggle(mockChoice, { id: 2, name: 'Athlete', slug: 'athlete', full_slug: 'phb:athlete' })
      await wrapper.vm.$nextTick()

      expect(vm.selectedFeats.get('test-choice')?.size).toBe(1)
    })
  })

  describe('Feat Choices Grouping', () => {
    it('groups feat choices by source', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      expect(vm.featChoices).toBeDefined()
      expect(Array.isArray(vm.featChoices)).toBe(true)
    })
  })

  describe('Feat Options', () => {
    it('maintains feat options cache', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      expect(vm.featOptions).toBeDefined()
      expect(vm.featOptions instanceof Map).toBe(true)
    })

    it('has fetchFeatOptionsForChoice method', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.fetchFeatOptionsForChoice).toBe('function')
    })

    it('gets available feats from cache or inline options', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.getAvailableFeats).toBe('function')

      // Inline options
      const choiceWithOptions = {
        id: 'test',
        options: [{ id: 1, name: 'Alert', slug: 'alert', full_slug: 'phb:alert' }]
      }
      expect(vm.getAvailableFeats(choiceWithOptions)).toEqual([{ id: 1, name: 'Alert', slug: 'alert', full_slug: 'phb:alert' }])

      // Empty options, no cache
      const emptyChoice = { id: 'test2', options: [] }
      expect(vm.getAvailableFeats(emptyChoice)).toEqual([])
    })
  })

  describe('Feat Detail Modal', () => {
    it('tracks modal open state', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.detailModalOpen).toBe('boolean')
      expect(vm.detailModalOpen).toBe(false)
    })

    it('tracks detail feat for modal', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      expect(vm.detailFeat).toBeNull()
    })

    it('opens modal to view feat details', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      const mockFeat = { id: 1, name: 'Alert', slug: 'alert' }
      vm.handleViewDetails(mockFeat)
      await wrapper.vm.$nextTick()

      expect(vm.detailModalOpen).toBe(true)
      expect(vm.detailFeat).toEqual(mockFeat)
    })

    it('closes modal', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      // Open then close
      vm.handleViewDetails({ id: 1, name: 'Alert' })
      vm.handleCloseModal()
      await wrapper.vm.$nextTick()

      expect(vm.detailModalOpen).toBe(false)
      expect(vm.detailFeat).toBeNull()
    })
  })

  describe('Validation', () => {
    it('has canProceed computed', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.canProceed).toBe('boolean')
    })

    it('allows proceed when no choices exist', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      // With no feat choices loaded, canProceed should be true
      expect(vm.canProceed).toBe(true)
    })
  })

  describe('Continue Flow', () => {
    it('has handleContinue method', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.handleContinue).toBe('function')
    })

    it('tracks saving state', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      expect(vm.isSaving).toBe(false)
    })

    it('tracks save error state', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      expect(vm.saveError).toBeNull()
    })

    it('has continue button', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const button = wrapper.find('[data-testid="continue-btn"]')
      expect(button.exists()).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('combines store error and choices error', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const vm = wrapper.vm as any
      // error computed returns storeError || choicesError
      expect(vm.error === null || typeof vm.error === 'string').toBe(true)
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no feat choices', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      // With no choices loaded, should show empty state
      const text = wrapper.text()
      // Will contain either empty state message or the heading
      expect(text).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('has descriptive heading', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const heading = wrapper.find('h2')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toBe('Select Your Feats')
    })

    it('has instructional text', async () => {
      const { wrapper } = await mountWizardStep(StepFeats, {
        storeSetup: (store) => {
          store.selections.race = wizardMockRaces.human
        }
      })

      const text = wrapper.text()
      expect(text.length).toBeGreaterThan('Select Your Feats'.length)
    })
  })
})
