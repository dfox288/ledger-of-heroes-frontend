import type { components } from '~/types/api/generated'

type PendingChoice = components['schemas']['PendingChoiceResource']
type PendingChoicesResponse = { data: components['schemas']['PendingChoicesResource'] }

type ChoiceType = 'proficiency' | 'language' | 'equipment' | 'spell' | 'subclass' | 'asi_or_feat' | 'optional_feature' | 'expertise' | 'fighting_style' | 'hit_points' | 'ability_score'

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
   * @param type - Optional choice type filter
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
      choices.value = response.data.choices
      summary.value = response.data.summary
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
    spells: choices.value.filter(c => c.type === 'spell'),
    subclass: choices.value.find(c => c.type === 'subclass') ?? null,
    asiOrFeat: choices.value.filter(c => c.type === 'asi_or_feat'),
    optionalFeatures: choices.value.filter(c => c.type === 'optional_feature'),
    abilityScores: choices.value.filter(c => c.type === 'ability_score')
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
