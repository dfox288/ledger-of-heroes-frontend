import type { components } from '~/types/api/generated'

type PendingChoice = components['schemas']['PendingChoiceResource']
type PendingChoicesResponse = { data: components['schemas']['PendingChoicesResource'] }

type ChoiceType = 'proficiency' | 'language' | 'equipment' | 'equipment_mode' | 'spell' | 'subclass' | 'asi_or_feat' | 'optional_feature' | 'expertise' | 'fighting_style' | 'hit_points' | 'ability_score' | 'feat' | 'size'

/**
 * Unified choices composable for character creation/advancement
 *
 * Manages pending choices (proficiencies, languages, spells, etc.) for a character.
 * Provides reactive state, type-grouped choices, and resolution/undo actions.
 *
 * @example
 * ```typescript
 * const characterId = ref(1)
 * const {
 *   choices,
 *   choicesByType,
 *   pending,
 *   allRequiredComplete,
 *   fetchChoices,
 *   resolveChoice,
 *   undoChoice
 * } = useUnifiedChoices(characterId)
 *
 * // Fetch all pending choices
 * await fetchChoices()
 *
 * // Fetch only spell choices
 * await fetchChoices('spell')
 *
 * // Resolve a proficiency choice
 * await resolveChoice('proficiency:class:1:1:skills', {
 *   selected: ['athletics', 'stealth']
 * })
 *
 * // Undo a choice
 * await undoChoice('proficiency:class:1:1:skills')
 * ```
 */
export function useUnifiedChoices(characterId: Ref<number | null>) {
  const { apiFetch } = useApi()

  const pending = ref(false)
  const error = ref<string | null>(null)
  const choices = ref<PendingChoice[]>([])
  const summary = ref<PendingChoicesResponse['data']['summary'] | null>(null)

  /**
   * Fetch all pending choices (optionally filtered by type)
   *
   * When a type filter is provided, this function MERGES the results into
   * the existing choices array (replacing only choices of that type).
   * This allows parallel fetchChoices calls without race conditions.
   *
   * Without a type filter, all choices are replaced (full refresh).
   *
   * @param type - Optional choice type filter
   *
   * @example
   * // Safe parallel fetching (no race condition)
   * await Promise.all([
   *   fetchChoices('equipment'),      // Merges equipment choices
   *   fetchChoices('equipment_mode')  // Merges equipment_mode choices
   * ])
   * // Both choice types are now in choices.value
   */
  async function fetchChoices(type?: ChoiceType) {
    if (!characterId.value) return

    pending.value = true
    error.value = null

    try {
      const query = type ? `?type=${type}` : ''
      const response = await apiFetch<PendingChoicesResponse>(
        `/characters/${characterId.value}/pending-choices${query}`
      )

      // Defensive check: handle undefined or malformed response
      const responseChoices = response?.data?.choices ?? []
      const responseSummary = response?.data?.summary ?? null

      if (type) {
        // Filtered fetch: merge results (remove old choices of this type, add new ones)
        // This prevents race conditions when multiple fetchChoices run in parallel
        const otherChoices = choices.value.filter(c => c.type !== type)
        choices.value = [...otherChoices, ...responseChoices]
      } else {
        // Unfiltered fetch: replace all choices
        choices.value = responseChoices
      }

      summary.value = responseSummary
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch choices'
      throw e
    } finally {
      pending.value = false
    }
  }

  /**
   * Computed: group choices by type for easier access
   */
  const choicesByType = computed(() => ({
    proficiencies: choices.value.filter(c => c.type === 'proficiency'),
    languages: choices.value.filter(c => c.type === 'language'),
    equipment: choices.value.filter(c => c.type === 'equipment'),
    equipmentMode: choices.value.find(c => c.type === 'equipment_mode') ?? null,
    spells: choices.value.filter(c => c.type === 'spell'),
    subclass: choices.value.find(c => c.type === 'subclass') ?? null,
    asiOrFeat: choices.value.filter(c => c.type === 'asi_or_feat'),
    optionalFeatures: choices.value.filter(c => c.type === 'optional_feature'),
    abilityScores: choices.value.filter(c => c.type === 'ability_score'),
    feats: choices.value.filter(c => c.type === 'feat'),
    sizes: choices.value.filter(c => c.type === 'size'),
    hitPoints: choices.value.filter(c => c.type === 'hit_points'),
    // Feature choice groupings
    fightingStyles: choices.value.filter(c => c.type === 'fighting_style'),
    expertise: choices.value.filter(c => c.type === 'expertise')
  }))

  /**
   * Resolve a choice with selected options
   *
   * @param choiceId - The choice ID to resolve
   * @param payload - Payload with selected options or custom data
   */
  async function resolveChoice(choiceId: string, payload: { selected: (string | number)[] } | Record<string, unknown>) {
    if (!characterId.value) return

    await apiFetch(`/characters/${characterId.value}/choices/${choiceId}`, {
      method: 'POST',
      body: payload
    })

    // Refresh choices after resolution
    await fetchChoices()
  }

  /**
   * Undo a previously resolved choice
   *
   * @param choiceId - The choice ID to undo
   */
  async function undoChoice(choiceId: string) {
    if (!characterId.value) return

    await apiFetch(`/characters/${characterId.value}/choices/${choiceId}`, {
      method: 'DELETE'
    })

    // Refresh choices after undo
    await fetchChoices()
  }

  /**
   * Check if all required choices are complete
   */
  const allRequiredComplete = computed(() => {
    return choices.value
      .filter(c => c.required)
      .every(c => c.remaining === 0)
  })

  return {
    // State
    choices,
    choicesByType,
    summary,
    pending,
    error,

    // Computed
    allRequiredComplete,

    // Actions
    fetchChoices,
    resolveChoice,
    undoChoice
  }
}
