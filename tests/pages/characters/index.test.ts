/**
 * Character List Page Tests
 *
 * Tests for character list page with pagination and search functionality.
 * GitHub Issue: #349
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { ref, computed } from 'vue'
import CharacterListPage from '~/pages/characters/index.vue'
import type { CharacterSummary } from '~/types'

// Mock character data
const mockCharacters: CharacterSummary[] = [
  {
    id: 1,
    public_id: 'mighty-wizard-abc1',
    name: 'Gandalf the Grey',
    level: 5,
    total_level: 5,
    is_multiclass: false,
    is_complete: true,
    race: { id: 1, name: 'Human', slug: 'human' },
    class: { id: 1, name: 'Wizard', slug: 'wizard', equipment: [] },
    classes: [],
    background: { id: 1, name: 'Sage', slug: 'sage' },
    portrait: {
      original: 'http://localhost:8080/storage/1/gandalf.webp',
      thumb: 'http://localhost:8080/storage/1/conversions/gandalf-thumb.webp',
      medium: 'http://localhost:8080/storage/1/conversions/gandalf-medium.webp',
      is_uploaded: true
    }
  },
  {
    id: 2,
    public_id: 'swift-rogue-def2',
    name: 'Bilbo Baggins',
    level: 3,
    total_level: 3,
    is_multiclass: false,
    is_complete: true,
    race: { id: 2, name: 'Halfling', slug: 'halfling' },
    class: { id: 2, name: 'Rogue', slug: 'rogue', equipment: [] },
    classes: [],
    background: { id: 2, name: 'Criminal', slug: 'criminal' },
    portrait: null
  },
  {
    id: 3,
    public_id: 'brave-paladin-ghi3',
    name: 'Aragorn',
    level: 8,
    total_level: 8,
    is_multiclass: false,
    is_complete: true,
    race: { id: 1, name: 'Human', slug: 'human' },
    class: { id: 3, name: 'Paladin', slug: 'paladin', equipment: [] },
    classes: [],
    background: { id: 3, name: 'Noble', slug: 'noble' },
    portrait: null
  }
] as CharacterSummary[]

// Mutable mock state - updated by tests
let mockData: CharacterSummary[] = mockCharacters
let mockMeta = {
  total: 3,
  from: 1,
  to: 3,
  current_page: 1,
  last_page: 1,
  per_page: 15
}
let mockLoading = false
let mockError: Error | null = null
let mockSearchQuery = ''

// Mock useEntityList composable (called once at module level)
mockNuxtImport('useEntityList', () => {
  return vi.fn(() => {
    const searchQuery = ref(mockSearchQuery)
    const currentPage = ref(1)

    return {
      searchQuery,
      currentPage,
      data: computed(() => mockData),
      meta: computed(() => mockMeta),
      totalResults: computed(() => mockMeta.total),
      loading: computed(() => mockLoading),
      error: computed(() => mockError),
      refresh: vi.fn(),
      clearFilters: vi.fn(() => {
        searchQuery.value = ''
        currentPage.value = 1
      }),
      hasActiveFilters: computed(() => searchQuery.value !== '')
    }
  })
})

describe('CharacterListPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Reset mock state before each test
    mockData = mockCharacters
    mockMeta = {
      total: 3,
      from: 1,
      to: 3,
      current_page: 1,
      last_page: 1,
      per_page: 15
    }
    mockLoading = false
    mockError = null
    mockSearchQuery = ''
  })

  // ===========================================================================
  // Basic Rendering
  // ===========================================================================
  describe('basic rendering', () => {
    it('renders the page title', async () => {
      const wrapper = await mountSuspended(CharacterListPage)
      expect(wrapper.text()).toContain('Your Characters')
    })

    it('shows create button', async () => {
      const wrapper = await mountSuspended(CharacterListPage)
      expect(wrapper.text()).toContain('Create Character')
    })

    it('displays character cards when characters exist', async () => {
      const wrapper = await mountSuspended(CharacterListPage)
      // Should show character names
      expect(wrapper.text()).toContain('Gandalf')
      expect(wrapper.text()).toContain('Bilbo')
      expect(wrapper.text()).toContain('Aragorn')
    })
  })

  // ===========================================================================
  // Search Functionality
  // ===========================================================================
  describe('search functionality', () => {
    it('renders search input', async () => {
      const wrapper = await mountSuspended(CharacterListPage)
      const searchInput = wrapper.find('input[placeholder*="Search"]')
      expect(searchInput.exists()).toBe(true)
    })

    it('search input has correct placeholder', async () => {
      const wrapper = await mountSuspended(CharacterListPage)
      const searchInput = wrapper.find('input[placeholder*="Search"]')
      expect(searchInput.attributes('placeholder')).toBe('Search characters...')
    })
  })

  // ===========================================================================
  // Pagination
  // ===========================================================================
  describe('pagination', () => {
    it('shows results count', async () => {
      const wrapper = await mountSuspended(CharacterListPage)
      // Should show "Showing 1-3 of 3 characters" or similar
      expect(wrapper.text()).toMatch(/showing|1.*3/i)
    })

    it('displays pagination when multiple pages exist', async () => {
      mockMeta = {
        total: 30,
        from: 1,
        to: 15,
        current_page: 1,
        last_page: 2,
        per_page: 15
      }

      const wrapper = await mountSuspended(CharacterListPage)
      // Should have pagination component
      const pagination = wrapper.findComponent({ name: 'UiListPagination' })
      expect(pagination.exists()).toBe(true)
    })
  })

  // ===========================================================================
  // Empty and Loading States
  // ===========================================================================
  describe('states', () => {
    it('shows empty state when no characters', async () => {
      mockData = []
      mockMeta = { ...mockMeta, total: 0, from: 0, to: 0 }

      const wrapper = await mountSuspended(CharacterListPage)
      expect(wrapper.text()).toContain('No characters')
    })

    it('shows loading state when pending', async () => {
      mockLoading = true
      mockData = []

      const wrapper = await mountSuspended(CharacterListPage)
      // Should show skeleton or loading indicator
      const skeleton = wrapper.findComponent({ name: 'UiListSkeletonCards' })
      expect(skeleton.exists()).toBe(true)
    })

    it('shows error state when fetch fails', async () => {
      mockError = new Error('Failed to load characters')
      mockData = []

      const wrapper = await mountSuspended(CharacterListPage)
      expect(wrapper.text()).toContain('Failed')
    })

    it('shows create button in empty state', async () => {
      mockData = []
      mockMeta = { ...mockMeta, total: 0, from: 0, to: 0 }

      const wrapper = await mountSuspended(CharacterListPage)
      // Should have create button even in empty state
      const createButton = wrapper.find('a[href="/characters/create"]')
      expect(createButton.exists()).toBe(true)
    })
  })
})
