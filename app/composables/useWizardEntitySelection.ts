// app/composables/useWizardEntitySelection.ts
import type { Ref, ComputedRef } from 'vue'
import { useDetailModal } from '~/composables/useDetailModal'
import { useEntitySearch } from '~/composables/useEntitySearch'

/**
 * Configuration for the entity selection composable
 */
export interface EntitySelectionConfig<T> {
  /** Store action to call when confirming selection */
  storeAction: (entity: T) => Promise<void>

  /** Existing selection from store (for initialization) */
  existingSelection?: ComputedRef<T | null>

  /** Fields to search (defaults to ['name']) */
  searchableFields?: Array<keyof T>
}

/**
 * Return type for the entity selection composable
 */
export interface EntitySelectionReturn<T> {
  // State
  localSelected: Ref<T | null>
  searchQuery: Ref<string>
  filtered: ComputedRef<T[]>

  // Validation
  canProceed: ComputedRef<boolean>

  // Actions
  handleSelect: (entity: T) => void
  confirmSelection: () => Promise<void>

  // Detail modal
  detailModal: {
    open: Ref<boolean>
    item: Ref<T | null>
    show: (entity: T) => void
    close: () => void
  }
}

/**
 * Composable for entity selection in wizard steps
 *
 * Consolidates the common pattern used by StepRace, StepClass, and StepBackground:
 * - Local selection state management
 * - Search functionality via useEntitySearch
 * - Detail modal via useDetailModal
 * - Validation (canProceed)
 * - Confirm selection flow
 *
 * @param entities - Ref containing the entities to select from (fetched by component)
 * @param config - Configuration including storeAction and optional existing selection
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * // Component handles data fetching
 * const { data: classes } = await useAsyncData(...)
 *
 * // Composable handles selection logic
 * const {
 *   localSelected,
 *   searchQuery,
 *   filtered,
 *   canProceed,
 *   handleSelect,
 *   confirmSelection,
 *   detailModal
 * } = useWizardEntitySelection(classes, {
 *   storeAction: (cls) => store.selectClass(cls),
 *   existingSelection: computed(() => selections.value.class)
 * })
 *
 * // Component handles navigation
 * async function handleConfirm() {
 *   await confirmSelection()
 *   nextStep()
 * }
 * </script>
 * ```
 */
export function useWizardEntitySelection<T extends { id: number; name: string }>(
  entities: Ref<T[] | null | undefined>,
  config: EntitySelectionConfig<T>
): EntitySelectionReturn<T> {
  const { storeAction, existingSelection, searchableFields } = config

  // Local state for selected entity
  const localSelected = ref<T | null>(null) as Ref<T | null>

  // Search functionality via useEntitySearch
  const searchOptions = searchableFields
    ? { searchableFields: searchableFields as Array<keyof (T & { name: string })> }
    : undefined

  const { searchQuery, filtered } = useEntitySearch(entities, searchOptions)

  // Detail modal via useDetailModal
  const detailModal = useDetailModal<T>()

  // Validation: can proceed if an entity is selected
  const canProceed = computed(() => localSelected.value !== null)

  /**
   * Handle entity selection from card click
   */
  function handleSelect(entity: T): void {
    localSelected.value = entity
  }

  /**
   * Confirm selection by calling the store action
   * Does nothing if no selection. Propagates errors to caller.
   */
  async function confirmSelection(): Promise<void> {
    if (!localSelected.value) return
    await storeAction(localSelected.value)
  }

  // Initialize from existing selection on mount
  // Uses watchEffect to handle both initial mount and reactive changes
  watchEffect(() => {
    if (existingSelection?.value && entities.value) {
      // Find matching entity by ID for proper reference equality
      const match = entities.value.find(e => e.id === existingSelection.value?.id)
      localSelected.value = match ?? existingSelection.value
    } else if (existingSelection?.value) {
      // Entities not loaded yet, use store value directly
      localSelected.value = existingSelection.value
    }
  })

  return {
    // State
    localSelected,
    searchQuery,
    filtered,

    // Validation
    canProceed,

    // Actions
    handleSelect,
    confirmSelection,

    // Detail modal
    detailModal: {
      open: detailModal.open,
      item: detailModal.item,
      show: detailModal.show,
      close: detailModal.close
    }
  }
}
