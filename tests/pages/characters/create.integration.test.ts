// tests/pages/characters/create.integration.test.ts
// Integration tests for the character creation wizard flow
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

describe('Character Builder Store Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('wizard navigation', () => {
    it('starts at step 1', () => {
      const store = useCharacterBuilderStore()
      expect(store.currentStep).toBe(1)
    })

    it('can navigate forward', () => {
      const store = useCharacterBuilderStore()
      store.nextStep()
      expect(store.currentStep).toBe(2)
    })

    it('can navigate backward', () => {
      const store = useCharacterBuilderStore()
      store.currentStep = 3
      store.previousStep()
      expect(store.currentStep).toBe(2)
    })

    it('cannot go below step 1', () => {
      const store = useCharacterBuilderStore()
      store.previousStep()
      expect(store.currentStep).toBe(1)
    })

    it('can jump to specific step', () => {
      const store = useCharacterBuilderStore()
      store.goToStep(5)
      expect(store.currentStep).toBe(5)
    })
  })

  describe('total steps calculation', () => {
    it('defaults to 7 steps for non-caster', () => {
      const store = useCharacterBuilderStore()
      // No class selected = non-caster
      expect(store.totalSteps).toBe(7)
    })

    it('has 8 steps for caster classes', () => {
      const store = useCharacterBuilderStore()
      store.selectedClass = {
        id: 1,
        name: 'Wizard',
        slug: 'wizard',
        spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' }
      } as any

      expect(store.totalSteps).toBe(8)
    })

    it('has 7 steps for non-caster classes', () => {
      const store = useCharacterBuilderStore()
      store.selectedClass = {
        id: 2,
        name: 'Fighter',
        slug: 'fighter',
        spellcasting_ability: null
      } as any

      expect(store.totalSteps).toBe(7)
    })
  })

  describe('equipment choices', () => {
    it('tracks equipment choices by group', () => {
      const store = useCharacterBuilderStore()

      store.setEquipmentChoice('choice_1', 10)
      store.setEquipmentChoice('choice_2', 20)

      expect(store.equipmentChoices.get('choice_1')).toBe(10)
      expect(store.equipmentChoices.get('choice_2')).toBe(20)
    })

    it('can replace equipment choice', () => {
      const store = useCharacterBuilderStore()

      store.setEquipmentChoice('choice_1', 10)
      store.setEquipmentChoice('choice_1', 15) // Change selection

      expect(store.equipmentChoices.get('choice_1')).toBe(15)
    })

    it('validates all equipment choices made', () => {
      const store = useCharacterBuilderStore()

      // Set up class with equipment choices
      store.selectedClass = {
        id: 1,
        name: 'Fighter',
        slug: 'fighter',
        equipment: [
          { id: 10, is_choice: true, choice_group: 'choice_1' },
          { id: 11, is_choice: true, choice_group: 'choice_1' },
          { id: 20, is_choice: true, choice_group: 'choice_2' },
          { id: 21, is_choice: true, choice_group: 'choice_2' }
        ]
      } as any

      // Initially no choices made
      expect(store.allEquipmentChoicesMade).toBe(false)

      // Make one choice
      store.setEquipmentChoice('choice_1', 10)
      expect(store.allEquipmentChoicesMade).toBe(false)

      // Make second choice
      store.setEquipmentChoice('choice_2', 20)
      expect(store.allEquipmentChoicesMade).toBe(true)
    })
  })

  describe('computed equipment lists', () => {
    it('separates fixed and choice equipment', () => {
      const store = useCharacterBuilderStore()

      store.selectedClass = {
        id: 1,
        equipment: [
          { id: 1, item: { name: 'Shield' }, is_choice: false },
          { id: 10, item: { name: 'Longsword' }, is_choice: true, choice_group: 'weapon' },
          { id: 11, item: { name: 'Battleaxe' }, is_choice: true, choice_group: 'weapon' }
        ]
      } as any

      expect(store.fixedEquipment).toHaveLength(1)
      expect(store.fixedEquipment[0].item?.name).toBe('Shield')

      expect(store.equipmentByChoiceGroup.size).toBe(1)
      expect(store.equipmentByChoiceGroup.get('weapon')).toHaveLength(2)
    })

    it('combines class and background equipment', () => {
      const store = useCharacterBuilderStore()

      store.selectedClass = {
        id: 1,
        equipment: [{ id: 1, item: { name: 'Sword' }, is_choice: false }]
      } as any

      store.selectedBackground = {
        id: 2,
        equipment: [{ id: 2, item: { name: 'Traveler Clothes' }, is_choice: false }]
      } as any

      expect(store.allEquipment).toHaveLength(2)
      expect(store.fixedEquipment).toHaveLength(2)
    })
  })

  describe('spell tracking', () => {
    it('separates cantrips from leveled spells', () => {
      const store = useCharacterBuilderStore()

      store.selectedSpells = [
        { id: 1, spell_id: 101, spell: { id: 101, name: 'Fire Bolt', level: 0 } },
        { id: 2, spell_id: 102, spell: { id: 102, name: 'Light', level: 0 } },
        { id: 3, spell_id: 103, spell: { id: 103, name: 'Magic Missile', level: 1 } },
        { id: 4, spell_id: 104, spell: { id: 104, name: 'Shield', level: 1 } }
      ] as any[]

      expect(store.selectedCantrips).toHaveLength(2)
      expect(store.selectedLeveledSpells).toHaveLength(2)
    })

    it('tracks race spell choices', () => {
      const store = useCharacterBuilderStore()

      store.setRaceSpellChoice('high_elf_cantrip', 50)

      expect(store.raceSpellChoices.get('high_elf_cantrip')).toBe(50)
    })
  })

  describe('reset functionality', () => {
    it('resets all state to defaults', () => {
      const store = useCharacterBuilderStore()

      // Set up various state
      store.characterId = 123
      store.name = 'Test Character'
      store.currentStep = 5
      store.selectedClass = { id: 1 } as any
      store.selectedRace = { id: 2 } as any
      store.selectedBackground = { id: 3 } as any
      store.equipmentChoices.set('choice_1', 10)
      store.selectedSpells = [{ id: 1 }] as any[]
      store.abilityScores = {
        strength: 18,
        dexterity: 14,
        constitution: 16,
        intelligence: 10,
        wisdom: 12,
        charisma: 8
      }

      // Reset
      store.reset()

      // Verify all reset
      expect(store.characterId).toBeNull()
      expect(store.name).toBe('')
      expect(store.currentStep).toBe(1)
      expect(store.selectedClass).toBeNull()
      expect(store.selectedRace).toBeNull()
      expect(store.selectedBackground).toBeNull()
      expect(store.equipmentChoices.size).toBe(0)
      expect(store.selectedSpells).toHaveLength(0)
      expect(store.abilityScores.strength).toBe(10)
    })
  })

  describe('caster detection', () => {
    it('identifies caster class by spellcasting ability', () => {
      const store = useCharacterBuilderStore()

      store.selectedClass = {
        id: 1,
        spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' }
      } as any

      expect(store.isCaster).toBe(true)
    })

    it('identifies non-caster class by null spellcasting ability', () => {
      const store = useCharacterBuilderStore()

      store.selectedClass = {
        id: 2,
        spellcasting_ability: null
      } as any

      expect(store.isCaster).toBe(false)
    })

    it('identifies non-caster when no class selected', () => {
      const store = useCharacterBuilderStore()
      expect(store.isCaster).toBe(false)
    })
  })

  describe('ability score management', () => {
    it('stores ability scores with default values', () => {
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

    it('tracks ability score method', () => {
      const store = useCharacterBuilderStore()

      expect(store.abilityScoreMethod).toBe('manual')

      store.abilityScoreMethod = 'point_buy'
      expect(store.abilityScoreMethod).toBe('point_buy')
    })

    it('computes racial bonuses from modifiers', () => {
      const store = useCharacterBuilderStore()

      store.selectedRace = {
        id: 1,
        modifiers: [
          { id: 1, modifier_category: 'ability_score', value: '2' },
          { id: 2, modifier_category: 'speed', value: '30' } // Non-ability modifier
        ]
      } as any

      expect(store.racialBonuses).toHaveLength(1)
      expect(store.racialBonuses[0].modifier_category).toBe('ability_score')
    })
  })

  describe('step boundary checks', () => {
    it('isFirstStep is true on step 1', () => {
      const store = useCharacterBuilderStore()
      expect(store.isFirstStep).toBe(true)
    })

    it('isFirstStep is false on other steps', () => {
      const store = useCharacterBuilderStore()
      store.currentStep = 3
      expect(store.isFirstStep).toBe(false)
    })

    it('isLastStep checks against totalSteps', () => {
      const store = useCharacterBuilderStore()

      // Non-caster: 7 steps
      store.currentStep = 7
      expect(store.isLastStep).toBe(true)

      store.currentStep = 6
      expect(store.isLastStep).toBe(false)
    })

    it('isLastStep adjusts for casters', () => {
      const store = useCharacterBuilderStore()

      store.selectedClass = {
        id: 1,
        spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' }
      } as any

      // Caster: 8 steps
      store.currentStep = 7
      expect(store.isLastStep).toBe(false)

      store.currentStep = 8
      expect(store.isLastStep).toBe(true)
    })
  })
})
