import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BackgroundsSlugPage from '~/pages/backgrounds/[slug].vue'

describe('Backgrounds [slug] Page', () => {
  it('should render single UAccordion with type="multiple"', async () => {
    const wrapper = await mountSuspended(BackgroundsSlugPage, {
      route: '/backgrounds/charlatan'
    })

    // Find all UAccordion components
    const accordions = wrapper.findAllComponents({ name: 'UAccordion' })

    // Should be exactly ONE accordion (not multiple UCards)
    expect(accordions.length).toBe(1)

    // Should have type="multiple"
    expect(accordions[0].props('type')).toBe('multiple')
  })

  it('should NOT render traits in standalone UCard outside accordion', async () => {
    const wrapper = await mountSuspended(BackgroundsSlugPage, {
      route: '/backgrounds/charlatan'
    })

    // Check that UAccordion component exists (traits are in accordion)
    const accordion = wrapper.findComponent({ name: 'UAccordion' })
    expect(accordion.exists()).toBe(true)

    // If "Background Traits" appears, it should be within the accordion items
    const accordionProps = accordion.props()
    const hasTraitsItem = accordionProps.items?.some((item: Record<string, unknown>) =>
      item.label === 'Background Traits'
    )
    expect(hasTraitsItem).toBe(true)
  })

  it('should render traits in accordion slot with UiAccordionTraitsList', async () => {
    const wrapper = await mountSuspended(BackgroundsSlugPage, {
      route: '/backgrounds/charlatan'
    })

    // Check that accordion has traits slot defined in items
    const accordion = wrapper.findComponent({ name: 'UAccordion' })
    const items = accordion.props('items')
    const hasTraitsSlot = items?.some((item: Record<string, unknown>) => item.slot === 'traits')
    expect(hasTraitsSlot).toBe(true)

    // Check that the traits slot exists in the component's slots
    const html = wrapper.html()
    // Accordion slots are rendered conditionally, but the template should have them
    expect(html).toContain('Background Traits')
  })

  it('should render proficiencies in accordion slot', async () => {
    const wrapper = await mountSuspended(BackgroundsSlugPage, {
      route: '/backgrounds/charlatan'
    })

    // Check that accordion has proficiencies slot defined in items
    const accordion = wrapper.findComponent({ name: 'UAccordion' })
    const items = accordion.props('items')
    const hasProficienciesSlot = items?.some((item: Record<string, unknown>) => item.slot === 'proficiencies')
    expect(hasProficienciesSlot).toBe(true)
  })

  it('should render languages in accordion slot', async () => {
    const wrapper = await mountSuspended(BackgroundsSlugPage, {
      route: '/backgrounds/charlatan'
    })

    // Check that accordion has languages slot defined in items
    const accordion = wrapper.findComponent({ name: 'UAccordion' })
    const items = accordion.props('items')
    const hasLanguagesSlot = items?.some((item: Record<string, unknown>) => item.slot === 'languages')
    expect(hasLanguagesSlot).toBe(true)
  })

  it('should render description outside accordion (always visible)', async () => {
    const wrapper = await mountSuspended(BackgroundsSlugPage, {
      route: '/backgrounds/charlatan'
    })

    const html = wrapper.html()

    // Description card should exist
    expect(html).toContain('Description')

    // Find the description section in HTML
    const descriptionIndex = html.indexOf('Description')
    const accordionIndex = html.indexOf('type="multiple"')

    // Description should appear BEFORE accordion in the HTML
    if (descriptionIndex > -1 && accordionIndex > -1) {
      expect(descriptionIndex).toBeLessThan(accordionIndex)
    }
  })

  it('should have all expected sections in accordion items array', async () => {
    const wrapper = await mountSuspended(BackgroundsSlugPage, {
      route: '/backgrounds/charlatan'
    })

    const accordion = wrapper.findComponent({ name: 'UAccordion' })
    expect(accordion.exists()).toBe(true)

    const items = accordion.props('items')
    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)

    // Should contain key sections
    const slots = items.map((item: Record<string, unknown>) => item.slot)

    // At minimum, should have traits (charlatan has traits)
    expect(slots).toContain('traits')
  })

  it('should render image in dedicated section (not side-by-side with traits)', async () => {
    const wrapper = await mountSuspended(BackgroundsSlugPage, {
      route: '/backgrounds/charlatan'
    })

    const html = wrapper.html()

    // Check that image is NOT in a flex layout with traits
    // (old pattern had lg:flex-row with image and traits side-by-side)
    const hasOldSideBySideLayout = html.includes('lg:flex-row')
      && html.includes('lg:w-2/3')
      && html.includes('lg:w-1/3')

    expect(hasOldSideBySideLayout).toBe(false)
  })
})
