import { describe, it, expect, beforeEach, vi } from 'vitest'
import { idbStorage } from '~/utils/idbStorage'

// Mock idb-keyval for testing (IndexedDB not available in jsdom)
vi.mock('idb-keyval', () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn()
}))

import { get, set, del } from 'idb-keyval'

describe('idbStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getItem', () => {
    it('returns value from IndexedDB', async () => {
      vi.mocked(get).mockResolvedValue('{"test": "value"}')

      const result = await idbStorage.getItem('test-key')

      expect(get).toHaveBeenCalledWith('test-key')
      expect(result).toBe('{"test": "value"}')
    })

    it('returns null when key not found', async () => {
      vi.mocked(get).mockResolvedValue(undefined)

      const result = await idbStorage.getItem('missing-key')

      expect(result).toBeNull()
    })

    it('returns null on error', async () => {
      vi.mocked(get).mockRejectedValue(new Error('IndexedDB error'))

      const result = await idbStorage.getItem('error-key')

      expect(result).toBeNull()
    })
  })

  describe('setItem', () => {
    it('stores value in IndexedDB', async () => {
      vi.mocked(set).mockResolvedValue(undefined)

      await idbStorage.setItem('test-key', '{"data": 123}')

      expect(set).toHaveBeenCalledWith('test-key', '{"data": 123}')
    })

    it('handles errors gracefully', async () => {
      vi.mocked(set).mockRejectedValue(new Error('Quota exceeded'))

      // Should not throw
      await expect(idbStorage.setItem('test-key', 'value')).resolves.toBeUndefined()
    })
  })

  describe('removeItem', () => {
    it('removes key from IndexedDB', async () => {
      vi.mocked(del).mockResolvedValue(undefined)

      await idbStorage.removeItem('test-key')

      expect(del).toHaveBeenCalledWith('test-key')
    })

    it('handles errors gracefully', async () => {
      vi.mocked(del).mockRejectedValue(new Error('Delete failed'))

      // Should not throw
      await expect(idbStorage.removeItem('test-key')).resolves.toBeUndefined()
    })
  })
})
