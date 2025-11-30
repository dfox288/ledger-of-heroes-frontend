import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BackgroundsSlugPage from '~/pages/backgrounds/[slug].vue'

/**
 * Background Detail Page Tests
 *
 * Tests the redesigned background page layout (Issue #51):
 * - Quick Stats with skills (ability codes), languages, tools, gold
 * - Feature hero section
 * - Description card
 * - Suggested Characteristics (2x2 grid of rollable tables)
 * - Accordion for equipment/source/tags
 */
describe('Backgrounds [slug] Page', () => {
  describe('page structure', () => {
    it('renders the page without errors', async () => {
      const wrapper = await mountSuspended(BackgroundsSlugPage, {
        route: '/backgrounds/acolyte'
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('displays background name in header', async () => {
      const wrapper = await mountSuspended(BackgroundsSlugPage, {
        route: '/backgrounds/acolyte'
      })

      expect(wrapper.text()).toContain('Acolyte')
    })

    it('displays Background badge', async () => {
      const wrapper = await mountSuspended(BackgroundsSlugPage, {
        route: '/backgrounds/acolyte'
      })

      expect(wrapper.text()).toContain('Background')
    })
  })

  describe('quick stats section', () => {
    it('renders BackgroundQuickStats component', async () => {
      const wrapper = await mountSuspended(BackgroundsSlugPage, {
        route: '/backgrounds/acolyte'
      })

      const quickStats = wrapper.findComponent({ name: 'BackgroundQuickStats' })
      expect(quickStats.exists()).toBe(true)
    })

    it('displays skill proficiencies with ability codes', async () => {
      const wrapper = await mountSuspended(BackgroundsSlugPage, {
        route: '/backgrounds/acolyte'
      })

      const text = wrapper.text()
      // Mock data has Investigation (INT) and Insight (WIS)
      expect(text).toContain('Investigation')
      expect(text).toContain('INT')
      expect(text).toContain('Insight')
      expect(text).toContain('WIS')
    })

    it('displays language information', async () => {
      const wrapper = await mountSuspended(BackgroundsSlugPage, {
        route: '/backgrounds/acolyte'
      })

      const text = wrapper.text()
      // Mock data has is_choice: true, quantity: 2
      expect(text).toContain('2 of your choice')
    })
  })

  describe('feature section', () => {
    it('renders BackgroundFeatureCard component', async () => {
      const wrapper = await mountSuspended(BackgroundsSlugPage, {
        route: '/backgrounds/acolyte'
      })

      const featureCard = wrapper.findComponent({ name: 'BackgroundFeatureCard' })
      expect(featureCard.exists()).toBe(true)
    })

    it('displays feature name', async () => {
      const wrapper = await mountSuspended(BackgroundsSlugPage, {
        route: '/backgrounds/acolyte'
      })

      const text = wrapper.text()
      // Mock data has "Acolyte Expertise" feature
      expect(text).toContain('FEATURE') // Label is all caps
      expect(text).toContain('Expertise') // Feature name
    })
  })

  describe('characteristics section', () => {
    it('renders BackgroundCharacteristicsGrid component', async () => {
      const wrapper = await mountSuspended(BackgroundsSlugPage, {
        route: '/backgrounds/acolyte'
      })

      const charGrid = wrapper.findComponent({ name: 'BackgroundCharacteristicsGrid' })
      expect(charGrid.exists()).toBe(true)
    })

    it('displays Suggested Characteristics heading', async () => {
      const wrapper = await mountSuspended(BackgroundsSlugPage, {
        route: '/backgrounds/acolyte'
      })

      expect(wrapper.text()).toContain('Suggested Characteristics')
    })

    it('displays characteristic tables', async () => {
      const wrapper = await mountSuspended(BackgroundsSlugPage, {
        route: '/backgrounds/acolyte'
      })

      const text = wrapper.text()
      // Mock data has all 4 tables
      expect(text).toContain('Personality Trait')
      expect(text).toContain('Ideal')
      expect(text).toContain('Bond')
      expect(text).toContain('Flaw')
    })
  })

  describe('accordion sections', () => {
    it('renders single UAccordion with type="multiple"', async () => {
      const wrapper = await mountSuspended(BackgroundsSlugPage, {
        route: '/backgrounds/acolyte'
      })

      const accordions = wrapper.findAllComponents({ name: 'UAccordion' })
      expect(accordions.length).toBe(1)
      expect(accordions[0].props('type')).toBe('multiple')
    })

    it('has equipment slot in accordion', async () => {
      const wrapper = await mountSuspended(BackgroundsSlugPage, {
        route: '/backgrounds/acolyte'
      })

      const accordion = wrapper.findComponent({ name: 'UAccordion' })
      const items = accordion.props('items')
      const hasEquipmentSlot = items?.some((item: Record<string, unknown>) => item.slot === 'equipment')
      expect(hasEquipmentSlot).toBe(true)
    })

    it('has source slot in accordion', async () => {
      const wrapper = await mountSuspended(BackgroundsSlugPage, {
        route: '/backgrounds/acolyte'
      })

      const accordion = wrapper.findComponent({ name: 'UAccordion' })
      const items = accordion.props('items')
      const hasSourceSlot = items?.some((item: Record<string, unknown>) => item.slot === 'source')
      expect(hasSourceSlot).toBe(true)
    })
  })

  describe('description section', () => {
    it('renders description outside accordion (always visible)', async () => {
      const wrapper = await mountSuspended(BackgroundsSlugPage, {
        route: '/backgrounds/acolyte'
      })

      // Description comes from descriptionTrait which is extracted from traits
      const text = wrapper.text()
      expect(text).toContain('You have spent your life')
    })
  })

  describe('navigation', () => {
    it('displays breadcrumb navigation', async () => {
      const wrapper = await mountSuspended(BackgroundsSlugPage, {
        route: '/backgrounds/acolyte'
      })

      expect(wrapper.text()).toContain('Backgrounds')
    })

    it('displays back navigation button', async () => {
      const wrapper = await mountSuspended(BackgroundsSlugPage, {
        route: '/backgrounds/acolyte'
      })

      expect(wrapper.text()).toContain('Back to Backgrounds')
    })
  })
})
