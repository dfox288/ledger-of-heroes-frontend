// tests/components/character/sheet/StatDisplay.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import StatDisplay from '~/components/character/sheet/StatDisplay.vue'

describe('StatDisplay', () => {
  describe('label display', () => {
    it('displays the provided label', async () => {
      const wrapper = await mountSuspended(StatDisplay, {
        props: { label: 'Initiative', value: 2 }
      })
      expect(wrapper.text()).toContain('Initiative')
    })

    it('displays multi-word labels', async () => {
      const wrapper = await mountSuspended(StatDisplay, {
        props: { label: 'Prof Bonus', value: 2 }
      })
      expect(wrapper.text()).toContain('Prof Bonus')
    })
  })

  describe('value formatting with modifier (default)', () => {
    it('displays positive value with + prefix', async () => {
      const wrapper = await mountSuspended(StatDisplay, {
        props: { label: 'Test', value: 3 }
      })
      expect(wrapper.text()).toContain('+3')
    })

    it('displays negative value with - prefix', async () => {
      const wrapper = await mountSuspended(StatDisplay, {
        props: { label: 'Test', value: -1 }
      })
      expect(wrapper.text()).toContain('-1')
    })

    it('displays zero as +0', async () => {
      const wrapper = await mountSuspended(StatDisplay, {
        props: { label: 'Test', value: 0 }
      })
      expect(wrapper.text()).toContain('+0')
    })

    it('displays placeholder when value is null', async () => {
      const wrapper = await mountSuspended(StatDisplay, {
        props: { label: 'Test', value: null }
      })
      expect(wrapper.text()).toContain('—')
    })
  })

  describe('custom formatting', () => {
    it('uses custom format function when provided', async () => {
      const customFormat = (val: number) => `${val} ft`
      const wrapper = await mountSuspended(StatDisplay, {
        props: { label: 'Speed', value: 30, formatFn: customFormat }
      })
      expect(wrapper.text()).toContain('30 ft')
    })

    it('still shows placeholder for null even with custom format', async () => {
      const customFormat = (val: number) => `${val} ft`
      const wrapper = await mountSuspended(StatDisplay, {
        props: { label: 'Speed', value: null, formatFn: customFormat }
      })
      expect(wrapper.text()).toContain('—')
    })
  })

  describe('visual structure', () => {
    it('has rounded card styling', async () => {
      const wrapper = await mountSuspended(StatDisplay, {
        props: { label: 'Test', value: 2 }
      })
      expect(wrapper.find('.rounded-lg').exists()).toBe(true)
    })

    it('has centered text', async () => {
      const wrapper = await mountSuspended(StatDisplay, {
        props: { label: 'Test', value: 2 }
      })
      expect(wrapper.find('.text-center').exists()).toBe(true)
    })
  })
})
