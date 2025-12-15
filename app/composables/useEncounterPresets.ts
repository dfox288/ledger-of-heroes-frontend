// app/composables/useEncounterPresets.ts
import type { EncounterPreset, PresetMonster } from '~/types/dm-screen'

const STORAGE_KEY = 'dm-encounter-presets'

/**
 * Composable for managing encounter presets (saved monster groups)
 *
 * Currently uses localStorage for persistence.
 * Will migrate to backend API when issue #674 is implemented.
 */
export function useEncounterPresets() {
  const presets = ref<EncounterPreset[]>([])

  /**
   * Load presets from localStorage
   */
  function loadPresets(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        presets.value = JSON.parse(stored)
      }
    } catch {
      // Handle corrupted data gracefully
      presets.value = []
    }
  }

  /**
   * Persist presets to localStorage
   */
  function persistPresets(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets.value))
    } catch {
      // localStorage full or unavailable
    }
  }

  /**
   * Generate a unique ID for a new preset
   */
  function generateId(): string {
    return `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Save current encounter as a preset
   */
  function savePreset(name: string, monsters: PresetMonster[]): EncounterPreset {
    const preset: EncounterPreset = {
      id: generateId(),
      name,
      monsters: [...monsters],
      created_at: Date.now()
    }
    presets.value.push(preset)
    persistPresets()
    return preset
  }

  /**
   * Delete a preset by ID
   */
  function deletePreset(id: string): void {
    presets.value = presets.value.filter(p => p.id !== id)
    persistPresets()
  }

  /**
   * Rename a preset
   */
  function renamePreset(id: string, newName: string): void {
    const preset = presets.value.find(p => p.id === id)
    if (preset) {
      preset.name = newName
      persistPresets()
    }
  }

  /**
   * Get a preset by ID
   */
  function getPresetById(id: string): EncounterPreset | undefined {
    return presets.value.find(p => p.id === id)
  }

  return {
    presets,
    loadPresets,
    savePreset,
    deletePreset,
    renamePreset,
    getPresetById
  }
}
