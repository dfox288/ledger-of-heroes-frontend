import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { PaginationMeta, UseEntityListConfig } from '~/composables/useEntityList'

// Mock Nuxt composables - must be at module level with inline functions
mockNuxtImport('useApi', () => () => ({
  apiFetch: vi.fn().mockResolvedValue({
    data: [],
    meta: { total: 0, from: 0, to: 0, current_page: 1, last_page: 1, per_page: 24 }
  })
}))

// Store route query as mutable object
const routeQuery: Record<string, string> = {}
mockNuxtImport('useRoute', () => () => ({ query: routeQuery }))

mockNuxtImport('navigateTo', () => vi.fn())
mockNuxtImport('useSeoMeta', () => vi.fn())
mockNuxtImport('useHead', () => vi.fn())

// Mock useAsyncData with proper structure
mockNuxtImport('useAsyncData', () => () => ({
  data: ref({ data: [], meta: { total: 0, from: 0, to: 0, current_page: 1, last_page: 1, per_page: 24 } }),
  pending: ref(false),
  error: ref(null),
  refresh: vi.fn()
}))

describe('useEntityList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear route query by removing all keys
    Object.keys(routeQuery).forEach((key) => {
      Reflect.deleteProperty(routeQuery, key)
    })
  })

  describe('TypeScript types', () => {
    it('exports PaginationMeta interface with correct shape', () => {
      const meta: PaginationMeta = {
        total: 100,
        from: 1,
        to: 24,
        current_page: 1,
        last_page: 5,
        per_page: 24
      }

      expect(meta.total).toBe(100)
      expect(meta.per_page).toBe(24)
      expect(meta.last_page).toBe(5)
    })

    it('exports UseEntityListConfig interface with required properties', () => {
      const config: UseEntityListConfig = {
        endpoint: '/spells',
        cacheKey: 'spells-list',
        queryBuilder: computed(() => ({})),
        seo: {
          title: 'Spells',
          description: 'Browse spells'
        }
      }

      expect(config.endpoint).toBe('/spells')
      expect(config.cacheKey).toBe('spells-list')
      expect(config.seo.title).toBe('Spells')
    })

    it('accepts optional config properties', () => {
      const externalSearch = ref('fireball')
      const config: UseEntityListConfig = {
        endpoint: '/spells',
        cacheKey: 'spells-list',
        queryBuilder: computed(() => ({})),
        searchQuery: externalSearch,
        perPage: 12,
        initialRoute: false,
        noPagination: true,
        seo: {
          title: 'Spells',
          description: 'Browse spells'
        }
      }

      expect(config.searchQuery).toBe(externalSearch)
      expect(config.perPage).toBe(12)
      expect(config.initialRoute).toBe(false)
      expect(config.noPagination).toBe(true)
    })
  })

  describe('composable behavior', () => {
    it('returns correct structure', async () => {
      const { useEntityList } = await import('~/composables/useEntityList')

      const result = useEntityList({
        endpoint: '/spells',
        cacheKey: 'spells-list',
        queryBuilder: computed(() => ({})),
        seo: { title: 'Spells', description: 'Test' }
      })

      // Check all expected return properties exist
      expect(result).toHaveProperty('searchQuery')
      expect(result).toHaveProperty('currentPage')
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('meta')
      expect(result).toHaveProperty('totalResults')
      expect(result).toHaveProperty('loading')
      expect(result).toHaveProperty('error')
      expect(result).toHaveProperty('refresh')
      expect(result).toHaveProperty('clearFilters')
      expect(result).toHaveProperty('hasActiveFilters')
    })

    it('initializes with default values', async () => {
      const { useEntityList } = await import('~/composables/useEntityList')

      const result = useEntityList({
        endpoint: '/spells',
        cacheKey: 'spells-list',
        queryBuilder: computed(() => ({})),
        seo: { title: 'Spells', description: 'Test' }
      })

      expect(result.searchQuery.value).toBe('')
      expect(result.currentPage.value).toBe(1)
      expect(result.hasActiveFilters.value).toBe(false)
    })

    it('clearFilters resets search and page', async () => {
      const { useEntityList } = await import('~/composables/useEntityList')

      const result = useEntityList({
        endpoint: '/spells',
        cacheKey: 'spells-list',
        queryBuilder: computed(() => ({})),
        seo: { title: 'Spells', description: 'Test' }
      })

      // Set some values
      result.searchQuery.value = 'fireball'
      result.currentPage.value = 3

      // Clear filters
      result.clearFilters()

      expect(result.searchQuery.value).toBe('')
      expect(result.currentPage.value).toBe(1)
    })

    it('hasActiveFilters returns true when search has value', async () => {
      const { useEntityList } = await import('~/composables/useEntityList')

      const result = useEntityList({
        endpoint: '/spells',
        cacheKey: 'spells-list',
        queryBuilder: computed(() => ({})),
        seo: { title: 'Spells', description: 'Test' }
      })

      result.searchQuery.value = 'fireball'

      expect(result.hasActiveFilters.value).toBe(true)
    })

    it('hasActiveFilters returns true when queryBuilder has filters', async () => {
      const { useEntityList } = await import('~/composables/useEntityList')
      const levelFilter = ref(3)

      const result = useEntityList({
        endpoint: '/spells',
        cacheKey: 'spells-list',
        queryBuilder: computed(() => ({
          filter: levelFilter.value ? `level = ${levelFilter.value}` : null
        })),
        seo: { title: 'Spells', description: 'Test' }
      })

      expect(result.hasActiveFilters.value).toBe(true)
    })

    it('hasActiveFilters ignores empty arrays in queryBuilder', async () => {
      const { useEntityList } = await import('~/composables/useEntityList')

      const result = useEntityList({
        endpoint: '/spells',
        cacheKey: 'spells-list',
        queryBuilder: computed(() => ({
          tags: [],
          school: null,
          level: undefined
        })),
        seo: { title: 'Spells', description: 'Test' }
      })

      expect(result.hasActiveFilters.value).toBe(false)
    })

    it('uses external searchQuery when provided', async () => {
      const { useEntityList } = await import('~/composables/useEntityList')
      const externalSearch = ref('magic missile')

      const result = useEntityList({
        endpoint: '/spells',
        cacheKey: 'spells-list',
        queryBuilder: computed(() => ({})),
        searchQuery: externalSearch,
        seo: { title: 'Spells', description: 'Test' }
      })

      expect(result.searchQuery.value).toBe('magic missile')

      // Modifying external ref should affect result
      externalSearch.value = 'fireball'
      expect(result.searchQuery.value).toBe('fireball')
    })

    it('initializes from route query params', async () => {
      // Set up route with query params
      routeQuery.q = 'shield'
      routeQuery.page = '2'

      const { useEntityList } = await import('~/composables/useEntityList')

      const result = useEntityList({
        endpoint: '/spells',
        cacheKey: 'spells-list',
        queryBuilder: computed(() => ({})),
        seo: { title: 'Spells', description: 'Test' }
      })

      expect(result.searchQuery.value).toBe('shield')
      expect(result.currentPage.value).toBe(2)
    })

    it('skips route initialization when initialRoute is false', async () => {
      routeQuery.q = 'shield'
      routeQuery.page = '2'

      const { useEntityList } = await import('~/composables/useEntityList')

      const result = useEntityList({
        endpoint: '/spells',
        cacheKey: 'spells-list',
        queryBuilder: computed(() => ({})),
        initialRoute: false,
        seo: { title: 'Spells', description: 'Test' }
      })

      expect(result.searchQuery.value).toBe('')
      expect(result.currentPage.value).toBe(1)
    })
  })
})

/**
 * Integration testing notes:
 *
 * Full integration tests for useEntityList are performed in page component tests:
 * - tests/pages/spells/index.test.ts
 * - tests/pages/items/index.test.ts
 * - tests/pages/monsters/index.test.ts
 *
 * These tests cover:
 * - Actual API calls with query params
 * - URL sync behavior
 * - Data display and pagination
 * - SEO meta tags
 * - Loading and error states
 */
