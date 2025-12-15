import { describe, it, expect } from 'vitest'
import { useCharacterSlug } from '~/composables/useCharacterSlug'

describe('useCharacterSlug', () => {
  describe('generateSlug', () => {
    it('generates slug in expected format', () => {
      const { generateSlug } = useCharacterSlug()

      const slug = generateSlug()

      // Format: word-word-XXXX (alphanumeric suffix)
      expect(slug).toMatch(/^[a-z]+-[a-z]+-[A-Za-z0-9]{4}$/)
    })

    it('generates different slugs on each call', () => {
      const { generateSlug } = useCharacterSlug()

      const slugs = new Set<string>()
      for (let i = 0; i < 100; i++) {
        slugs.add(generateSlug())
      }

      // With ~31.8 billion possibilities, 100 calls should always be unique
      expect(slugs.size).toBe(100)
    })

    it('uses lowercase words', () => {
      const { generateSlug } = useCharacterSlug()

      const slug = generateSlug()
      const parts = slug.split('-')

      // First two parts should be lowercase words
      expect(parts[0]).toMatch(/^[a-z]+$/)
      expect(parts[1]).toMatch(/^[a-z]+$/)
    })

    it('suffix is exactly 4 characters', () => {
      const { generateSlug } = useCharacterSlug()

      const slug = generateSlug()
      const parts = slug.split('-')
      const suffix = parts[2]

      expect(suffix).toHaveLength(4)
    })

    it('suffix contains only alphanumeric characters (no _ or -)', () => {
      const { generateSlug } = useCharacterSlug()

      // Generate many slugs to ensure consistent behavior
      for (let i = 0; i < 50; i++) {
        const slug = generateSlug()
        const suffix = slug.split('-')[2]

        expect(suffix).toMatch(/^[A-Za-z0-9]+$/)
        expect(suffix).not.toContain('_')
        expect(suffix).not.toContain('-')
      }
    })
  })

  describe('isValidSlug', () => {
    it('returns true for valid slugs', () => {
      const { isValidSlug } = useCharacterSlug()

      // Valid examples
      expect(isValidSlug('shadow-warden-q3x9')).toBe(true)
      expect(isValidSlug('arcane-phoenix-M7k2')).toBe(true)
      expect(isValidSlug('divine-sentinel-ABCD')).toBe(true)
      expect(isValidSlug('iron-guard-1234')).toBe(true)
      expect(isValidSlug('fire-blade-aA1z')).toBe(true)
    })

    it('returns false for slugs with uppercase words', () => {
      const { isValidSlug } = useCharacterSlug()

      expect(isValidSlug('Shadow-warden-q3x9')).toBe(false)
      expect(isValidSlug('shadow-Warden-q3x9')).toBe(false)
      expect(isValidSlug('SHADOW-WARDEN-q3x9')).toBe(false)
    })

    it('returns false for slugs with wrong suffix length', () => {
      const { isValidSlug } = useCharacterSlug()

      expect(isValidSlug('shadow-warden-q3')).toBe(false) // Too short
      expect(isValidSlug('shadow-warden-q3x9a')).toBe(false) // Too long
      expect(isValidSlug('shadow-warden-')).toBe(false) // Empty
    })

    it('returns false for slugs with special characters in suffix', () => {
      const { isValidSlug } = useCharacterSlug()

      expect(isValidSlug('shadow-warden-q3_9')).toBe(false) // Underscore
      expect(isValidSlug('shadow-warden-q3-9')).toBe(false) // Hyphen
      expect(isValidSlug('shadow-warden-q3$9')).toBe(false) // Special char
    })

    it('returns false for slugs with wrong number of parts', () => {
      const { isValidSlug } = useCharacterSlug()

      expect(isValidSlug('shadow-q3x9')).toBe(false) // Two parts
      expect(isValidSlug('shadow-warden-guard-q3x9')).toBe(false) // Four parts
      expect(isValidSlug('shadowwardenq3x9')).toBe(false) // No hyphens
    })

    it('returns false for empty string', () => {
      const { isValidSlug } = useCharacterSlug()

      expect(isValidSlug('')).toBe(false)
    })

    it('returns false for slugs with numbers in words', () => {
      const { isValidSlug } = useCharacterSlug()

      expect(isValidSlug('shadow1-warden-q3x9')).toBe(false)
      expect(isValidSlug('shadow-warden2-q3x9')).toBe(false)
    })

    it('returns false for slugs with spaces', () => {
      const { isValidSlug } = useCharacterSlug()

      expect(isValidSlug('shadow warden-q3x9')).toBe(false)
      expect(isValidSlug('shadow-warden -q3x9')).toBe(false)
    })

    it('validates generated slugs correctly', () => {
      const { generateSlug, isValidSlug } = useCharacterSlug()

      // All generated slugs should be valid
      for (let i = 0; i < 50; i++) {
        const slug = generateSlug()
        expect(isValidSlug(slug)).toBe(true)
      }
    })
  })

  describe('composable structure', () => {
    it('returns generateSlug and isValidSlug functions', () => {
      const result = useCharacterSlug()

      expect(result).toHaveProperty('generateSlug')
      expect(result).toHaveProperty('isValidSlug')
      expect(typeof result.generateSlug).toBe('function')
      expect(typeof result.isValidSlug).toBe('function')
    })
  })
})
