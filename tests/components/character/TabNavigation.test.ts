// tests/components/character/TabNavigation.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import TabNavigation from '~/components/character/TabNavigation.vue'

// Mock useRoute to return inventory path
mockNuxtImport('useRoute', () => () => ({
  path: '/characters/test-char-123/inventory'
}))

describe('TabNavigation', () => {
  it('renders all tabs with correct labels', async () => {
    const wrapper = await mountSuspended(TabNavigation, {
      props: { publicId: 'test-char-123' }
    })

    expect(wrapper.text()).toContain('Overview')
    expect(wrapper.text()).toContain('Inventory')
  })

  it('generates correct routes for tabs', async () => {
    const wrapper = await mountSuspended(TabNavigation, {
      props: { publicId: 'test-char-123' }
    })

    const links = wrapper.findAll('a')
    const hrefs = links.map(l => l.attributes('href'))

    expect(hrefs).toContain('/characters/test-char-123')
    expect(hrefs).toContain('/characters/test-char-123/inventory')
  })

  it('highlights active tab based on current route', async () => {
    const wrapper = await mountSuspended(TabNavigation, {
      props: { publicId: 'test-char-123' }
    })

    // Inventory tab should be active (mocked route ends with /inventory)
    const inventoryTab = wrapper.find('[data-testid="tab-inventory"]')
    expect(inventoryTab.classes()).toContain('text-primary')

    // Overview tab should not be active
    const overviewTab = wrapper.find('[data-testid="tab-overview"]')
    expect(overviewTab.classes()).not.toContain('text-primary')
  })

  it('shows Spells tab when isSpellcaster is true', async () => {
    const wrapper = await mountSuspended(TabNavigation, {
      props: { publicId: 'test-char-123', isSpellcaster: true }
    })

    expect(wrapper.text()).toContain('Spells')

    const links = wrapper.findAll('a')
    const hrefs = links.map(l => l.attributes('href'))
    expect(hrefs).toContain('/characters/test-char-123/spells')
  })

  it('hides Spells tab when isSpellcaster is false', async () => {
    const wrapper = await mountSuspended(TabNavigation, {
      props: { publicId: 'test-char-123', isSpellcaster: false }
    })

    expect(wrapper.text()).not.toContain('Spells')
  })
})
