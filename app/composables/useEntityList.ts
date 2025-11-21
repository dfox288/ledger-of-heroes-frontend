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
  queryBuilder: ComputedRef<Record<string, any>>

  /** Items per page (default: 24) */
  perPage?: number

  /** SEO metadata */
  seo: {
    title: string
    description: string
  }

  /** Parse URL params on mount (default: true) */
  initialRoute?: boolean
}

/**
 * Return type for useEntityList composable
 */
export interface UseEntityListReturn {
  // Base State
  searchQuery: Ref<string>
  currentPage: Ref<number>

  // Data
  data: ComputedRef<Array<any>>
  meta: ComputedRef<PaginationMeta | null>
  totalResults: ComputedRef<number>
  loading: Ref<boolean>
  error: Ref<any>

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
    const params: Record<string, any> = {
      per_page: config.perPage ?? 24,
      page: currentPage.value,
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
  const { data: response, pending: loading, error, refresh } = useAsyncData(
    config.cacheKey,
    async () => {
      const result = await apiFetch(config.endpoint, {
        query: queryParams.value
      })
      return result
    },
    {
      watch: [queryParams]  // Refetch when params change
    }
  )

  // Computed data values
  const data = computed(() => response.value?.data || [])
  const meta = computed(() => response.value?.meta || null)
  const totalResults = computed(() => meta.value?.total || 0)

  // Check if any filters are active
  const hasActiveFilters = computed(() => {
    return searchQuery.value.trim() !== '' ||
           Object.keys(config.queryBuilder.value).length > 0
  })

  // Clear base filters (search + page)
  const clearFilters = () => {
    searchQuery.value = ''
    currentPage.value = 1
  }

  // URL sync: State → Route (bidirectional)
  watch([currentPage, searchQuery, config.queryBuilder], () => {
    const query: Record<string, any> = {}

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
    description: config.seo.description,
  })

  useHead({
    title: config.seo.title,
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
