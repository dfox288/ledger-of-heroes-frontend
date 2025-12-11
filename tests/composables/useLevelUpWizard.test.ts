// tests/composables/useLevelUpWizard.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'

// =============================================================================
// MOCK SETUP
// =============================================================================

const mockGoToStep = vi.fn()

// Create reactive refs that tests can modify
const mockLevelUpResult = ref<unknown>(null)
const mockNeedsClassSelection = ref(true)
const mockCurrentStepName = ref('class-selection')
const mockHasSpellChoices = ref(false)
const mockHasFeatureChoices = ref(false)
const mockHasLanguageChoices = ref(false)
const mockHasProficiencyChoices = ref(false)

vi.mock('~/stores/characterLevelUp', () => ({
  useCharacterLevelUpStore: vi.fn(() => ({
    // Return refs directly - Pinia stores expose refs that way
    get levelUpResult() { return mockLevelUpResult.value },
    get needsClassSelection() { return mockNeedsClassSelection.value },
    get currentStepName() { return mockCurrentStepName.value },
    get hasSpellChoices() { return mockHasSpellChoices.value },
    get hasFeatureChoices() { return mockHasFeatureChoices.value },
    get hasLanguageChoices() { return mockHasLanguageChoices.value },
    get hasProficiencyChoices() { return mockHasProficiencyChoices.value },
    goToStep: mockGoToStep
  }))
}))

// Import composable AFTER mocks
// eslint-disable-next-line import/first
import { useLevelUpWizard } from '~/composables/useLevelUpWizard'

// =============================================================================
// TESTS
// =============================================================================

