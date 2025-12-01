import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MonstersSlugPage from '~/pages/monsters/[slug].vue'

/**
 * Monster [slug] Page Tests
 *
 * Tests for senses, languages, and lair actions display on the monster detail page.
 * Issues: #36 (languages), #37 (senses), #38 (lair actions)
 *
 * Note: These tests verify page structure and component integration.
 * Component-level tests (with mock data) verify display logic.
 */

describe('Monster [slug] Page - Structure', () => {
  it('should mount without errors', async () => {
    const wrapper = await mountSuspended(MonstersSlugPage, {
      route: '/monsters/goblin'
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should have container with max-width constraint', async () => {
    const wrapper = await mountSuspended(MonstersSlugPage, {
      route: '/monsters/goblin'
    })

    const html = wrapper.html()
    expect(html).toContain('max-w-4xl')
  })
})

describe('Monster [slug] Page - Reactions Display (#81)', () => {
  /**
   * Tests for Issue #81: Display monster reactions separately from actions
   * Reactions are triggered abilities (e.g., Parry, Shield) that use the reaction economy.
   */

  it('should have reactions computed property in script', async () => {
    const pageSource = await import('~/pages/monsters/[slug].vue?raw')
    const source = pageSource.default

    // Script should define reactions computed property
    expect(source).toContain('reactions')
  })

  it('should have Reactions accordion section in template', async () => {
    const pageSource = await import('~/pages/monsters/[slug].vue?raw')
    const source = pageSource.default

    // Template should include reactions in accordion items
    expect(source).toContain('label: \'Reactions\'')
    expect(source).toContain('slot: \'reactions\'')
  })

  it('should access reactions from monster data', async () => {
    const pageSource = await import('~/pages/monsters/[slug].vue?raw')
    const source = pageSource.default

    // Should access reactions from monster value (API response)
    expect(source).toContain('.reactions')
  })

  it('should have reactions template slot', async () => {
    const pageSource = await import('~/pages/monsters/[slug].vue?raw')
    const source = pageSource.default

    // Template should have #reactions slot
    expect(source).toContain('#reactions')
  })
})

describe('Monster [slug] Page - Template Structure (#36, #37, #38)', () => {
  /**
   * These tests verify the PAGE TEMPLATE has the necessary sections.
   * We check the Vue template source code has the right elements.
   */

  it('should have senses display section in template', async () => {
    // Read the component source to verify structure
    const pageSource = await import('~/pages/monsters/[slug].vue?raw')
    const source = pageSource.default

    // Template should include senses display
    expect(source).toContain('senses')
  })

  it('should have languages display in template', async () => {
    const pageSource = await import('~/pages/monsters/[slug].vue?raw')
    const source = pageSource.default

    // Template should include languages display
    expect(source).toContain('languages')
  })

  it('should have lair actions accordion section in template', async () => {
    const pageSource = await import('~/pages/monsters/[slug].vue?raw')
    const source = pageSource.default

    // Template should include lair_actions in accordion items
    expect(source).toContain('lair_actions')
    expect(source).toContain('Lair Actions')
  })
})
