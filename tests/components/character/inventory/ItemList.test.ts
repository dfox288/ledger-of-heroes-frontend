// tests/components/character/inventory/ItemList.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ItemList from '~/components/character/inventory/ItemList.vue'
import type { CharacterEquipment } from '~/types/character'

// Mock equipment array - mix of equipped and inventory items
const mockEquipment: CharacterEquipment[] = [
  {
    id: 1,
    item: { name: 'Longsword', weight: '3.00', item_type: 'Melee Weapon' },
    item_slug: 'phb:longsword',
    is_dangling: 'false',
    custom_name: null,
    custom_description: null,
    quantity: 1,
    equipped: true,
    location: 'main_hand'
  },
  {
    id: 2,
    item: { name: 'Shield', weight: '6.00', item_type: 'Shield' },
    item_slug: 'phb:shield',
    is_dangling: 'false',
    custom_name: null,
    custom_description: null,
    quantity: 1,
    equipped: true,
    location: 'off_hand'
  },
  {
    id: 3,
    item: { name: 'Potion of Healing', weight: '0.50', item_type: 'Potion' },
    item_slug: 'phb:potion-of-healing',
    is_dangling: 'false',
    custom_name: null,
    custom_description: null,
    quantity: 3,
    equipped: false,
    location: 'inventory'
  },
  {
    id: 4,
    item: { name: 'Rope', weight: '10.00', item_type: 'Adventuring Gear', description: '50 feet of hemp rope' },
    item_slug: 'phb:rope',
    is_dangling: 'false',
    custom_name: null,
    custom_description: null,
    quantity: 1,
    equipped: false,
    location: 'inventory'
  }
]

describe('ItemList', () => {
  describe('rendering', () => {
    it('renders all items as ItemRow components', async () => {
      const wrapper = await mountSuspended(ItemList, {
        props: { items: mockEquipment, editable: true }
      })

      // Should render 4 items
      const rows = wrapper.findAll('[data-testid="item-row"]')
      expect(rows).toHaveLength(4)
    })

    it('displays item names in the list', async () => {
      const wrapper = await mountSuspended(ItemList, {
        props: { items: mockEquipment, editable: true }
      })

      expect(wrapper.text()).toContain('Longsword')
      expect(wrapper.text()).toContain('Shield')
      expect(wrapper.text()).toContain('Potion of Healing')
      expect(wrapper.text()).toContain('Rope')
    })

    it('shows empty state when no items', async () => {
      const wrapper = await mountSuspended(ItemList, {
        props: { items: [], editable: true }
      })

      expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('No items')
    })

    it('preserves item order from props (no client-side sorting)', async () => {
      const wrapper = await mountSuspended(ItemList, {
        props: { items: mockEquipment, editable: true }
      })

      const rows = wrapper.findAll('[data-testid="item-row"]')
      // Order should match the input array
      expect(rows[0].text()).toContain('Longsword')
      expect(rows[1].text()).toContain('Shield')
      expect(rows[2].text()).toContain('Potion of Healing')
      expect(rows[3].text()).toContain('Rope')
    })
  })

  describe('search filtering', () => {
    it('filters items by search query (case insensitive)', async () => {
      const wrapper = await mountSuspended(ItemList, {
        props: { items: mockEquipment, editable: true }
      })

      // Enter search query
      const searchInput = wrapper.find('[data-testid="item-search"]')
      await searchInput.setValue('potion')

      const rows = wrapper.findAll('[data-testid="item-row"]')
      expect(rows).toHaveLength(1)
      expect(wrapper.text()).toContain('Potion of Healing')
    })

    it('shows all items when search is cleared', async () => {
      const wrapper = await mountSuspended(ItemList, {
        props: { items: mockEquipment, editable: true }
      })

      // Enter and clear search
      const searchInput = wrapper.find('[data-testid="item-search"]')
      await searchInput.setValue('potion')
      await searchInput.setValue('')

      const rows = wrapper.findAll('[data-testid="item-row"]')
      expect(rows).toHaveLength(4)
    })

    it('shows empty state when search matches nothing', async () => {
      const wrapper = await mountSuspended(ItemList, {
        props: { items: mockEquipment, editable: true }
      })

      const searchInput = wrapper.find('[data-testid="item-search"]')
      await searchInput.setValue('nonexistent item xyz')

      expect(wrapper.find('[data-testid="empty-search"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('No items match')
    })

    it('searches in custom_name when present', async () => {
      const customItem: CharacterEquipment = {
        id: 5,
        item: null,
        item_slug: null,
        is_dangling: 'false',
        custom_name: 'Lucky Charm',
        custom_description: null,
        quantity: 1,
        equipped: false,
        location: 'inventory'
      }

      const wrapper = await mountSuspended(ItemList, {
        props: { items: [...mockEquipment, customItem], editable: true }
      })

      const searchInput = wrapper.find('[data-testid="item-search"]')
      await searchInput.setValue('lucky')

      const rows = wrapper.findAll('[data-testid="item-row"]')
      expect(rows).toHaveLength(1)
      expect(wrapper.text()).toContain('Lucky Charm')
    })
  })

  describe('editable prop', () => {
    it('passes editable prop to ItemRow components', async () => {
      const wrapper = await mountSuspended(ItemList, {
        props: { items: mockEquipment, editable: false }
      })

      // When not editable, action menus should be hidden
      expect(wrapper.find('[data-testid="item-actions"]').exists()).toBe(false)
    })
  })

  describe('event forwarding', () => {
    it('emits unequip event from ItemRow', async () => {
      const wrapper = await mountSuspended(ItemList, {
        props: { items: mockEquipment, editable: true }
      })

      // Expand first item and click unequip
      const firstRow = wrapper.find('[data-testid="item-row"]')
      await firstRow.trigger('click')

      const unequipBtn = wrapper.find('[data-testid="action-unequip"]')
      await unequipBtn.trigger('click')

      expect(wrapper.emitted('unequip')).toBeTruthy()
      expect(wrapper.emitted('unequip')![0]).toEqual([1])
    })

    it('emits drop event from ItemRow', async () => {
      const wrapper = await mountSuspended(ItemList, {
        props: { items: mockEquipment, editable: true }
      })

      // Expand third item (potion) and click drop
      const rows = wrapper.findAll('[data-testid="item-row"]')
      await rows[2].trigger('click')

      const dropBtn = wrapper.find('[data-testid="action-drop"]')
      await dropBtn.trigger('click')

      expect(wrapper.emitted('drop')).toBeTruthy()
      expect(wrapper.emitted('drop')![0]).toEqual([3])
    })
  })

  describe('item count display', () => {
    it('shows total item count', async () => {
      const wrapper = await mountSuspended(ItemList, {
        props: { items: mockEquipment, editable: true }
      })

      expect(wrapper.text()).toContain('4 items')
    })

    it('shows filtered count when searching', async () => {
      const wrapper = await mountSuspended(ItemList, {
        props: { items: mockEquipment, editable: true }
      })

      const searchInput = wrapper.find('[data-testid="item-search"]')
      await searchInput.setValue('sword')

      expect(wrapper.text()).toContain('1 of 4')
    })

    it('uses singular "item" when count is 1', async () => {
      const singleItem: CharacterEquipment[] = [mockEquipment[0]]

      const wrapper = await mountSuspended(ItemList, {
        props: { items: singleItem, editable: true }
      })

      expect(wrapper.text()).toContain('1 item')
      expect(wrapper.text()).not.toContain('1 items')
    })
  })
})
