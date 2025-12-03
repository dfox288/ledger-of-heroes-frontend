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

    it('calculates totalSteps as 7 for non-casters', () => {
      const store = useCharacterBuilderStore()
      expect(store.totalSteps).toBe(7)
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
      // Go to last step (7 for non-caster)
      for (let i = 0; i < 10; i++) {
        store.nextStep()
      }
      expect(store.currentStep).toBe(7)
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

    it('calls API with class_id and fetches full detail', async () => {
      // Mock PATCH and GET calls
      mockApiFetch
        .mockResolvedValueOnce({ data: {} }) // PATCH
        .mockResolvedValueOnce({ data: mockClass }) // GET /classes/{slug}
        .mockResolvedValueOnce({ data: {} }) // refreshStats

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await store.selectClass(mockClass)

      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42', {
        method: 'PATCH',
        body: { class_id: 1 }
      })
      expect(mockApiFetch).toHaveBeenCalledWith('/classes/fighter')
    })

    it('updates store state with full class detail', async () => {
      const fullClassDetail = { ...mockClass, equipment: [{ id: 1, item: { name: 'Sword' } }] }
      mockApiFetch
        .mockResolvedValueOnce({ data: {} }) // PATCH
        .mockResolvedValueOnce({ data: fullClassDetail }) // GET detail
        .mockResolvedValueOnce({ data: {} }) // refreshStats

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await store.selectClass(mockClass)

      expect(store.classId).toBe(1)
      expect(store.selectedClass).toEqual(fullClassDetail)
    })

    it('isCaster is false for non-caster class', async () => {
      mockApiFetch
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: mockClass })
        .mockResolvedValueOnce({ data: {} })

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await store.selectClass(mockClass)

      expect(store.isCaster).toBe(false)
      expect(store.totalSteps).toBe(7)
    })

    it('isCaster is true for caster class', async () => {
      mockApiFetch
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: mockCasterClass })
        .mockResolvedValueOnce({ data: {} })

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await store.selectClass(mockCasterClass)

      expect(store.isCaster).toBe(true)
      expect(store.totalSteps).toBe(8)
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
      await promise.catch(() => {}) // May fail due to incomplete mocking

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

  describe('selectBackground', () => {
    it('saves background to API and fetches full detail', async () => {
      const store = useCharacterBuilderStore()
      store.characterId = 1

      const mockBackground = {
        id: 5,
        slug: 'soldier',
        name: 'Soldier',
        feature_name: 'Military Rank',
        feature_description: 'You have a military rank...',
        proficiencies: [],
        equipment: [],
        languages: []
      }

      const fullBackgroundDetail = {
        ...mockBackground,
        equipment: [{ id: 1, item: { name: 'Dagger' }, quantity: 1 }]
      }

      // Mock PATCH, GET detail, and refreshStats calls
      mockApiFetch
        .mockResolvedValueOnce({ data: { id: 1 } }) // PATCH
        .mockResolvedValueOnce({ data: fullBackgroundDetail }) // GET /backgrounds/{slug}
        .mockResolvedValueOnce({ data: {} }) // refreshStats

      await store.selectBackground(mockBackground as any)

      expect(mockApiFetch).toHaveBeenCalledWith('/characters/1', {
        method: 'PATCH',
        body: { background_id: 5 }
      })
      expect(mockApiFetch).toHaveBeenCalledWith('/backgrounds/soldier')
      expect(store.backgroundId).toBe(5)
      expect(store.selectedBackground).toEqual(fullBackgroundDetail)
    })
  })

  describe('totalSteps', () => {
    it('returns 7 for non-casters', () => {
      const store = useCharacterBuilderStore()
      store.selectedClass = {
        id: 1,
        name: 'Fighter',
        spellcasting_ability: null
      } as any

      expect(store.totalSteps).toBe(7)
    })

    it('returns 8 for casters', () => {
      const store = useCharacterBuilderStore()
      store.selectedClass = {
        id: 2,
        name: 'Wizard',
        spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' }
      } as any

      expect(store.totalSteps).toBe(8)
    })
  })

  describe('equipment choices', () => {
    it('setEquipmentChoice updates local state', () => {
      const store = useCharacterBuilderStore()

      store.setEquipmentChoice('weapon', 101)

      expect(store.equipmentChoices.get('weapon')).toBe(101)
    })

    it('allEquipmentChoicesMade returns false when choices pending', () => {
      const store = useCharacterBuilderStore()
      store.selectedClass = {
        equipment: [
          { is_choice: true, choice_group: 'weapon', item_id: 101 },
          { is_choice: true, choice_group: 'weapon', item_id: 102 }
        ]
      } as any

      expect(store.allEquipmentChoicesMade).toBe(false)
    })

    it('allEquipmentChoicesMade returns true when all choices made', () => {
      const store = useCharacterBuilderStore()
      store.selectedClass = {
        equipment: [
          { is_choice: true, choice_group: 'weapon', item_id: 101 },
          { is_choice: true, choice_group: 'weapon', item_id: 102 }
        ]
      } as any

      store.setEquipmentChoice('weapon', 101)

      expect(store.allEquipmentChoicesMade).toBe(true)
    })
  })

  describe('spell actions', () => {
    describe('learnSpell', () => {
      it('calls API to learn spell and updates selectedSpells', async () => {
        const store = useCharacterBuilderStore()
        store.characterId = 1

        const mockSpellResponse = {
          id: 100,
          spell_id: 42,
          spell: {
            id: 42,
            slug: 'fireball',
            name: 'Fireball',
            level: 3
          },
          source: 'class'
        }

        mockApiFetch.mockResolvedValue({ data: mockSpellResponse })

        await store.learnSpell(42)

        expect(mockApiFetch).toHaveBeenCalledWith('/characters/1/spells', {
          method: 'POST',
          body: { spell_id: 42 }
        })
        expect(store.selectedSpells).toContainEqual(mockSpellResponse)
      })

      it('sets loading state during API call', async () => {
        let resolvePromise: (value: unknown) => void
        mockApiFetch.mockReturnValue(new Promise((resolve) => {
          resolvePromise = resolve
        }))

        const store = useCharacterBuilderStore()
        store.characterId = 1

        const promise = store.learnSpell(42)
        expect(store.isLoading).toBe(true)

        resolvePromise!({ data: { id: 100, spell_id: 42, spell: { id: 42 }, source: 'class' } })
        await promise

        expect(store.isLoading).toBe(false)
      })

      it('sets error on API failure', async () => {
        mockApiFetch.mockRejectedValue(new Error('Network error'))

        const store = useCharacterBuilderStore()
        store.characterId = 1

        await expect(store.learnSpell(42)).rejects.toThrow('Network error')
        expect(store.error).toBe('Failed to learn spell')
      })
    })

    describe('unlearnSpell', () => {
      it('calls API to unlearn spell and removes from selectedSpells', async () => {
        const store = useCharacterBuilderStore()
        store.characterId = 1
        store.selectedSpells = [
          { id: 100, spell_id: 42, spell: { id: 42, name: 'Fireball' }, source: 'class' } as any,
          { id: 101, spell_id: 43, spell: { id: 43, name: 'Magic Missile' }, source: 'class' } as any
        ]

        mockApiFetch.mockResolvedValue({})

        await store.unlearnSpell(42)

        expect(mockApiFetch).toHaveBeenCalledWith('/characters/1/spells/42', {
          method: 'DELETE'
        })
        expect(store.selectedSpells).toHaveLength(1)
        expect(store.selectedSpells[0].spell_id).toBe(43)
      })

      it('sets error on API failure', async () => {
        mockApiFetch.mockRejectedValue(new Error('Network error'))

        const store = useCharacterBuilderStore()
        store.characterId = 1
        store.selectedSpells = [
          { id: 100, spell_id: 42, spell: { id: 42 }, source: 'class' } as any
        ]

        await expect(store.unlearnSpell(42)).rejects.toThrow('Network error')
        expect(store.error).toBe('Failed to unlearn spell')
      })
    })

    describe('setRaceSpellChoice', () => {
      it('updates local state for race spell choices', () => {
        const store = useCharacterBuilderStore()

        store.setRaceSpellChoice('high-elf-cantrip', 123)

        expect(store.raceSpellChoices.get('high-elf-cantrip')).toBe(123)
      })

      it('overwrites previous choice for same group', () => {
        const store = useCharacterBuilderStore()

        store.setRaceSpellChoice('high-elf-cantrip', 123)
        store.setRaceSpellChoice('high-elf-cantrip', 456)

        expect(store.raceSpellChoices.get('high-elf-cantrip')).toBe(456)
      })
    })

    describe('spell computed properties', () => {
      it('selectedCantrips returns only cantrips from selectedSpells', () => {
        const store = useCharacterBuilderStore()
        store.selectedSpells = [
          { id: 1, spell_id: 10, spell: { id: 10, name: 'Fire Bolt', level: 0 }, source: 'class' } as any,
          { id: 2, spell_id: 20, spell: { id: 20, name: 'Fireball', level: 3 }, source: 'class' } as any,
          { id: 3, spell_id: 30, spell: { id: 30, name: 'Light', level: 0 }, source: 'class' } as any
        ]

        expect(store.selectedCantrips).toHaveLength(2)
        expect(store.selectedCantrips.every(s => s.spell?.level === 0)).toBe(true)
      })

      it('selectedLeveledSpells returns only non-cantrip spells', () => {
        const store = useCharacterBuilderStore()
        store.selectedSpells = [
          { id: 1, spell_id: 10, spell: { id: 10, name: 'Fire Bolt', level: 0 }, source: 'class' } as any,
          { id: 2, spell_id: 20, spell: { id: 20, name: 'Fireball', level: 3 }, source: 'class' } as any,
          { id: 3, spell_id: 30, spell: { id: 30, name: 'Magic Missile', level: 1 }, source: 'class' } as any
        ]

        expect(store.selectedLeveledSpells).toHaveLength(2)
        expect(store.selectedLeveledSpells.every(s => (s.spell?.level ?? 0) > 0)).toBe(true)
      })
    })
  })

  describe('loadCharacterForEditing', () => {
    it('loads character data into store', async () => {
      const mockCharacter = {
        id: 42,
        name: 'Gandalf',
        level: 1,
        ability_scores: { STR: 14, DEX: 12, CON: 15, INT: 18, WIS: 16, CHA: 10 },
        race: { id: 1, name: 'Human', slug: 'human' },
        class: { id: 2, name: 'Wizard', slug: 'wizard' },
        background: { id: 3, name: 'Sage', slug: 'sage' }
      }

      const mockRace = { id: 1, name: 'Human', slug: 'human', speed: 30 }
      const mockClass = { id: 2, name: 'Wizard', slug: 'wizard', spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' } }
      const mockBackground = { id: 3, name: 'Sage', slug: 'sage' }

      mockApiFetch
        .mockResolvedValueOnce({ data: mockCharacter }) // GET /characters/42
        .mockResolvedValueOnce({ data: mockRace }) // GET /races/human
        .mockResolvedValueOnce({ data: mockClass }) // GET /classes/wizard
        .mockResolvedValueOnce({ data: mockBackground }) // GET /backgrounds/sage
        .mockResolvedValueOnce({ data: [] }) // GET /characters/42/spells

      const store = useCharacterBuilderStore()
      await store.loadCharacterForEditing(42)

      expect(store.characterId).toBe(42)
      expect(store.name).toBe('Gandalf')
      expect(store.abilityScores.strength).toBe(14)
      expect(store.abilityScores.intelligence).toBe(18)
      expect(store.raceId).toBe(1)
      expect(store.classId).toBe(2)
      expect(store.backgroundId).toBe(3)
      expect(store.selectedRace).toEqual(mockRace)
      expect(store.selectedClass).toEqual(mockClass)
    })

    it('throws error for characters above level 1', async () => {
      mockApiFetch.mockResolvedValueOnce({
        data: { id: 42, name: 'High Level', level: 5 }
      })

      const store = useCharacterBuilderStore()
      await expect(store.loadCharacterForEditing(42)).rejects.toThrow('Only level 1 characters can be edited')
    })

    it('handles subrace by setting both raceId and subraceId', async () => {
      const mockCharacter = {
        id: 42,
        name: 'Thorin',
        level: 1,
        ability_scores: { STR: 14, DEX: 10, CON: 16, INT: 10, WIS: 12, CHA: 8 },
        race: { id: 2, name: 'Hill Dwarf', slug: 'hill-dwarf' },
        class: null,
        background: null
      }

      const mockSubrace = {
        id: 2,
        name: 'Hill Dwarf',
        slug: 'hill-dwarf',
        parent_race: { id: 1, name: 'Dwarf', slug: 'dwarf' }
      }

      mockApiFetch
        .mockResolvedValueOnce({ data: mockCharacter })
        .mockResolvedValueOnce({ data: mockSubrace })

      const store = useCharacterBuilderStore()
      await store.loadCharacterForEditing(42)

      expect(store.raceId).toBe(1) // Parent race ID
      expect(store.subraceId).toBe(2) // Subrace ID
    })
  })

  describe('equipment item selections', () => {
    it('tracks item selections within compound choices', () => {
      const store = useCharacterBuilderStore()

      store.setEquipmentItemSelection('choice_2', 1, 0, 42)

      expect(store.getEquipmentItemSelection('choice_2', 1, 0)).toBe(42)
    })

    it('clears item selections on reset', () => {
      const store = useCharacterBuilderStore()
      store.setEquipmentItemSelection('choice_2', 1, 0, 42)

      store.reset()

      expect(store.getEquipmentItemSelection('choice_2', 1, 0)).toBeUndefined()
    })

    it('builds selection key correctly', () => {
      const store = useCharacterBuilderStore()

      store.setEquipmentItemSelection('choice_2', 1, 0, 42)
      store.setEquipmentItemSelection('choice_2', 1, 1, 43) // second item in same choice

      expect(store.equipmentItemSelections.get('choice_2:1:0')).toBe(42)
      expect(store.equipmentItemSelections.get('choice_2:1:1')).toBe(43)
    })

    it('clears all item selections for a choice group', () => {
      const store = useCharacterBuilderStore()

      store.setEquipmentItemSelection('choice_2', 1, 0, 42)
      store.setEquipmentItemSelection('choice_2', 1, 1, 43)
      store.setEquipmentItemSelection('choice_3', 1, 0, 44)

      store.clearEquipmentItemSelections('choice_2')

      expect(store.getEquipmentItemSelection('choice_2', 1, 0)).toBeUndefined()
      expect(store.getEquipmentItemSelection('choice_2', 1, 1)).toBeUndefined()
      expect(store.getEquipmentItemSelection('choice_3', 1, 0)).toBe(44) // other group unaffected
    })
  })
})
