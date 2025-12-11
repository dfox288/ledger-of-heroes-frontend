// tests/stores/characterLevelUp.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// =============================================================================
// API MOCK SETUP
// =============================================================================

const { mockApiFetch } = vi.hoisted(() => ({
  mockApiFetch: vi.fn()
}))

vi.mock('~/composables/useApi', () => ({
  useApi: () => ({ apiFetch: mockApiFetch })
}))

// Import store AFTER mocks are set up
// eslint-disable-next-line import/first
import { useCharacterLevelUpStore } from '~/stores/characterLevelUp'

// =============================================================================
// MOCK DATA
// =============================================================================

const mockLevelUpResult = {
  previous_level: 3,
  new_level: 4,
  hp_increase: 9,
  new_max_hp: 38,
  features_gained: [
    { id: 1, name: 'Ability Score Improvement', description: 'Increase ability scores' }
  ],
  spell_slots: {},
  asi_pending: true,
  hp_choice_pending: true
}

const mockCharacterClasses = [
  {
    class: {
      id: 1,
      name: 'Fighter',
      slug: 'fighter',
      full_slug: 'phb:fighter',
      hit_die: 10
    },
    level: 3,
    subclass: null,
    is_primary: true
  }
]

// =============================================================================
// TESTS
// =============================================================================

