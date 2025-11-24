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

    const html = wrapper.html()

    // Look for the old pattern: UCard with "Background Traits" header
    // This should NOT exist outside the accordion
    const hasStandaloneTraitsCard = html.includes('Background Traits')
      && !html.includes('<UAccordion')

    // Traits should be in accordion, not standalone card
    expect(hasStandaloneTraitsCard).toBe(false)
  })

  it('should render traits in accordion slot with UiAccordionTraitsList', async () => {
    const wrapper = await mountSuspended(BackgroundsSlugPage, {
      route: '/backgrounds/charlatan'
    })

    // Should contain UiAccordionTraitsList component
    const traitsList = wrapper.findComponent({ name: 'UiAccordionTraitsList' })
    expect(traitsList.exists()).toBe(true)
  })

  it('should render proficiencies in accordion slot', async () => {
    const wrapper = await mountSuspended(BackgroundsSlugPage, {
      route: '/backgrounds/charlatan'
    })

    // Should contain UiAccordionBulletList for proficiencies
    const bulletList = wrapper.findAllComponents({ name: 'UiAccordionBulletList' })
    expect(bulletList.length).toBeGreaterThan(0)
  })

  it('should render languages in accordion slot', async () => {
    const wrapper = await mountSuspended(BackgroundsSlugPage, {
      route: '/backgrounds/charlatan'
    })

    // Should contain UiAccordionBadgeList for languages
    const badgeList = wrapper.findAllComponents({ name: 'UiAccordionBadgeList' })
    expect(badgeList.length).toBeGreaterThan(0)
  })

  it('should render description outside accordion (always visible)', async () => {
    const wrapper = await mountSuspended(BackgroundsSlugPage, {
      route: '/backgrounds/charlatan'
    })

    const accordion = wrapper.findComponent({ name: 'UAccordion' })
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
    const slots = items.map((item: any) => item.slot)

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
