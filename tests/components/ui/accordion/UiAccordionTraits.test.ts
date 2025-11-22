import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiAccordionTraits from '~/components/ui/accordion/UiAccordionTraits.vue'

describe('UiAccordionTraits', () => {
  const mockTraits = [
    {
      id: 1,
      name: 'Legendary Resistance (3/Day)',
      description: 'If the dragon fails a saving throw, it can choose to succeed instead.'
    },
    {
      id: 2,
      name: 'Amphibious',
      description: 'The creature can breathe air and water.'
    }
  ]

  it('renders accordion header with trait count', async () => {
    const wrapper = await mountSuspended(UiAccordionTraits, {
      props: { traits: mockTraits }
    })

    expect(wrapper.text()).toContain('Traits (2)')
  })

  it('uses default title "Traits"', async () => {
    const wrapper = await mountSuspended(UiAccordionTraits, {
      props: { traits: mockTraits }
    })

    expect(wrapper.text()).toContain('Traits')
  })

  it('uses custom title when provided', async () => {
    const wrapper = await mountSuspended(UiAccordionTraits, {
      props: {
        traits: mockTraits,
        title: 'Special Abilities'
      }
    })

    expect(wrapper.text()).toContain('Special Abilities (2)')
  })

  it('displays trait names', async () => {
    const wrapper = await mountSuspended(UiAccordionTraits, {
      props: { traits: mockTraits }
    })

    // Click accordion button to expand it
    const button = wrapper.find('button')
    if (button.exists()) {
      await button.trigger('click')
    }

    expect(wrapper.text()).toContain('Legendary Resistance (3/Day)')
    expect(wrapper.text()).toContain('Amphibious')
  })

  it('displays trait descriptions', async () => {
    const wrapper = await mountSuspended(UiAccordionTraits, {
      props: { traits: mockTraits }
    })

    // Click accordion button to expand it
    const button = wrapper.find('button')
    if (button.exists()) {
      await button.trigger('click')
    }

    expect(wrapper.text()).toContain('If the dragon fails a saving throw')
    expect(wrapper.text()).toContain('The creature can breathe air and water')
  })

  it('does not render when traits array is empty', async () => {
    const wrapper = await mountSuspended(UiAccordionTraits, {
      props: { traits: [] }
    })

    // Component should not render anything when no traits
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('does not render when no traits provided', async () => {
    const wrapper = await mountSuspended(UiAccordionTraits, {
      props: { traits: [] }
    })

    // Component should not render the accordion element
    const accordion = wrapper.find('div')
    expect(accordion.exists()).toBe(false)
  })
})
