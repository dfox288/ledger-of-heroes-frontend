import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ItemQuickInfo from '~/components/item/ItemQuickInfo.vue'
import { createMockSource } from '#tests/helpers/mockFactories'
import type { EntitySource } from '~/types'

describe('ItemQuickInfo', () => {
  const mockSources: EntitySource[] = [
    createMockSource({ code: 'PHB', name: 'Player\'s Handbook', pages: '149' })
  ]

  // ============================================================================
  // Cost Display
  // ============================================================================

  it('renders cost when present', async () => {
    const wrapper = await mountSuspended(ItemQuickInfo, {
      props: {
        cost: '15 gp',
        weight: null,
        sources: []
      }
    })

    expect(wrapper.text()).toContain('15 gp')
  })

  it('does not render cost section when cost is null', async () => {
    const wrapper = await mountSuspended(ItemQuickInfo, {
      props: {
        cost: null,
        weight: null,
        sources: []
      }
    })

    expect(wrapper.text()).not.toContain('gp')
    expect(wrapper.text()).not.toContain('cp')
  })

  // ============================================================================
  // Weight Display
  // ============================================================================

  it('renders weight when present', async () => {
    const wrapper = await mountSuspended(ItemQuickInfo, {
      props: {
        cost: null,
        weight: '3 lb',
        sources: []
      }
    })

    expect(wrapper.text()).toContain('3 lb')
  })

  it('does not render weight section when weight is null', async () => {
    const wrapper = await mountSuspended(ItemQuickInfo, {
      props: {
        cost: null,
        weight: null,
        sources: []
      }
    })

    expect(wrapper.text()).not.toContain('lb')
  })

  // ============================================================================
  // Source Display
  // ============================================================================

  it('renders source with page number', async () => {
    const wrapper = await mountSuspended(ItemQuickInfo, {
      props: {
        cost: null,
        weight: null,
        sources: mockSources
      }
    })

    const text = wrapper.text()
    expect(text).toContain('PHB')
    expect(text).toContain('p.149')
  })

  it('renders multiple sources separated', async () => {
    const multipleSources: EntitySource[] = [
      createMockSource({ code: 'PHB', name: 'Player\'s Handbook', pages: '149' }),
      createMockSource({ code: 'DMG', name: 'Dungeon Master\'s Guide', pages: '165' })
    ]

    const wrapper = await mountSuspended(ItemQuickInfo, {
      props: {
        cost: null,
        weight: null,
        sources: multipleSources
      }
    })

    const text = wrapper.text()
    expect(text).toContain('PHB')
    expect(text).toContain('p.149')
    expect(text).toContain('DMG')
    expect(text).toContain('p.165')
  })

  it('handles empty sources array', async () => {
    const wrapper = await mountSuspended(ItemQuickInfo, {
      props: {
        cost: null,
        weight: null,
        sources: []
      }
    })

    // Should render without crashing
    expect(wrapper.exists()).toBe(true)
  })

  // ============================================================================
  // Layout & Formatting
  // ============================================================================

  it('uses bullet separators between sections', async () => {
    const wrapper = await mountSuspended(ItemQuickInfo, {
      props: {
        cost: '15 gp',
        weight: '3 lb',
        sources: mockSources
      }
    })

    const text = wrapper.text()
    // Should have bullets between cost, weight, and source
    expect(text).toContain('•')
  })

  it('renders icons for each section', async () => {
    const wrapper = await mountSuspended(ItemQuickInfo, {
      props: {
        cost: '15 gp',
        weight: '3 lb',
        sources: mockSources
      }
    })

    const html = wrapper.html()
    // Check for emoji icons or icon elements
    expect(html).toMatch(/💰|icon/)
  })

  it('renders all sections when all data is present', async () => {
    const wrapper = await mountSuspended(ItemQuickInfo, {
      props: {
        cost: '15 gp',
        weight: '3 lb',
        sources: mockSources
      }
    })

    const text = wrapper.text()
    expect(text).toContain('15 gp')
    expect(text).toContain('3 lb')
    expect(text).toContain('PHB')
    expect(text).toContain('p.149')
  })

  it('only renders sections with data', async () => {
    const wrapper = await mountSuspended(ItemQuickInfo, {
      props: {
        cost: '15 gp',
        weight: null,
        sources: []
      }
    })

    const text = wrapper.text()
    expect(text).toContain('15 gp')
    expect(text).not.toContain('lb')
    expect(text).not.toContain('p.')
  })

  // ============================================================================
  // Edge Cases
  // ============================================================================

  it('handles copper piece costs', async () => {
    const wrapper = await mountSuspended(ItemQuickInfo, {
      props: {
        cost: '50 cp',
        weight: null,
        sources: []
      }
    })

    expect(wrapper.text()).toContain('50 cp')
  })

  it('handles large gold amounts', async () => {
    const wrapper = await mountSuspended(ItemQuickInfo, {
      props: {
        cost: '5,000 gp',
        weight: null,
        sources: []
      }
    })

    expect(wrapper.text()).toContain('5,000 gp')
  })

  it('handles fractional weights', async () => {
    const wrapper = await mountSuspended(ItemQuickInfo, {
      props: {
        cost: null,
        weight: '0.5 lb',
        sources: []
      }
    })

    expect(wrapper.text()).toContain('0.5 lb')
  })

  it('handles source without page number', async () => {
    const sourcesNoPages: EntitySource[] = [
      createMockSource({ code: 'DMG', name: 'Dungeon Master\'s Guide', pages: null })
    ]

    const wrapper = await mountSuspended(ItemQuickInfo, {
      props: {
        cost: null,
        weight: null,
        sources: sourcesNoPages
      }
    })

    const text = wrapper.text()
    expect(text).toContain('DMG')
    // Should handle null pages gracefully
  })
})
