// tests/components/ui/detail/UiDetailDescriptionWithImage.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiDetailDescriptionWithImage from '~/components/ui/detail/UiDetailDescriptionWithImage.vue'

describe('UiDetailDescriptionWithImage', () => {
  it('displays description text', async () => {
    const wrapper = await mountSuspended(UiDetailDescriptionWithImage, {
      props: {
        description: 'Test description text'
      }
    })

    expect(wrapper.text()).toContain('Test description text')
  })

  it('shows default title "Description"', async () => {
    const wrapper = await mountSuspended(UiDetailDescriptionWithImage, {
      props: {
        description: 'Test description'
      }
    })

    expect(wrapper.text()).toContain('Description')
  })

  it('shows custom title when provided', async () => {
    const wrapper = await mountSuspended(UiDetailDescriptionWithImage, {
      props: {
        description: 'Test description',
        title: 'Custom Title'
      }
    })

    expect(wrapper.text()).toContain('Custom Title')
    expect(wrapper.text()).not.toContain('Description')
  })

  it('displays image when imagePath provided', async () => {
    const wrapper = await mountSuspended(UiDetailDescriptionWithImage, {
      props: {
        description: 'Test description',
        imagePath: '/images/test.png',
        imageAlt: 'Test image'
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Test image')
  })

  it('does not display image when imagePath is null', async () => {
    const wrapper = await mountSuspended(UiDetailDescriptionWithImage, {
      props: {
        description: 'Test description',
        imagePath: null
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(false)
  })

  it('uses 2/3 width layout when image present', async () => {
    const wrapper = await mountSuspended(UiDetailDescriptionWithImage, {
      props: {
        description: 'Test description',
        imagePath: '/images/test.png'
      }
    })

    const contentDiv = wrapper.find('.lg\\:w-2\\/3')
    expect(contentDiv.exists()).toBe(true)
  })

  it('uses full width layout when no image', async () => {
    const wrapper = await mountSuspended(UiDetailDescriptionWithImage, {
      props: {
        description: 'Test description',
        imagePath: null
      }
    })

    const contentDiv = wrapper.find('.w-full')
    expect(contentDiv.exists()).toBe(true)
    const narrowDiv = wrapper.find('.lg\\:w-2\\/3')
    expect(narrowDiv.exists()).toBe(false)
  })

  it('handles missing description gracefully', async () => {
    const wrapper = await mountSuspended(UiDetailDescriptionWithImage, {
      props: {
        description: undefined
      }
    })

    expect(wrapper.text()).toContain('Description')
    expect(wrapper.find('.prose').exists()).toBe(true)
  })

  it('applies prose styling to description', async () => {
    const wrapper = await mountSuspended(UiDetailDescriptionWithImage, {
      props: {
        description: 'Test description'
      }
    })

    expect(wrapper.find('.prose').exists()).toBe(true)
    expect(wrapper.find('.dark\\:prose-invert').exists()).toBe(true)
  })

  it('preserves whitespace in description', async () => {
    const wrapper = await mountSuspended(UiDetailDescriptionWithImage, {
      props: {
        description: 'Line 1\nLine 2\nLine 3'
      }
    })

    expect(wrapper.find('.whitespace-pre-line').exists()).toBe(true)
  })
})
