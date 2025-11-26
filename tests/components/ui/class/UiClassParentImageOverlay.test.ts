import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import UiClassParentImageOverlay from '~/components/ui/class/UiClassParentImageOverlay.vue'

describe('UiClassParentImageOverlay', () => {
  const mountOptions = {
    global: {
      stubs: {
        NuxtLink: RouterLinkStub,
        NuxtImg: {
          template: '<img :src="src" :alt="alt" class="nuxt-img" />',
          props: ['src', 'alt', 'loading']
        }
      }
    }
  }

  it('renders parent class image', () => {
    const wrapper = mount(UiClassParentImageOverlay, {
      props: {
        parentSlug: 'rogue',
        parentName: 'Rogue'
      },
      ...mountOptions
    })

    const img = wrapper.find('.nuxt-img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toContain('Rogue')
  })

  it('shows Base Class label', () => {
    const wrapper = mount(UiClassParentImageOverlay, {
      props: {
        parentSlug: 'rogue',
        parentName: 'Rogue'
      },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('Base Class')
  })

  it('links to parent class page', () => {
    const wrapper = mount(UiClassParentImageOverlay, {
      props: {
        parentSlug: 'rogue',
        parentName: 'Rogue'
      },
      ...mountOptions
    })

    const link = wrapper.findComponent(RouterLinkStub)
    expect(link.props('to')).toBe('/classes/rogue')
  })

  it('displays parent class name', () => {
    const wrapper = mount(UiClassParentImageOverlay, {
      props: {
        parentSlug: 'fighter',
        parentName: 'Fighter'
      },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('Fighter')
  })
})
