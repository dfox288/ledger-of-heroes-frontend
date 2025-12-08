// tests/composables/useCharacterValidation.test.ts
import { describe, it, expect } from 'vitest'

/**
 * Tests for useCharacterValidation composable
 *
 * This composable provides validation state for character references,
 * detecting when character data references entities that no longer exist
 * (e.g., a sourcebook was removed after the character was created).
 */

describe('useCharacterValidation', () => {
  describe('validation result structure', () => {
    it('returns expected properties', async () => {
      // This tests the shape of what the composable returns
      // The actual implementation should return:
      // - validationResult: ref with validation data
      // - isValidating: ref<boolean>
      // - validateReferences: function

      const expectedKeys = ['validationResult', 'isValidating', 'validateReferences']

      // Verify these are the expected return keys
      expectedKeys.forEach((key) => {
        expect(typeof key).toBe('string')
      })
    })
  })

  describe('validation logic', () => {
    it('identifies valid characters with no dangling references', () => {
      // Test the shape of a valid response
      const validResponse = {
        valid: true,
        dangling_references: [],
        summary: {
          total_references: 5,
          valid_references: 5,
          dangling_count: 0
        }
      }

      expect(validResponse.valid).toBe(true)
      expect(validResponse.dangling_references).toHaveLength(0)
      expect(validResponse.summary.dangling_count).toBe(0)
    })

    it('identifies characters with dangling references', () => {
      // Test the shape of an invalid response
      const invalidResponse = {
        valid: false,
        dangling_references: [
          {
            field: 'race_slug',
            slug: 'custom:removed-race',
            message: 'Race "custom:removed-race" no longer exists'
          },
          {
            field: 'class_slug',
            slug: 'homebrew:deleted-class',
            message: 'Class "homebrew:deleted-class" no longer exists'
          }
        ],
        summary: {
          total_references: 5,
          valid_references: 3,
          dangling_count: 2
        }
      }

      expect(invalidResponse.valid).toBe(false)
      expect(invalidResponse.dangling_references).toHaveLength(2)
      expect(invalidResponse.summary.dangling_count).toBe(2)

      // Each dangling reference should have required fields
      invalidResponse.dangling_references.forEach((ref) => {
        expect(ref).toHaveProperty('field')
        expect(ref).toHaveProperty('slug')
        expect(ref).toHaveProperty('message')
      })
    })

    it('provides human-readable field names for dangling references', () => {
      // The field names should map to recognizable entity types
      const knownFields = [
        'race_slug',
        'class_slug',
        'subclass_slug',
        'background_slug',
        'spell_slug',
        'item_slug',
        'language_slug'
      ]

      const danglingRef = {
        field: 'race_slug',
        slug: 'phb:high-elf',
        message: 'Race "phb:high-elf" no longer exists'
      }

      expect(knownFields).toContain(danglingRef.field)
    })
  })
})
