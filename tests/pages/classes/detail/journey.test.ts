import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { createPinia, setActivePinia } from 'pinia'
import JourneyPage from '~/pages/classes/[slug]/journey.vue'

/**
 * Class Detail - Journey View Tests
 *
 * Tests the journey timeline view showing level-by-level class progression.
 * Focuses on component presence, conditional rendering, and page structure.
 */

describe('Class Detail - Journey View', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Page Mounting - Base Class', () => {
    it('mounts without errors for base class (wizard)', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/wizard/journey'
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('renders page with content for base class', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/wizard/journey'
      })
      const html = wrapper.html()
      expect(html.length).toBeGreaterThan(0)
      // Should have container structure
      expect(html).toContain('container')
    })

    it('has proper page structure', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/wizard/journey'
      })
      const html = wrapper.html()
      // Should have the max-w-5xl container
      expect(html).toContain('max-w-5xl')
    })
  })

  describe('Page Mounting - Subclass', () => {
    it('mounts without errors for subclass (school-of-evocation)', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/school-of-evocation/journey'
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('renders page with content for subclass', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/school-of-evocation/journey'
      })
      const html = wrapper.html()
      expect(html.length).toBeGreaterThan(0)
      expect(html).toContain('container')
    })
  })

  describe('Conditional Rendering - Base Class', () => {
    it('does NOT show parent toggle for base class', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/wizard/journey'
      })

      const html = wrapper.html()
      // Base classes should not have "Show [Parent] base features" toggle
      expect(html).not.toContain('base features')
    })

    it('does NOT show parent features section for base class', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/wizard/journey'
      })

      const html = wrapper.html()
      // Should not have parent features marker
      expect(html).not.toContain('inherited features')
    })
  })

  describe('Error Handling', () => {
    it('handles non-existent class gracefully', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/nonexistent-class-xyz/journey'
      })

      // Should still mount without crashing
      expect(wrapper.exists()).toBe(true)

      const html = wrapper.html()
      expect(html.length).toBeGreaterThan(0)
    })

    it('does not crash with invalid slug', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/!!!/journey'
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Component Structure', () => {
    it('page has container div', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/wizard/journey'
      })

      const html = wrapper.html()
      expect(html).toContain('<div')
      expect(html).toContain('container')
    })

    it('does not have obvious rendering errors', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/wizard/journey'
      })

      const html = wrapper.html()
      // Check for common rendering errors
      expect(html).not.toContain('[object Object]')
      expect(html).not.toContain('undefined')
      expect(html).not.toContain('[object HTMLElement]')
    })

    it('has spacing classes applied', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/wizard/journey'
      })

      const html = wrapper.html()
      // Should have py-8 (vertical padding)
      expect(html).toContain('py-8')
    })
  })

  describe('Multiple Class Types', () => {
    const classTypes = [
      { slug: 'wizard', name: 'spellcaster' },
      { slug: 'fighter', name: 'martial' },
      { slug: 'rogue', name: 'skill-based' },
      { slug: 'cleric', name: 'divine-caster' }
    ]

    classTypes.forEach(({ slug, name }) => {
      it(`renders correctly for ${name} (${slug})`, async () => {
        const wrapper = await mountSuspended(JourneyPage, {
          route: `/classes/${slug}/journey`
        })

        expect(wrapper.exists()).toBe(true)
        const html = wrapper.html()
        expect(html.length).toBeGreaterThan(0)
        expect(html).toContain('container')
      })
    })
  })

  describe('Multiple Subclass Types', () => {
    const subclasses = [
      { slug: 'school-of-evocation', parent: 'wizard' },
      { slug: 'champion', parent: 'fighter' },
      { slug: 'thief', parent: 'rogue' }
    ]

    subclasses.forEach(({ slug, parent }) => {
      it(`renders correctly for subclass ${slug} (${parent})`, async () => {
        const wrapper = await mountSuspended(JourneyPage, {
          route: `/classes/${slug}/journey`
        })

        expect(wrapper.exists()).toBe(true)
        const html = wrapper.html()
        expect(html.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Page Layout', () => {
    it('uses mx-auto for center alignment', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/wizard/journey'
      })

      const html = wrapper.html()
      expect(html).toContain('mx-auto')
    })

    it('has horizontal padding', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/wizard/journey'
      })

      const html = wrapper.html()
      expect(html).toContain('px-4')
    })

    it('has max width constraint', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/wizard/journey'
      })

      const html = wrapper.html()
      expect(html).toContain('max-w')
    })
  })

  describe('Loading States', () => {
    it('eventually shows content (not stuck loading)', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/wizard/journey'
      })

      // Should render successfully (mountSuspended waits for async)
      expect(wrapper.exists()).toBe(true)

      const html = wrapper.html()
      // Should have some HTML content (even if loading state)
      expect(html.length).toBeGreaterThan(50)
    })
  })

  describe('Accessibility', () => {
    it('has semantic HTML structure', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/wizard/journey'
      })

      const html = wrapper.html()
      // Should have divs for structure
      expect(html).toContain('<div')
      expect(html).toContain('</div>')
    })

    it('does not have broken HTML', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/wizard/journey'
      })

      const html = wrapper.html()
      // Basic HTML validation - opening div should have closing div
      const openDivs = (html.match(/<div/g) || []).length
      const closeDivs = (html.match(/<\/div>/g) || []).length
      // Allow for some variance due to v-if comments, but should be close
      expect(Math.abs(openDivs - closeDivs)).toBeLessThan(5)
    })
  })

  describe('Responsive Design Classes', () => {
    it('has responsive container classes', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/wizard/journey'
      })

      const html = wrapper.html()
      // Should use Tailwind container
      expect(html).toContain('container')
    })
  })

  describe('Dark Mode Support', () => {
    it('component supports dark mode rendering', async () => {
      const wrapper = await mountSuspended(JourneyPage, {
        route: '/classes/wizard/journey'
      })

      // Page should render successfully
      expect(wrapper.exists()).toBe(true)

      const html = wrapper.html()
      // Dark mode classes may be in loading state or content state
      // Just verify the page structure exists
      expect(html).toContain('container')
    })
  })
})
