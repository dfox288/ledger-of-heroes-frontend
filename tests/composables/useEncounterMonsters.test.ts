// tests/composables/useEncounterMonsters.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

// Mock apiFetch
const mockApiFetch = vi.fn()
mockNuxtImport('useApi', () => () => ({ apiFetch: mockApiFetch }))

describe('useEncounterMonsters', () => {
  beforeEach(() => {
    mockApiFetch.mockClear()
  })

  describe('fetchMonsters', () => {
    it('fetches monsters for a party', async () => {
      const mockMonsters = [
        { id: 1, monster_id: 42, label: 'Goblin 1', current_hp: 7, max_hp: 7 }
      ]
      mockApiFetch.mockResolvedValue({ data: mockMonsters })

      const { useEncounterMonsters } = await import('~/composables/useEncounterMonsters')
      const { monsters, fetchMonsters, loading, error } = useEncounterMonsters('party-1')

      expect(monsters.value).toEqual([])
      expect(loading.value).toBe(false)

      await fetchMonsters()

      expect(mockApiFetch).toHaveBeenCalledWith('/parties/party-1/monsters')
      expect(monsters.value).toEqual(mockMonsters)
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('handles fetch error', async () => {
      const fetchError = new Error('Network error')
      mockApiFetch.mockRejectedValue(fetchError)

      const { useEncounterMonsters } = await import('~/composables/useEncounterMonsters')
      const { monsters, fetchMonsters, error } = useEncounterMonsters('party-1')

      await fetchMonsters()

      expect(monsters.value).toEqual([])
      expect(error.value).toBe(fetchError)
    })
  })

  describe('addMonster', () => {
    it('posts monster with quantity and refreshes list', async () => {
      const newMonsters = [
        { id: 1, label: 'Goblin 1' },
        { id: 2, label: 'Goblin 2' }
      ]
      // First call: POST to add monsters
      mockApiFetch.mockResolvedValueOnce({ data: newMonsters })
      // Second call: GET to refresh list
      mockApiFetch.mockResolvedValueOnce({ data: newMonsters })

      const { useEncounterMonsters } = await import('~/composables/useEncounterMonsters')
      const { addMonster } = useEncounterMonsters('party-1')

      const result = await addMonster(42, 2)

      expect(mockApiFetch).toHaveBeenCalledWith('/parties/party-1/monsters', {
        method: 'POST',
        body: { monster_id: 42, quantity: 2 }
      })
      expect(result).toEqual(newMonsters)
    })

    it('defaults quantity to 1', async () => {
      mockApiFetch.mockResolvedValueOnce({ data: [{ id: 1 }] })
      mockApiFetch.mockResolvedValueOnce({ data: [{ id: 1 }] })

      const { useEncounterMonsters } = await import('~/composables/useEncounterMonsters')
      const { addMonster } = useEncounterMonsters('party-1')

      await addMonster(42)

      expect(mockApiFetch).toHaveBeenCalledWith('/parties/party-1/monsters', {
        method: 'POST',
        body: { monster_id: 42, quantity: 1 }
      })
    })
  })

  describe('updateMonsterHp', () => {
    it('patches monster HP', async () => {
      mockApiFetch.mockResolvedValue({ data: { id: 1, current_hp: 5 } })

      const { useEncounterMonsters } = await import('~/composables/useEncounterMonsters')
      const { updateMonsterHp } = useEncounterMonsters('party-1')

      await updateMonsterHp(1, 5)

      expect(mockApiFetch).toHaveBeenCalledWith('/parties/party-1/monsters/1', {
        method: 'PATCH',
        body: { current_hp: 5 }
      })
    })
  })

  describe('updateMonsterLabel', () => {
    it('patches monster label and updates local state', async () => {
      const initialMonsters = [
        { id: 1, label: 'Goblin 1', current_hp: 7, max_hp: 7 }
      ]
      // First call: fetch
      mockApiFetch.mockResolvedValueOnce({ data: initialMonsters })
      // Second call: patch
      mockApiFetch.mockResolvedValueOnce({ data: { id: 1, label: 'Goblin Chief' } })

      const { useEncounterMonsters } = await import('~/composables/useEncounterMonsters')
      const { monsters, fetchMonsters, updateMonsterLabel } = useEncounterMonsters('party-1')

      await fetchMonsters()
      await updateMonsterLabel(1, 'Goblin Chief')

      expect(mockApiFetch).toHaveBeenCalledWith('/parties/party-1/monsters/1', {
        method: 'PATCH',
        body: { label: 'Goblin Chief' }
      })
      expect(monsters.value[0].label).toBe('Goblin Chief')
    })
  })

  describe('removeMonster', () => {
    it('deletes a monster instance and updates local state', async () => {
      const initialMonsters = [
        { id: 1, label: 'Goblin 1' },
        { id: 2, label: 'Goblin 2' }
      ]
      // First call: fetch
      mockApiFetch.mockResolvedValueOnce({ data: initialMonsters })
      // Second call: delete
      mockApiFetch.mockResolvedValueOnce({ success: true })

      const { useEncounterMonsters } = await import('~/composables/useEncounterMonsters')
      const { monsters, fetchMonsters, removeMonster } = useEncounterMonsters('party-1')

      await fetchMonsters()
      expect(monsters.value).toHaveLength(2)

      await removeMonster(1)

      expect(mockApiFetch).toHaveBeenCalledWith('/parties/party-1/monsters/1', {
        method: 'DELETE'
      })
      expect(monsters.value).toHaveLength(1)
      expect(monsters.value[0].id).toBe(2)
    })
  })

  describe('clearEncounter', () => {
    it('deletes all monsters and clears local state', async () => {
      const initialMonsters = [
        { id: 1, label: 'Goblin 1' },
        { id: 2, label: 'Goblin 2' }
      ]
      // First call: fetch
      mockApiFetch.mockResolvedValueOnce({ data: initialMonsters })
      // Second call: delete all
      mockApiFetch.mockResolvedValueOnce({ success: true })

      const { useEncounterMonsters } = await import('~/composables/useEncounterMonsters')
      const { monsters, fetchMonsters, clearEncounter } = useEncounterMonsters('party-1')

      await fetchMonsters()
      expect(monsters.value).toHaveLength(2)

      await clearEncounter()

      expect(mockApiFetch).toHaveBeenCalledWith('/parties/party-1/monsters', {
        method: 'DELETE'
      })
      expect(monsters.value).toHaveLength(0)
    })
  })
})
