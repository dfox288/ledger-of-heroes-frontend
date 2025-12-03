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

    it('isCaster is true for caster class with spells at level 1', async () => {
      const wizardWithSpells: CharacterClass = {
        ...mockCasterClass,
        level_progression: [
          { level: 1, cantrips_known: 3, spells_known: 6 }
        ]
      } as CharacterClass

      mockApiFetch
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: wizardWithSpells })
        .mockResolvedValueOnce({ data: {} })

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await store.selectClass(wizardWithSpells)

      expect(store.isCaster).toBe(true)
      expect(store.totalSteps).toBe(8)
    })

    it('isCaster is false for class with spellcasting_ability but no spells at level 1 (e.g., Paladin)', async () => {
      const paladinClass: CharacterClass = {
        id: 3,
        name: 'Paladin',
        slug: 'paladin',
        hit_die: 10,
        is_base_class: true,
        spellcasting_ability: { id: 6, code: 'CHA', name: 'Charisma' },
        // Paladins don't get spells until level 2
        level_progression: [
          { level: 1, cantrips_known: 0, spells_known: 0 }
        ]
      } as CharacterClass

      mockApiFetch
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: paladinClass })
        .mockResolvedValueOnce({ data: {} })

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await store.selectClass(paladinClass)

      // Should be false because no spells are available at level 1
      expect(store.isCaster).toBe(false)
      expect(store.totalSteps).toBe(7) // No spell step
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

    it('returns 8 for casters (with spells at level 1)', () => {
      const store = useCharacterBuilderStore()
      store.selectedClass = {
        id: 2,
        name: 'Wizard',
        spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' },
        level_progression: [{ level: 1, cantrips_known: 3, spells_known: 6 }]
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
    describe('toggleSpell', () => {
      it('adds spell ID to pendingSpellIds when not selected', () => {
        const store = useCharacterBuilderStore()

        store.toggleSpell(42)

        expect(store.pendingSpellIds.has(42)).toBe(true)
      })

      it('removes spell ID from pendingSpellIds when already selected', () => {
        const store = useCharacterBuilderStore()
        store.pendingSpellIds = new Set([42, 43])

        store.toggleSpell(42)

        expect(store.pendingSpellIds.has(42)).toBe(false)
        expect(store.pendingSpellIds.has(43)).toBe(true)
      })
    })

    describe('isSpellSelected', () => {
      it('returns true when spell is in pendingSpellIds', () => {
        const store = useCharacterBuilderStore()
        store.pendingSpellIds = new Set([42])

        expect(store.isSpellSelected(42)).toBe(true)
      })

      it('returns false when spell is not in pendingSpellIds', () => {
        const store = useCharacterBuilderStore()
        store.pendingSpellIds = new Set([43])

        expect(store.isSpellSelected(42)).toBe(false)
      })
    })

    describe('initializePendingSpells', () => {
      it('populates pendingSpellIds from existing character spells', async () => {
        const store = useCharacterBuilderStore()
        store.characterId = 1

        mockApiFetch.mockResolvedValue({
          data: [
            { id: 100, spell: { id: 42 } },
            { id: 101, spell: { id: 43 } }
          ]
        })

        await store.initializePendingSpells()

        expect(store.pendingSpellIds.has(42)).toBe(true)
        expect(store.pendingSpellIds.has(43)).toBe(true)
      })

      it('handles empty spell list gracefully', async () => {
        const store = useCharacterBuilderStore()
        store.characterId = 1

        mockApiFetch.mockResolvedValue({ data: [] })

        await store.initializePendingSpells()

        expect(store.pendingSpellIds.size).toBe(0)
      })
    })

    describe('saveSpellChoices', () => {
      it('clears existing spells and saves new selections', async () => {
        const store = useCharacterBuilderStore()
        store.characterId = 1
        store.pendingSpellIds = new Set([42, 43])

        // Mock: GET existing spells, DELETE each, then POST new ones
        mockApiFetch
          .mockResolvedValueOnce({ data: [{ spell: { id: 99 } }] }) // GET existing
          .mockResolvedValueOnce({}) // DELETE 99
          .mockResolvedValueOnce({}) // POST 42
          .mockResolvedValueOnce({}) // POST 43

        await store.saveSpellChoices()

        expect(mockApiFetch).toHaveBeenCalledWith('/characters/1/spells')
        expect(mockApiFetch).toHaveBeenCalledWith('/characters/1/spells/99', { method: 'DELETE' })
        expect(mockApiFetch).toHaveBeenCalledWith('/characters/1/spells', {
          method: 'POST',
          body: { spell_id: 42 }
        })
        expect(mockApiFetch).toHaveBeenCalledWith('/characters/1/spells', {
          method: 'POST',
          body: { spell_id: 43 }
        })
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

      const mockParentRace = {
        id: 1,
        name: 'Dwarf',
        slug: 'dwarf',
        subraces: [{ id: 2, name: 'Hill Dwarf', slug: 'hill-dwarf' }]
      }

      mockApiFetch
        .mockResolvedValueOnce({ data: mockCharacter }) // GET /characters/42
        .mockResolvedValueOnce({ data: mockSubrace }) // GET /races/hill-dwarf
        .mockResolvedValueOnce({ data: mockParentRace }) // GET /races/dwarf (parent)

      const store = useCharacterBuilderStore()
      await store.loadCharacterForEditing(42)

      expect(store.raceId).toBe(1) // Parent race ID
      expect(store.subraceId).toBe(2) // Subrace ID
      expect(store.selectedRace?.subraces?.length).toBeGreaterThan(0) // Parent race with subraces
    })
  })

  describe('updateName', () => {
    it('updates character name via API', async () => {
      mockApiFetch.mockResolvedValueOnce({ data: { id: 42, name: 'New Name' } })

      const store = useCharacterBuilderStore()
      store.characterId = 42
      store.name = 'Old Name'

      await store.updateName('New Name')

      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42', {
        method: 'PATCH',
        body: { name: 'New Name' }
      })
      expect(store.name).toBe('New Name')
    })

    it('does nothing if no characterId', async () => {
      const store = useCharacterBuilderStore()
      store.characterId = null

      await store.updateName('New Name')

      expect(mockApiFetch).not.toHaveBeenCalled()
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

  describe('saveEquipmentChoices', () => {
    it('saves fixed equipment with item_id', async () => {
      const store = useCharacterBuilderStore()
      store.characterId = 42
      store.selectedClass = {
        name: 'Fighter',
        equipment: [
          { id: 1, item: { id: 100, name: 'Chain Mail' }, quantity: 1, is_choice: false }
        ]
      } as any
      store.selectedBackground = { name: 'Soldier', equipment: [] } as any

      // Mock returns empty equipment list for clearing, then success for POST
      mockApiFetch.mockResolvedValue({ data: [] })

      await store.saveEquipmentChoices()

      // First call fetches existing equipment for clearing
      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42/equipment')

      // Then saves the equipment
      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42/equipment', {
        method: 'POST',
        body: { item_id: 100, quantity: 1 }
      })
    })

    it('saves flavor equipment without item_id using custom_name', async () => {
      const store = useCharacterBuilderStore()
      store.characterId = 42
      store.selectedClass = { name: 'Fighter', equipment: [] } as any
      store.selectedBackground = {
        name: 'Acolyte',
        equipment: [
          // Flavor item - no item_id, just description
          { id: 118, item: null, description: 'holy symbol (a gift to you when you entered the priesthood)', quantity: 1, is_choice: false },
          // Regular item with item_id
          { id: 121, item: { id: 455, name: 'Cloth-of-gold vestments' }, quantity: 1, is_choice: false }
        ]
      } as any

      // Mock returns empty equipment list for clearing, then success for POSTs
      mockApiFetch.mockResolvedValue({ data: [] })

      await store.saveEquipmentChoices()

      // Should: 1) GET to check existing equipment, 2) POST flavor item, 3) POST regular item
      expect(mockApiFetch).toHaveBeenCalledTimes(3)

      // First call fetches existing equipment for clearing
      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42/equipment')

      // Flavor item saved with custom_name
      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42/equipment', {
        method: 'POST',
        body: { custom_name: 'holy symbol (a gift to you when you entered the priesthood)', quantity: 1 }
      })

      // Regular item saved with item_id
      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42/equipment', {
        method: 'POST',
        body: { item_id: 455, quantity: 1 }
      })
    })
  })

  describe('hasSubraces computed', () => {
    it('returns false when selectedRace is null', () => {
      const store = useCharacterBuilderStore()
      store.selectedRace = null

      expect(store.hasSubraces).toBe(false)
    })

    it('returns false when selectedRace has no subraces', () => {
      const store = useCharacterBuilderStore()
      store.selectedRace = {
        id: 1,
        name: 'Human',
        slug: 'human',
        speed: 30,
        subraces: []
      } as Race

      expect(store.hasSubraces).toBe(false)
    })

    it('returns false when selectedRace has undefined subraces', () => {
      const store = useCharacterBuilderStore()
      store.selectedRace = {
        id: 1,
        name: 'Human',
        slug: 'human',
        speed: 30
      } as Race

      expect(store.hasSubraces).toBe(false)
    })

    it('returns true when selectedRace has subraces', () => {
      const store = useCharacterBuilderStore()
      store.selectedRace = {
        id: 1,
        name: 'Elf',
        slug: 'elf',
        speed: 30,
        subraces: [
          { id: 2, name: 'High Elf', slug: 'high-elf' },
          { id: 3, name: 'Wood Elf', slug: 'wood-elf' }
        ]
      } as Race

      expect(store.hasSubraces).toBe(true)
    })
  })

  describe('clearSubrace action', () => {
    it('clears subraceId', () => {
      const store = useCharacterBuilderStore()
      store.subraceId = 5

      store.clearSubrace()

      expect(store.subraceId).toBeNull()
    })

    it('does not affect raceId', () => {
      const store = useCharacterBuilderStore()
      store.raceId = 1
      store.subraceId = 5

      store.clearSubrace()

      expect(store.raceId).toBe(1)
    })
  })

  describe('selectSubrace action', () => {
    const mockSubrace: Race = {
      id: 2,
      name: 'High Elf',
      slug: 'high-elf',
      speed: 30,
      parent_race: { id: 1, name: 'Elf', slug: 'elf' }
    } as Race

    it('calls API with subrace ID', async () => {
      mockApiFetch.mockResolvedValue({ data: {} })

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await store.selectSubrace(mockSubrace)

      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42', {
        method: 'PATCH',
        body: { race_id: 2 }
      })
    })

    it('updates subraceId in store', async () => {
      mockApiFetch.mockResolvedValue({ data: {} })

      const store = useCharacterBuilderStore()
      store.characterId = 42
      store.raceId = 1

      await store.selectSubrace(mockSubrace)

      expect(store.subraceId).toBe(2)
    })

    it('updates selectedRace to subrace', async () => {
      mockApiFetch.mockResolvedValue({ data: {} })

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await store.selectSubrace(mockSubrace)

      expect(store.selectedRace).toEqual(mockSubrace)
    })

    it('calls refreshStats after selection', async () => {
      mockApiFetch
        .mockResolvedValueOnce({ data: {} }) // PATCH
        .mockResolvedValueOnce({ data: { character_id: 42 } }) // refreshStats

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await store.selectSubrace(mockSubrace)

      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42/stats')
    })

    it('sets loading state during API call', async () => {
      let resolvePromise: (value: unknown) => void
      mockApiFetch.mockReturnValue(new Promise((resolve) => {
        resolvePromise = resolve
      }))

      const store = useCharacterBuilderStore()
      store.characterId = 42

      const promise = store.selectSubrace(mockSubrace)
      expect(store.isLoading).toBe(true)

      resolvePromise!({ data: {} })
      await promise

      expect(store.isLoading).toBe(false)
    })

    it('sets error on API failure', async () => {
      mockApiFetch.mockRejectedValue(new Error('Network error'))

      const store = useCharacterBuilderStore()
      store.characterId = 42

      await expect(store.selectSubrace(mockSubrace)).rejects.toThrow('Network error')
      expect(store.error).toBe('Failed to save subrace')
    })
  })

  describe('totalSteps with subrace', () => {
    it('returns 7 for non-caster without subraces', () => {
      const store = useCharacterBuilderStore()
      store.selectedClass = { spellcasting_ability: null } as any
      store.selectedRace = { id: 1, name: 'Human', subraces: [] } as Race

      expect(store.totalSteps).toBe(7)
    })

    it('returns 8 when race has subraces (non-caster)', () => {
      const store = useCharacterBuilderStore()
      store.selectedClass = { spellcasting_ability: null } as any
      store.selectedRace = {
        id: 1,
        name: 'Elf',
        subraces: [{ id: 2, name: 'High Elf' }]
      } as Race

      expect(store.totalSteps).toBe(8)
    })

    it('returns 9 when race has subraces and is caster', () => {
      const store = useCharacterBuilderStore()
      store.selectedClass = {
        spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' }
      } as any
      store.selectedRace = {
        id: 1,
        name: 'Elf',
        subraces: [{ id: 2, name: 'High Elf' }]
      } as Race

      expect(store.totalSteps).toBe(9)
    })

    it('returns 10 when race has subraces, is caster, and has proficiency choices', () => {
      const store = useCharacterBuilderStore()
      store.selectedClass = {
        spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' }
      } as any
      store.selectedRace = {
        id: 1,
        name: 'Elf',
        subraces: [{ id: 2, name: 'High Elf' }]
      } as Race
      store.proficiencyChoices = {
        data: {
          class: { skill_choice_1: { quantity: 2, remaining: 2, options: [] } },
          race: {},
          background: {}
        }
      }

      expect(store.totalSteps).toBe(10)
    })
  })

  describe('proficiency choices', () => {
    it('fetchProficiencyChoices populates proficiencyChoices state', async () => {
      const store = useCharacterBuilderStore()
      store.characterId = 1

      mockApiFetch.mockResolvedValueOnce({
        data: {
          class: {
            skill_choice_1: {
              quantity: 2,
              remaining: 2,
              options: [
                { type: 'skill', skill_id: 1, skill: { id: 1, name: 'Acrobatics', slug: 'acrobatics' } }
              ]
            }
          },
          race: {},
          background: {}
        }
      })

      await store.fetchProficiencyChoices()

      expect(store.proficiencyChoices).not.toBeNull()
      expect(store.proficiencyChoices?.data.class.skill_choice_1.quantity).toBe(2)
    })

    it('toggleProficiencySelection adds and removes skills', () => {
      const store = useCharacterBuilderStore()

      store.toggleProficiencySelection('class', 'skill_choice_1', 5)
      expect(store.pendingProficiencySelections.get('class:skill_choice_1')?.has(5)).toBe(true)

      store.toggleProficiencySelection('class', 'skill_choice_1', 5)
      expect(store.pendingProficiencySelections.get('class:skill_choice_1')?.has(5)).toBe(false)
    })

    it('hasPendingChoices returns true when choices exist', () => {
      const store = useCharacterBuilderStore()

      store.proficiencyChoices = {
        data: {
          class: { skill_choice_1: { quantity: 2, remaining: 2, options: [] } },
          race: {},
          background: {}
        }
      }

      expect(store.hasPendingChoices).toBe(true)
    })

    it('hasPendingChoices returns false when no choices', () => {
      const store = useCharacterBuilderStore()

      store.proficiencyChoices = {
        data: { class: {}, race: {}, background: {} }
      }

      expect(store.hasPendingChoices).toBe(false)
    })

    it('hasPendingChoices returns true when remaining is 0 (allows editing saved choices)', () => {
      const store = useCharacterBuilderStore()

      // Even when remaining is 0, we show the step so users can edit their choices
      store.proficiencyChoices = {
        data: {
          class: { skill_choice_1: { quantity: 2, remaining: 0, options: [] } },
          race: {},
          background: {}
        }
      }

      expect(store.hasPendingChoices).toBe(true)
    })

    it('allProficiencyChoicesComplete returns true when all choices made', () => {
      const store = useCharacterBuilderStore()

      store.proficiencyChoices = {
        data: {
          class: {
            skill_choice_1: { quantity: 2, remaining: 2, options: [] }
          },
          race: {},
          background: {}
        }
      }

      // No selections yet
      expect(store.allProficiencyChoicesComplete).toBe(false)

      // Add correct number of selections
      store.pendingProficiencySelections.set('class:skill_choice_1', new Set([1, 5]))
      expect(store.allProficiencyChoicesComplete).toBe(true)
    })

    it('allProficiencyChoicesComplete returns true when choices already made (remaining=0, no pending selections)', () => {
      const store = useCharacterBuilderStore()

      // User has already made their proficiency choices in a previous session
      // remaining=0 means all choices were already saved
      store.proficiencyChoices = {
        data: {
          class: {
            skill_choice_1: { quantity: 2, remaining: 0, options: [] }
          },
          race: {},
          background: {}
        }
      }

      // No pending selections (user is just passing through)
      // This should still be complete because remaining=0
      expect(store.allProficiencyChoicesComplete).toBe(true)
    })

    it('allProficiencyChoicesComplete requires full quantity when user starts re-editing (remaining=0 but has pending)', () => {
      const store = useCharacterBuilderStore()

      // User has made choices (remaining=0) but now wants to edit
      store.proficiencyChoices = {
        data: {
          class: {
            skill_choice_1: { quantity: 2, remaining: 0, options: [{ type: 'skill', skill_id: 1, skill: { id: 1, name: 'Acrobatics', slug: 'acrobatics' } }] }
          },
          race: {},
          background: {}
        }
      }

      // User started editing (selected 1 skill) but hasn't selected the full quantity
      store.pendingProficiencySelections.set('class:skill_choice_1', new Set([1]))
      expect(store.allProficiencyChoicesComplete).toBe(false)

      // User selects full quantity
      store.pendingProficiencySelections.set('class:skill_choice_1', new Set([1, 2]))
      expect(store.allProficiencyChoicesComplete).toBe(true)
    })

    it('saveProficiencyChoices calls API for each selection group', async () => {
      const store = useCharacterBuilderStore()
      store.characterId = 1
      store.proficiencyChoices = {
        data: {
          class: { skill_choice_1: { quantity: 2, remaining: 2, options: [] } },
          race: {},
          background: {}
        }
      }
      store.pendingProficiencySelections.set('class:skill_choice_1', new Set([1, 5]))

      mockApiFetch
        .mockResolvedValueOnce({}) // POST proficiency-choices
        .mockResolvedValueOnce({ data: { class: {}, race: {}, background: {} } }) // refresh

      await store.saveProficiencyChoices()

      expect(mockApiFetch).toHaveBeenCalledWith('/characters/1/proficiency-choices', {
        method: 'POST',
        body: {
          source: 'class',
          choice_group: 'skill_choice_1',
          skill_ids: [1, 5]
        }
      })
    })

    it('saveProficiencyChoices sets loading state and handles errors', async () => {
      const store = useCharacterBuilderStore()
      store.characterId = 1
      store.proficiencyChoices = {
        data: {
          class: { skill_choice_1: { quantity: 2, remaining: 2, options: [] } },
          race: {},
          background: {}
        }
      }
      store.pendingProficiencySelections.set('class:skill_choice_1', new Set([1, 5]))

      mockApiFetch.mockRejectedValue(new Error('Network error'))

      await expect(store.saveProficiencyChoices()).rejects.toThrow('Network error')
      expect(store.error).toBe('Failed to save proficiency choices')
      expect(store.isLoading).toBe(false)
    })

    it('saveProficiencyChoices sets loading during API call', async () => {
      const store = useCharacterBuilderStore()
      store.characterId = 1
      store.proficiencyChoices = {
        data: {
          class: { skill_choice_1: { quantity: 2, remaining: 2, options: [] } },
          race: {},
          background: {}
        }
      }
      store.pendingProficiencySelections.set('class:skill_choice_1', new Set([1, 5]))

      let resolvePromise: (value: unknown) => void
      mockApiFetch.mockReturnValue(new Promise((resolve) => {
        resolvePromise = resolve
      }))

      const promise = store.saveProficiencyChoices()
      expect(store.isLoading).toBe(true)

      resolvePromise!({})
      await promise.catch(() => {}) // May fail due to incomplete mocking

      expect(store.isLoading).toBe(false)
    })

    it('totalSteps includes proficiency step when choices exist', () => {
      const store = useCharacterBuilderStore()

      // Non-caster without proficiency choices: 7 steps
      store.selectedClass = { spellcasting_ability: null } as any
      store.proficiencyChoices = { data: { class: {}, race: {}, background: {} } }
      expect(store.totalSteps).toBe(7)

      // Non-caster with proficiency choices: 8 steps
      store.proficiencyChoices = {
        data: {
          class: { skill_choice_1: { quantity: 2, remaining: 2, options: [] } },
          race: {},
          background: {}
        }
      }
      expect(store.totalSteps).toBe(8)

      // Caster (with spells at level 1) with proficiency choices: 9 steps
      // Note: isCaster now requires level_progression to have cantrips/spells at level 1
      store.selectedClass = {
        spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' },
        level_progression: [{ level: 1, cantrips_known: 3, spells_known: 2 }]
      } as any
      expect(store.totalSteps).toBe(9)
    })
  })
})
