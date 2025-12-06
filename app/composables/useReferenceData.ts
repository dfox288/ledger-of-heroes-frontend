import { computed, type ComputedRef, type Ref } from 'vue'

export interface ReferenceDataOptions<T> {
  /** Override cache key (default: endpoint-based) */
  cacheKey?: string

  /** Transform response (default: extracts .data property) */
  transform?: (data: T[]) => T[]

  /** Fetch multiple pages (for large datasets like classes) */
  pages?: number
}

export interface UseReferenceDataReturn<T> {
  /** Reference data array */
  data: ComputedRef<T[]>

  /** Fetch error */
  error: Ref<unknown>

  /** Fetch status */
  status: Ref<'idle' | 'pending' | 'success' | 'error'>

  /** Loading state */
  loading: ComputedRef<boolean>
}

/**
 * Fetch reference data for filter options
 *
 * Wraps the common pattern of useAsyncData + apiFetch for reference entities.
 * Automatically handles pagination, caching, and type safety.
 *
 * @example
 * ```typescript
 * // Simple fetch
 * const { data: schools } = useReferenceData<SpellSchool>('/spell-schools')
 *
 * // Multi-page fetch (for large datasets)
 * const { data: classes } = useReferenceData<CharacterClass>('/classes', {
 *   pages: 2,
 *   transform: (data) => data.filter(c => c.is_base_class === true)
 * })
 *
 * // Use in computed options
 * const schoolOptions = computed(() =>
 *   schools.value?.map(s => ({ label: s.name, value: s.id })) || []
 * )
 * ```
 */
export function useReferenceData<T>(
  endpoint: string,
  options: ReferenceDataOptions<T> = {}
): UseReferenceDataReturn<T> {
  const { apiFetch } = useApi()

  const cacheKey = options.cacheKey || `reference-${endpoint.replace(/\//g, '-')}`

  const { data, error, status } = useAsyncData<T[]>(
    cacheKey,
    async () => {
      // Handle multi-page fetching
      if (options.pages && options.pages > 1) {
        const pagePromises = Array.from({ length: options.pages }, (_, i) => {
          const page = i + 1
          return apiFetch<{ data: T[] }>(`${endpoint}?per_page=100&page=${page}`)
        })

        const responses = await Promise.all(pagePromises)
        const allData = responses.flatMap(r => r?.data || [])

        return options.transform ? options.transform(allData) : allData
      }

      // Single page fetch
      const response = await apiFetch<{ data: T[] }>(endpoint)
      const data = response?.data || []

      return options.transform ? options.transform(data) : data
    }
  )

  return {
    data: computed(() => data.value || []),
    error,
    status,
    loading: computed(() => status.value === 'pending')
  }
}
