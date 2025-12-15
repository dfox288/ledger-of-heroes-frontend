// tests/composables/useEncounterPresets.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useEncounterPresets } from '~/composables/useEncounterPresets'
import type { EncounterPreset, PresetMonster } from '~/types/dm-screen'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { store = Object.fromEntries(Object.entries(store).filter(([k]) => k !== key)) }),
    clear: vi.fn(() => { store = {} })
  }
})()

vi.stubGlobal('localStorage', localStorageMock)

describe('useEncounterPresets', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  const mockMonsters: PresetMonster[] = [
    { monster_id: 1, monster_name: 'Goblin', quantity: 4 },
    { monster_id: 2, monster_name: 'Hobgoblin', quantity: 1 }
  ]

  describe('loadPresets', () => {
    it('returns empty array when no presets exist', () => {
      const { presets, loadPresets } = useEncounterPresets()
      loadPresets()
      expect(presets.value).toEqual([])
    })

    it('loads presets from localStorage', () => {
      const existingPresets: EncounterPreset[] = [
        { id: '1', name: 'Goblin Patrol', monsters: mockMonsters, created_at: Date.now() }
      ]
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingPresets))

      const { presets, loadPresets } = useEncounterPresets()
      loadPresets()

      expect(presets.value).toHaveLength(1)
      expect(presets.value[0].name).toBe('Goblin Patrol')
    })

    it('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json {{{')

      const { presets, loadPresets } = useEncounterPresets()
      loadPresets()

      expect(presets.value).toEqual([])
    })
  })

  describe('savePreset', () => {
    it('creates a new preset with unique id', () => {
      const { presets, savePreset, loadPresets } = useEncounterPresets()
      loadPresets()

      savePreset('Goblin Patrol', mockMonsters)

      expect(presets.value).toHaveLength(1)
      expect(presets.value[0].name).toBe('Goblin Patrol')
      expect(presets.value[0].monsters).toEqual(mockMonsters)
      expect(presets.value[0].id).toBeDefined()
      expect(presets.value[0].created_at).toBeDefined()
    })

    it('persists preset to localStorage', () => {
      const { savePreset, loadPresets } = useEncounterPresets()
      loadPresets()

      savePreset('Test Preset', mockMonsters)

      expect(localStorageMock.setItem).toHaveBeenCalled()
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
      expect(savedData[0].name).toBe('Test Preset')
    })

    it('adds new preset to existing presets', () => {
      const existingPresets: EncounterPreset[] = [
        { id: '1', name: 'Existing', monsters: [], created_at: Date.now() }
      ]
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingPresets))

      const { presets, savePreset, loadPresets } = useEncounterPresets()
      loadPresets()
      savePreset('New Preset', mockMonsters)

      expect(presets.value).toHaveLength(2)
    })
  })

  describe('deletePreset', () => {
    it('removes preset by id', () => {
      const existingPresets: EncounterPreset[] = [
        { id: '1', name: 'First', monsters: [], created_at: Date.now() },
        { id: '2', name: 'Second', monsters: [], created_at: Date.now() }
      ]
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingPresets))

      const { presets, deletePreset, loadPresets } = useEncounterPresets()
      loadPresets()
      deletePreset('1')

      expect(presets.value).toHaveLength(1)
      expect(presets.value[0].id).toBe('2')
    })

    it('persists deletion to localStorage', () => {
      const existingPresets: EncounterPreset[] = [
        { id: '1', name: 'ToDelete', monsters: [], created_at: Date.now() }
      ]
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingPresets))

      const { deletePreset, loadPresets } = useEncounterPresets()
      loadPresets()
      deletePreset('1')

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
      expect(savedData).toHaveLength(0)
    })
  })

  describe('renamePreset', () => {
    it('updates preset name', () => {
      const existingPresets: EncounterPreset[] = [
        { id: '1', name: 'Old Name', monsters: mockMonsters, created_at: Date.now() }
      ]
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingPresets))

      const { presets, renamePreset, loadPresets } = useEncounterPresets()
      loadPresets()
      renamePreset('1', 'New Name')

      expect(presets.value[0].name).toBe('New Name')
    })
  })

  describe('getPresetById', () => {
    it('returns preset by id', () => {
      const existingPresets: EncounterPreset[] = [
        { id: '1', name: 'First', monsters: mockMonsters, created_at: Date.now() },
        { id: '2', name: 'Second', monsters: [], created_at: Date.now() }
      ]
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingPresets))

      const { getPresetById, loadPresets } = useEncounterPresets()
      loadPresets()
      const preset = getPresetById('1')

      expect(preset?.name).toBe('First')
      expect(preset?.monsters).toEqual(mockMonsters)
    })

    it('returns undefined for non-existent id', () => {
      const { getPresetById, loadPresets } = useEncounterPresets()
      loadPresets()
      const preset = getPresetById('nonexistent')

      expect(preset).toBeUndefined()
    })
  })
})
