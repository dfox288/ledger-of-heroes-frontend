// tests/stores/characterWizard.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { Race, CharacterClass, Background } from '~/types'

// =============================================================================
// API MOCK SETUP
// =============================================================================
// Mock composables at module level for store action tests
// Uses vi.hoisted to ensure mocks are defined before vi.mock() calls

const { mockApiFetch, mockGenerateSlug } = vi.hoisted(() => ({
  mockApiFetch: vi.fn(),
  mockGenerateSlug: vi.fn(() => 'shadow-warden-q3x9')
}))

// Mock the composables module used by the store
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({ apiFetch: mockApiFetch })
}))

vi.mock('~/composables/useCharacterSlug', () => ({
  useCharacterSlug: () => ({ generateSlug: mockGenerateSlug })
}))

// Import store AFTER mocks are set up (intentional - mocks must be hoisted first)
// eslint-disable-next-line import/first
import { useCharacterWizardStore } from '~/stores/characterWizard'

// Mock race data - includes full_slug for slug-based references (#318)
const mockElf: Race = {
  id: 1,
  name: 'Elf',
  slug: 'elf',
  full_slug: 'phb:elf',
  description: 'Elves are a magical people',
  speed: 30,
  size: { id: 1, name: 'Medium', slug: 'medium' },
  subrace_required: true,
  subraces: [
    { id: 2, name: 'High Elf', slug: 'high-elf', full_slug: 'phb:high-elf' },
    { id: 3, name: 'Wood Elf', slug: 'wood-elf', full_slug: 'phb:wood-elf' }
  ],
  modifiers: [],
  traits: [],
  languages: [],
  sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
} as Race

const mockHuman: Race = {
  id: 4,
  name: 'Human',
  slug: 'human',
  full_slug: 'phb:human',
  description: 'Humans are versatile',
  speed: 30,
  size: { id: 1, name: 'Medium', slug: 'medium' },
  subrace_required: false,
  subraces: [
    { id: 5, name: 'Variant Human', slug: 'variant-human', full_slug: 'phb:variant-human' }
  ],
  modifiers: [],
  traits: [],
  languages: [],
  sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
} as Race

const mockHalfOrc: Race = {
  id: 6,
  name: 'Half-Orc',
  slug: 'half-orc',
  full_slug: 'phb:half-orc',
  description: 'Half-Orcs are strong',
  speed: 30,
  size: { id: 1, name: 'Medium', slug: 'medium' },
  subrace_required: false,
  subraces: [],
  modifiers: [],
  traits: [],
  languages: [],
  sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
} as Race

// Mock class data - includes full_slug for slug-based references (#318)
const mockCleric: CharacterClass = {
  id: 1,
  name: 'Cleric',
  slug: 'cleric',
  full_slug: 'phb:cleric',
  hit_die: 8,
  subclass_level: 1,
  spellcasting_ability: { id: 5, code: 'WIS', name: 'Wisdom' },
  level_progression: [
    { level: 1, cantrips_known: 3, spells_known: null }
  ],
  subclasses: [],
  equipment: [],
  sources: []
} as unknown as CharacterClass

const mockFighter: CharacterClass = {
  id: 2,
  name: 'Fighter',
  slug: 'fighter',
  full_slug: 'phb:fighter',
  hit_die: 10,
  subclass_level: 3,
  spellcasting_ability: null,
  level_progression: [],
  subclasses: [],
  equipment: [],
  sources: []
} as unknown as CharacterClass

