import { describe, it, expect } from 'vitest'
import { ref, computed } from 'vue'
import { useSSRFallback } from '~/composables/useSSRFallback'

describe('useSSRFallback', () => {
  describe('when store is ready', () => {
    it('returns store value', () => {
      const storeValue = ref(42)
      const isStoreReady = ref(true)
      const initialProp = 10

      const result = useSSRFallback(storeValue, initialProp, isStoreReady)

      expect(result.value).toBe(42)
    })

    it('returns store value even when initial prop is undefined', () => {
      const storeValue = ref('hello')
      const isStoreReady = ref(true)

      const result = useSSRFallback(storeValue, undefined, isStoreReady)

      expect(result.value).toBe('hello')
    })

    it('returns store value for complex objects', () => {
      const storeValue = ref({ current: 25, max: 30 })
      const isStoreReady = ref(true)
      const initialProp = { current: 10, max: 15 }

      const result = useSSRFallback(storeValue, initialProp, isStoreReady)

      expect(result.value).toEqual({ current: 25, max: 30 })
    })
  })

  describe('when store is not ready', () => {
    it('returns initial prop if provided', () => {
      const storeValue = ref(0)
      const isStoreReady = ref(false)
      const initialProp = 42

      const result = useSSRFallback(storeValue, initialProp, isStoreReady)

      expect(result.value).toBe(42)
    })

    it('returns store value as fallback when initial prop is undefined', () => {
      const storeValue = ref(100)
      const isStoreReady = ref(false)

      const result = useSSRFallback(storeValue, undefined, isStoreReady)

      expect(result.value).toBe(100)
    })

    it('returns initial prop for complex objects', () => {
      const storeValue = ref({ current: 0, max: 0 })
      const isStoreReady = ref(false)
      const initialProp = { current: 20, max: 25 }

      const result = useSSRFallback(storeValue, initialProp, isStoreReady)

      expect(result.value).toEqual({ current: 20, max: 25 })
    })

    it('returns false as valid initial prop (not treated as falsy)', () => {
      const storeValue = ref(true)
      const isStoreReady = ref(false)
      const initialProp = false

      const result = useSSRFallback(storeValue, initialProp, isStoreReady)

      expect(result.value).toBe(false)
    })

    it('returns 0 as valid initial prop (not treated as falsy)', () => {
      const storeValue = ref(99)
      const isStoreReady = ref(false)
      const initialProp = 0

      const result = useSSRFallback(storeValue, initialProp, isStoreReady)

      expect(result.value).toBe(0)
    })

    it('returns empty string as valid initial prop (not treated as falsy)', () => {
      const storeValue = ref('default')
      const isStoreReady = ref(false)
      const initialProp = ''

      const result = useSSRFallback(storeValue, initialProp, isStoreReady)

      expect(result.value).toBe('')
    })

    it('returns null as valid initial prop', () => {
      const storeValue = ref<string | null>('store value')
      const isStoreReady = ref(false)
      const initialProp: string | null = null

      const result = useSSRFallback(storeValue, initialProp, isStoreReady)

      expect(result.value).toBeNull()
    })
  })

  describe('reactivity', () => {
    it('updates when store becomes ready', () => {
      const storeValue = ref(100)
      const isStoreReady = ref(false)
      const initialProp = 50

      const result = useSSRFallback(storeValue, initialProp, isStoreReady)

      expect(result.value).toBe(50)

      isStoreReady.value = true

      expect(result.value).toBe(100)
    })

    it('updates when store value changes after ready', () => {
      const storeValue = ref(10)
      const isStoreReady = ref(true)

      const result = useSSRFallback(storeValue, 5, isStoreReady)

      expect(result.value).toBe(10)

      storeValue.value = 20

      expect(result.value).toBe(20)
    })

    it('does not update from initial prop changes (prop is captured at call time)', () => {
      // Initial prop is a static value, not reactive
      const storeValue = ref(0)
      const isStoreReady = ref(false)
      let initialProp = 42

      const result = useSSRFallback(storeValue, initialProp, isStoreReady)

      expect(result.value).toBe(42)

      // Changing the variable doesn't affect the result
      initialProp = 99

      expect(result.value).toBe(42) // Still 42, not 99
    })
  })

  describe('works with computed refs', () => {
    it('accepts computed for store value', () => {
      const baseValue = ref(10)
      const storeValue = computed(() => baseValue.value * 2)
      const isStoreReady = ref(true)

      const result = useSSRFallback(storeValue, 5, isStoreReady)

      expect(result.value).toBe(20)

      baseValue.value = 15

      expect(result.value).toBe(30)
    })

    it('accepts computed for isStoreReady', () => {
      const characterId = ref<number | null>(null)
      const storeValue = ref(100)
      const isStoreReady = computed(() => characterId.value !== null)

      const result = useSSRFallback(storeValue, 50, isStoreReady)

      expect(result.value).toBe(50)

      characterId.value = 1

      expect(result.value).toBe(100)
    })
  })

  describe('type safety', () => {
    it('infers correct type from store value', () => {
      interface HitPoints {
        current: number
        max: number
        temporary: number
      }

      const storeValue = ref<HitPoints>({ current: 10, max: 20, temporary: 5 })
      const isStoreReady = ref(true)
      const initialProp: HitPoints = { current: 0, max: 0, temporary: 0 }

      const result = useSSRFallback(storeValue, initialProp, isStoreReady)

      // TypeScript should infer result.value as HitPoints
      expect(result.value.current).toBe(10)
      expect(result.value.max).toBe(20)
      expect(result.value.temporary).toBe(5)
    })

    it('handles union types', () => {
      const storeValue = ref<number | null>(null)
      const isStoreReady = ref(true)
      const initialProp: number | null = 42

      const result = useSSRFallback(storeValue, initialProp, isStoreReady)

      expect(result.value).toBeNull()
    })
  })
})
