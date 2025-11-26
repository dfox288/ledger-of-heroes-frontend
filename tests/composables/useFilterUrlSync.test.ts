import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

// Must import after mocks
import { useFilterUrlSync } from '~/composables/useFilterUrlSync'

// Mock vue-router
const mockReplace = vi.fn()
const mockRoute = ref({ query: {} })

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute.value,
  useRouter: () => ({ replace: mockReplace })
}))

describe('useFilterUrlSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.value = { query: {} }
  })

  describe('hasUrlParams', () => {
    it('returns false when no query params', () => {
      const { hasUrlParams } = useFilterUrlSync()
      expect(hasUrlParams.value).toBe(false)
    })

    it('returns true when query params exist', () => {
      mockRoute.value = { query: { level: '3' } }
      const { hasUrlParams } = useFilterUrlSync()
      expect(hasUrlParams.value).toBe(true)
    })
  })

  describe('syncToUrl', () => {
    it('updates URL with query object', () => {
      const { syncToUrl } = useFilterUrlSync()

      syncToUrl({ level: '3', school: 'evocation' })

      expect(mockReplace).toHaveBeenCalledWith({
        query: { level: '3', school: 'evocation' }
      })
    })

    it('removes empty values from URL', () => {
      const { syncToUrl } = useFilterUrlSync()

      syncToUrl({ level: '3', school: null, empty: '' })

      expect(mockReplace).toHaveBeenCalledWith({
        query: { level: '3' }
      })
    })

    it('handles array values', () => {
      const { syncToUrl } = useFilterUrlSync()

      syncToUrl({ sources: ['PHB', 'XGTE'] })

      expect(mockReplace).toHaveBeenCalledWith({
        query: { sources: ['PHB', 'XGTE'] }
      })
    })
  })

  describe('clearUrl', () => {
    it('removes all query params', () => {
      mockRoute.value = { query: { level: '3', school: 'evocation' } }
      const { clearUrl } = useFilterUrlSync()

      clearUrl()

      expect(mockReplace).toHaveBeenCalledWith({ query: {} })
    })
  })
})
