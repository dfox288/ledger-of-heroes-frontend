import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiDetailStandaloneImage from '~/components/ui/detail/UiDetailStandaloneImage.vue'

describe('UiDetailStandaloneImage', () => {
  it('renders image with correct props when imagePath is provided', async () => {
    const wrapper = await mountSuspended(UiDetailStandaloneImage, {
      props: {
        imagePath: '/images/test-image.jpg',
        imageAlt: 'Test image alt text'
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Test image alt text')
    expect(img.attributes('src')).toContain('test-image.jpg')
  })

  it('renders nothing when imagePath is null', async () => {
    const wrapper = await mountSuspended(UiDetailStandaloneImage, {
      props: {
        imagePath: null,
        imageAlt: 'Test alt'
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(false)
  })

  it('renders nothing when imagePath is undefined', async () => {
    const wrapper = await mountSuspended(UiDetailStandaloneImage, {
      props: {
        imagePath: undefined,
        imageAlt: 'Test alt'
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(false)
  })

  it('wraps image in UCard component', async () => {
    const wrapper = await mountSuspended(UiDetailStandaloneImage, {
      props: {
        imagePath: '/images/test.jpg',
        imageAlt: 'Test'
      }
    })

    // Check that a card-like container exists
    const container = wrapper.find('[class*="shadow"]')
    expect(container.exists()).toBe(true)
  })

  it('applies rounded corners to image', async () => {
    const wrapper = await mountSuspended(UiDetailStandaloneImage, {
      props: {
        imagePath: '/images/test.jpg',
        imageAlt: 'Test'
      }
    })

    const img = wrapper.find('img')
    expect(img.attributes('class')).toContain('rounded')
  })

  it('sets lazy loading on image', async () => {
    const wrapper = await mountSuspended(UiDetailStandaloneImage, {
      props: {
        imagePath: '/images/test.jpg',
        imageAlt: 'Test'
      }
    })

    const img = wrapper.find('img')
    expect(img.attributes('loading')).toBe('lazy')
  })
})