const mockWizard: CharacterClass = {
  id: 3,
  name: 'Wizard',
  slug: 'wizard',
  full_slug: 'phb:wizard',
  hit_die: 6,
  subclass_level: 2,
  spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' },
  level_progression: [
    { level: 1, cantrips_known: 3, spells_known: 6 }
  ],
  subclasses: [],
  equipment: [],
  sources: []
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

    // Note: pendingChoices removed - choices are now managed by useUnifiedChoices composable
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

  // Note: pending choices actions removed - choices are now managed by useUnifiedChoices composable
  // Removed tests for: toggleProficiencyChoice, toggleSpellChoice, setEquipmentChoice

  describe('reset action', () => {
    it('resets all state to defaults', () => {
      const store = useCharacterWizardStore()

      // Set various state
      store.characterId = 42
      store.selectedSources = ['PHB', 'XGE']
      store.selections.race = mockElf
      store.selections.class = mockCleric
      store.selections.name = 'Test Character'
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
      // Note: pendingChoices removed - now managed by useUnifiedChoices composable
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
      const highElf = { ...mockElf, id: 2, name: 'High Elf', slug: 'high-elf', full_slug: 'phb:high-elf' }
      store.selections.race = mockElf
      store.selections.subrace = highElf
      expect(store.effectiveRace?.id).toBe(highElf.id)
      expect(store.effectiveRace?.name).toBe(highElf.name)
    })
  })

  // =============================================================================
  // ACTION TESTS (require API mocking)
  // =============================================================================

  describe('selectRace action', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('creates new character when characterId is null', async () => {
      const store = useCharacterWizardStore()

      // Mock API responses
      mockApiFetch
        .mockResolvedValueOnce({ data: { id: 123, public_id: 'shadow-warden-q3x9' } }) // POST /characters
        .mockResolvedValueOnce({ data: mockElf }) // GET /races/{slug}
        .mockResolvedValueOnce({ data: {} }) // GET /characters/{id}/stats
        .mockResolvedValueOnce({ data: {} }) // GET /characters/{id}/summary

      await store.selectRace(mockElf)

      expect(store.characterId).toBe(123)
      expect(store.publicId).toBe('shadow-warden-q3x9')
      expect(store.selections.race?.id).toBe(mockElf.id)
      expect(store.selections.subrace).toBeNull()
    })

    it('updates existing character when characterId exists', async () => {
      const store = useCharacterWizardStore()
      store.characterId = 456

      mockApiFetch
        .mockResolvedValueOnce({}) // PATCH /characters/{id}
        .mockResolvedValueOnce({ data: mockHuman }) // GET /races/{slug}
        .mockResolvedValueOnce({ data: {} }) // GET /characters/{id}/stats
        .mockResolvedValueOnce({ data: {} }) // GET /characters/{id}/summary

      await store.selectRace(mockHuman)

      expect(store.characterId).toBe(456) // Unchanged
      expect(store.selections.race?.id).toBe(mockHuman.id)
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/456',
        expect.objectContaining({ method: 'PATCH', body: { race_slug: mockHuman.full_slug } })
      )
    })

    it('sets loading state during request', async () => {
      const store = useCharacterWizardStore()
      store.characterId = 1

      let loadingDuringFetch = false
      mockApiFetch.mockImplementation(async () => {
        loadingDuringFetch = store.isLoading
        return { data: mockElf }
      })

      const promise = store.selectRace(mockElf)
      expect(store.isLoading).toBe(true)

      await promise

      expect(loadingDuringFetch).toBe(true)
      expect(store.isLoading).toBe(false)
    })

    it('sets error state on failure', async () => {
      const store = useCharacterWizardStore()
      store.characterId = 1

      mockApiFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(store.selectRace(mockElf)).rejects.toThrow('Network error')

      expect(store.error).toBe('Network error')
      expect(store.isLoading).toBe(false)
    })

    it('clears subrace when race changes', async () => {
      const store = useCharacterWizardStore()
      store.characterId = 1
      store.selections.subrace = { ...mockElf, id: 2, name: 'High Elf' } as Race

      mockApiFetch
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ data: mockHuman })
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: {} })

      await store.selectRace(mockHuman)

      expect(store.selections.subrace).toBeNull()
    })

    it('generates default name from race when name is empty', async () => {
      const store = useCharacterWizardStore()

      mockApiFetch
        .mockResolvedValueOnce({ data: { id: 1, public_id: 'test-123' } })
        .mockResolvedValueOnce({ data: mockElf })
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: {} })

      await store.selectRace(mockElf)

      expect(store.selections.name).toBe('New Elf')
    })
  })

  describe('selectSubrace action', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('does nothing when characterId is null', async () => {
      const store = useCharacterWizardStore()

      await store.selectSubrace(mockElf)

      expect(mockApiFetch).not.toHaveBeenCalled()
    })

    it('updates character with subrace', async () => {
      const store = useCharacterWizardStore()
      store.characterId = 1
      store.selections.race = mockElf
      const highElf = { ...mockElf, id: 2, name: 'High Elf', slug: 'high-elf', full_slug: 'phb:high-elf' } as Race

      mockApiFetch
        .mockResolvedValueOnce({}) // PATCH
        .mockResolvedValueOnce({ data: {} }) // stats
        .mockResolvedValueOnce({ data: {} }) // summary

      await store.selectSubrace(highElf)

      expect(store.selections.subrace?.id).toBe(2)
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/1',
        expect.objectContaining({ method: 'PATCH', body: { race_slug: 'phb:high-elf' } })
      )
    })

    it('handles null subrace (optional subraces)', async () => {
      const store = useCharacterWizardStore()
      store.characterId = 1
      store.selections.race = mockHuman

      mockApiFetch
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: {} })

      await store.selectSubrace(null)

      expect(store.selections.subrace).toBeNull()
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/1',
        expect.objectContaining({ body: { race_slug: mockHuman.full_slug } })
      )
    })
  })

  describe('selectClass action', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('does nothing when characterId is null', async () => {
      const store = useCharacterWizardStore()

      await store.selectClass(mockCleric)

      expect(mockApiFetch).not.toHaveBeenCalled()
    })

    it('posts new class when no class selected', async () => {
      const store = useCharacterWizardStore()
      store.characterId = 1

      mockApiFetch
        .mockResolvedValueOnce({}) // POST classes
        .mockResolvedValueOnce({ data: mockCleric }) // GET class detail
        .mockResolvedValueOnce({ data: {} }) // stats
        .mockResolvedValueOnce({ data: {} }) // summary

      await store.selectClass(mockCleric)

      expect(store.selections.class?.id).toBe(mockCleric.id)
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/1/classes',
        expect.objectContaining({ method: 'POST', body: { class_slug: mockCleric.full_slug } })
      )
    })

    it('puts replacement class when class already selected', async () => {
      const store = useCharacterWizardStore()
      store.characterId = 1
      store.selections.class = mockFighter

      mockApiFetch
        .mockResolvedValueOnce({}) // PUT
        .mockResolvedValueOnce({ data: mockCleric }) // GET
        .mockResolvedValueOnce({ data: {} }) // stats
        .mockResolvedValueOnce({ data: {} }) // summary

      await store.selectClass(mockCleric)

      expect(store.selections.class?.id).toBe(mockCleric.id)
      expect(mockApiFetch).toHaveBeenCalledWith(
        `/characters/1/classes/${mockFighter.id}`,
        expect.objectContaining({ method: 'PUT', body: { class_slug: mockCleric.full_slug } })
      )
    })

    it('skips API call when selecting same class', async () => {
      const store = useCharacterWizardStore()
      store.characterId = 1
      store.selections.class = mockCleric

      await store.selectClass(mockCleric)

      expect(mockApiFetch).not.toHaveBeenCalled()
    })

    it('clears subclass when class changes', async () => {
      const store = useCharacterWizardStore()
      store.characterId = 1
      store.selections.class = mockFighter
      store.selections.subclass = { id: 99, name: 'Champion', slug: 'champion', full_slug: 'phb:champion' }

      mockApiFetch
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ data: mockCleric })
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: {} })

      await store.selectClass(mockCleric)

      expect(store.selections.subclass).toBeNull()
    })
  })

  describe('selectBackground action', () => {
    const mockBackground: Background = {
      id: 1,
      name: 'Soldier',
      slug: 'soldier',
      full_slug: 'phb:soldier',
      feature_name: 'Military Rank'
    } as Background

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('does nothing when characterId is null', async () => {
      const store = useCharacterWizardStore()

      await store.selectBackground(mockBackground)

      expect(mockApiFetch).not.toHaveBeenCalled()
    })

    it('patches character with background', async () => {
      const store = useCharacterWizardStore()
      store.characterId = 1

      mockApiFetch
        .mockResolvedValueOnce({}) // PATCH
        .mockResolvedValueOnce({ data: mockBackground }) // GET detail
        .mockResolvedValueOnce({ data: {} }) // stats
        .mockResolvedValueOnce({ data: {} }) // summary

      await store.selectBackground(mockBackground)

      expect(store.selections.background?.id).toBe(mockBackground.id)
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/1',
        expect.objectContaining({ method: 'PATCH', body: { background_slug: mockBackground.full_slug } })
      )
    })
  })

  describe('syncWithBackend action', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('does nothing when characterId is null', async () => {
      const store = useCharacterWizardStore()

      await store.syncWithBackend()

      expect(mockApiFetch).not.toHaveBeenCalled()
    })

    it('fetches stats and summary in parallel', async () => {
      const store = useCharacterWizardStore()
      store.characterId = 42

      const mockStats = { hp: 12, ac: 15 }
      const mockSummary = { creation_complete: false, pending_choices: {} }

      mockApiFetch
        .mockResolvedValueOnce({ data: mockStats })
        .mockResolvedValueOnce({ data: mockSummary })

      await store.syncWithBackend()

      expect(mockApiFetch).toHaveBeenCalledTimes(2)
      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42/stats')
      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42/summary')
      expect(store.stats).toEqual(mockStats)
      expect(store.summary).toEqual(mockSummary)
    })

    it('handles errors gracefully without throwing', async () => {
      const store = useCharacterWizardStore()
      store.characterId = 42

      mockApiFetch.mockRejectedValue(new Error('Server error'))

      // Should not throw
      await store.syncWithBackend()

      // Stats and summary remain unchanged
      expect(store.stats).toBeNull()
    })
  })

  describe('saveAbilityScores action', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('does nothing when characterId is null', async () => {
      const store = useCharacterWizardStore()
      const scores = {
        strength: 15, dexterity: 14, constitution: 13,
        intelligence: 12, wisdom: 10, charisma: 8
      }

      await store.saveAbilityScores('standard_array', scores)

      expect(mockApiFetch).not.toHaveBeenCalled()
    })

    it('patches character with ability scores', async () => {
      const store = useCharacterWizardStore()
      store.characterId = 1
      const scores = {
        strength: 15, dexterity: 14, constitution: 13,
        intelligence: 12, wisdom: 10, charisma: 8
      }

      mockApiFetch
        .mockResolvedValueOnce({}) // PATCH
        .mockResolvedValueOnce({ data: {} }) // stats
        .mockResolvedValueOnce({ data: {} }) // summary

      await store.saveAbilityScores('standard_array', scores)

      expect(store.selections.abilityScores).toEqual(scores)
      expect(store.selections.abilityMethod).toBe('standard_array')
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/1',
        expect.objectContaining({
          method: 'PATCH',
          body: {
            ability_score_method: 'standard_array',
            strength: 15,
            dexterity: 14,
            constitution: 13,
            intelligence: 12,
            wisdom: 10,
            charisma: 8
          }
        })
      )
    })
  })

  describe('saveDetails action', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('does nothing when characterId is null', async () => {
      const store = useCharacterWizardStore()

      await store.saveDetails('My Character', 'Lawful Good')

      expect(mockApiFetch).not.toHaveBeenCalled()
    })

    it('patches character with name and alignment', async () => {
      const store = useCharacterWizardStore()
      store.characterId = 1

      mockApiFetch
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: {} })

      await store.saveDetails('Aragorn', 'Lawful Good')

      expect(store.selections.name).toBe('Aragorn')
      expect(store.selections.alignment).toBe('Lawful Good')
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/1',
        expect.objectContaining({
          method: 'PATCH',
          body: { name: 'Aragorn', alignment: 'Lawful Good' }
        })
      )
    })
  })

  describe('loadCharacter action', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('skips loading when already loaded', async () => {
      const store = useCharacterWizardStore()
      store.characterId = 1
      store.publicId = 'shadow-warden-q3x9'

      await store.loadCharacter('shadow-warden-q3x9')

      expect(mockApiFetch).not.toHaveBeenCalled()
    })

    it('fetches character by publicId', async () => {
      const store = useCharacterWizardStore()

      mockApiFetch
        .mockResolvedValueOnce({
          data: {
            id: 42,
            public_id: 'noble-mage-xyz',
            name: 'Gandalf',
            race: mockElf
          }
        })
        .mockResolvedValueOnce({ data: {} }) // stats
        .mockResolvedValueOnce({ data: {} }) // summary

      await store.loadCharacter('noble-mage-xyz')

      expect(store.characterId).toBe(42)
      expect(store.publicId).toBe('noble-mage-xyz')
      expect(store.selections.name).toBe('Gandalf')
      expect(store.selections.race?.id).toBe(mockElf.id)
    })

    it('sets error on failure', async () => {
      const store = useCharacterWizardStore()

      mockApiFetch.mockRejectedValueOnce(new Error('Character not found'))

      await expect(store.loadCharacter('invalid-id')).rejects.toThrow('Character not found')

      expect(store.error).toBe('Character not found')
    })
  })

  describe('createCharacterWithRetry (via selectRace)', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('retries on public_id collision', async () => {
      const store = useCharacterWizardStore()

      // First attempt: collision error
      const collisionError = Object.assign(new Error('Validation: public_id already taken'), { status: 422 })

      // Mock sequence: collision → collision → success
      mockApiFetch
        .mockRejectedValueOnce(collisionError) // First POST - collision
        .mockRejectedValueOnce(collisionError) // Second POST - collision
        .mockResolvedValueOnce({ data: { id: 1, public_id: 'unique-slug' } }) // Third POST - success
        .mockResolvedValueOnce({ data: mockElf }) // GET race
        .mockResolvedValueOnce({ data: {} }) // stats
        .mockResolvedValueOnce({ data: {} }) // summary

      await store.selectRace(mockElf)

      expect(mockGenerateSlug).toHaveBeenCalledTimes(3)
      expect(store.characterId).toBe(1)
    })

    it('throws after max retries exceeded', async () => {
      const store = useCharacterWizardStore()

      const collisionError = Object.assign(new Error('Validation: public_id already taken'), { status: 422 })

      mockApiFetch
        .mockRejectedValueOnce(collisionError)
        .mockRejectedValueOnce(collisionError)
        .mockRejectedValueOnce(collisionError)

      await expect(store.selectRace(mockElf)).rejects.toThrow()
      expect(mockGenerateSlug).toHaveBeenCalledTimes(3)
    })

    it('throws immediately on non-collision errors', async () => {
      const store = useCharacterWizardStore()

      mockApiFetch.mockRejectedValueOnce(new Error('Server error'))

      await expect(store.selectRace(mockElf)).rejects.toThrow('Server error')
      expect(mockGenerateSlug).toHaveBeenCalledTimes(1)
    })
  })

  describe('hasProficiencyChoices computed', () => {
    it('returns false when no summary', () => {
      const store = useCharacterWizardStore()
      expect(store.hasProficiencyChoices).toBe(false)
    })

    it('returns true when proficiency choices are pending', () => {
      const store = useCharacterWizardStore()
      store.summary = {
        character: { id: 1, name: 'Test', total_level: 1 },
        pending_choices: { proficiencies: 2, languages: 0, spells: 0, optional_features: 0, asi: 0 },
        creation_complete: false,
        missing_required: []
      }
      expect(store.hasProficiencyChoices).toBe(true)
    })

    it('returns false when no proficiency choices pending', () => {
      const store = useCharacterWizardStore()
      store.summary = {
        character: { id: 1, name: 'Test', total_level: 1 },
        pending_choices: { proficiencies: 0, languages: 1, spells: 0, optional_features: 0, asi: 0 },
        creation_complete: false,
        missing_required: []
      }
      expect(store.hasProficiencyChoices).toBe(false)
    })
  })

  describe('hasLanguageChoices computed', () => {
    it('returns false when no summary', () => {
      const store = useCharacterWizardStore()
      expect(store.hasLanguageChoices).toBe(false)
    })

    it('returns true when language choices are pending', () => {
      const store = useCharacterWizardStore()
      store.summary = {
        character: { id: 1, name: 'Test', total_level: 1 },
        pending_choices: { proficiencies: 0, languages: 2, spells: 0, optional_features: 0, asi: 0 },
        creation_complete: false,
        missing_required: []
      }
      expect(store.hasLanguageChoices).toBe(true)
    })
  })

  describe('isComplete computed', () => {
    it('returns false when no summary', () => {
      const store = useCharacterWizardStore()
      expect(store.isComplete).toBe(false)
    })

    it('returns true when creation_complete is true', () => {
      const store = useCharacterWizardStore()
      store.summary = {
        character: { id: 1, name: 'Test', total_level: 1 },
        pending_choices: { proficiencies: 0, languages: 0, spells: 0, optional_features: 0, asi: 0 },
        creation_complete: true,
        missing_required: []
      }
      expect(store.isComplete).toBe(true)
    })
  })

  describe('racialBonuses computed', () => {
    it('returns empty array when no race selected', () => {
      const store = useCharacterWizardStore()
      expect(store.racialBonuses).toEqual([])
    })

    it('returns ability score modifiers from race', () => {
      const store = useCharacterWizardStore()
      const raceWithMods: Race = {
        ...mockElf,
        modifiers: [
          { id: 1, modifier_category: 'ability_score', value: 2 },
          { id: 2, modifier_category: 'speed', value: 5 } // Should be filtered out
        ]
      } as Race
      store.selections.race = raceWithMods

      expect(store.racialBonuses).toHaveLength(1)
      expect(store.racialBonuses[0].modifier_category).toBe('ability_score')
    })
  })
})
