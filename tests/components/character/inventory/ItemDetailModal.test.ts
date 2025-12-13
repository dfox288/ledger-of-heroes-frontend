// tests/components/character/inventory/ItemDetailModal.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import ItemDetailModal from '~/components/character/inventory/ItemDetailModal.vue'
import type { CharacterEquipment } from '~/types/character'

// Mock full item data (as returned by /items/{slug} API)
const mockFullItemData = {
  name: 'Longsword',
  slug: 'phb:longsword',
  description: 'A versatile martial weapon favored by knights.',
  weight: '3.00',
  item_type: { name: 'Melee Weapon' },
  damage_dice: '1d8',
  damage_type: { name: 'slashing' },
  properties: [
    { name: 'Versatile', description: 'Can be used with one or two hands' },
    { name: 'Martial', description: 'Requires martial weapon proficiency' }
  ],
  cost_cp: 1500,
  rarity: 'common',
  range_normal: null,
  range_long: null,
  requires_attunement: false,
  stealth_disadvantage: false,
  strength_requirement: null
}

// Mock apiFetch
const mockApiFetch = vi.fn()
mockNuxtImport('useApi', () => () => ({
  apiFetch: mockApiFetch
}))

// Equipment record (minimal data from /characters/{id}/equipment)
const mockWeapon: CharacterEquipment = {
  id: 1,
  item: {
    name: 'Longsword',
    weight: '3.00',
    item_type: 'Melee Weapon',
    damage_dice: '1d8',
    requires_attunement: false
  },
  item_slug: 'phb:longsword',
  is_dangling: 'false',
  custom_name: null,
  custom_description: null,
  quantity: 1,
  equipped: true,
  location: 'main_hand'
}

const mockPotion: CharacterEquipment = {
  id: 3,
  item: {
    name: 'Potion of Healing',
    weight: '0.50',
    item_type: 'Potion'
  },
  item_slug: 'phb:potion-of-healing',
  is_dangling: 'false',
  custom_name: null,
  custom_description: null,
  quantity: 3,
  equipped: false,
  location: 'inventory'
}

const mockCustomItem: CharacterEquipment = {
  id: 5,
  item: null,
  item_slug: null,
  is_dangling: 'false',
  custom_name: 'Magic Ring',
  custom_description: 'A ring that glows faintly.',
  quantity: 1,
  equipped: false,
  location: 'backpack'
}

/**
 * ItemDetailModal Tests
 *
 * The modal fetches full item data from /items/{slug} when opened.
 * Tests verify the component handles loading states, API responses,
 * and custom items (which don't have slugs to fetch).
 *
 * @see Design: docs/frontend/plans/2025-12-13-inventory-redesign.md
 */
