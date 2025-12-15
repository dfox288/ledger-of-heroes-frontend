// tests/composables/useEncounterPresets.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { EncounterPreset, PresetMonster } from '~/types/dm-screen'

// Mock apiFetch
const mockApiFetch = vi.fn()
mockNuxtImport('useApi', () => () => ({ apiFetch: mockApiFetch }))

describe('useEncounterPresets', () => {
  beforeEach(() => {
    mockApiFetch.mockClear()
  })

  const partyId = '1'

  const mockMonsters: PresetMonster[] = [
    { monster_id: 42, monster_name: 'Goblin', quantity: 4, challenge_rating: '1/4' },
    { monster_id: 43, monster_name: 'Hobgoblin', quantity: 1, challenge_rating: '1/2' }
  ]

  const mockPreset: EncounterPreset = {
    id: 1,
    name: 'Goblin Patrol',
    monsters: mockMonsters,
    created_at: '2025-12-15T12:00:00Z',
    updated_at: '2025-12-15T12:00:00Z'
  }

  describe('fetchPresets', () => {
    it('returns empty array when no presets exist', async () => {
      mockApiFetch.mockResolvedValue({ data: [] })

      const { useEncounterPresets } = await import('~/composables/useEncounterPresets')
      const { presets, fetchPresets } = useEncounterPresets(partyId)

      await fetchPresets()

      expect(mockApiFetch).toHaveBeenCalledWith('/parties/1/encounter-presets')
      expect(presets.value).toEqual([])
    })

    it('fetches presets from API', async () => {
      mockApiFetch.mockResolvedValue({ data: [mockPreset] })

      const { useEncounterPresets } = await import('~/composables/useEncounterPresets')
      const { presets, fetchPresets } = useEncounterPresets(partyId)

      await fetchPresets()

      expect(presets.value).toHaveLength(1)
      expect(presets.value[0].name).toBe('Goblin Patrol')
    })

    it('sets loading state during fetch', async () => {
      let resolvePromise: (value: unknown) => void
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      mockApiFetch.mockReturnValue(pendingPromise)

      const { useEncounterPresets } = await import('~/composables/useEncounterPresets')
      const { loading, fetchPresets } = useEncounterPresets(partyId)

      expect(loading.value).toBe(false)
      const fetchPromise = fetchPresets()
      expect(loading.value).toBe(true)

      resolvePromise!({ data: [] })
      await fetchPromise

      expect(loading.value).toBe(false)
    })

    it('handles API errors gracefully', async () => {
      const fetchError = new Error('Network error')
      mockApiFetch.mockRejectedValue(fetchError)

      const { useEncounterPresets } = await import('~/composables/useEncounterPresets')
      const { presets, fetchPresets } = useEncounterPresets(partyId)

      await expect(fetchPresets()).rejects.toThrow('Network error')
      expect(presets.value).toEqual([])
    })
  })

  describe('savePreset', () => {
    it('creates a new preset via API', async () => {
      mockApiFetch.mockResolvedValue({ data: mockPreset })

      const { useEncounterPresets } = await import('~/composables/useEncounterPresets')
      const { presets, savePreset } = useEncounterPresets(partyId)

      const preset = await savePreset('Goblin Patrol', mockMonsters)

      expect(mockApiFetch).toHaveBeenCalledWith('/parties/1/encounter-presets', {
        method: 'POST',
        body: {
          name: 'Goblin Patrol',
          monsters: [
            { monster_id: 42, quantity: 4 },
            { monster_id: 43, quantity: 1 }
          ]
        }
      })
      expect(preset.name).toBe('Goblin Patrol')
      expect(preset.id).toBe(1)
      expect(presets.value).toHaveLength(1)
    })

    it('adds new preset to existing presets', async () => {
      // First call: fetch existing
      mockApiFetch.mockResolvedValueOnce({ data: [mockPreset] })
      // Second call: save new
      const newPreset = { ...mockPreset, id: 2, name: 'New Preset' }
      mockApiFetch.mockResolvedValueOnce({ data: newPreset })

      const { useEncounterPresets } = await import('~/composables/useEncounterPresets')
      const { presets, fetchPresets, savePreset } = useEncounterPresets(partyId)

      await fetchPresets()
      await savePreset('New Preset', mockMonsters)

      expect(presets.value).toHaveLength(2)
    })
  })

  describe('renamePreset', () => {
    it('renames preset via API', async () => {
      // First call: fetch
      mockApiFetch.mockResolvedValueOnce({ data: [mockPreset] })
      // Second call: rename
      const renamedPreset = { ...mockPreset, name: 'New Name', updated_at: '2025-12-15T13:00:00Z' }
      mockApiFetch.mockResolvedValueOnce({ data: renamedPreset })

      const { useEncounterPresets } = await import('~/composables/useEncounterPresets')
      const { presets, fetchPresets, renamePreset } = useEncounterPresets(partyId)

      await fetchPresets()
      await renamePreset(1, 'New Name')

      expect(mockApiFetch).toHaveBeenCalledWith('/parties/1/encounter-presets/1', {
        method: 'PATCH',
        body: { name: 'New Name' }
      })
      expect(presets.value[0].name).toBe('New Name')
    })

    it('handles rename of non-existent preset', async () => {
      const notFoundError = new Error('Preset not found')
      mockApiFetch.mockRejectedValue(notFoundError)

      const { useEncounterPresets } = await import('~/composables/useEncounterPresets')
      const { renamePreset } = useEncounterPresets(partyId)

      await expect(renamePreset(999, 'New Name')).rejects.toThrow('Preset not found')
    })
  })

  describe('deletePreset', () => {
    it('removes preset via API', async () => {
      const preset2 = { ...mockPreset, id: 2, name: 'Second' }
      // First call: fetch
      mockApiFetch.mockResolvedValueOnce({ data: [mockPreset, preset2] })
      // Second call: delete
      mockApiFetch.mockResolvedValueOnce({ success: true })

      const { useEncounterPresets } = await import('~/composables/useEncounterPresets')
      const { presets, fetchPresets, deletePreset } = useEncounterPresets(partyId)

      await fetchPresets()
      await deletePreset(1)

      expect(mockApiFetch).toHaveBeenCalledWith('/parties/1/encounter-presets/1', {
        method: 'DELETE'
      })
      expect(presets.value).toHaveLength(1)
      expect(presets.value[0].id).toBe(2)
    })

    it('handles delete of non-existent preset', async () => {
      const notFoundError = new Error('Preset not found')
      mockApiFetch.mockRejectedValue(notFoundError)

      const { useEncounterPresets } = await import('~/composables/useEncounterPresets')
      const { deletePreset } = useEncounterPresets(partyId)

      await expect(deletePreset(999)).rejects.toThrow('Preset not found')
    })
  })

  describe('loadPreset', () => {
    it('loads preset and returns created monsters', async () => {
      const mockCreatedMonsters = [
        { id: 101, label: 'Goblin 1', monster: { name: 'Goblin' } },
        { id: 102, label: 'Goblin 2', monster: { name: 'Goblin' } }
      ]
      mockApiFetch.mockResolvedValue({ data: mockCreatedMonsters })

      const { useEncounterPresets } = await import('~/composables/useEncounterPresets')
      const { loadPreset } = useEncounterPresets(partyId)

      const monsters = await loadPreset(1)

      expect(mockApiFetch).toHaveBeenCalledWith('/parties/1/encounter-presets/1/load', {
        method: 'POST'
      })
      expect(monsters).toHaveLength(2)
      expect(monsters[0].monster.name).toBe('Goblin')
    })

    it('handles load of non-existent preset', async () => {
      const notFoundError = new Error('Preset not found')
      mockApiFetch.mockRejectedValue(notFoundError)

      const { useEncounterPresets } = await import('~/composables/useEncounterPresets')
      const { loadPreset } = useEncounterPresets(partyId)

      await expect(loadPreset(999)).rejects.toThrow('Preset not found')
    })
  })

  describe('getPresetById', () => {
    it('returns preset by id from local state', async () => {
      const preset2 = { ...mockPreset, id: 2, name: 'Second' }
      mockApiFetch.mockResolvedValue({ data: [mockPreset, preset2] })

      const { useEncounterPresets } = await import('~/composables/useEncounterPresets')
      const { fetchPresets, getPresetById } = useEncounterPresets(partyId)

      await fetchPresets()
      const preset = getPresetById(1)

      expect(preset?.name).toBe('Goblin Patrol')
      expect(preset?.monsters).toEqual(mockMonsters)
    })

    it('returns undefined for non-existent id', async () => {
      mockApiFetch.mockResolvedValue({ data: [] })

      const { useEncounterPresets } = await import('~/composables/useEncounterPresets')
      const { fetchPresets, getPresetById } = useEncounterPresets(partyId)

      await fetchPresets()
      const preset = getPresetById(999)

      expect(preset).toBeUndefined()
    })
  })
})
