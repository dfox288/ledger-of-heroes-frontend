import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useFilterCount } from '~/composables/useFilterCount'

describe('useFilterCount', () => {
  describe('single value refs', () => {
    it('counts non-null values', () => {
      const levelRef = ref(3)

      const count = useFilterCount(levelRef)

      expect(count.value).toBe(1)
    })

    it('skips null values', () => {
      const levelRef = ref(null)

      const count = useFilterCount(levelRef)

      expect(count.value).toBe(0)
    })

    it('skips undefined values', () => {
      const levelRef = ref(undefined)

      const count = useFilterCount(levelRef)

      expect(count.value).toBe(0)
    })

    it('skips empty strings', () => {
      const typeRef = ref('')

      const count = useFilterCount(typeRef)

      expect(count.value).toBe(0)
    })

    it('counts zero as active', () => {
      const levelRef = ref(0)

      const count = useFilterCount(levelRef)

      expect(count.value).toBe(1)
    })

    it('counts false as active', () => {
      const boolRef = ref(false)

      const count = useFilterCount(boolRef)

      expect(count.value).toBe(1)
    })
  })

  describe('array refs', () => {
    it('counts non-empty arrays', () => {
      const damageTypesRef = ref(['F', 'C'])

      const count = useFilterCount(damageTypesRef)

      expect(count.value).toBe(1)
    })

    it('skips empty arrays', () => {
      const damageTypesRef = ref([])

      const count = useFilterCount(damageTypesRef)

      expect(count.value).toBe(0)
    })

    it('handles single-item arrays', () => {
      const classRef = ref(['wizard'])

      const count = useFilterCount(classRef)

      expect(count.value).toBe(1)
    })
  })

  describe('multiple refs', () => {
    it('counts multiple active refs', () => {
      const levelRef = ref(3)
      const schoolRef = ref(2)
      const concentrationRef = ref('1')

      const count = useFilterCount(levelRef, schoolRef, concentrationRef)

      expect(count.value).toBe(3)
    })

    it('skips all inactive refs', () => {
      const levelRef = ref(null)
      const schoolRef = ref(null)
      const damageTypesRef = ref([])

      const count = useFilterCount(levelRef, schoolRef, damageTypesRef)

      expect(count.value).toBe(0)
    })

    it('counts mixed active/inactive refs', () => {
      const levelRef = ref(3)
      const schoolRef = ref(null)
      const damageTypesRef = ref(['F'])
      const concentrationRef = ref(null)

      const count = useFilterCount(levelRef, schoolRef, damageTypesRef, concentrationRef)

      expect(count.value).toBe(2)
    })
  })

  describe('reactivity', () => {
    it('updates when refs change', () => {
      const levelRef = ref(null)

      const count = useFilterCount(levelRef)

      expect(count.value).toBe(0)

      levelRef.value = 5

      expect(count.value).toBe(1)
    })

    it('decrements when filter cleared', () => {
      const levelRef = ref(3)

      const count = useFilterCount(levelRef)

      expect(count.value).toBe(1)

      levelRef.value = null

      expect(count.value).toBe(0)
    })

    it('increments when filter added', () => {
      const levelRef = ref(null)
      const schoolRef = ref(null)

      const count = useFilterCount(levelRef, schoolRef)

      expect(count.value).toBe(0)

      levelRef.value = 3
      schoolRef.value = 2

      expect(count.value).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('handles zero refs passed', () => {
      const count = useFilterCount()

      expect(count.value).toBe(0)
    })

    it('handles all null refs', () => {
      const count = useFilterCount(ref(null), ref(null), ref(null))

      expect(count.value).toBe(0)
    })

    it('handles mixed types', () => {
      const stringRef = ref('hello')
      const numberRef = ref(42)
      const boolRef = ref(true)
      const arrayRef = ref(['a', 'b'])

      const count = useFilterCount(stringRef, numberRef, boolRef, arrayRef)

      expect(count.value).toBe(4)
    })
  })
})
