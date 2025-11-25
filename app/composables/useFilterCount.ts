import { computed, type Ref, type ComputedRef } from 'vue'

/**
 * Count active filters for badge display
 *
 * Counts non-null/non-empty filter values. Handles:
 * - Single value refs (null/undefined = inactive)
 * - Array refs (empty array = inactive)
 * - String refs (empty string = inactive)
 *
 * @example
 * ```typescript
 * const activeFilterCount = useFilterCount(
 *   selectedLevel,
 *   selectedSchool,
 *   selectedClass,
 *   concentrationFilter,
 *   selectedDamageTypes,  // array
 *   selectedSavingThrows  // array
 * )
 *
 * // Use in template
 * <UiFilterCollapse :badge-count="activeFilterCount" />
 * ```
 */
export function useFilterCount(...refs: Ref<any>[]): ComputedRef<number> {
  return computed(() => {
    let count = 0

    for (const ref of refs) {
      const value = ref.value

      // Skip null/undefined
      if (value === null || value === undefined) continue

      // Skip empty strings
      if (value === '') continue

      // Count non-empty arrays
      if (Array.isArray(value)) {
        if (value.length > 0) count++
        continue
      }

      // Count any other truthy value (including 0 and false)
      count++
    }

    return count
  })
}
