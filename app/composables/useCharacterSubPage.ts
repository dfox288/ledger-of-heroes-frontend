// app/composables/useCharacterSubPage.ts
import { computed, ref, watch, type Ref, type ComputedRef } from 'vue'
import type { Character, CharacterStats } from '~/types/character'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

/**
 * Options for additional data fetching in sub-pages
 */
export interface AdditionalFetch<T> {
  key: string
  fetcher: () => Promise<T>
}

/**
 * Return type for useCharacterSubPage
 */
export interface UseCharacterSubPageReturn {
  // Core data (shared cache keys with useCharacterSheet)
  character: ComputedRef<Character | null>
  stats: ComputedRef<CharacterStats | null>

  // Derived state
  isSpellcaster: ComputedRef<boolean>

  // Loading state
  loading: ComputedRef<boolean>

  // Refresh function
  refreshCharacter: () => Promise<void>

  // Play state store (exposed for convenience)
  playStateStore: ReturnType<typeof useCharacterPlayStateStore>

  // Helper to add additional pending states to loading computation
  addPendingState: (pending: Ref<boolean>) => void
}

/**
 * Composable for character sub-pages (spells, inventory, features, notes, battle)
 *
 * Provides:
 * - Character and stats data with shared cache keys (prevents refetch when navigating between tabs)
 * - hasLoadedOnce pattern (prevents skeleton flash on refresh)
 * - Play state store initialization (HP, death saves, currency)
 * - isSpellcaster computed (for tab navigation)
 *
 * Sub-pages can add their own specific data fetching and register pending states
 * via addPendingState() to include them in the loading computation.
 *
 * Uses the same cache keys as useCharacterSheet:
 * - `character-${publicId}` for character data
 * - `character-${publicId}-stats` for stats data
 *
 * This enables data sharing between the main character sheet and sub-pages,
 * reducing API calls and improving navigation performance.
 *
 * @example
 * ```typescript
 * const { character, stats, loading, isSpellcaster, refreshCharacter, addPendingState } =
 *   useCharacterSubPage(publicId)
 *
 * // Add page-specific data
 * const { data: spellsData, pending: spellsPending } = await useAsyncData(
 *   `character-${publicId.value}-spells`,
 *   () => apiFetch(`/characters/${publicId.value}/spells`)
 * )
 *
 * // Register pending state so it's included in loading
 * addPendingState(spellsPending)
 * ```
 *
 * @see useCharacterSheet - Main character sheet composable (fetches all data)
 * @see Issue #621 - Consolidation of character page data fetching
 */
export function useCharacterSubPage(publicId: Ref<string>): UseCharacterSubPageReturn {
  const { apiFetch } = useApi()
  const nuxtApp = useNuxtApp()
  const playStateStore = useCharacterPlayStateStore()

  // Additional pending states from sub-pages
  const additionalPendingStates: Ref<boolean>[] = []

  /**
   * Returns cached data from Nuxt payload if available.
   * Prevents skeleton flash on navigation by providing data synchronously.
   */
  function getCachedData<T>(key: string): T | undefined {
    if (import.meta.test || process.env.VITEST) return undefined
    const cached = nuxtApp.payload.data[key]
    return (cached ?? undefined) as T | undefined
  }

  // Check if core data is already cached
  const { data: cachedCharacter } = useNuxtData(`character-${publicId.value}`)
  const { data: cachedStats } = useNuxtData(`character-${publicId.value}-stats`)
  const dataAlreadyCached = cachedCharacter.value !== null && cachedStats.value !== null

  // Fetch character data with SHARED cache key (same as useCharacterSheet)
  const { data: characterData, pending: characterPending, refresh: refreshCharacter } =
    useAsyncData(
      `character-${publicId.value}`,
      () => apiFetch<{ data: Character }>(`/characters/${publicId.value}`),
      { getCachedData: key => getCachedData(key) }
    )

  // Fetch stats data with SHARED cache key (same as useCharacterSheet)
  const { data: statsData, pending: statsPending } =
    useAsyncData(
      `character-${publicId.value}-stats`,
      () => apiFetch<{ data: CharacterStats }>(`/characters/${publicId.value}/stats`),
      { getCachedData: key => getCachedData(key) }
    )

  // Computed data extraction
  const character = computed(() => characterData.value?.data ?? null)
  const stats = computed(() => statsData.value?.data ?? null)
  const isSpellcaster = computed(() => !!stats.value?.spellcasting)

  // Track initial load completion (prevents skeleton flash on refresh)
  const hasLoadedOnce = ref(dataAlreadyCached)

  watch(
    () => !characterPending.value && !statsPending.value,
    (coreLoaded) => {
      if (coreLoaded && !hasLoadedOnce.value) {
        hasLoadedOnce.value = true
      }
    },
    { immediate: true }
  )

  // Loading state includes core data + any additional pending states
  const loading = computed(() => {
    if (hasLoadedOnce.value) return false

    const corePending = characterPending.value || statsPending.value
    const additionalPending = additionalPendingStates.some(p => p.value)

    return corePending || additionalPending
  })

  /**
   * Register an additional pending state to include in loading computation.
   * Call this after setting up page-specific useAsyncData calls.
   *
   * IMPORTANT: Must be called synchronously during component setup,
   * before hasLoadedOnce becomes true, for the loading state to reflect it.
   */
  function addPendingState(pending: Ref<boolean>) {
    additionalPendingStates.push(pending)
  }

  /**
   * Initialize play state store when character and stats load.
   * Manages HP, death saves, and currency state for play mode.
   */
  watch([character, statsData], ([char, s]) => {
    if (char && s?.data) {
      playStateStore.initialize({
        characterId: char.id,
        isDead: char.is_dead ?? false,
        hitPoints: {
          current: s.data.hit_points?.current ?? null,
          max: s.data.hit_points?.max ?? null,
          temporary: s.data.hit_points?.temporary ?? null
        },
        deathSaves: {
          successes: char.death_save_successes ?? 0,
          failures: char.death_save_failures ?? 0
        },
        currency: char.currency ?? { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
      })
    }
  }, { immediate: true })

  return {
    character,
    stats,
    isSpellcaster,
    loading,
    refreshCharacter,
    playStateStore,
    addPendingState
  }
}
