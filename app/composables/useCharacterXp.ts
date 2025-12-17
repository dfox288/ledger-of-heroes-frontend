// app/composables/useCharacterXp.ts
import type { MaybeRef } from 'vue'
import type { CharacterXpData } from '~/types/character'
import { logger } from '~/utils/logger'

/**
 * Composable for fetching and updating character XP
 *
 * Provides reactive state for XP display, formatted values for UI,
 * and update function for the edit modal.
 *
 * @param characterId - Character public ID (reactive)
 *
 * @example
 * const { xpData, formattedCurrentXp, updateXp } = useCharacterXp(publicId)
 *
 * @see Issue #653 - XP progress display
 */
export function useCharacterXp(characterId: MaybeRef<string | null>) {
  const { apiFetch } = useApi()

  // ══════════════════════════════════════════════════════════════
  // STATE
  // ══════════════════════════════════════════════════════════════

  const xpData = ref<CharacterXpData | null>(null)
  const pending = ref(false)
  const error = ref<string | null>(null)

  // ══════════════════════════════════════════════════════════════
  // COMPUTED: Formatted display values
  // ══════════════════════════════════════════════════════════════

  /**
   * Format number with comma separators
   * 6500 -> "6,500"
   */
  function formatNumber(num: number): string {
    return num.toLocaleString('en-US')
  }

  /** Current XP formatted with commas (e.g., "6,500") */
  const formattedCurrentXp = computed(() => {
    if (!xpData.value) return '0'
    return formatNumber(xpData.value.experience_points)
  })

  /** Next level XP threshold formatted (e.g., "14,000") */
  const formattedNextLevelXp = computed(() => {
    if (!xpData.value?.next_level_xp) return '0'
    return formatNumber(xpData.value.next_level_xp)
  })

  /** Progress percentage (0-100) */
  const progressPercent = computed(() => {
    return xpData.value?.xp_progress_percent ?? 0
  })

  /** Whether character is at max level (20) */
  const isMaxLevel = computed(() => {
    return xpData.value?.is_max_level ?? false
  })

  // ══════════════════════════════════════════════════════════════
  // ACTIONS
  // ══════════════════════════════════════════════════════════════

  /**
   * Fetch XP data from backend
   */
  async function refresh(): Promise<void> {
    const id = toValue(characterId)
    if (!id) {
      xpData.value = null
      return
    }

    pending.value = true
    error.value = null

    try {
      const response = await apiFetch<{ data: CharacterXpData }>(
        `/characters/${id}/xp`
      )
      xpData.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch XP'
      logger.error('Failed to fetch character XP:', err)
    } finally {
      pending.value = false
    }
  }

  /**
   * Update character XP to a new value
   *
   * @param newXp - New experience points value
   * @throws If update fails
   */
  async function updateXp(newXp: number): Promise<void> {
    const id = toValue(characterId)
    if (!id) return

    const response = await apiFetch<{ data: CharacterXpData }>(
      `/characters/${id}/xp`,
      {
        method: 'POST',
        body: { experience_points: newXp }
      }
    )

    // Update local state with response
    xpData.value = response.data
  }

  // ══════════════════════════════════════════════════════════════
  // WATCH
  // ══════════════════════════════════════════════════════════════

  // Auto-fetch when characterId changes
  watch(
    () => toValue(characterId),
    (newId) => {
      if (newId) {
        refresh()
      } else {
        xpData.value = null
      }
    },
    { immediate: true }
  )

  // ══════════════════════════════════════════════════════════════
  // RETURN
  // ══════════════════════════════════════════════════════════════

  return {
    // Raw data
    xpData,
    pending,
    error,

    // Formatted values
    formattedCurrentXp,
    formattedNextLevelXp,
    progressPercent,
    isMaxLevel,

    // Actions
    refresh,
    updateXp
  }
}
