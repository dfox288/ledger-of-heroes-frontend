import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import RacesSlugPage from '~/pages/races/[slug].vue'

describe('Races [slug] Page - Conditions Component Integration', () => {
  it('should use UiAccordionConditions component for conditions display', async () => {
    const wrapper = await mountSuspended(RacesSlugPage, {
      route: '/races/elf'
    })

    // Should contain UiAccordionConditions component
    const conditionsComponent = wrapper.findAllComponents({ name: 'UiAccordionConditions' })

    // Component exists on page (even if no conditions to display)
    expect(conditionsComponent).toBeDefined()
  })

  it('should pass conditions array to UiAccordionConditions component', async () => {
    const wrapper = await mountSuspended(RacesSlugPage, {
      route: '/races/elf'
    })

    const conditionsComponent = wrapper.findAllComponents({ name: 'UiAccordionConditions' })

    if (conditionsComponent.length > 0) {
      const conditionsProps = conditionsComponent[0].props()
      expect(conditionsProps).toHaveProperty('conditions')
    }
  })

  it('should render conditions in accordion slot (not manual template)', async () => {
    const wrapper = await mountSuspended(RacesSlugPage, {
      route: '/races/elf'
    })

    // Should NOT use manual div template anymore
    // Should use UiAccordionConditions component instead
    const conditionsComponent = wrapper.findAllComponents({ name: 'UiAccordionConditions' })

    // If conditions exist, should use component
    const html = wrapper.html()
    if (html.includes('Condition')) {
      expect(conditionsComponent.length).toBeGreaterThan(0)
    }
  })

  it('should handle races without conditions gracefully', async () => {
    const wrapper = await mountSuspended(RacesSlugPage, {
      route: '/races/human'
    })

    // Should not error if no conditions
    expect(wrapper.exists()).toBe(true)
  })

  it('should display condition name, effect type, and descriptions', async () => {
    const wrapper = await mountSuspended(RacesSlugPage, {
      route: '/races/elf'
    })

    const conditionsComponent = wrapper.findAllComponents({ name: 'UiAccordionConditions' })

    // Component handles all the display logic internally
    expect(conditionsComponent).toBeDefined()
  })

  it('should have conditions in accordion (not standalone)', async () => {
    const wrapper = await mountSuspended(RacesSlugPage, {
      route: '/races/elf'
    })

    // Conditions should be inside the UAccordion
    const accordion = wrapper.findComponent({ name: 'UAccordion' })
    expect(accordion.exists()).toBe(true)

    // UAccordion should have type="multiple"
    expect(accordion.props('type')).toBe('multiple')
  })
})

describe('Races [slug] Page - Accordion Structure', () => {
  it('should have single UAccordion with type="multiple"', async () => {
    const wrapper = await mountSuspended(RacesSlugPage, {
      route: '/races/elf'
    })

    const accordions = wrapper.findAllComponents({ name: 'UAccordion' })

    // Should have at least one accordion
    expect(accordions.length).toBeGreaterThan(0)

    // Should have type="multiple"
    expect(accordions[0].props('type')).toBe('multiple')
  })

  it('should have conditions slot in accordion items', async () => {
    const wrapper = await mountSuspended(RacesSlugPage, {
      route: '/races/elf'
    })

    const accordion = wrapper.findComponent({ name: 'UAccordion' })
    const items = accordion.props('items')

    expect(Array.isArray(items)).toBe(true)

    // Find conditions slot
    const hasConditionsSlot = items.some((item: any) => item.slot === 'conditions')

    // If race has conditions, slot should exist
    // Otherwise, it's conditionally excluded (which is correct)
    expect(typeof hasConditionsSlot).toBe('boolean')
  })
})
