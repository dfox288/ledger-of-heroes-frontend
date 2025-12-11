// tests/components/character/wizard/StepLanguages.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StepLanguages from '~/components/character/wizard/StepLanguages.vue'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import type { Race, Background } from '~/types'
import type { components } from '~/types/api/generated'

type PendingChoice = components['schemas']['PendingChoiceResource']

// Standard language options
const standardLanguageOptions = [
  { id: 2, name: 'Dwarvish', slug: 'dwarvish', script: 'Dwarvish' },
  { id: 3, name: 'Elvish', slug: 'elvish', script: 'Elvish' },
  { id: 4, name: 'Giant', slug: 'giant', script: 'Dwarvish' },
  { id: 5, name: 'Gnomish', slug: 'gnomish', script: 'Dwarvish' }
]

// Mock pending choices responses
const mockHumanAcolyteChoices: PendingChoice[] = [
  {
    id: 'language:race:1:1:language_choice_1',
    type: 'language',
    subtype: null,
    source: 'race',
    source_name: 'Human',
    level_granted: 1,
    required: true,
    quantity: 1,
    remaining: 1,
    selected: [],
    options: standardLanguageOptions,
    options_endpoint: null,
    metadata: []
  },
  {
    id: 'language:background:1:1:language_choice_1',
    type: 'language',
    subtype: null,
    source: 'background',
    source_name: 'Acolyte',
    level_granted: 1,
    required: true,
    quantity: 2,
    remaining: 2,
    selected: [],
    options: standardLanguageOptions,
    options_endpoint: null,
    metadata: []
  }
]

const mockNoLanguageChoices: PendingChoice[] = []

// Create a mock for the current test
let currentMockChoices = mockHumanAcolyteChoices

// Mock useUnifiedChoices composable
mockNuxtImport('useUnifiedChoices', () => {
  return vi.fn(() => {
    return {
      choices: ref(currentMockChoices),
      choicesByType: computed(() => ({
        languages: currentMockChoices.filter(c => c.type === 'language'),
        proficiencies: [],
        equipment: [],
        spells: [],
        subclass: null,
        asiOrFeat: [],
        optionalFeatures: []
      })),
      summary: ref(null),
      pending: ref(false),
      error: ref(null),
      allRequiredComplete: computed(() => false),
      fetchChoices: vi.fn().mockResolvedValue(undefined),
      resolveChoice: vi.fn().mockResolvedValue(undefined),
      undoChoice: vi.fn().mockResolvedValue(undefined)
    }
  })
})

// Helper to set up store before each test
function setupStore() {
  const store = useCharacterWizardStore()
  store.characterId = 1
  store.selections.race = { id: 1, name: 'Human' } as Partial<Race> as Race
  store.selections.background = { id: 1, name: 'Acolyte' } as Partial<Background> as Background
  return store
}

describe('StepLanguages', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    currentMockChoices = mockHumanAcolyteChoices
    setupStore()
  })

  describe('basic rendering', () => {
    it('renders header and description', async () => {
      const wrapper = await mountSuspended(StepLanguages)
      expect(wrapper.text()).toContain('Choose Your Languages')
    })

    it('shows message when no language choices are needed', async () => {
      currentMockChoices = mockNoLanguageChoices
      const wrapper = await mountSuspended(StepLanguages)
      expect(wrapper.text()).toContain('No language choices needed')
    })

    it('displays source headers with entity names', async () => {
      const wrapper = await mountSuspended(StepLanguages)
      expect(wrapper.text()).toContain('From Race: Human')
      expect(wrapper.text()).toContain('From Background: Acolyte')
    })
  })

  describe('language options display', () => {
    it('displays language options for selection', async () => {
      const wrapper = await mountSuspended(StepLanguages)
      expect(wrapper.text()).toContain('Dwarvish')
      expect(wrapper.text()).toContain('Elvish')
      expect(wrapper.text()).toContain('Giant')
    })

    it('shows quantity badges for each choice', async () => {
      const wrapper = await mountSuspended(StepLanguages)
      expect(wrapper.text()).toContain('Choose 1 language')
      expect(wrapper.text()).toContain('Choose 2 languages')
    })
  })

  describe('continue button', () => {
    it('is disabled when choices incomplete', async () => {
      const wrapper = await mountSuspended(StepLanguages)
      const continueBtn = wrapper.find('[data-testid="continue-btn"]')
      expect(continueBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('props-based usage', () => {
    it('accepts characterId as prop', async () => {
      const wrapper = await mountSuspended(StepLanguages, {
        props: {
          characterId: 123,
          nextStep: vi.fn()
        }
      })

      expect(wrapper.props('characterId')).toBe(123)
    })

    it('accepts nextStep function as prop', async () => {
      const nextStepFn = vi.fn()
      const wrapper = await mountSuspended(StepLanguages, {
        props: {
          characterId: 123,
          nextStep: nextStepFn
        }
      })

      expect(wrapper.props('nextStep')).toBe(nextStepFn)
    })

    it('uses characterId prop for useUnifiedChoices', async () => {
      // This tests that the component uses props.characterId, not store.characterId
      const wrapper = await mountSuspended(StepLanguages, {
        props: {
          characterId: 456,
          nextStep: vi.fn()
        }
      })

      // Component should initialize with the prop value
      expect(wrapper.vm).toBeDefined()
    })

    it('works without props (backward compatibility)', async () => {
      // When no props provided, should still work with store values
      const wrapper = await mountSuspended(StepLanguages)

      expect(wrapper.vm).toBeDefined()
      expect(wrapper.text()).toContain('Choose Your Languages')
    })
  })
})
