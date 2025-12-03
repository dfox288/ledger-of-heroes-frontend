// tests/stores/characterBuilder.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'
import type { Race, CharacterClass } from '~/types'

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

  describe('refreshStats action', () => {
    it('fetches stats from API when characterId exists', async () => {
      mockApiFetch.mockResolvedValue({
        data: {
          character_id: 42,
          level: 1,
          proficiency_bonus: 2,
          ability_scores: {}
        }
      })

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await store.refreshStats()

      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42/stats')
      expect(store.characterStats).toEqual({
        character_id: 42,
        level: 1,
        proficiency_bonus: 2,
        ability_scores: {}
      })
    })

    it('does nothing when characterId is null', async () => {
      const store = useCharacterBuilderStore()
      store.characterId = null

      await store.refreshStats()

      expect(mockApiFetch).not.toHaveBeenCalled()
    })
  })

  describe('selectRace action', () => {
    const mockRace: Race = {
      id: 1,
      name: 'Dwarf',
      slug: 'dwarf',
      speed: 25
    } as Race

    const mockSubrace: Race = {
      id: 2,
      name: 'Hill Dwarf',
      slug: 'hill-dwarf',
      speed: 25,
      parent_race: { id: 1, name: 'Dwarf', slug: 'dwarf' }
    } as Race

    it('calls API with race_id', async () => {
      mockApiFetch.mockResolvedValue({ data: {} })

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await store.selectRace(mockRace)

      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42', {
        method: 'PATCH',
        body: { race_id: 1 }
      })
    })

    it('uses subrace ID when subrace provided', async () => {
      mockApiFetch.mockResolvedValue({ data: {} })

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await store.selectRace(mockRace, mockSubrace)

      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42', {
        method: 'PATCH',
        body: { race_id: 2 }
      })
    })

    it('updates store state after selection', async () => {
      mockApiFetch.mockResolvedValue({ data: {} })

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await store.selectRace(mockRace, mockSubrace)

      expect(store.raceId).toBe(1)
      expect(store.subraceId).toBe(2)
      expect(store.selectedRace).toEqual(mockSubrace)
    })

    it('sets loading state during API call', async () => {
      let resolvePromise: (value: unknown) => void
      mockApiFetch.mockReturnValue(new Promise((resolve) => {
        resolvePromise = resolve
      }))

      const store = useCharacterBuilderStore()
      store.characterId = 42

      const promise = store.selectRace(mockRace)
      expect(store.isLoading).toBe(true)

      resolvePromise!({ data: {} })
      await promise

      expect(store.isLoading).toBe(false)
    })

    it('sets error on API failure', async () => {
      mockApiFetch.mockRejectedValue(new Error('Network error'))

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await expect(store.selectRace(mockRace)).rejects.toThrow('Network error')
      expect(store.error).toBe('Failed to save race')
    })
  })

  describe('selectClass action', () => {
    const mockClass: CharacterClass = {
      id: 1,
      name: 'Fighter',
      slug: 'fighter',
      hit_die: 10,
      is_base_class: true,
      spellcasting_ability: null
    } as CharacterClass

    const mockCasterClass: CharacterClass = {
      id: 2,
      name: 'Wizard',
      slug: 'wizard',
      hit_die: 6,
      is_base_class: true,
      spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' }
    } as CharacterClass

    it('calls API with class_id', async () => {
      mockApiFetch.mockResolvedValue({ data: {} })

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await store.selectClass(mockClass)

      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42', {
        method: 'PATCH',
        body: { class_id: 1 }
      })
    })

    it('updates store state after selection', async () => {
      mockApiFetch.mockResolvedValue({ data: {} })

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await store.selectClass(mockClass)

      expect(store.classId).toBe(1)
      expect(store.selectedClass).toEqual(mockClass)
    })

    it('isCaster is false for non-caster class', async () => {
      mockApiFetch.mockResolvedValue({ data: {} })

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await store.selectClass(mockClass)

      expect(store.isCaster).toBe(false)
      expect(store.totalSteps).toBe(6)
    })

    it('isCaster is true for caster class', async () => {
      mockApiFetch.mockResolvedValue({ data: {} })

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await store.selectClass(mockCasterClass)

      expect(store.isCaster).toBe(true)
      expect(store.totalSteps).toBe(7)
    })

    it('sets loading state during API call', async () => {
      let resolvePromise: (value: unknown) => void
      mockApiFetch.mockReturnValue(new Promise((resolve) => {
        resolvePromise = resolve
      }))

      const store = useCharacterBuilderStore()
      store.characterId = 42

      const promise = store.selectClass(mockClass)
      expect(store.isLoading).toBe(true)

      resolvePromise!({ data: {} })
      await promise

      expect(store.isLoading).toBe(false)
    })

    it('sets error on API failure', async () => {
      mockApiFetch.mockRejectedValue(new Error('Network error'))

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await expect(store.selectClass(mockClass)).rejects.toThrow('Network error')
      expect(store.error).toBe('Failed to save class')
    })
  })

  describe('saveAbilityScores', () => {
    it('saves ability scores and method to API', async () => {
      mockApiFetch.mockResolvedValue({ data: {} })

      const store = useCharacterBuilderStore()
      store.characterId = 1

      await store.saveAbilityScores('point_buy', {
        strength: 14,
        dexterity: 12,
        constitution: 15,
        intelligence: 10,
        wisdom: 13,
        charisma: 8
      })

      // Verify API call parameters
      expect(mockApiFetch).toHaveBeenCalledWith('/characters/1', {
        method: 'PATCH',
        body: {
          ability_score_method: 'point_buy',
          strength: 14,
          dexterity: 12,
          constitution: 15,
          intelligence: 10,
          wisdom: 13,
          charisma: 8
        }
      })

      // Verify refreshStats was called
      expect(mockApiFetch).toHaveBeenCalledWith('/characters/1/stats')

      // Verify state was updated
      expect(store.abilityScores).toEqual({
        strength: 14,
        dexterity: 12,
        constitution: 15,
        intelligence: 10,
        wisdom: 13,
        charisma: 8
      })
      expect(store.abilityScoreMethod).toBe('point_buy')
    })

    it('sets error on API failure', async () => {
      mockApiFetch.mockRejectedValue(new Error('Not found'))

      const store = useCharacterBuilderStore()
      store.characterId = 999 // Will cause 404

      await expect(store.saveAbilityScores('manual', {
        strength: 10, dexterity: 10, constitution: 10,
        intelligence: 10, wisdom: 10, charisma: 10
      })).rejects.toThrow()

      expect(store.error).toBe('Failed to save ability scores')
    })
  })
})