describe('ItemDetailModal', () => {
  beforeEach(() => {
    mockApiFetch.mockReset()
    mockApiFetch.mockResolvedValue({ data: mockFullItemData })
  })

  it('mounts successfully with item prop', async () => {
    const wrapper = await mountSuspended(ItemDetailModal, {
      props: { open: true, item: mockWeapon }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('mounts successfully with null item', async () => {
    const wrapper = await mountSuspended(ItemDetailModal, {
      props: { open: true, item: null }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('accepts open prop', async () => {
    const wrapper = await mountSuspended(ItemDetailModal, {
      props: { open: false, item: mockWeapon }
    })

    expect(wrapper.props('open')).toBe(false)
  })

  it('emits update:open event', async () => {
    const wrapper = await mountSuspended(ItemDetailModal, {
      props: { open: true, item: mockWeapon }
    })

    wrapper.vm.$emit('update:open', false)

    expect(wrapper.emitted('update:open')).toBeTruthy()
    expect(wrapper.emitted('update:open')![0]).toEqual([false])
  })

  describe('API fetching', () => {
    it('fetches full item data when modal opens with slug', async () => {
      await mountSuspended(ItemDetailModal, {
        props: { open: true, item: mockWeapon }
      })
      await flushPromises()

      expect(mockApiFetch).toHaveBeenCalledWith('/items/phb:longsword')
    })

    it('does not fetch when modal is closed', async () => {
      await mountSuspended(ItemDetailModal, {
        props: { open: false, item: mockWeapon }
      })
      await flushPromises()

      expect(mockApiFetch).not.toHaveBeenCalled()
    })

    it('does not fetch for custom items (no slug)', async () => {
      await mountSuspended(ItemDetailModal, {
        props: { open: true, item: mockCustomItem }
      })
      await flushPromises()

      expect(mockApiFetch).not.toHaveBeenCalled()
    })

    it('shows loading state while fetching', async () => {
      // Create a promise that won't resolve immediately
      let resolvePromise: (value: unknown) => void
      mockApiFetch.mockReturnValue(new Promise(resolve => {
        resolvePromise = resolve
      }))

      const wrapper = await mountSuspended(ItemDetailModal, {
        props: { open: true, item: mockWeapon }
      })

      // Check loading state is true
      expect((wrapper.vm as unknown as { isLoading: boolean }).isLoading).toBe(true)

      // Resolve the promise
      resolvePromise!({ data: mockFullItemData })
      await flushPromises()

      expect((wrapper.vm as unknown as { isLoading: boolean }).isLoading).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('computes displayName from fetched data', async () => {
      const wrapper = await mountSuspended(ItemDetailModal, {
        props: { open: true, item: mockWeapon }
      })
      await flushPromises()

      expect((wrapper.vm as unknown as { displayName: string }).displayName).toBe('Longsword')
    })

    it('computes displayName from custom_name when present', async () => {
      const customNameItem: CharacterEquipment = {
        ...mockWeapon,
        custom_name: 'Flametongue'
      }

      const wrapper = await mountSuspended(ItemDetailModal, {
        props: { open: true, item: customNameItem }
      })
      await flushPromises()

      expect((wrapper.vm as unknown as { displayName: string }).displayName).toBe('Flametongue')
    })

    it('computes description from fetched data', async () => {
      const wrapper = await mountSuspended(ItemDetailModal, {
        props: { open: true, item: mockWeapon }
      })
      await flushPromises()

      expect((wrapper.vm as unknown as { description: string }).description).toContain('versatile martial weapon')
    })

    it('computes description from custom_description when present', async () => {
      const wrapper = await mountSuspended(ItemDetailModal, {
        props: { open: true, item: mockCustomItem }
      })
      await flushPromises()

      expect((wrapper.vm as unknown as { description: string }).description).toContain('glows faintly')
    })

    it('parses JSON custom_description correctly', async () => {
      const itemWithJsonDesc: CharacterEquipment = {
        ...mockWeapon,
        custom_description: '{"source":"background","description":"A family heirloom."}'
      }

      const wrapper = await mountSuspended(ItemDetailModal, {
        props: { open: true, item: itemWithJsonDesc }
      })
      await flushPromises()

      expect((wrapper.vm as unknown as { description: string }).description).toBe('A family heirloom.')
    })

    it('computes weight from fetched data', async () => {
      const wrapper = await mountSuspended(ItemDetailModal, {
        props: { open: true, item: mockWeapon }
      })
      await flushPromises()

      expect((wrapper.vm as unknown as { weight: number | null }).weight).toBe(3)
    })

    it('computes costGp correctly (cp to gp conversion)', async () => {
      const wrapper = await mountSuspended(ItemDetailModal, {
        props: { open: true, item: mockWeapon }
      })
      await flushPromises()

      // 1500 cp = 15 gp
      expect((wrapper.vm as unknown as { costGp: string | null }).costGp).toBe('15')
    })

    it('computes damageText with type from fetched data', async () => {
      const wrapper = await mountSuspended(ItemDetailModal, {
        props: { open: true, item: mockWeapon }
      })
      await flushPromises()

      expect((wrapper.vm as unknown as { damageText: string | null }).damageText).toBe('1d8 slashing')
    })

    it('computes properties from fetched data', async () => {
      const wrapper = await mountSuspended(ItemDetailModal, {
        props: { open: true, item: mockWeapon }
      })
      await flushPromises()

      const properties = (wrapper.vm as unknown as { properties: Array<{ name: string }> }).properties
      expect(properties.map(p => p.name)).toContain('Versatile')
      expect(properties.map(p => p.name)).toContain('Martial')
    })

    it('computes rarityColor based on rarity', async () => {
      mockApiFetch.mockResolvedValue({
        data: { ...mockFullItemData, rarity: 'rare' }
      })

      const wrapper = await mountSuspended(ItemDetailModal, {
        props: { open: true, item: mockWeapon }
      })
      await flushPromises()

      expect((wrapper.vm as unknown as { rarityColor: string }).rarityColor).toBe('info')
    })

    it('identifies custom items correctly', async () => {
      const wrapper = await mountSuspended(ItemDetailModal, {
        props: { open: true, item: mockCustomItem }
      })
      await flushPromises()

      expect((wrapper.vm as unknown as { isCustomItem: boolean }).isCustomItem).toBe(true)
    })
  })
})
