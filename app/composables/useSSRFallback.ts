import { computed, type Ref, type ComputedRef } from 'vue'

/**
 * SSR Fallback Composable
 *
 * Provides reactive values that fall back to initial props during SSR
 * when the store isn't yet initialized, preventing hydration mismatches.
 *
 * Pattern used by character sheet manager components:
 * - HitPointsManager
 * - CurrencyManager
 * - DeathSavesManager
 *
 * @example
 * ```typescript
 * const store = useCharacterPlayStateStore()
 *
 * // Simple usage
 * const displayCurrency = useSSRFallback(
 *   computed(() => store.currency),
 *   props.initialCurrency,
 *   computed(() => store.characterId !== null)
 * )
 *
 * // With complex objects
 * const displayHitPoints = useSSRFallback(
 *   computed(() => store.hitPoints),
 *   props.initialHitPoints,
 *   computed(() => store.characterId !== null)
 * )
 * ```
 *
 * @param storeValue - Reactive store value (Ref or ComputedRef)
 * @param initialProp - Initial prop value for SSR (captured at call time)
 * @param isStoreReady - Reactive boolean indicating if store is initialized
 * @returns ComputedRef that returns store value when ready, otherwise initial prop or store fallback
 *
 * @see Issue #623 - Hydration fixes
 * @see Issue #820 - Extract SSR fallback pattern
 */
export function useSSRFallback<T>(
  storeValue: Ref<T> | ComputedRef<T>,
  initialProp: T | undefined,
  isStoreReady: Ref<boolean> | ComputedRef<boolean>
): ComputedRef<T> {
  return computed(() => {
    // If store is initialized, use store values for reactivity
    if (isStoreReady.value) {
      return storeValue.value
    }

    // During SSR or before store init, use initial prop if provided
    // Note: We check !== undefined to allow null, false, 0, '' as valid values
    if (initialProp !== undefined) {
      return initialProp
    }

    // Fallback to store value (will be zeros/defaults during SSR)
    return storeValue.value
  })
}