describe('characterLevelUp store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('starts with null character data', () => {
      const store = useCharacterLevelUpStore()
      expect(store.characterId).toBeNull()
      expect(store.publicId).toBeNull()
      expect(store.levelUpResult).toBeNull()
    })

    it('starts not open', () => {
      const store = useCharacterLevelUpStore()
      expect(store.isOpen).toBe(false)
    })

    it('starts on class-selection step', () => {
      const store = useCharacterLevelUpStore()
      expect(store.currentStepName).toBe('class-selection')
    })

    it('starts with no loading state', () => {
      const store = useCharacterLevelUpStore()
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('openWizard', () => {
    it('sets character data and opens wizard', () => {
      const store = useCharacterLevelUpStore()
      store.openWizard(123, 'shadow-warden-q3x9', mockCharacterClasses, 3)

      expect(store.characterId).toBe(123)
      expect(store.publicId).toBe('shadow-warden-q3x9')
      expect(store.isOpen).toBe(true)
    })

    it('stores character classes for multiclass detection', () => {
      const store = useCharacterLevelUpStore()
      store.openWizard(123, 'shadow-warden-q3x9', mockCharacterClasses, 3)

      expect(store.characterClasses).toEqual(mockCharacterClasses)
      expect(store.totalLevel).toBe(3)
    })

    it('resets previous state when opening', () => {
      const store = useCharacterLevelUpStore()

      // Set some state
      store.levelUpResult = mockLevelUpResult
      store.selectedClassSlug = 'phb:fighter'
      store.error = 'previous error'

      // Open fresh wizard
      store.openWizard(456, 'new-char-xxxx', [], 1)

      expect(store.levelUpResult).toBeNull()
      expect(store.selectedClassSlug).toBeNull()
      expect(store.error).toBeNull()
    })
  })

  describe('closeWizard', () => {
    it('closes wizard but preserves character data', () => {
      const store = useCharacterLevelUpStore()
      store.openWizard(123, 'shadow-warden-q3x9', mockCharacterClasses, 3)
      store.closeWizard()

      expect(store.isOpen).toBe(false)
      expect(store.characterId).toBe(123)
      expect(store.publicId).toBe('shadow-warden-q3x9')
    })
  })

  describe('reset', () => {
    it('clears all state', () => {
      const store = useCharacterLevelUpStore()
      store.openWizard(123, 'shadow-warden-q3x9', mockCharacterClasses, 3)
      store.levelUpResult = mockLevelUpResult
      store.reset()

      expect(store.characterId).toBeNull()
      expect(store.publicId).toBeNull()
      expect(store.isOpen).toBe(false)
      expect(store.levelUpResult).toBeNull()
      expect(store.characterClasses).toEqual([])
      expect(store.totalLevel).toBe(0)
    })
  })

  describe('goToStep', () => {
    it('changes current step', () => {
      const store = useCharacterLevelUpStore()
      store.goToStep('hit-points')

      expect(store.currentStepName).toBe('hit-points')
    })
  })

  describe('computed: isMulticlass', () => {
    it('returns false for single-class characters', () => {
      const store = useCharacterLevelUpStore()
      store.openWizard(123, 'test', mockCharacterClasses, 3)

      expect(store.isMulticlass).toBe(false)
    })

    it('returns true for multiclass characters', () => {
      const store = useCharacterLevelUpStore()
      const multiclassEntries = [
        ...mockCharacterClasses,
        {
          class: { id: 2, name: 'Rogue', slug: 'rogue', full_slug: 'phb:rogue', hit_die: 8 },
          level: 2,
          subclass: null,
          is_primary: false
        }
      ]
      store.openWizard(123, 'test', multiclassEntries, 5)

      expect(store.isMulticlass).toBe(true)
    })
  })

  describe('computed: isFirstMulticlassOpportunity', () => {
    it('returns true at level 1', () => {
      const store = useCharacterLevelUpStore()
      store.openWizard(123, 'test', mockCharacterClasses, 1)

      expect(store.isFirstMulticlassOpportunity).toBe(true)
    })

    it('returns false at level 2+', () => {
      const store = useCharacterLevelUpStore()
      store.openWizard(123, 'test', mockCharacterClasses, 3)

      expect(store.isFirstMulticlassOpportunity).toBe(false)
    })
  })

  describe('computed: needsClassSelection', () => {
    it('returns true for multiclass characters', () => {
      const store = useCharacterLevelUpStore()
      const multiclassEntries = [
        ...mockCharacterClasses,
        {
          class: { id: 2, name: 'Rogue', slug: 'rogue', full_slug: 'phb:rogue', hit_die: 8 },
          level: 2,
          subclass: null,
          is_primary: false
        }
      ]
      store.openWizard(123, 'test', multiclassEntries, 5)

      expect(store.needsClassSelection).toBe(true)
    })

    it('returns true for first multiclass opportunity', () => {
      const store = useCharacterLevelUpStore()
      store.openWizard(123, 'test', mockCharacterClasses, 1)

      expect(store.needsClassSelection).toBe(true)
    })

    it('returns false for single-class at level 2+', () => {
      const store = useCharacterLevelUpStore()
      store.openWizard(123, 'test', mockCharacterClasses, 3)

      expect(store.needsClassSelection).toBe(false)
    })
  })

  describe('computed: isComplete', () => {
    it('returns false when no level up result', () => {
      const store = useCharacterLevelUpStore()
      expect(store.isComplete).toBe(false)
    })

    it('returns false when choices are pending', () => {
      const store = useCharacterLevelUpStore()
      store.levelUpResult = { ...mockLevelUpResult, hp_choice_pending: true, asi_pending: false }
      expect(store.isComplete).toBe(false)
    })

    it('returns true when all choices resolved', () => {
      const store = useCharacterLevelUpStore()
      store.levelUpResult = { ...mockLevelUpResult, hp_choice_pending: false, asi_pending: false }
      expect(store.isComplete).toBe(true)
    })
  })

  describe('levelUp action', () => {
    it('calls API with correct parameters', async () => {
      mockApiFetch.mockResolvedValueOnce(mockLevelUpResult)
      const store = useCharacterLevelUpStore()
      store.openWizard(123, 'shadow-warden-q3x9', mockCharacterClasses, 3)

      await store.levelUp('phb:fighter')

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/shadow-warden-q3x9/classes/phb:fighter/level-up',
        { method: 'POST' }
      )
    })

    it('stores level up result on success', async () => {
      mockApiFetch.mockResolvedValueOnce(mockLevelUpResult)
      const store = useCharacterLevelUpStore()
      store.openWizard(123, 'shadow-warden-q3x9', mockCharacterClasses, 3)

      const result = await store.levelUp('phb:fighter')

      expect(store.levelUpResult).toEqual(mockLevelUpResult)
      expect(store.selectedClassSlug).toBe('phb:fighter')
      expect(result).toEqual(mockLevelUpResult)
    })

    it('sets loading state during API call', async () => {
      let resolvePromise: (value: unknown) => void
      mockApiFetch.mockImplementationOnce(() => new Promise((resolve) => {
        resolvePromise = resolve
      }))

      const store = useCharacterLevelUpStore()
      store.openWizard(123, 'shadow-warden-q3x9', mockCharacterClasses, 3)

      const promise = store.levelUp('phb:fighter')
      expect(store.isLoading).toBe(true)

      resolvePromise!(mockLevelUpResult)
      await promise

      expect(store.isLoading).toBe(false)
    })

    it('handles API errors', async () => {
      const error = new Error('Network error')
      mockApiFetch.mockRejectedValueOnce(error)

      const store = useCharacterLevelUpStore()
      store.openWizard(123, 'shadow-warden-q3x9', mockCharacterClasses, 3)

      await expect(store.levelUp('phb:fighter')).rejects.toThrow('Network error')
      expect(store.error).toBe('Network error')
      expect(store.isLoading).toBe(false)
    })

    it('throws if no character selected', async () => {
      const store = useCharacterLevelUpStore()

      await expect(store.levelUp('phb:fighter')).rejects.toThrow('No character selected')
    })
  })

  describe('pending choices state', () => {
    it('initializes with empty pending choices', () => {
      const store = useCharacterLevelUpStore()
      expect(store.pendingChoices).toEqual([])
    })

    it('computes hasSpellChoices from pending choices', () => {
      const store = useCharacterLevelUpStore()
      expect(store.hasSpellChoices).toBe(false)

      store.pendingChoices = [
        { id: 'spell-1', type: 'spell', quantity: 2, source: 'class', source_name: 'Wizard' }
      ]

      expect(store.hasSpellChoices).toBe(true)
    })

    it('computes hasFeatureChoices for fighting_style', () => {
      const store = useCharacterLevelUpStore()
      store.pendingChoices = [
        { id: 'fs-1', type: 'fighting_style', quantity: 1, source: 'class', source_name: 'Fighter' }
      ]

      expect(store.hasFeatureChoices).toBe(true)
    })

    it('computes hasFeatureChoices for expertise', () => {
      const store = useCharacterLevelUpStore()
      store.pendingChoices = [
        { id: 'exp-1', type: 'expertise', quantity: 2, source: 'class', source_name: 'Rogue' }
      ]

      expect(store.hasFeatureChoices).toBe(true)
    })

    it('computes hasFeatureChoices for optional_feature', () => {
      const store = useCharacterLevelUpStore()
      store.pendingChoices = [
        { id: 'of-1', type: 'optional_feature', quantity: 2, source: 'class', source_name: 'Warlock' }
      ]

      expect(store.hasFeatureChoices).toBe(true)
    })

    it('computes hasLanguageChoices from pending choices', () => {
      const store = useCharacterLevelUpStore()
      store.pendingChoices = [
        { id: 'lang-1', type: 'language', quantity: 3, source: 'feat', source_name: 'Linguist' }
      ]

      expect(store.hasLanguageChoices).toBe(true)
    })

    it('computes hasProficiencyChoices from pending choices', () => {
      const store = useCharacterLevelUpStore()
      store.pendingChoices = [
        { id: 'prof-1', type: 'proficiency', quantity: 3, source: 'feat', source_name: 'Skilled' }
      ]

      expect(store.hasProficiencyChoices).toBe(true)
    })
  })

  describe('fetchPendingChoices', () => {
    it('fetches and stores pending choices', async () => {
      const mockChoices = [
        { id: 'spell-1', type: 'spell', quantity: 2, source: 'class', source_name: 'Wizard' },
        { id: 'fs-1', type: 'fighting_style', quantity: 1, source: 'class', source_name: 'Fighter' }
      ]
      // API returns { data: { choices: [...], summary: {...} } }
      mockApiFetch.mockResolvedValueOnce({ data: { choices: mockChoices, summary: {} } })

      const store = useCharacterLevelUpStore()
      store.characterId = 1
      store.publicId = 'test-char-abc'

      await store.fetchPendingChoices()

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/test-char-abc/pending-choices'
      )
      expect(store.pendingChoices).toEqual(mockChoices)
    })

    it('handles API errors gracefully without throwing', async () => {
      const error = new Error('Network error')
      mockApiFetch.mockRejectedValueOnce(error)

      const store = useCharacterLevelUpStore()
      store.characterId = 1
      store.publicId = 'test-char-abc'

      // Should not throw
      await expect(store.fetchPendingChoices()).resolves.toBeUndefined()

      // Choices should remain empty
      expect(store.pendingChoices).toEqual([])
    })

    it('does nothing when publicId is null', async () => {
      const store = useCharacterLevelUpStore()
      store.characterId = 1
      store.publicId = null

      await store.fetchPendingChoices()

      expect(mockApiFetch).not.toHaveBeenCalled()
    })
  })

  describe('refreshChoices', () => {
    it('calls fetchPendingChoices', async () => {
      const mockChoices = [
        { id: 'lang-1', type: 'language', quantity: 1, source: 'feat', source_name: 'Linguist' }
      ]
      // API returns { data: { choices: [...], summary: {...} } }
      mockApiFetch.mockResolvedValueOnce({ data: { choices: mockChoices, summary: {} } })

      const store = useCharacterLevelUpStore()
      store.characterId = 1
      store.publicId = 'test-char-xyz'

      await store.refreshChoices()

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/test-char-xyz/pending-choices'
      )
      expect(store.pendingChoices).toEqual(mockChoices)
    })
  })

  describe('levelUp action - fetches pending choices', () => {
    it('calls fetchPendingChoices after successful level-up', async () => {
      const mockChoices = [
        { id: 'spell-1', type: 'spell', quantity: 2, source: 'class', source_name: 'Wizard' }
      ]

      // First call: level-up, Second call: pending choices
      // API returns { data: { choices: [...], summary: {...} } }
      mockApiFetch
        .mockResolvedValueOnce(mockLevelUpResult)
        .mockResolvedValueOnce({ data: { choices: mockChoices, summary: {} } })

      const store = useCharacterLevelUpStore()
      store.openWizard(123, 'shadow-warden-q3x9', mockCharacterClasses, 3)

      await store.levelUp('phb:wizard')

      // Verify both API calls were made
      expect(mockApiFetch).toHaveBeenCalledTimes(2)
      expect(mockApiFetch).toHaveBeenNthCalledWith(
        1,
        '/characters/shadow-warden-q3x9/classes/phb:wizard/level-up',
        { method: 'POST' }
      )
      expect(mockApiFetch).toHaveBeenNthCalledWith(
        2,
        '/characters/shadow-warden-q3x9/pending-choices'
      )

      // Verify choices were stored
      expect(store.pendingChoices).toEqual(mockChoices)
    })
  })
})
