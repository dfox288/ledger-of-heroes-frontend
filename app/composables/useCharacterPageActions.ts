// app/composables/useCharacterPageActions.ts
/**
 * Character Page Actions Composable
 *
 * Extracts action handlers from PageHeader for better separation of concerns.
 * Handles inspiration toggle, export, revive, edit, and condition management.
 */
import type { Character } from '~/types/character'
import type { EditPayload } from '~/components/character/sheet/EditModal.vue'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'
import { logger } from '~/utils/logger'

interface UseCharacterPageActionsOptions {
  /** Callback when character data has changed */
  onUpdated?: () => void
}

export function useCharacterPageActions(
  character: Ref<Character>,
  options: UseCharacterPageActionsOptions = {}
) {
  const { apiFetch } = useApi()
  const toast = useToast()
  const playStateStore = useCharacterPlayStateStore()

  // ============================================================================
  // Local State
  // ============================================================================

  const localHasInspiration = ref(false)
  const localName = ref('')
  const isUpdatingInspiration = ref(false)
  const isEditing = ref(false)
  const isExporting = ref(false)
  const isReviving = ref(false)

  // Sync inspiration with character prop
  watch(() => character.value.has_inspiration, (hasInspiration) => {
    if (hasInspiration !== undefined && !isUpdatingInspiration.value) {
      localHasInspiration.value = hasInspiration
    }
  }, { immediate: true })

  // Sync name with character prop
  watch(() => character.value.name, (name) => {
    if (name && !isEditing.value) {
      localName.value = name
    }
  }, { immediate: true })

  // ============================================================================
  // Computed
  // ============================================================================

  const canToggleInspiration = computed(() => {
    return playStateStore.isPlayMode && !playStateStore.isDead
  })

  // ============================================================================
  // Actions
  // ============================================================================

  async function toggleInspiration(): Promise<void> {
    if (isUpdatingInspiration.value || !canToggleInspiration.value) return

    isUpdatingInspiration.value = true
    const oldValue = localHasInspiration.value
    const newValue = !oldValue
    localHasInspiration.value = newValue

    try {
      await apiFetch(`/characters/${character.value.id}`, {
        method: 'PATCH',
        body: { has_inspiration: newValue }
      })
      toast.add({
        title: newValue ? 'Inspiration granted!' : 'Inspiration spent',
        color: newValue ? 'warning' : 'neutral'
      })
    } catch (err) {
      localHasInspiration.value = oldValue
      logger.error('Failed to toggle inspiration:', err)
      toast.add({ title: 'Failed to update inspiration', color: 'error' })
    } finally {
      isUpdatingInspiration.value = false
    }
  }

  async function exportCharacter(): Promise<void> {
    if (isExporting.value) return
    isExporting.value = true

    try {
      const response = await apiFetch<{ data: unknown }>(`/characters/${character.value.public_id}/export`)
      const now = new Date()
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
      const filename = `${character.value.public_id}-${timestamp}.json`

      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.add({ title: 'Character exported', color: 'success' })
    } catch (err) {
      logger.error('Failed to export character:', err)
      toast.add({ title: 'Failed to export character', color: 'error' })
    } finally {
      isExporting.value = false
    }
  }

  async function revive(): Promise<void> {
    if (isReviving.value || !playStateStore.isDead) return
    isReviving.value = true

    try {
      await apiFetch(`/characters/${character.value.id}/revive`, {
        method: 'POST',
        body: { hit_points: 1, clear_exhaustion: true }
      })

      // Update store immediately for reactive UI
      playStateStore.isDead = false
      playStateStore.hitPoints.current = 1
      playStateStore.deathSaves.successes = 0
      playStateStore.deathSaves.failures = 0

      toast.add({
        title: 'Character revived!',
        description: `${character.value.name} has been brought back with 1 HP`,
        color: 'success'
      })
      options.onUpdated?.()
    } catch (err: unknown) {
      const error = err as { statusCode?: number, data?: { message?: string } }
      if (error.statusCode === 422) {
        toast.add({
          title: 'Cannot revive',
          description: error.data?.message || 'Character is not dead',
          color: 'warning'
        })
      } else {
        logger.error('Failed to revive character:', err)
        toast.add({ title: 'Failed to revive', color: 'error' })
      }
    } finally {
      isReviving.value = false
    }
  }

  async function editCharacter(payload: EditPayload): Promise<{ success: boolean, error?: string }> {
    if (isEditing.value) return { success: false, error: 'Already editing' }
    isEditing.value = true

    try {
      const hasNameChange = payload.name !== character.value.name
      const hasAlignmentChange = payload.alignment !== character.value.alignment
      const hasPhysicalChange
        = (payload.age ?? null) !== (character.value.age ?? null)
          || (payload.height ?? null) !== (character.value.height ?? null)
          || (payload.weight ?? null) !== (character.value.weight ?? null)
          || (payload.eye_color ?? null) !== (character.value.eye_color ?? null)
          || (payload.hair_color ?? null) !== (character.value.hair_color ?? null)
          || (payload.skin_color ?? null) !== (character.value.skin_color ?? null)
          || (payload.deity ?? null) !== (character.value.deity ?? null)

      if (hasNameChange || hasAlignmentChange || hasPhysicalChange) {
        await apiFetch(`/characters/${character.value.id}`, {
          method: 'PATCH',
          body: {
            name: payload.name,
            alignment: payload.alignment,
            age: payload.age,
            height: payload.height,
            weight: payload.weight,
            eye_color: payload.eye_color,
            hair_color: payload.hair_color,
            skin_color: payload.skin_color,
            deity: payload.deity
          }
        })
      }

      if (payload.portraitFile) {
        const formData = new FormData()
        formData.append('file', payload.portraitFile)
        await apiFetch(`/characters/${character.value.id}/media/portrait`, {
          method: 'POST',
          body: formData
        })
      }

      // Update local name immediately for instant UI feedback
      if (hasNameChange) {
        localName.value = payload.name
      }

      const changes: string[] = []
      if (hasNameChange || hasAlignmentChange || hasPhysicalChange) changes.push('details')
      if (payload.portraitFile) changes.push('portrait')
      const toastTitle = changes.length > 1
        ? 'Character details and portrait updated'
        : payload.portraitFile ? 'Portrait updated' : 'Character updated'

      toast.add({ title: toastTitle, color: 'success' })
      options.onUpdated?.()

      return { success: true }
    } catch (err: unknown) {
      const error = err as { statusCode?: number, data?: { message?: string } }
      if (error.statusCode === 422) {
        return { success: false, error: error.data?.message || 'Validation failed' }
      } else {
        logger.error('Failed to update character:', err)
        return { success: false, error: 'Failed to update character. Please try again.' }
      }
    } finally {
      isEditing.value = false
    }
  }

  async function removePortrait(): Promise<void> {
    if (isEditing.value) return
    isEditing.value = true

    try {
      await apiFetch(`/characters/${character.value.id}/media/portrait`, {
        method: 'DELETE'
      })
      toast.add({ title: 'Portrait removed', color: 'success' })
      options.onUpdated?.()
    } catch (err) {
      logger.error('Failed to remove portrait:', err)
      toast.add({ title: 'Failed to remove portrait', color: 'error' })
    } finally {
      isEditing.value = false
    }
  }

  async function addCondition(payload: { condition: string, source: string, duration: string, level?: number }): Promise<void> {
    const success = await playStateStore.addCondition(payload)
    if (success) {
      toast.add({ title: 'Condition added', color: 'success' })
    } else {
      toast.add({ title: 'Failed to add condition', color: 'error' })
    }
  }

  return {
    // State
    localHasInspiration,
    localName,
    isUpdatingInspiration,
    isEditing,
    isExporting,
    isReviving,

    // Computed
    canToggleInspiration,

    // Actions
    toggleInspiration,
    exportCharacter,
    revive,
    editCharacter,
    removePortrait,
    addCondition
  }
}
