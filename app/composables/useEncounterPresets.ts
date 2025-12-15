// app/composables/useEncounterPresets.ts
import type { EncounterPreset, PresetMonster, EncounterMonster } from '~/types/dm-screen'

/**
 * Composable for managing encounter presets (saved monster groups)
 *
 * Presets are party-scoped and stored via backend API.
 */
export function useEncounterPresets(partyId: string) {
  const { apiFetch } = useApi()
  const presets = ref<EncounterPreset[]>([])
  const loading = ref(false)

  /**
   * Fetch all presets for this party from the API
   */
  async function fetchPresets(): Promise<void> {
    loading.value = true
    try {
      const response = await apiFetch<{ data: EncounterPreset[] }>(
        `/parties/${partyId}/encounter-presets`
      )
      presets.value = response.data
    } finally {
      loading.value = false
    }
  }

  /**
   * Save current encounter as a new preset
   */
  async function savePreset(name: string, monsters: PresetMonster[]): Promise<EncounterPreset> {
    const response = await apiFetch<{ data: EncounterPreset }>(
      `/parties/${partyId}/encounter-presets`,
      {
        method: 'POST',
        body: {
          name,
          monsters: monsters.map(m => ({
            monster_id: m.monster_id,
            quantity: m.quantity
          }))
        }
      }
    )

    // Update local state
    presets.value.push(response.data)

    return response.data
  }

  /**
   * Rename an existing preset
   */
  async function renamePreset(presetId: number, name: string): Promise<EncounterPreset> {
    const response = await apiFetch<{ data: EncounterPreset }>(
      `/parties/${partyId}/encounter-presets/${presetId}`,
      {
        method: 'PATCH',
        body: { name }
      }
    )

    // Update local state
    const index = presets.value.findIndex(p => p.id === presetId)
    if (index !== -1) {
      presets.value[index] = response.data
    }

    return response.data
  }

  /**
   * Delete a preset by ID
   */
  async function deletePreset(presetId: number): Promise<void> {
    await apiFetch(
      `/parties/${partyId}/encounter-presets/${presetId}`,
      { method: 'DELETE' }
    )

    // Update local state
    presets.value = presets.value.filter(p => p.id !== presetId)
  }

  /**
   * Load a preset into the current encounter
   * Returns the created EncounterMonster instances
   */
  async function loadPreset(presetId: number): Promise<EncounterMonster[]> {
    const response = await apiFetch<{ data: EncounterMonster[] }>(
      `/parties/${partyId}/encounter-presets/${presetId}/load`,
      { method: 'POST' }
    )

    return response.data
  }

  /**
   * Get a preset by ID from local state
   */
  function getPresetById(presetId: number): EncounterPreset | undefined {
    return presets.value.find(p => p.id === presetId)
  }

  return {
    presets,
    loading,
    fetchPresets,
    savePreset,
    renamePreset,
    deletePreset,
    loadPreset,
    getPresetById
  }
}
