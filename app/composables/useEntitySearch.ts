// app/composables/useEntitySearch.ts
type SearchPredicate<T> = (item: T, query: string) => boolean

interface SearchOptions<T> {
  /** Fields to search within (uses 'name' if not specified) */
  searchableFields?: Array<keyof T>
}

/**
 * Composable for filtering entities by search query
 * Used across wizard steps for searching races, classes, backgrounds, etc.
 *
 * @param items - Ref containing the items to search
 * @param predicateOrOptions - Custom predicate function OR options object
 *
 * @example
 * // Simple name search
 * const { searchQuery, filtered } = useEntitySearch(races)
 *
 * // Search multiple fields
 * const { searchQuery, filtered } = useEntitySearch(backgrounds, {
 *   searchableFields: ['name', 'feature_name']
 * })
 *
 * // Custom predicate
 * const { searchQuery, filtered } = useEntitySearch(items, (item, query) =>
 *   item.name.includes(query) || item.tags.some(t => t.includes(query))
 * )
 */
export function useEntitySearch<T extends { name: string }>(
  items: Ref<T[] | null | undefined>,
  predicateOrOptions?: SearchPredicate<T> | SearchOptions<T>
) {
  const searchQuery = ref('')

  const filtered = computed((): T[] => {
    if (!items.value) return []
    if (!searchQuery.value.trim()) return items.value

    const query = searchQuery.value.toLowerCase()

    // Custom predicate function
    if (typeof predicateOrOptions === 'function') {
      return items.value.filter(item => predicateOrOptions(item, query))
    }

    // Options object with searchableFields
    if (predicateOrOptions?.searchableFields) {
      const fields = predicateOrOptions.searchableFields
      return items.value.filter(item =>
        fields.some((field) => {
          const value = item[field]
          return typeof value === 'string' && value.toLowerCase().includes(query)
        })
      )
    }

    // Default: search by name only
    return items.value.filter(item =>
      item.name.toLowerCase().includes(query)
    )
  })

  return {
    searchQuery,
    filtered
  }
}
