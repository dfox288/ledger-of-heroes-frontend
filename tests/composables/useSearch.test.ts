import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSearch } from '~/composables/useSearch'
import type { SearchResult } from '~/types/search'

// Create a mock function that will persist across all tests
const mockApiFetch = vi.fn()

// Mock useApi composable to return our mock function
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    apiFetch: mockApiFetch
  })
}))

describe('useSearch', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  it('initializes with null results, not loading, and no error', () => {
    const { results, loading, error } = useSearch()

    expect(results.value).toBeNull()
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('sets loading state while searching', async () => {
    // Mock apiFetch to return after a delay
    mockApiFetch.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ data: { spells: [] } }), 100)
      })
    })

    const { search, loading } = useSearch()

    const searchPromise = search('fireball')
    expect(loading.value).toBe(true)

    await searchPromise
    expect(loading.value).toBe(false)
  })

  it('fetches and returns search results successfully', async () => {
    const mockData: SearchResult = {
      data: {
        spells: [
          {
            id: 1,
            slug: 'fireball',
            name: 'Fireball',
            level: 3,
            casting_time: '1 action',
            range: '150 feet',
            components: 'V, S, M',
            material_components: 'a tiny ball of bat guano and sulfur',
            duration: 'Instantaneous',
            needs_concentration: false,
            is_ritual: false,
            description: 'A bright streak flashes...',
            higher_levels: 'When you cast this spell...',
          },
        ],
      },
    }

    mockApiFetch.mockResolvedValue(mockData)

    const { search, results, error } = useSearch()
    await search('fireball')

    expect(results.value).toEqual(mockData)
    expect(error.value).toBeNull()
  })

  it('handles API errors gracefully', async () => {
    const errorMessage = 'Network error'
    mockApiFetch.mockRejectedValue(new Error(errorMessage))

    const { search, results, error } = useSearch()
    await search('fireball')

    expect(results.value).toBeNull()
    expect(error.value).toBe(errorMessage)
  })

  it('clears results when query is empty', async () => {
    const { search, results } = useSearch()

    // Initially set some results
    mockApiFetch.mockResolvedValue({ data: { spells: [] } })
    await search('fire')
    expect(results.value).not.toBeNull()

    // Search with empty query should clear
    await search('')
    expect(results.value).toBeNull()
  })

  it('passes entity type filters to API', async () => {
    mockApiFetch.mockResolvedValue({ data: {} })

    const { search } = useSearch()
    await search('dragon', { types: ['spells', 'items'] })

    expect(mockApiFetch).toHaveBeenCalledWith(
      '/search',
      expect.objectContaining({
        query: expect.objectContaining({
          q: 'dragon',
          types: ['spells', 'items'],
        }),
      })
    )
  })

  it('passes limit parameter to API', async () => {
    mockApiFetch.mockResolvedValue({ data: {} })

    const { search } = useSearch()
    await search('sword', { limit: 5 })

    expect(mockApiFetch).toHaveBeenCalledWith(
      '/search',
      expect.objectContaining({
        query: expect.objectContaining({
          q: 'sword',
          limit: 5,
        }),
      })
    )
  })

  it('clears results using clearResults method', async () => {
    mockApiFetch.mockResolvedValue({ data: { spells: [] } })

    const { search, results, clearResults } = useSearch()

    await search('fireball')
    expect(results.value).not.toBeNull()

    clearResults()
    expect(results.value).toBeNull()
  })
})
