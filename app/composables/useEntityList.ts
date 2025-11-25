import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'

/**
 * Pagination metadata from API responses
 */
export interface PaginationMeta {
  total: number
  from: number
  to: number
  current_page: number
  last_page: number
  per_page: number
}

/**
 * Configuration for useEntityList composable
 */
export interface UseEntityListConfig {
  /** API endpoint (e.g., '/spells', '/items') */
  endpoint: string

  /** Cache key for useAsyncData (e.g., 'spells-list') */
  cacheKey: string

  /** Computed callback that builds custom query params */
  queryBuilder: ComputedRef<Record<string, unknown>>

  /** Items per page (default: 24) */
  perPage?: number

  /** SEO metadata */
  seo: {
    title: string
    description: string
  }

  /** Parse URL params on mount (default: true) */
  initialRoute?: boolean

  /** Disable pagination for small datasets (default: false) */
  noPagination?: boolean
}

/**
 * Return type for useEntityList composable
 */
export interface UseEntityListReturn {
  // Base State
  searchQuery: Ref<string>
  currentPage: Ref<number>

  // Data
  data: ComputedRef<Array<unknown>>
  meta: ComputedRef<PaginationMeta | null>
  totalResults: ComputedRef<number>
  loading: Ref<boolean>
  error: Ref<unknown>

  // Methods
  refresh: () => Promise<void>
  clearFilters: () => void

  // Computed Helpers
  hasActiveFilters: ComputedRef<boolean>
}

/**
 * Generic list page composable
 *
 * Handles pagination, search, URL sync, data fetching, and SEO
 * for all entity list pages. Pages inject custom filters via queryBuilder.
 *
 * @example
 * ```typescript
 * const queryBuilder = computed(() => ({
 *   level: selectedLevel.value,
 *   school: selectedSchool.value
 * }))
 *
 * const {
 *   searchQuery,
 *   currentPage,
 *   data,
 *   loading,
 *   clearFilters
 * } = useEntityList({
 *   endpoint: '/spells',
 *   cacheKey: 'spells-list',
 *   queryBuilder,
 *   seo: {
 *     title: 'Spells - D&D 5e',
 *     description: 'Browse D&D 5e spells'
 *   }
 * })
 * ```
 */
export function useEntityList(config: UseEntityListConfig): UseEntityListReturn {
  const { apiFetch } = useApi()
  const route = useRoute()

  // Initialize from route query params (if enabled)
  const shouldInitFromRoute = config.initialRoute !== false

  // Base state - managed by composable
  const searchQuery = ref(
    shouldInitFromRoute && route.query.q
      ? (route.query.q as string)
      : ''
  )
  const currentPage = ref(
    shouldInitFromRoute && route.query.page
      ? Number(route.query.page)
      : 1
  )

  // Build complete query params (base + custom)
  const queryParams = computed(() => {
    const params: Record<string, unknown> = {
      per_page: config.noPagination ? 100 : (config.perPage ?? 24),
      page: config.noPagination ? 1 : currentPage.value
    }

    // Add search if present
    const trimmedQuery = searchQuery.value.trim()
    if (trimmedQuery) {
      params.q = trimmedQuery
    }

    // Merge custom filters from page's queryBuilder
    Object.assign(params, config.queryBuilder.value)

    return params
  })

  // Fetch data with Nuxt's useAsyncData (SSR support + caching)
  const { data: response, pending: loading, error, refresh } = useAsyncData<{ data: Array<unknown>, meta: PaginationMeta }>(
    config.cacheKey,
    async () => {
      const result = await apiFetch<{ data: Array<unknown>, meta: PaginationMeta }>(config.endpoint, {
        query: queryParams.value
      })
      // Ensure we always return a valid object to prevent SSR warnings
      return result || { data: [], meta: { total: 0, per_page: 15, current_page: 1, last_page: 1, from: 0, to: 0 } }
    },
    {
      watch: [queryParams] // Refetch when params change
    }
  )

  // Computed data values
  const data = computed(() => response.value?.data || [])
  const meta = computed(() => response.value?.meta || null)
  const totalResults = computed(() => meta.value?.total || 0)

  // Check if any filters are active (excludes sort params and per_page)
  const hasActiveFilters = computed(() => {
    if (searchQuery.value.trim() !== '') return true

    // Filter out non-filter params (sort, pagination)
    const filterKeys = Object.keys(config.queryBuilder.value).filter(
      key => !['sort_by', 'sort_direction', 'per_page', 'page'].includes(key)
    )

    // Check if any actual filter params have values
    return filterKeys.some(key => {
      const value = config.queryBuilder.value[key]
      // Empty strings, null, undefined, empty arrays don't count as active
      if (value === null || value === undefined || value === '') return false
      if (Array.isArray(value) && value.length === 0) return false
      return true
    })
  })

  // Clear base filters (search + page)
  const clearFilters = () => {
    searchQuery.value = ''
    currentPage.value = 1
  }

  // URL sync: State → Route (bidirectional)
  watch([currentPage, searchQuery, config.queryBuilder], () => {
    const query: Record<string, string | number> = {}

    // Only include page if > 1
    if (currentPage.value > 1) {
      query.page = currentPage.value.toString()
    }

    // Only include search if present
    if (searchQuery.value) {
      query.q = searchQuery.value
    }

    // Merge custom filters
    Object.assign(query, config.queryBuilder.value)

    navigateTo({ query }, { replace: true })
  })

  // SEO setup
  useSeoMeta({
    title: config.seo.title,
    description: config.seo.description
  })

  useHead({
    title: config.seo.title
  })

  return {
    // State
    searchQuery,
    currentPage,

    // Data
    data,
    meta,
    totalResults,
    loading,
    error,

    // Methods
    refresh,
    clearFilters,

    // Computed
    hasActiveFilters
  }
}