describe('useLevelUpWizard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // Reset mock refs
    mockLevelUpResult.value = null
    mockNeedsClassSelection.value = true
    mockCurrentStepName.value = 'class-selection'
    mockHasSpellChoices.value = false
    mockHasFeatureChoices.value = false
    mockHasLanguageChoices.value = false
    mockHasProficiencyChoices.value = false
  })

  describe('stepRegistry', () => {
    it('provides step definitions', () => {
      const { stepRegistry } = useLevelUpWizard()

      expect(stepRegistry).toBeDefined()
      expect(stepRegistry.length).toBeGreaterThan(0)
    })

    it('has class-selection as first step', () => {
      const { stepRegistry } = useLevelUpWizard()

      expect(stepRegistry[0].name).toBe('class-selection')
    })

    it('has summary as last step', () => {
      const { stepRegistry } = useLevelUpWizard()

      const lastStep = stepRegistry[stepRegistry.length - 1]
      expect(lastStep.name).toBe('summary')
    })

    it('includes hit-points step', () => {
      const { stepRegistry } = useLevelUpWizard()

      const hpStep = stepRegistry.find(s => s.name === 'hit-points')
      expect(hpStep).toBeDefined()
      expect(hpStep?.label).toBe('Hit Points')
    })

    it('includes asi-feat step', () => {
      const { stepRegistry } = useLevelUpWizard()

      const asiStep = stepRegistry.find(s => s.name === 'asi-feat')
      expect(asiStep).toBeDefined()
      expect(asiStep?.label).toBe('ASI / Feat')
    })

    it('includes feature-choices step with correct label and icon', () => {
      const { stepRegistry } = useLevelUpWizard()

      const featureStep = stepRegistry.find(s => s.name === 'feature-choices')
      expect(featureStep).toBeDefined()
      expect(featureStep?.label).toBe('Features')
      expect(featureStep?.icon).toBe('i-heroicons-puzzle-piece')
    })

    it('includes spells step with correct label and icon', () => {
      const { stepRegistry } = useLevelUpWizard()

      const spellsStep = stepRegistry.find(s => s.name === 'spells')
      expect(spellsStep).toBeDefined()
      expect(spellsStep?.label).toBe('Spells')
      expect(spellsStep?.icon).toBe('i-heroicons-sparkles')
    })

    it('includes languages step with correct label and icon', () => {
      const { stepRegistry } = useLevelUpWizard()

      const languagesStep = stepRegistry.find(s => s.name === 'languages')
      expect(languagesStep).toBeDefined()
      expect(languagesStep?.label).toBe('Languages')
      expect(languagesStep?.icon).toBe('i-heroicons-language')
    })

    it('includes proficiencies step with correct label and icon', () => {
      const { stepRegistry } = useLevelUpWizard()

      const proficienciesStep = stepRegistry.find(s => s.name === 'proficiencies')
      expect(proficienciesStep).toBeDefined()
      expect(proficienciesStep?.label).toBe('Proficiencies')
      expect(proficienciesStep?.icon).toBe('i-heroicons-academic-cap')
    })
  })

  describe('activeSteps', () => {
    it('filters steps by visibility', () => {
      mockNeedsClassSelection.value = true
      const { activeSteps } = useLevelUpWizard()

      // Class selection should be visible when needsClassSelection is true
      const classStep = activeSteps.value.find(s => s.name === 'class-selection')
      expect(classStep).toBeDefined()
    })

    it('excludes class-selection when not needed', () => {
      mockNeedsClassSelection.value = false
      const { activeSteps } = useLevelUpWizard()

      const classStep = activeSteps.value.find(s => s.name === 'class-selection')
      expect(classStep).toBeUndefined()
    })
  })

  describe('step order', () => {
    it('has correct step order when all steps are visible', () => {
      // Enable all steps
      mockNeedsClassSelection.value = true
      mockLevelUpResult.value = { hp_choice_pending: true, asi_pending: true }
      mockHasFeatureChoices.value = true
      mockHasSpellChoices.value = true
      mockHasLanguageChoices.value = true
      mockHasProficiencyChoices.value = true

      const { activeSteps } = useLevelUpWizard()

      // Extract step names in order
      const stepNames = activeSteps.value.map(s => s.name)

      // Expected order: class-selection -> subclass -> hit-points -> asi-feat -> feature-choices -> spells -> languages -> proficiencies -> summary
      const expectedOrder = [
        'class-selection',
        'subclass',
        'hit-points',
        'asi-feat',
        'feature-choices',
        'spells',
        'languages',
        'proficiencies',
        'summary'
      ]

      // Filter expected order to only visible steps
      const visibleExpectedOrder = expectedOrder.filter(name => stepNames.includes(name))

      expect(stepNames).toEqual(visibleExpectedOrder)
    })

    it('has feature-choices after asi-feat', () => {
      mockLevelUpResult.value = { hp_choice_pending: true, asi_pending: true }
      mockHasFeatureChoices.value = true

      const { activeSteps } = useLevelUpWizard()
      const stepNames = activeSteps.value.map(s => s.name)

      const asiIndex = stepNames.indexOf('asi-feat')
      const featureIndex = stepNames.indexOf('feature-choices')

      expect(featureIndex).toBeGreaterThan(asiIndex)
    })

    it('has spells after feature-choices', () => {
      mockHasFeatureChoices.value = true
      mockHasSpellChoices.value = true

      const { activeSteps } = useLevelUpWizard()
      const stepNames = activeSteps.value.map(s => s.name)

      const featureIndex = stepNames.indexOf('feature-choices')
      const spellsIndex = stepNames.indexOf('spells')

      expect(spellsIndex).toBeGreaterThan(featureIndex)
    })

    it('has languages after spells', () => {
      mockHasSpellChoices.value = true
      mockHasLanguageChoices.value = true

      const { activeSteps } = useLevelUpWizard()
      const stepNames = activeSteps.value.map(s => s.name)

      const spellsIndex = stepNames.indexOf('spells')
      const languagesIndex = stepNames.indexOf('languages')

      expect(languagesIndex).toBeGreaterThan(spellsIndex)
    })

    it('has proficiencies after languages', () => {
      mockHasLanguageChoices.value = true
      mockHasProficiencyChoices.value = true

      const { activeSteps } = useLevelUpWizard()
      const stepNames = activeSteps.value.map(s => s.name)

      const languagesIndex = stepNames.indexOf('languages')
      const proficienciesIndex = stepNames.indexOf('proficiencies')

      expect(proficienciesIndex).toBeGreaterThan(languagesIndex)
    })

    it('has summary as last step', () => {
      mockHasFeatureChoices.value = true
      mockHasSpellChoices.value = true
      mockHasLanguageChoices.value = true
      mockHasProficiencyChoices.value = true

      const { activeSteps } = useLevelUpWizard()
      const lastStep = activeSteps.value[activeSteps.value.length - 1]

      expect(lastStep.name).toBe('summary')
    })
  })

  describe('step visibility logic', () => {
    it('shows feature-choices when hasFeatureChoices is true', () => {
      mockHasFeatureChoices.value = true
      const { activeSteps } = useLevelUpWizard()

      const featureStep = activeSteps.value.find(s => s.name === 'feature-choices')
      expect(featureStep).toBeDefined()
    })

    it('hides feature-choices when hasFeatureChoices is false', () => {
      mockHasFeatureChoices.value = false
      const { activeSteps } = useLevelUpWizard()

      const featureStep = activeSteps.value.find(s => s.name === 'feature-choices')
      expect(featureStep).toBeUndefined()
    })

    it('shows spells when hasSpellChoices is true', () => {
      mockHasSpellChoices.value = true
      const { activeSteps } = useLevelUpWizard()

      const spellsStep = activeSteps.value.find(s => s.name === 'spells')
      expect(spellsStep).toBeDefined()
    })

    it('hides spells when hasSpellChoices is false', () => {
      mockHasSpellChoices.value = false
      const { activeSteps } = useLevelUpWizard()

      const spellsStep = activeSteps.value.find(s => s.name === 'spells')
      expect(spellsStep).toBeUndefined()
    })

    it('shows languages when hasLanguageChoices is true', () => {
      mockHasLanguageChoices.value = true
      const { activeSteps } = useLevelUpWizard()

      const languagesStep = activeSteps.value.find(s => s.name === 'languages')
      expect(languagesStep).toBeDefined()
    })

    it('hides languages when hasLanguageChoices is false', () => {
      mockHasLanguageChoices.value = false
      const { activeSteps } = useLevelUpWizard()

      const languagesStep = activeSteps.value.find(s => s.name === 'languages')
      expect(languagesStep).toBeUndefined()
    })

    it('shows proficiencies when hasProficiencyChoices is true', () => {
      mockHasProficiencyChoices.value = true
      const { activeSteps } = useLevelUpWizard()

      const proficienciesStep = activeSteps.value.find(s => s.name === 'proficiencies')
      expect(proficienciesStep).toBeDefined()
    })

    it('hides proficiencies when hasProficiencyChoices is false', () => {
      mockHasProficiencyChoices.value = false
      const { activeSteps } = useLevelUpWizard()

      const proficienciesStep = activeSteps.value.find(s => s.name === 'proficiencies')
      expect(proficienciesStep).toBeUndefined()
    })
  })

  describe('currentStepIndex', () => {
    it('returns correct index for current step', () => {
      mockNeedsClassSelection.value = true
      mockCurrentStepName.value = 'class-selection'
      const { currentStepIndex } = useLevelUpWizard()

      expect(currentStepIndex.value).toBe(0)
    })

    it('returns -1 for invalid step', () => {
      mockCurrentStepName.value = 'nonexistent-step'
      const { currentStepIndex } = useLevelUpWizard()

      expect(currentStepIndex.value).toBe(-1)
    })
  })

  describe('currentStep', () => {
    it('returns current step object', () => {
      mockNeedsClassSelection.value = true
      mockCurrentStepName.value = 'class-selection'
      const { currentStep } = useLevelUpWizard()

      expect(currentStep.value?.name).toBe('class-selection')
      expect(currentStep.value?.label).toBe('Class')
    })
  })

  describe('progress tracking', () => {
    it('calculates totalSteps correctly', () => {
      mockNeedsClassSelection.value = true
      const { totalSteps } = useLevelUpWizard()

      // Should have at least class-selection, hit-points, and summary
      expect(totalSteps.value).toBeGreaterThanOrEqual(3)
    })

    it('calculates progressPercent', () => {
      mockNeedsClassSelection.value = true
      mockCurrentStepName.value = 'class-selection'
      const { progressPercent } = useLevelUpWizard()

      // First step should be 0%
      expect(progressPercent.value).toBe(0)
    })

    it('isFirstStep returns true on first step', () => {
      mockNeedsClassSelection.value = true
      mockCurrentStepName.value = 'class-selection'
      const { isFirstStep } = useLevelUpWizard()

      expect(isFirstStep.value).toBe(true)
    })

    it('isLastStep returns true on summary step', () => {
      mockCurrentStepName.value = 'summary'
      const { isLastStep } = useLevelUpWizard()

      expect(isLastStep.value).toBe(true)
    })
  })

  describe('navigation', () => {
    it('nextStep calls goToStep with next step name', () => {
      mockNeedsClassSelection.value = true
      mockCurrentStepName.value = 'class-selection'
      const { nextStep } = useLevelUpWizard()

      nextStep()

      expect(mockGoToStep).toHaveBeenCalled()
    })

    it('previousStep calls goToStep with previous step name', () => {
      mockNeedsClassSelection.value = true
      mockCurrentStepName.value = 'hit-points'
      const { previousStep } = useLevelUpWizard()

      previousStep()

      expect(mockGoToStep).toHaveBeenCalled()
    })

    it('goToStep delegates to store', () => {
      const { goToStep } = useLevelUpWizard()

      goToStep('summary')

      expect(mockGoToStep).toHaveBeenCalledWith('summary')
    })
  })
})
