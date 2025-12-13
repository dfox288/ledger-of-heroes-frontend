// tests/pages/characters/inventory.test.ts
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import InventoryPage from '~/pages/characters/[publicId]/inventory.vue'
import { server, http, HttpResponse } from '../../msw/server'

// Mock route params
mockNuxtImport('useRoute', () => () => ({
  path: '/characters/iron-phoenix-X7k2/inventory',
  params: { publicId: 'iron-phoenix-X7k2' }
}))

// Setup MSW
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock character for inventory page
const mockCharacter = {
  id: 1,
  public_id: 'iron-phoenix-X7k2',
  name: 'Thorin Ironforge',
  level: 1
}

// Mock equipment items
const mockEquipment = [
  {
    id: 1,
    item: { name: 'Longsword', weight: '3.00', item_type: 'Melee Weapon' },
    item_slug: 'phb:longsword',
    custom_name: null,
    quantity: 1,
    equipped: true,
    location: 'main_hand',
    is_attuned: false
  },
  {
    id: 2,
    item: { name: 'Chain Mail', weight: '55.00', armor_class: 16, item_type: 'Heavy Armor' },
    item_slug: 'phb:chain-mail',
    custom_name: null,
    quantity: 1,
    equipped: true,
    location: 'worn',
    is_attuned: false
  },
  {
    id: 3,
    item: { name: 'Backpack', weight: '5.00', item_type: 'Adventuring Gear' },
    item_slug: 'phb:backpack',
    custom_name: null,
    quantity: 1,
    equipped: false,
    location: 'backpack',
    is_attuned: false
  }
]

// Mock stats (includes carrying capacity)
const mockStats = {
  ability_scores: {
    STR: { score: 16, modifier: 3 },
    DEX: { score: 14, modifier: 2 },
    CON: { score: 15, modifier: 2 },
    INT: { score: 10, modifier: 0 },
    WIS: { score: 12, modifier: 1 },
    CHA: { score: 9, modifier: -1 }
  },
  combat: {
    armor_class: 16,
    initiative: 2,
    speed: 30,
    hit_points: { current: 12, max: 12, temporary: 0 }
  },
  carrying_capacity: 240,
  push_drag_lift: 480,
  spellcasting: null
}

describe('Inventory Page', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    // Setup MSW handlers for this test
    server.use(
      http.get('/api/characters/:id', () => {
        return HttpResponse.json({ data: mockCharacter })
      }),
      http.get('/api/characters/:id/equipment', () => {
        return HttpResponse.json({ data: mockEquipment })
      }),
      http.get('/api/characters/:id/stats', () => {
        return HttpResponse.json({ data: mockStats })
      })
    )
  })

  it('renders tab navigation', async () => {
    const wrapper = await mountSuspended(InventoryPage)

    // Tab navigation should be present
    expect(wrapper.find('[data-testid="tab-navigation"]').exists()).toBe(true)
  })

  it('renders inventory layout with two columns on desktop', async () => {
    const wrapper = await mountSuspended(InventoryPage)

    // Two-column layout should be present
    expect(wrapper.find('[data-testid="inventory-layout"]').exists()).toBe(true)
  })

  it('shows search input for items', async () => {
    const wrapper = await mountSuspended(InventoryPage)

    expect(wrapper.find('[data-testid="item-search"]').exists()).toBe(true)
  })

  it('shows Add Loot and Shop buttons', async () => {
    const wrapper = await mountSuspended(InventoryPage)

    expect(wrapper.find('[data-testid="add-loot-btn"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="shop-btn"]').exists()).toBe(true)
  })

  it('has back to character button', async () => {
    const wrapper = await mountSuspended(InventoryPage)

    // Should have a back button linking to character sheet
    const backLink = wrapper.find('a[href*="/characters/iron-phoenix-X7k2"]')
    expect(backLink.exists()).toBe(true)
    expect(backLink.text()).toContain('Back to Character')
  })
})
