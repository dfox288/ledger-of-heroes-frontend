import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AnimatedBackground from '~/components/AnimatedBackground.vue'

describe('AnimatedBackground', () => {
  beforeEach(() => {
    // Mock matchMedia to allow animations (prefers-reduced-motion: no-preference)
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false, // prefers-reduced-motion is NOT enabled
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  })

  it('renders canvas element', async () => {
    const wrapper = await mountSuspended(AnimatedBackground)

    const canvas = wrapper.find('canvas')
    expect(canvas.exists()).toBe(true)
  })

  it('positions canvas behind content', async () => {
    const wrapper = await mountSuspended(AnimatedBackground)

    const canvas = wrapper.find('canvas')
    const style = canvas.attributes('style')
    expect(style).toContain('position: fixed')
    expect(style).toContain('z-index: 1')
  })

  it('makes canvas non-interactive', async () => {
    const wrapper = await mountSuspended(AnimatedBackground)

    const canvas = wrapper.find('canvas')
    expect(canvas.classes()).toContain('pointer-events-none')
  })

  it('marks canvas as aria-hidden', async () => {
    const wrapper = await mountSuspended(AnimatedBackground)

    const canvas = wrapper.find('canvas')
    expect(canvas.attributes('aria-hidden')).toBe('true')
  })

  it('skips rendering when prefers-reduced-motion is true', async () => {
    // Mock matchMedia BEFORE mounting to indicate reduced motion is preferred
    const originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: true, // prefers-reduced-motion IS enabled
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))

    const wrapper = await mountSuspended(AnimatedBackground)

    // Canvas should not be rendered
    const canvas = wrapper.find('canvas')
    expect(canvas.exists()).toBe(false)

    // Restore original matchMedia
    window.matchMedia = originalMatchMedia
  })
})
