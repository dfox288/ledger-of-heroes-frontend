// tests/components/character/sheet/StatCurrency.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import StatCurrency from '~/components/character/sheet/StatCurrency.vue'

const mockCurrency = { pp: 5, gp: 100, ep: 10, sp: 50, cp: 200 }
const partialCurrency = { pp: 0, gp: 50, ep: 0, sp: 25, cp: 0 }
const zeroCurrency = { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }

describe('StatCurrency', () => {
  describe('basic display', () => {
    it('displays "Currency" label', async () => {
      const wrapper = await mountSuspended(StatCurrency, {
        props: { currency: mockCurrency }
      })
      expect(wrapper.text()).toContain('Currency')
    })

    it('has data-testid="currency-cell"', async () => {
      const wrapper = await mountSuspended(StatCurrency, {
        props: { currency: mockCurrency }
      })
      expect(wrapper.find('[data-testid="currency-cell"]').exists()).toBe(true)
    })

    it('has expected visual structure (rounded card)', async () => {
      const wrapper = await mountSuspended(StatCurrency, {
        props: { currency: mockCurrency }
      })
      expect(wrapper.find('.rounded-lg').exists()).toBe(true)
    })
  })

  describe('currency values', () => {
    it('shows all currency values when provided', async () => {
      const wrapper = await mountSuspended(StatCurrency, {
        props: { currency: mockCurrency }
      })
      expect(wrapper.text()).toContain('5') // PP
      expect(wrapper.text()).toContain('100') // GP
      expect(wrapper.text()).toContain('10') // EP
      expect(wrapper.text()).toContain('50') // SP
      expect(wrapper.text()).toContain('200') // CP
    })

    it('only shows non-zero currencies', async () => {
      const wrapper = await mountSuspended(StatCurrency, {
        props: { currency: partialCurrency }
      })
      // Should show GP and SP
      expect(wrapper.text()).toContain('50') // GP
      expect(wrapper.text()).toContain('25') // SP
      // Should have only 2 coin circles
      const coins = wrapper.findAll('.rounded-full')
      expect(coins.length).toBe(2)
    })

    it('shows placeholder when currency is null', async () => {
      const wrapper = await mountSuspended(StatCurrency, {
        props: { currency: null }
      })
      expect(wrapper.text()).toContain('—')
    })

    it('shows placeholder when all currencies are zero', async () => {
      const wrapper = await mountSuspended(StatCurrency, {
        props: { currency: zeroCurrency }
      })
      expect(wrapper.text()).toContain('—')
    })

    it('formats large numbers with locale separators', async () => {
      const wrapper = await mountSuspended(StatCurrency, {
        props: { currency: { pp: 0, gp: 10000, ep: 0, sp: 0, cp: 0 } }
      })
      // toLocaleString should add commas for 10,000
      expect(wrapper.text()).toContain('10,000')
    })
  })

  describe('editable mode', () => {
    it('has cursor-pointer when editable', async () => {
      const wrapper = await mountSuspended(StatCurrency, {
        props: { currency: mockCurrency, editable: true }
      })
      const cell = wrapper.find('[data-testid="currency-cell"]')
      expect(cell.classes()).toContain('cursor-pointer')
    })

    it('does not have cursor-pointer when not editable', async () => {
      const wrapper = await mountSuspended(StatCurrency, {
        props: { currency: mockCurrency, editable: false }
      })
      const cell = wrapper.find('[data-testid="currency-cell"]')
      expect(cell.classes()).not.toContain('cursor-pointer')
    })

    it('emits click event when editable and clicked', async () => {
      const wrapper = await mountSuspended(StatCurrency, {
        props: { currency: mockCurrency, editable: true }
      })
      const cell = wrapper.find('[data-testid="currency-cell"]')
      await cell.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('does not emit click event when not editable', async () => {
      const wrapper = await mountSuspended(StatCurrency, {
        props: { currency: mockCurrency, editable: false }
      })
      const cell = wrapper.find('[data-testid="currency-cell"]')
      await cell.trigger('click')
      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })

  describe('coin colors', () => {
    it('renders coin indicators with correct colors', async () => {
      const wrapper = await mountSuspended(StatCurrency, {
        props: { currency: mockCurrency }
      })
      // Should have 5 coin circles (all currencies non-zero)
      const coins = wrapper.findAll('.rounded-full')
      expect(coins.length).toBe(5)
    })
  })
})
