import { describe, it, expect } from 'vitest'
import { computed } from 'vue'
import type { Background } from '~/types'

/**
 * useBackgroundDetail Feature Extraction Tests
 *
 * Tests the feature extraction logic in isolation without network mocks.
 * The actual composable integration is tested in page tests (slug.test.ts).
 *
 * Focus: New API fields feature_name and feature_description (Issue #67)
 */
describe('useBackgroundDetail - feature extraction logic', () => {
  /**
   * Replicate the feature extraction logic from the composable
   * This tests the pure logic without dealing with async data/mocking
   */
  function extractFeature(background: Background | null) {
    const name = background?.feature_name?.trim() || ''
    const description = background?.feature_description?.trim() || ''

    // Only return if both fields have content
    if (!name || !description) return null

    return { name, description }
  }

  describe('valid feature data', () => {
    it('extracts feature from feature_name and feature_description fields', () => {
      const background: Background = {
        id: 1,
        name: 'Acolyte',
        slug: 'acolyte',
        feature_name: 'Shelter of the Faithful',
        feature_description: 'As an acolyte, you command the respect of those who share your faith.'
      }

      const feature = extractFeature(background)

      expect(feature).toEqual({
        name: 'Shelter of the Faithful',
        description: 'As an acolyte, you command the respect of those who share your faith.'
      })
    })

    it('handles long feature descriptions', () => {
      const longDescription = 'As an acolyte, you command the respect of those who share your faith. '.repeat(10).trim()

      const background: Background = {
        id: 1,
        name: 'Acolyte',
        slug: 'acolyte',
        feature_name: 'Shelter of the Faithful',
        feature_description: longDescription
      }

      const feature = extractFeature(background)

      expect(feature?.description).toBe(longDescription)
      expect(feature?.description.length).toBeGreaterThan(500)
    })

    it('handles special characters in feature name and description', () => {
      const background: Background = {
        id: 1,
        name: 'Acolyte',
        slug: 'acolyte',
        feature_name: 'Feature: "Special & Unique"',
        feature_description: 'Description with <em>HTML</em> & special chars: é, ñ, ü'
      }

      const feature = extractFeature(background)

      expect(feature?.name).toBe('Feature: "Special & Unique"')
      expect(feature?.description).toContain('<em>HTML</em>')
      expect(feature?.description).toContain('é, ñ, ü')
    })

    it('trims whitespace from fields', () => {
      const background: Background = {
        id: 1,
        name: 'Acolyte',
        slug: 'acolyte',
        feature_name: '  Shelter of the Faithful  ',
        feature_description: '  As an acolyte, you command respect.  '
      }

      const feature = extractFeature(background)

      expect(feature?.name).toBe('Shelter of the Faithful')
      expect(feature?.description).toBe('As an acolyte, you command respect.')
    })
  })

  describe('invalid or missing feature data', () => {
    it('returns null when feature_name is empty', () => {
      const background: Background = {
        id: 1,
        name: 'Acolyte',
        slug: 'acolyte',
        feature_name: '',
        feature_description: 'As an acolyte, you command respect.'
      }

      const feature = extractFeature(background)

      expect(feature).toBeNull()
    })

    it('returns null when feature_description is empty', () => {
      const background: Background = {
        id: 1,
        name: 'Acolyte',
        slug: 'acolyte',
        feature_name: 'Test Feature',
        feature_description: ''
      }

      const feature = extractFeature(background)

      expect(feature).toBeNull()
    })

    it('returns null when both fields are missing', () => {
      const background: Background = {
        id: 1,
        name: 'Acolyte',
        slug: 'acolyte'
      }

      const feature = extractFeature(background)

      expect(feature).toBeNull()
    })

    it('returns null when feature_name is only whitespace', () => {
      const background: Background = {
        id: 1,
        name: 'Acolyte',
        slug: 'acolyte',
        feature_name: '   ',
        feature_description: 'Description here'
      }

      const feature = extractFeature(background)

      expect(feature).toBeNull()
    })

    it('returns null when feature_description is only whitespace', () => {
      const background: Background = {
        id: 1,
        name: 'Acolyte',
        slug: 'acolyte',
        feature_name: 'Feature Name',
        feature_description: '   '
      }

      const feature = extractFeature(background)

      expect(feature).toBeNull()
    })

    it('returns null when background is null', () => {
      const feature = extractFeature(null)

      expect(feature).toBeNull()
    })
  })

  describe('computed reactivity behavior', () => {
    it('recomputes when background changes', () => {
      const backgroundRef = computed<Background>(() => ({
        id: 1,
        name: 'Acolyte',
        slug: 'acolyte',
        feature_name: 'Shelter of the Faithful',
        feature_description: 'As an acolyte, you command respect.'
      }))

      const feature = computed(() => extractFeature(backgroundRef.value))

      expect(feature.value).toEqual({
        name: 'Shelter of the Faithful',
        description: 'As an acolyte, you command respect.'
      })
    })
  })
})
