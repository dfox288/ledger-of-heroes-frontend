// tests/stores/characterWizard.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import type { Race, CharacterClass } from '~/types'

// Mock race data
const mockElf: Race = {
  id: 1,
  name: 'Elf',
  slug: 'elf',
  description: 'Elves are a magical people',
  speed: 30,
  size: { id: 1, name: 'Medium', slug: 'medium' },
  subrace_required: true,
  subraces: [
    { id: 2, name: 'High Elf', slug: 'high-elf' },
    { id: 3, name: 'Wood Elf', slug: 'wood-elf' },
  ],
  modifiers: [],
  traits: [],
  languages: [],
  sources: [{ code: 'PHB', name: "Player's Handbook" }],
} as Race

const mockHuman: Race = {
  id: 4,
  name: 'Human',
  slug: 'human',
  description: 'Humans are versatile',
  speed: 30,
  size: { id: 1, name: 'Medium', slug: 'medium' },
  subrace_required: false,
  subraces: [
    { id: 5, name: 'Variant Human', slug: 'variant-human' },
  ],
  modifiers: [],
  traits: [],
  languages: [],
  sources: [{ code: 'PHB', name: "Player's Handbook" }],
} as Race

const mockHalfOrc: Race = {
  id: 6,
  name: 'Half-Orc',
  slug: 'half-orc',
  description: 'Half-Orcs are strong',
  speed: 30,
  size: { id: 1, name: 'Medium', slug: 'medium' },
  subrace_required: false,
  subraces: [],
  modifiers: [],
  traits: [],
  languages: [],
  sources: [{ code: 'PHB', name: "Player's Handbook" }],
} as Race

// Mock class data
const mockCleric: CharacterClass = {
  id: 1,
  name: 'Cleric',
  slug: 'cleric',
  hit_die: 8,
  subclass_level: 1,
  spellcasting_ability: { id: 5, code: 'WIS', name: 'Wisdom' },
  level_progression: [
    { level: 1, cantrips_known: 3, spells_known: null },
  ],
  subclasses: [],
  equipment: [],
  sources: [],
} as unknown as CharacterClass

const mockFighter: CharacterClass = {
  id: 2,
  name: 'Fighter',
  slug: 'fighter',
  hit_die: 10,
  subclass_level: 3,
  spellcasting_ability: null,
  level_progression: [],
  subclasses: [],
  equipment: [],
  sources: [],
} as unknown as CharacterClass

const mockWizard: CharacterClass = {
  id: 3,
  name: 'Wizard',
  slug: 'wizard',
  hit_die: 6,
  subclass_level: 2,
  spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' },
  level_progression: [
    { level: 1, cantrips_known: 3, spells_known: 6 },
  ],
  subclasses: [],
  equipment: [],
  sources: [],
} as unknown as CharacterClass

