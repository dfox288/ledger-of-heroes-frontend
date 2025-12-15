import { setActivePinia, createPinia } from 'pinia'
import { beforeEach } from 'vitest'

/**
 * Sets up a fresh Pinia instance before each test.
 * Call at the top of a describe() block.
 *
 * This eliminates the repetitive beforeEach boilerplate:
 * ```
 * beforeEach(() => {
 *   setActivePinia(createPinia())
 * })
 * ```
 *
 * Usage:
 * ```typescript
 * import { usePiniaSetup } from '#tests/helpers/storeSetup'
 *
 * describe('useSpellFiltersStore', () => {
 *   usePiniaSetup()
 *   // tests...
 * })
 * ```
 */
export function usePiniaSetup(): void {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
}

/**
 * Creates and returns a store instance with a fresh Pinia.
 * Useful for one-off tests or inline store creation.
 *
 * Usage:
 * ```typescript
 * import { createTestStore } from '#tests/helpers/storeSetup'
 * import { useSpellFiltersStore } from '~/stores/spellFilters'
 *
 * const store = createTestStore(useSpellFiltersStore)
 * store.searchQuery = 'fireball'
 * expect(store.hasActiveFilters).toBe(true)
 * ```
 */
export function createTestStore<T>(useStore: () => T): T {
  setActivePinia(createPinia())
  return useStore()
}
