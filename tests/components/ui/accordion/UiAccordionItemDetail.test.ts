import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiAccordionItemDetail from '~/components/ui/accordion/UiAccordionItemDetail.vue'

describe('UiAccordionItemDetail', () => {
  it('renders detail text', async () => {
    const wrapper = await mountSuspended(UiAccordionItemDetail, {
      props: { detail: 'This is a magic sword forged in dragon fire.' }
    })

    expect(wrapper.text()).toContain('This is a magic sword forged in dragon fire.')
  })

  it('preserves whitespace for multi-line content', async () => {
    const multilineDetail = 'Line 1\nLine 2\nLine 3'
    const wrapper = await mountSuspended(UiAccordionItemDetail, {
      props: { detail: multilineDetail }
    })

    expect(wrapper.html()).toContain('whitespace-pre-line')
  })

  it('applies italic styling', async () => {
    const wrapper = await mountSuspended(UiAccordionItemDetail, {
      props: { detail: 'Flavor text' }
    })

    expect(wrapper.html()).toContain('italic')
  })

  it('does not render when detail is null', async () => {
    const wrapper = await mountSuspended(UiAccordionItemDetail, {
      props: { detail: null }
    })

    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('does not render when detail is empty string', async () => {
    const wrapper = await mountSuspended(UiAccordionItemDetail, {
      props: { detail: '' }
    })

    expect(wrapper.html()).toBe('<!--v-if-->')
  })
})
