// app/composables/useEncounterMonsters.ts
import type { EncounterMonster } from '~/types/dm-screen'

export function useEncounterMonsters(partyId: string) {
  const { apiFetch } = useApi()

  const monsters = ref<EncounterMonster[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Fetch all monsters in the party's encounter
   */
  async function fetchMonsters(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch<{ data: EncounterMonster[] }>(
        `/parties/${partyId}/monsters`
      )
      monsters.value = response.data
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  /**
   * Add monster(s) to the encounter
   */
  async function addMonster(monsterId: number, quantity: number = 1): Promise<EncounterMonster[]> {
    const response = await apiFetch<{ data: EncounterMonster[] }>(
      `/parties/${partyId}/monsters`,
      {
        method: 'POST',
        body: { monster_id: monsterId, quantity }
      }
    )
    await fetchMonsters() // Refresh list
    return response.data
  }

  /**
   * Update monster HP (debounced in component)
   */
  async function updateMonsterHp(instanceId: number, currentHp: number): Promise<void> {
    await apiFetch(`/parties/${partyId}/monsters/${instanceId}`, {
      method: 'PATCH',
      body: { current_hp: currentHp }
    })
    // Optimistic update already done in component
  }

  /**
   * Update monster label
   */
  async function updateMonsterLabel(instanceId: number, label: string): Promise<void> {
    await apiFetch(`/parties/${partyId}/monsters/${instanceId}`, {
      method: 'PATCH',
      body: { label }
    })
    const monster = monsters.value.find(m => m.id === instanceId)
    if (monster) monster.label = label
  }

  /**
   * Remove a monster instance
   */
  async function removeMonster(instanceId: number): Promise<void> {
    await apiFetch(`/parties/${partyId}/monsters/${instanceId}`, {
      method: 'DELETE'
    })
    monsters.value = monsters.value.filter(m => m.id !== instanceId)
  }

  /**
   * Clear all monsters (end encounter)
   */
  async function clearEncounter(): Promise<void> {
    await apiFetch(`/parties/${partyId}/monsters`, {
      method: 'DELETE'
    })
    monsters.value = []
  }

  return {
    monsters,
    loading,
    error,
    fetchMonsters,
    addMonster,
    updateMonsterHp,
    updateMonsterLabel,
    removeMonster,
    clearEncounter
  }
}
