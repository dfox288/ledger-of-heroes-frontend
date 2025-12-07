import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useMeilisearchFilters } from '~/composables/useMeilisearchFilters'

describe('Level Range Filter', () => {
  describe('range mode', () => {
    it('builds range filter with min and max levels', () => {
      const filterMode = ref<'exact' | 'range'>('range')
      const minLevel = ref(1)
      const maxLevel = ref(3)

      const { queryParams } = useMeilisearchFilters([
        {
          field: 'level',
          type: 'range',
          min: minLevel,
          max: maxLevel,
          ref: filterMode
        }
      ])

      expect(queryParams.value).toEqual({
        filter: 'level >= 1 AND level <= 3'
      })
    })

    it('builds range filter with only min level', () => {
      const filterMode = ref<'exact' | 'range'>('range')
      const minLevel = ref(5)
      const maxLevel = ref(null)

      const { queryParams } = useMeilisearchFilters([
        {
          field: 'level',
          type: 'range',
          min: minLevel,
          max: maxLevel,
          ref: filterMode
        }
      ])

      expect(queryParams.value).toEqual({
        filter: 'level >= 5'
      })
    })

    it('builds range filter with only max level', () => {
      const filterMode = ref<'exact' | 'range'>('range')
      const minLevel = ref(null)
      const maxLevel = ref(3)

      const { queryParams } = useMeilisearchFilters([
        {
          field: 'level',
          type: 'range',
          min: minLevel,
          max: maxLevel,
          ref: filterMode
        }
      ])

      expect(queryParams.value).toEqual({
        filter: 'level <= 3'
      })
    })

    it('skips range filter when both min and max are null', () => {
      const filterMode = ref<'exact' | 'range'>('range')
      const minLevel = ref(null)
      const maxLevel = ref(null)

      const { queryParams } = useMeilisearchFilters([
        {
          field: 'level',
          type: 'range',
          min: minLevel,
          max: maxLevel,
          ref: filterMode
        }
      ])

      expect(queryParams.value).toEqual({})
    })
  })

  describe('exact mode with fallback', () => {
    it('builds exact filter when selectedLevel is set', () => {
      const selectedLevel = ref(3)

      const { queryParams } = useMeilisearchFilters([
        { ref: selectedLevel, field: 'level' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'level = 3'
      })
    })

    it('skips exact filter when selectedLevel is null', () => {
      const selectedLevel = ref(null)

      const { queryParams } = useMeilisearchFilters([
        { ref: selectedLevel, field: 'level' }
      ])

      expect(queryParams.value).toEqual({})
    })
  })

  describe('reactivity', () => {
    it('updates filter when min level changes', () => {
      const filterMode = ref<'exact' | 'range'>('range')
      const minLevel = ref(1)
      const maxLevel = ref(3)

      const { queryParams } = useMeilisearchFilters([
        {
          field: 'level',
          type: 'range',
          min: minLevel,
          max: maxLevel,
          ref: filterMode
        }
      ])

      expect(queryParams.value).toEqual({
        filter: 'level >= 1 AND level <= 3'
      })

      minLevel.value = 5

      expect(queryParams.value).toEqual({
        filter: 'level >= 5 AND level <= 3'
      })
    })

    it('updates filter when max level changes', () => {
      const filterMode = ref<'exact' | 'range'>('range')
      const minLevel = ref(1)
      const maxLevel = ref(3)

      const { queryParams } = useMeilisearchFilters([
        {
          field: 'level',
          type: 'range',
          min: minLevel,
          max: maxLevel,
          ref: filterMode
        }
      ])

      expect(queryParams.value).toEqual({
        filter: 'level >= 1 AND level <= 3'
      })

      maxLevel.value = 9

      expect(queryParams.value).toEqual({
        filter: 'level >= 1 AND level <= 9'
      })
    })
  })
})
