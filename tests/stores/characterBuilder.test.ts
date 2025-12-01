// tests/stores/characterBuilder.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

// Mock apiFetch at module level
const mockApiFetch = vi.fn()
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    apiFetch: mockApiFetch
  })
}))

describe('useCharacterBuilderStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockApiFetch.mockReset()
  })

  describe('initial state', () => {
    it('starts at step 1', () => {
      const store = useCharacterBuilderStore()
      expect(store.currentStep).toBe(1)
    })

    it('has no character ID initially', () => {
      const store = useCharacterBuilderStore()
      expect(store.characterId).toBeNull()
    })

    it('has empty name initially', () => {
      const store = useCharacterBuilderStore()
      expect(store.name).toBe('')
    })

    it('has default ability scores of 10', () => {
      const store = useCharacterBuilderStore()
      expect(store.abilityScores).toEqual({
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      })
    })

    it('calculates totalSteps as 6 for non-casters', () => {
      const store = useCharacterBuilderStore()
      expect(store.totalSteps).toBe(6)
    })

    it('isFirstStep is true at step 1', () => {
      const store = useCharacterBuilderStore()
      expect(store.isFirstStep).toBe(true)
    })

    it('isLastStep is false at step 1', () => {
      const store = useCharacterBuilderStore()
      expect(store.isLastStep).toBe(false)
    })
  })

  describe('navigation actions', () => {
    it('nextStep increments currentStep', () => {
      const store = useCharacterBuilderStore()
      store.nextStep()
      expect(store.currentStep).toBe(2)
    })

    it('nextStep does not exceed totalSteps', () => {
      const store = useCharacterBuilderStore()
      // Go to last step (6 for non-caster)
      for (let i = 0; i < 10; i++) {
        store.nextStep()
      }
      expect(store.currentStep).toBe(6)
    })

    it('previousStep decrements currentStep', () => {
      const store = useCharacterBuilderStore()
      store.currentStep = 3
      store.previousStep()
      expect(store.currentStep).toBe(2)
    })

    it('previousStep does not go below 1', () => {
      const store = useCharacterBuilderStore()
      store.previousStep()
      expect(store.currentStep).toBe(1)
    })

    it('goToStep navigates to valid step', () => {
      const store = useCharacterBuilderStore()
      store.goToStep(4)
      expect(store.currentStep).toBe(4)
    })

    it('goToStep ignores invalid step numbers', () => {
      const store = useCharacterBuilderStore()
      store.goToStep(0)
      expect(store.currentStep).toBe(1)
      store.goToStep(10)
      expect(store.currentStep).toBe(1)
    })
  })

  describe('reset action', () => {
    it('resets all state to initial values', () => {
      const store = useCharacterBuilderStore()

      // Modify state
      store.characterId = 123
      store.name = 'Gandalf'
      store.currentStep = 5
      store.raceId = 1
      store.classId = 2
      store.abilityScores.strength = 18

      // Reset
      store.reset()

      // Verify all reset
      expect(store.characterId).toBeNull()
      expect(store.name).toBe('')
      expect(store.currentStep).toBe(1)
      expect(store.raceId).toBeNull()
      expect(store.classId).toBeNull()
      expect(store.abilityScores.strength).toBe(10)
    })
  })

  describe('createDraft action', () => {
    it('calls API with character name', async () => {
      mockApiFetch.mockResolvedValue({ data: { id: 42, name: 'Gandalf' } })

      const store = useCharacterBuilderStore()
      await store.createDraft('Gandalf')

      expect(mockApiFetch).toHaveBeenCalledWith('/characters', {
        method: 'POST',
        body: { name: 'Gandalf' }
      })
    })

    it('sets characterId from response', async () => {
      mockApiFetch.mockResolvedValue({ data: { id: 42, name: 'Gandalf' } })

      const store = useCharacterBuilderStore()
      await store.createDraft('Gandalf')

      expect(store.characterId).toBe(42)
    })

    it('sets name from input', async () => {
      mockApiFetch.mockResolvedValue({ data: { id: 42, name: 'Gandalf' } })

      const store = useCharacterBuilderStore()
      await store.createDraft('Gandalf')

      expect(store.name).toBe('Gandalf')
    })

    it('sets loading state during API call', async () => {
      let resolvePromise: (value: unknown) => void
      mockApiFetch.mockReturnValue(new Promise((resolve) => {
        resolvePromise = resolve
      }))

      const store = useCharacterBuilderStore()
      const promise = store.createDraft('Gandalf')

      expect(store.isLoading).toBe(true)

      resolvePromise!({ data: { id: 42, name: 'Gandalf' } })
      await promise

      expect(store.isLoading).toBe(false)
    })

    it('sets error on API failure', async () => {
      mockApiFetch.mockRejectedValue(new Error('Network error'))

      const store = useCharacterBuilderStore()

      await expect(store.createDraft('Gandalf')).rejects.toThrow('Network error')
      expect(store.error).toBe('Network error')
    })
  })
})
