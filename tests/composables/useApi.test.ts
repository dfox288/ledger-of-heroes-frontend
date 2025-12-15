import { describe, it, expect } from 'vitest'
import { normalizeEndpoint, useApi } from '~/composables/useApi'

describe('useApi', () => {
  describe('normalizeEndpoint', () => {
    it('strips /api/v1/ prefix from endpoint', () => {
      const result = normalizeEndpoint('/api/v1/characters/1/spells')
      expect(result).toBe('/characters/1/spells')
    })

    it('strips /api/v1 prefix without trailing slash', () => {
      const result = normalizeEndpoint('/api/v1')
      expect(result).toBe('')
    })

    it('returns endpoint unchanged if no /api/v1 prefix', () => {
      const result = normalizeEndpoint('/characters/1/spells')
      expect(result).toBe('/characters/1/spells')
    })

    it('handles root endpoint without prefix', () => {
      const result = normalizeEndpoint('/spells')
      expect(result).toBe('/spells')
    })

    it('handles empty string', () => {
      const result = normalizeEndpoint('')
      expect(result).toBe('')
    })

    it('handles endpoint with query params', () => {
      const result = normalizeEndpoint('/api/v1/spells?level=3&school=evocation')
      expect(result).toBe('/spells?level=3&school=evocation')
    })

    it('does not strip partial /api/v prefix', () => {
      const result = normalizeEndpoint('/api/v2/spells')
      expect(result).toBe('/api/v2/spells')
    })

    it('only strips /api/v1 at start of string', () => {
      const result = normalizeEndpoint('/characters/api/v1/data')
      expect(result).toBe('/characters/api/v1/data')
    })
  })

  describe('useApi composable', () => {
    it('returns an object with apiFetch', () => {
      const api = useApi()

      expect(api).toHaveProperty('apiFetch')
      expect(typeof api.apiFetch).toBe('function')
    })

    it('apiFetch is callable', () => {
      const api = useApi()

      // apiFetch should be a function created by $fetch.create()
      expect(api.apiFetch).toBeDefined()
      expect(typeof api.apiFetch).toBe('function')
    })
  })
})
