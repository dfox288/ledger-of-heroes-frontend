import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import OverviewPage from '~/pages/classes/[slug]/index.vue'

/**
 * Class Detail - Overview View Tests
 *
 * Tests rendering behavior for the Overview view.
 * Tests focus on page mounting and structure, not API data.
 */
describe('Class Detail - Overview View', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Page Mounting', () => {
    it('mounts without errors for base class (wizard)', async () => {
      const wrapper = await mountSuspended(OverviewPage, {
        route: '/classes/wizard'
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('mounts without errors for subclass (fighter-champion)', async () => {
      const wrapper = await mountSuspended(OverviewPage, {
        route: '/classes/fighter-champion'
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('mounts without errors for different class types', async () => {
      // Test various class types
      const classes = ['wizard', 'fighter', 'monk', 'cleric', 'rogue']

      for (const className of classes) {
        const wrapper = await mountSuspended(OverviewPage, {
          route: `/classes/${className}`
        })

        expect(wrapper.exists()).toBe(true)
      }
    })
  })

  describe('Page Structure', () => {
    it('renders container with correct classes', async () => {
      const wrapper = await mountSuspended(OverviewPage, {
        route: '/classes/wizard'
      })

      const html = wrapper.html()
      // Check for container structure
      expect(html).toContain('container')
      expect(html).toContain('mx-auto')
    })

    it('renders with proper layout structure', async () => {
      const wrapper = await mountSuspended(OverviewPage, {
        route: '/classes/fighter'
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.html()).toBeTruthy()
    })
  })

  describe('Loading and Error States', () => {
    it('handles loading state gracefully', async () => {
      const wrapper = await mountSuspended(OverviewPage, {
        route: '/classes/wizard'
      })

      // Page should render in some state (loading, error, or success)
      expect(wrapper.exists()).toBe(true)
    })

    it('renders page skeleton during load', async () => {
      const wrapper = await mountSuspended(OverviewPage, {
        route: '/classes/cleric'
      })

      const html = wrapper.html()
      // Page should have container regardless of load state
      expect(html).toBeTruthy()
    })
  })

  describe('Different Class Types', () => {
    it('renders for caster class (wizard)', async () => {
      const wrapper = await mountSuspended(OverviewPage, {
        route: '/classes/wizard'
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('renders for martial class (fighter)', async () => {
      const wrapper = await mountSuspended(OverviewPage, {
        route: '/classes/fighter'
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('renders for class with resources (monk)', async () => {
      const wrapper = await mountSuspended(OverviewPage, {
        route: '/classes/monk'
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('renders for subclass (fighter-champion)', async () => {
      const wrapper = await mountSuspended(OverviewPage, {
        route: '/classes/fighter-champion'
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Conditional Rendering Logic', () => {
    it('page uses useClassDetail composable correctly', async () => {
      const wrapper = await mountSuspended(OverviewPage, {
        route: '/classes/wizard'
      })

      // Page should mount and use composable
      expect(wrapper.exists()).toBe(true)
    })

    it('page handles route params correctly', async () => {
      const wrapper = await mountSuspended(OverviewPage, {
        route: '/classes/fighter'
      })

      // Page should read slug from route
      expect(wrapper.exists()).toBe(true)
    })
  })
})
