import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useMeilisearchFilters } from '~/composables/useMeilisearchFilters'

describe('Spell Tag Filtering', () => {
  describe('useMeilisearchFilters with tag_slugs', () => {
    it('builds IN filter for single tag slug', () => {
      const selectedTags = ref(['ritual-caster'])

      const { queryParams } = useMeilisearchFilters([
        { ref: selectedTags, field: 'tag_slugs', type: 'in' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'tag_slugs IN [ritual-caster]'
      })
    })

    it('builds IN filter for multiple tag slugs', () => {
      const selectedTags = ref(['ritual-caster', 'touch-spells'])

      const { queryParams } = useMeilisearchFilters([
        { ref: selectedTags, field: 'tag_slugs', type: 'in' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'tag_slugs IN [ritual-caster, touch-spells]'
      })
    })

    it('skips when no tags selected', () => {
      const selectedTags = ref([])

      const { queryParams } = useMeilisearchFilters([
        { ref: selectedTags, field: 'tag_slugs', type: 'in' }
      ])

      expect(queryParams.value).toEqual({})
    })

    it('combines tag filter with other filters', () => {
      const selectedTags = ref(['ritual-caster'])
      const selectedLevel = ref(1)
      const concentrationFilter = ref('1')

      const { queryParams } = useMeilisearchFilters([
        { ref: selectedLevel, field: 'level' },
        { ref: concentrationFilter, field: 'concentration', type: 'boolean' },
        { ref: selectedTags, field: 'tag_slugs', type: 'in' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'level = 1 AND concentration = true AND tag_slugs IN [ritual-caster]'
      })
    })

    it('reactively updates when tags change', () => {
      const selectedTags = ref<string[]>([])

      const { queryParams } = useMeilisearchFilters([
        { ref: selectedTags, field: 'tag_slugs', type: 'in' }
      ])

      expect(queryParams.value).toEqual({})

      // Add first tag
      selectedTags.value = ['ritual-caster']
      expect(queryParams.value).toEqual({
        filter: 'tag_slugs IN [ritual-caster]'
      })

      // Add second tag
      selectedTags.value = ['ritual-caster', 'touch-spells']
      expect(queryParams.value).toEqual({
        filter: 'tag_slugs IN [ritual-caster, touch-spells]'
      })

      // Clear all tags
      selectedTags.value = []
      expect(queryParams.value).toEqual({})
    })
  })

  describe('tag filter state management', () => {
    it('initializes from query params - single tag', () => {
      const route = {
        query: { tag: 'ritual-caster' }
      }

      const selectedTags = ref<string[]>(
        route.query.tag
          ? (Array.isArray(route.query.tag) ? route.query.tag : [route.query.tag]) as string[]
          : []
      )

      expect(selectedTags.value).toEqual(['ritual-caster'])
    })

    it('initializes from query params - multiple tags', () => {
      const route = {
        query: { tag: ['ritual-caster', 'touch-spells'] }
      }

      const selectedTags = ref<string[]>(
        route.query.tag
          ? (Array.isArray(route.query.tag) ? route.query.tag : [route.query.tag]) as string[]
          : []
      )

      expect(selectedTags.value).toEqual(['ritual-caster', 'touch-spells'])
    })

    it('initializes empty when no query params', () => {
      const route = {
        query: {}
      }

      const selectedTags = ref<string[]>(
        route.query.tag
          ? (Array.isArray(route.query.tag) ? route.query.tag : [route.query.tag]) as string[]
          : []
      )

      expect(selectedTags.value).toEqual([])
    })
  })

  describe('tag chip removal', () => {
    it('removes single tag from filter', () => {
      const selectedTags = ref(['ritual-caster', 'touch-spells'])

      // Simulate chip removal
      selectedTags.value = selectedTags.value.filter(t => t !== 'ritual-caster')

      expect(selectedTags.value).toEqual(['touch-spells'])
    })

    it('clears all tags when last chip removed', () => {
      const selectedTags = ref(['ritual-caster'])

      selectedTags.value = selectedTags.value.filter(t => t !== 'ritual-caster')

      expect(selectedTags.value).toEqual([])
    })
  })

  describe('tag filter count', () => {
    it('counts active tag filters correctly', () => {
      const selectedTags = ref<string[]>([])

      // Helper to count non-empty arrays
      const countActiveFilters = (...filters: any[]) => {
        return filters.filter((f) => {
          if (Array.isArray(f.value)) return f.value.length > 0
          return f.value !== null && f.value !== undefined && f.value !== ''
        }).length
      }

      expect(countActiveFilters(selectedTags)).toBe(0)

      selectedTags.value = ['ritual-caster']
      expect(countActiveFilters(selectedTags)).toBe(1)

      selectedTags.value = ['ritual-caster', 'touch-spells']
      expect(countActiveFilters(selectedTags)).toBe(1) // Still counts as 1 filter (multi-select)
    })
  })

  describe('tag options data structure', () => {
    it('has correct structure for UI components', () => {
      const tagOptions = [
        { label: 'Ritual Caster', value: 'ritual-caster' },
        { label: 'Touch Spells', value: 'touch-spells' }
      ]

      expect(tagOptions).toHaveLength(2)
      expect(tagOptions[0]).toHaveProperty('label')
      expect(tagOptions[0]).toHaveProperty('value')
      expect(tagOptions[0].label).toBe('Ritual Caster')
      expect(tagOptions[0].value).toBe('ritual-caster')
    })
  })
})
