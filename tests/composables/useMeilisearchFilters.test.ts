import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useMeilisearchFilters } from '~/composables/useMeilisearchFilters'

describe('useMeilisearchFilters', () => {
  describe('equals filter', () => {
    it('builds filter for single value', () => {
      const levelRef = ref(3)

      const { queryParams } = useMeilisearchFilters([
        { ref: levelRef, field: 'level' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'level = 3'
      })
    })

    it('skips null values', () => {
      const levelRef = ref(null)

      const { queryParams } = useMeilisearchFilters([
        { ref: levelRef, field: 'level' }
      ])

      expect(queryParams.value).toEqual({})
    })

    it('handles transform function', () => {
      const schoolIdRef = ref(2)

      const { queryParams } = useMeilisearchFilters([
        {
          ref: schoolIdRef,
          field: 'school_code',
          transform: id => id === 2 ? 'EV' : null
        }
      ])

      expect(queryParams.value).toEqual({
        filter: 'school_code = EV'
      })
    })

    it('skips when transform returns null', () => {
      const schoolIdRef = ref(99)

      const { queryParams } = useMeilisearchFilters([
        {
          ref: schoolIdRef,
          field: 'school_code',
          transform: () => null
        }
      ])

      expect(queryParams.value).toEqual({})
    })
  })

  describe('boolean filter', () => {
    it('converts string "1" to true', () => {
      const concentrationRef = ref('1')

      const { queryParams } = useMeilisearchFilters([
        { ref: concentrationRef, field: 'concentration', type: 'boolean' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'concentration = true'
      })
    })

    it('converts string "true" to true', () => {
      const ritualRef = ref('true')

      const { queryParams } = useMeilisearchFilters([
        { ref: ritualRef, field: 'ritual', type: 'boolean' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'ritual = true'
      })
    })

    it('converts string "0" to false', () => {
      const concentrationRef = ref('0')

      const { queryParams } = useMeilisearchFilters([
        { ref: concentrationRef, field: 'concentration', type: 'boolean' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'concentration = false'
      })
    })

    it('converts string "false" to false', () => {
      const ritualRef = ref('false')

      const { queryParams } = useMeilisearchFilters([
        { ref: ritualRef, field: 'ritual', type: 'boolean' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'ritual = false'
      })
    })

    it('handles actual boolean values', () => {
      const legendaryRef = ref(true)

      const { queryParams } = useMeilisearchFilters([
        { ref: legendaryRef, field: 'is_legendary', type: 'boolean' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'is_legendary = true'
      })
    })

    it('skips null values', () => {
      const concentrationRef = ref(null)

      const { queryParams } = useMeilisearchFilters([
        { ref: concentrationRef, field: 'concentration', type: 'boolean' }
      ])

      expect(queryParams.value).toEqual({})
    })
  })

  describe('in filter', () => {
    it('builds IN filter for array', () => {
      const damageTypesRef = ref(['F', 'C'])

      const { queryParams } = useMeilisearchFilters([
        { ref: damageTypesRef, field: 'damage_types', type: 'in' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'damage_types IN [F, C]'
      })
    })

    it('skips empty arrays', () => {
      const damageTypesRef = ref([])

      const { queryParams } = useMeilisearchFilters([
        { ref: damageTypesRef, field: 'damage_types', type: 'in' }
      ])

      expect(queryParams.value).toEqual({})
    })

    it('handles single value as array', () => {
      const classRef = ref('wizard')

      const { queryParams } = useMeilisearchFilters([
        { ref: classRef, field: 'class_slugs', type: 'in' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'class_slugs IN [wizard]'
      })
    })

    it('builds IN filter for source codes array', () => {
      const sourceCodesRef = ref(['PHB', 'XGE', 'TCE'])

      const { queryParams } = useMeilisearchFilters([
        { ref: sourceCodesRef, field: 'source_codes', type: 'in' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'source_codes IN [PHB, XGE, TCE]'
      })
    })
  })

  describe('range filter', () => {
    it('builds range with min and max', () => {
      const minRef = ref(5)
      const maxRef = ref(10)

      const { queryParams } = useMeilisearchFilters([
        { field: 'challenge_rating', type: 'range', min: minRef, max: maxRef, ref: ref(null) }
      ])

      expect(queryParams.value).toEqual({
        filter: 'challenge_rating >= 5 AND challenge_rating <= 10'
      })
    })

    it('builds range with only min', () => {
      const minRef = ref(17)
      const maxRef = ref(null)

      const { queryParams } = useMeilisearchFilters([
        { field: 'challenge_rating', type: 'range', min: minRef, max: maxRef, ref: ref(null) }
      ])

      expect(queryParams.value).toEqual({
        filter: 'challenge_rating >= 17'
      })
    })

    it('builds range with only max', () => {
      const minRef = ref(null)
      const maxRef = ref(4)

      const { queryParams } = useMeilisearchFilters([
        { field: 'challenge_rating', type: 'range', min: minRef, max: maxRef, ref: ref(null) }
      ])

      expect(queryParams.value).toEqual({
        filter: 'challenge_rating <= 4'
      })
    })

    it('skips when both min and max are null', () => {
      const minRef = ref(null)
      const maxRef = ref(null)

      const { queryParams } = useMeilisearchFilters([
        { field: 'challenge_rating', type: 'range', min: minRef, max: maxRef, ref: ref(null) }
      ])

      expect(queryParams.value).toEqual({})
    })
  })

  describe('isEmpty filter', () => {
    it('builds IS EMPTY for true value', () => {
      const hasPrereqRef = ref('1')

      const { queryParams } = useMeilisearchFilters([
        { ref: hasPrereqRef, field: 'prerequisites', type: 'isEmpty' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'prerequisites IS EMPTY'
      })
    })

    it('builds IS NOT EMPTY for false value', () => {
      const hasPrereqRef = ref('0')

      const { queryParams } = useMeilisearchFilters([
        { ref: hasPrereqRef, field: 'prerequisites', type: 'isEmpty' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'prerequisites IS NOT EMPTY'
      })
    })

    it('converts string "true" to IS EMPTY', () => {
      const hasPrereqRef = ref('true')

      const { queryParams } = useMeilisearchFilters([
        { ref: hasPrereqRef, field: 'prerequisites', type: 'isEmpty' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'prerequisites IS EMPTY'
      })
    })

    it('converts boolean true to IS EMPTY', () => {
      const hasPrereqRef = ref(true)

      const { queryParams } = useMeilisearchFilters([
        { ref: hasPrereqRef, field: 'prerequisites', type: 'isEmpty' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'prerequisites IS EMPTY'
      })
    })
  })

  describe('greaterThan filter', () => {
    it('builds > filter for numeric value', () => {
      const chargesRef = ref(0)

      const { queryParams } = useMeilisearchFilters([
        { ref: chargesRef, field: 'charges_max', type: 'greaterThan' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'charges_max > 0'
      })
    })

    it('skips null values', () => {
      const chargesRef = ref(null)

      const { queryParams } = useMeilisearchFilters([
        { ref: chargesRef, field: 'charges_max', type: 'greaterThan' }
      ])

      expect(queryParams.value).toEqual({})
    })
  })

  describe('multiple filters', () => {
    it('combines multiple filters with AND', () => {
      const levelRef = ref(3)
      const concentrationRef = ref('1')

      const { queryParams } = useMeilisearchFilters([
        { ref: levelRef, field: 'level' },
        { ref: concentrationRef, field: 'concentration', type: 'boolean' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'level = 3 AND concentration = true'
      })
    })

    it('skips inactive filters', () => {
      const levelRef = ref(3)
      const schoolRef = ref(null)
      const damageTypesRef = ref([])

      const { queryParams } = useMeilisearchFilters([
        { ref: levelRef, field: 'level' },
        { ref: schoolRef, field: 'school' },
        { ref: damageTypesRef, field: 'damage_types', type: 'in' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'level = 3'
      })
    })

    it('handles all filter types together', () => {
      const levelRef = ref(3)
      const concentrationRef = ref('1')
      const damageTypesRef = ref(['F', 'C'])

      const { queryParams } = useMeilisearchFilters([
        { ref: levelRef, field: 'level' },
        { ref: concentrationRef, field: 'concentration', type: 'boolean' },
        { ref: damageTypesRef, field: 'damage_types', type: 'in' }
      ])

      expect(queryParams.value).toEqual({
        filter: 'level = 3 AND concentration = true AND damage_types IN [F, C]'
      })
    })
  })

  describe('edge cases', () => {
    it('returns empty params when no active filters', () => {
      const levelRef = ref(null)

      const { queryParams } = useMeilisearchFilters([
        { ref: levelRef, field: 'level' }
      ])

      expect(queryParams.value).toEqual({})
    })

    it('handles undefined refs', () => {
      const levelRef = ref(undefined)

      const { queryParams } = useMeilisearchFilters([
        { ref: levelRef, field: 'level' }
      ])

      expect(queryParams.value).toEqual({})
    })

    it('handles empty string values', () => {
      const typeRef = ref('')

      const { queryParams } = useMeilisearchFilters([
        { ref: typeRef, field: 'type' }
      ])

      expect(queryParams.value).toEqual({})
    })

    it('reactive updates when refs change', () => {
      const levelRef = ref(null)

      const { queryParams } = useMeilisearchFilters([
        { ref: levelRef, field: 'level' }
      ])

      expect(queryParams.value).toEqual({})

      levelRef.value = 5

      expect(queryParams.value).toEqual({
        filter: 'level = 5'
      })
    })
  })
})
