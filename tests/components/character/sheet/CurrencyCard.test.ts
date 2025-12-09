import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CurrencyCard from '~/components/character/sheet/CurrencyCard.vue'

describe('CurrencyCard', () => {
  const defaultCurrency = {
    pp: 5,
    gp: 150,
    ep: 0,
    sp: 30,
    cp: 75
  }

  it('renders all currency types', async () => {
    const wrapper = await mountSuspended(CurrencyCard, {
      props: { currency: defaultCurrency }
    })

    expect(wrapper.text()).toContain('PP')
    expect(wrapper.text()).toContain('GP')
    expect(wrapper.text()).toContain('EP')
    expect(wrapper.text()).toContain('SP')
    expect(wrapper.text()).toContain('CP')
  })

  it('displays currency amounts correctly', async () => {
    const wrapper = await mountSuspended(CurrencyCard, {
      props: { currency: defaultCurrency }
    })

    // Check each currency value is displayed
    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('150')
    expect(wrapper.text()).toContain('0')
    expect(wrapper.text()).toContain('30')
    expect(wrapper.text()).toContain('75')
  })

  it('renders title', async () => {
    const wrapper = await mountSuspended(CurrencyCard, {
      props: { currency: defaultCurrency }
    })

    expect(wrapper.text()).toContain('Currency')
  })

  it('handles zero values gracefully', async () => {
    const zeroCurrency = { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
    const wrapper = await mountSuspended(CurrencyCard, {
      props: { currency: zeroCurrency }
    })

    // Should still render all labels
    expect(wrapper.text()).toContain('PP')
    expect(wrapper.text()).toContain('GP')
  })

  it('handles null/undefined currency gracefully', async () => {
    const wrapper = await mountSuspended(CurrencyCard, {
      props: { currency: null }
    })

    // Should show placeholder state
    expect(wrapper.text()).toContain('Currency')
    expect(wrapper.text()).toContain('—') // Em dash for missing data
  })

  it('formats large numbers with locale formatting', async () => {
    const richCurrency = { pp: 1000, gp: 25000, ep: 500, sp: 10000, cp: 50000 }
    const wrapper = await mountSuspended(CurrencyCard, {
      props: { currency: richCurrency }
    })

    // Should format with commas (or locale-appropriate separators)
    expect(wrapper.text()).toContain('1,000')
    expect(wrapper.text()).toContain('25,000')
  })

  it('has correct test ids for each currency', async () => {
    const wrapper = await mountSuspended(CurrencyCard, {
      props: { currency: defaultCurrency }
    })

    expect(wrapper.find('[data-testid="currency-pp"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="currency-gp"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="currency-ep"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="currency-sp"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="currency-cp"]').exists()).toBe(true)
  })
})
