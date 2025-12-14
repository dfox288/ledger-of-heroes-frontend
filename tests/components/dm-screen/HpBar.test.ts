import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import HpBar from '~/components/dm-screen/HpBar.vue'

describe('DmScreenHpBar', () => {
  it('displays current and max HP', async () => {
    const wrapper = await mountSuspended(HpBar, {
      props: { current: 28, max: 35, temp: 0 }
    })
    expect(wrapper.text()).toContain('28')
    expect(wrapper.text()).toContain('35')
  })

  it('displays temp HP when present', async () => {
    const wrapper = await mountSuspended(HpBar, {
      props: { current: 28, max: 35, temp: 5 }
    })
    expect(wrapper.text()).toContain('+5')
  })

  it('does not display temp HP when zero', async () => {
    const wrapper = await mountSuspended(HpBar, {
      props: { current: 28, max: 35, temp: 0 }
    })
    expect(wrapper.text()).not.toContain('+0')
  })

  it('shows green bar when HP above 50%', async () => {
    const wrapper = await mountSuspended(HpBar, {
      props: { current: 30, max: 35, temp: 0 }
    })
    const bar = wrapper.find('[data-testid="hp-bar-fill"]')
    expect(bar.classes().join(' ')).toMatch(/green|success|emerald/)
  })

  it('shows yellow bar when HP between 25% and 50%', async () => {
    const wrapper = await mountSuspended(HpBar, {
      props: { current: 10, max: 35, temp: 0 }
    })
    const bar = wrapper.find('[data-testid="hp-bar-fill"]')
    expect(bar.classes().join(' ')).toMatch(/yellow|warning|amber/)
  })

  it('shows red bar when HP below 25%', async () => {
    const wrapper = await mountSuspended(HpBar, {
      props: { current: 5, max: 35, temp: 0 }
    })
    const bar = wrapper.find('[data-testid="hp-bar-fill"]')
    expect(bar.classes().join(' ')).toMatch(/red|error|rose/)
  })

  it('calculates bar width based on percentage', async () => {
    const wrapper = await mountSuspended(HpBar, {
      props: { current: 17, max: 34, temp: 0 }
    })
    const bar = wrapper.find('[data-testid="hp-bar-fill"]')
    // 50% HP
    expect(bar.attributes('style')).toContain('50%')
  })

  it('handles zero max HP gracefully', async () => {
    const wrapper = await mountSuspended(HpBar, {
      props: { current: 0, max: 0, temp: 0 }
    })
    expect(wrapper.text()).toContain('0')
  })
})
