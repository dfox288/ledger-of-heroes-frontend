// tests/components/character/wizard/StepFeatureChoices.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StepFeatureChoices from '~/components/character/wizard/StepFeatureChoices.vue'
import type { components } from '~/types/api/generated'

type PendingChoice = components['schemas']['PendingChoiceResource']

// Mock feature choice options
const mockFightingStyleOptions = [
  { id: 1, name: 'Archery', slug: 'archery', description: '+2 bonus to attack rolls with ranged weapons' },
  { id: 2, name: 'Defense', slug: 'defense', description: '+1 AC while wearing armor' },
  { id: 3, name: 'Dueling', slug: 'dueling', description: '+2 damage with one-handed weapons' }
]

const mockExpertiseOptions = [
  { id: 1, name: 'Acrobatics', slug: 'acrobatics' },
  { id: 2, name: 'Stealth', slug: 'stealth' },
  { id: 3, name: 'Perception', slug: 'perception' }
]

// Mock pending choices responses
const mockFightingStyleChoice: PendingChoice[] = [
  {
    id: 'fighting_style:class:1:2:fighter_fighting_style',
    type: 'fighting_style',
    subtype: null,
    source: 'class',
    source_name: 'Fighter',
    level_granted: 2,
    required: true,
    quantity: 1,
    remaining: 1,
    selected: [],
    options: mockFightingStyleOptions,
    options_endpoint: null,
    metadata: []
  }
]

const mockExpertiseChoice: PendingChoice[] = [
  {
    id: 'expertise:class:1:3:rogue_expertise',
    type: 'expertise',
    subtype: null,
    source: 'class',
    source_name: 'Rogue',
    level_granted: 3,
    required: true,
    quantity: 2,
    remaining: 2,
    selected: [],
    options: mockExpertiseOptions,
    options_endpoint: null,
    metadata: []
  }
]

const mockNoFeatureChoices: PendingChoice[] = []

// Create a mock for the current test
let currentMockChoices = mockFightingStyleChoice

// Mock useUnifiedChoices composable
mockNuxtImport('useUnifiedChoices', () => {
  return vi.fn(() => {
    return {
      choices: ref(currentMockChoices),
      choicesByType: computed(() => ({
        fightingStyles: currentMockChoices.filter(c => c.type === 'fighting_style'),
        expertise: currentMockChoices.filter(c => c.type === 'expertise'),
        optionalFeatures: currentMockChoices.filter(c => c.type === 'optional_feature'),
        languages: [],
        proficiencies: [],
        equipment: [],
        spells: [],
        asiOrFeat: [],
        feats: [],
        abilityScores: [],
        sizes: [],
        hitPoints: []
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

describe('StepFeatureChoices', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    currentMockChoices = mockFightingStyleChoice
  })

  describe('basic rendering', () => {
    it('renders without error', async () => {
      const wrapper = await mountSuspended(StepFeatureChoices, {
        props: {
          characterId: 123,
          nextStep: vi.fn()
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('accepts required props', async () => {
      const nextStepFn = vi.fn()
      const wrapper = await mountSuspended(StepFeatureChoices, {
        props: {
          characterId: 456,
          nextStep: nextStepFn
        }
      })

      expect(wrapper.props('characterId')).toBe(456)
      expect(wrapper.props('nextStep')).toBe(nextStepFn)
    })

    it('displays header with "Feature Choices"', async () => {
      const wrapper = await mountSuspended(StepFeatureChoices, {
        props: {
          characterId: 123,
          nextStep: vi.fn()
        }
      })

      expect(wrapper.text()).toContain('Feature Choices')
    })

    it('shows continue button', async () => {
      const wrapper = await mountSuspended(StepFeatureChoices, {
        props: {
          characterId: 123,
          nextStep: vi.fn()
        }
      })

      const continueBtn = wrapper.find('[data-testid="continue-btn"]')
      expect(continueBtn.exists()).toBe(true)
    })
  })

  describe('empty state', () => {
    it('shows message when no feature choices available', async () => {
      currentMockChoices = mockNoFeatureChoices
      const wrapper = await mountSuspended(StepFeatureChoices, {
        props: {
          characterId: 123,
          nextStep: vi.fn()
        }
      })

      expect(wrapper.text()).toContain('No feature choices available')
    })
  })
})