describe('characterWizard store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('has null characterId initially', () => {
      const store = useCharacterWizardStore()
      expect(store.characterId).toBeNull()
    })

    it('has empty selections initially', () => {
      const store = useCharacterWizardStore()
      expect(store.selections.race).toBeNull()
      expect(store.selections.class).toBeNull()
      expect(store.selections.background).toBeNull()
      expect(store.selections.name).toBe('')
    })

    it('has default ability scores of 10', () => {
      const store = useCharacterWizardStore()
      expect(store.selections.abilityScores.strength).toBe(10)
      expect(store.selections.abilityScores.dexterity).toBe(10)
      expect(store.selections.abilityScores.constitution).toBe(10)
      expect(store.selections.abilityScores.intelligence).toBe(10)
      expect(store.selections.abilityScores.wisdom).toBe(10)
      expect(store.selections.abilityScores.charisma).toBe(10)
    })

    it('has empty pending choices initially', () => {
      const store = useCharacterWizardStore()
      expect(store.pendingChoices.proficiencies.size).toBe(0)
      expect(store.pendingChoices.languages.size).toBe(0)
      expect(store.pendingChoices.equipment.size).toBe(0)
      expect(store.pendingChoices.spells.size).toBe(0)
    })
  })

  describe('needsSubraceStep computed', () => {
    it('returns false when no race selected', () => {
      const store = useCharacterWizardStore()
      expect(store.needsSubraceStep).toBe(false)
    })

    it('returns true when race has subraces (required)', () => {
      const store = useCharacterWizardStore()
      store.selections.race = mockElf
      expect(store.needsSubraceStep).toBe(true)
    })

    it('returns true when race has optional subraces', () => {
      const store = useCharacterWizardStore()
      store.selections.race = mockHuman
      expect(store.needsSubraceStep).toBe(true)
    })

    it('returns false when race has no subraces', () => {
      const store = useCharacterWizardStore()
      store.selections.race = mockHalfOrc
      expect(store.needsSubraceStep).toBe(false)
    })
  })

  describe('isSubraceRequired computed', () => {
    it('returns false when no race selected', () => {
      const store = useCharacterWizardStore()
      expect(store.isSubraceRequired).toBe(false)
    })

    it('returns true when subrace_required is true', () => {
      const store = useCharacterWizardStore()
      store.selections.race = mockElf
      expect(store.isSubraceRequired).toBe(true)
    })

    it('returns false when subrace_required is false', () => {
      const store = useCharacterWizardStore()
      store.selections.race = mockHuman
      expect(store.isSubraceRequired).toBe(false)
    })
  })

  describe('needsSubclassStep computed', () => {
    it('returns false when no class selected', () => {
      const store = useCharacterWizardStore()
      expect(store.needsSubclassStep).toBe(false)
    })

    it('returns true for Cleric (subclass_level 1)', () => {
      const store = useCharacterWizardStore()
      store.selections.class = mockCleric
      expect(store.needsSubclassStep).toBe(true)
    })

    it('returns false for Fighter (subclass_level 3)', () => {
      const store = useCharacterWizardStore()
      store.selections.class = mockFighter
      expect(store.needsSubclassStep).toBe(false)
    })

    it('returns false for Wizard (subclass_level 2)', () => {
      const store = useCharacterWizardStore()
      store.selections.class = mockWizard
      expect(store.needsSubclassStep).toBe(false)
    })
  })

  describe('isSpellcaster computed', () => {
    it('returns false when no class selected', () => {
      const store = useCharacterWizardStore()
      expect(store.isSpellcaster).toBe(false)
    })

    it('returns false for Fighter (no spellcasting)', () => {
      const store = useCharacterWizardStore()
      store.selections.class = mockFighter
      expect(store.isSpellcaster).toBe(false)
    })

    it('returns true for Cleric (cantrips at level 1)', () => {
      const store = useCharacterWizardStore()
      store.selections.class = mockCleric
      expect(store.isSpellcaster).toBe(true)
    })

    it('returns true for Wizard (cantrips and spells at level 1)', () => {
      const store = useCharacterWizardStore()
      store.selections.class = mockWizard
      expect(store.isSpellcaster).toBe(true)
    })
  })

  describe('sourceFilterString computed', () => {
    it('returns empty string when no sources selected', () => {
      const store = useCharacterWizardStore()
      expect(store.sourceFilterString).toBe('')
    })

    it('returns filter string for single source', () => {
      const store = useCharacterWizardStore()
      store.setSelectedSources(['PHB'])
      expect(store.sourceFilterString).toBe('source_codes IN ["PHB"]')
    })

    it('returns filter string for multiple sources', () => {
      const store = useCharacterWizardStore()
      store.setSelectedSources(['PHB', 'XGE', 'TCE'])
      expect(store.sourceFilterString).toBe('source_codes IN ["PHB", "XGE", "TCE"]')
    })
  })

  describe('pending choices actions', () => {
    it('toggleProficiencyChoice adds and removes selections', () => {
      const store = useCharacterWizardStore()

      // Add first selection
      store.toggleProficiencyChoice('class:skill_choice', 1)
      expect(store.pendingChoices.proficiencies.get('class:skill_choice')?.has(1)).toBe(true)

      // Add second selection
      store.toggleProficiencyChoice('class:skill_choice', 2)
      expect(store.pendingChoices.proficiencies.get('class:skill_choice')?.has(2)).toBe(true)
      expect(store.pendingChoices.proficiencies.get('class:skill_choice')?.size).toBe(2)

      // Remove first selection
      store.toggleProficiencyChoice('class:skill_choice', 1)
      expect(store.pendingChoices.proficiencies.get('class:skill_choice')?.has(1)).toBe(false)
      expect(store.pendingChoices.proficiencies.get('class:skill_choice')?.size).toBe(1)
    })

    it('toggleSpellChoice adds and removes spells', () => {
      const store = useCharacterWizardStore()

      store.toggleSpellChoice(101)
      expect(store.pendingChoices.spells.has(101)).toBe(true)

      store.toggleSpellChoice(102)
      expect(store.pendingChoices.spells.size).toBe(2)

      store.toggleSpellChoice(101)
      expect(store.pendingChoices.spells.has(101)).toBe(false)
      expect(store.pendingChoices.spells.size).toBe(1)
    })

    it('setEquipmentChoice sets equipment selection', () => {
      const store = useCharacterWizardStore()

      store.setEquipmentChoice('weapon_choice', 5)
      expect(store.pendingChoices.equipment.get('weapon_choice')).toBe(5)

      // Overwrite selection
      store.setEquipmentChoice('weapon_choice', 6)
      expect(store.pendingChoices.equipment.get('weapon_choice')).toBe(6)
    })
  })

  describe('reset action', () => {
    it('resets all state to defaults', () => {
      const store = useCharacterWizardStore()

      // Set various state
      store.characterId = 42
      store.selectedSources = ['PHB', 'XGE']
      store.selections.race = mockElf
      store.selections.class = mockCleric
      store.selections.name = 'Test Character'
      store.toggleSpellChoice(101)
      store.isLoading = true
      store.error = 'Some error'

      // Reset
      store.reset()

      // Verify all reset
      expect(store.characterId).toBeNull()
      expect(store.selectedSources).toEqual([])
      expect(store.selections.race).toBeNull()
      expect(store.selections.class).toBeNull()
      expect(store.selections.name).toBe('')
      expect(store.pendingChoices.spells.size).toBe(0)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('effectiveRace computed', () => {
    it('returns null when no race selected', () => {
      const store = useCharacterWizardStore()
      expect(store.effectiveRace).toBeNull()
    })

    it('returns base race when no subrace selected', () => {
      const store = useCharacterWizardStore()
      store.selections.race = mockElf
      expect(store.effectiveRace?.id).toBe(mockElf.id)
      expect(store.effectiveRace?.name).toBe(mockElf.name)
    })

    it('returns subrace when selected', () => {
      const store = useCharacterWizardStore()
      const highElf = { ...mockElf, id: 2, name: 'High Elf', slug: 'high-elf' }
      store.selections.race = mockElf
      store.selections.subrace = highElf
      expect(store.effectiveRace?.id).toBe(highElf.id)
      expect(store.effectiveRace?.name).toBe(highElf.name)
    })
  })
})
