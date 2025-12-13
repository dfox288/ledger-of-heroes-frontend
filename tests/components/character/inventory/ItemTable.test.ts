// tests/components/character/inventory/ItemTable.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick } from 'vue'
import ItemTable from '~/components/character/inventory/ItemTable.vue'
import type { CharacterEquipment } from '~/types/character'

const mockWeapon: CharacterEquipment = {
  id: 1,
  item: { name: 'Longsword', item_type: 'Melee Weapon', weight: '3.00' },
  item_slug: 'phb:longsword',
  is_dangling: 'false',
  custom_name: null,
  custom_description: null,
  quantity: 1,
  equipped: true,
  location: 'main_hand'
}

const mockArmor: CharacterEquipment = {
  id: 2,
  item: { name: 'Chain Mail', item_type: 'Heavy Armor', armor_class: 16 },
  item_slug: 'phb:chain-mail',
  is_dangling: 'false',
  custom_name: null,
  custom_description: null,
  quantity: 1,
  equipped: true,
  location: 'worn'
}

const mockPotion: CharacterEquipment = {
  id: 3,
  item: { name: 'Potion of Healing', item_type: 'Potion', weight: '0.50' },
  item_slug: 'phb:potion-of-healing',
  is_dangling: 'false',
  custom_name: null,
  custom_description: null,
  quantity: 3,
  equipped: false,
  location: 'inventory'
}

const mockGear: CharacterEquipment = {
  id: 4,
  item: { name: 'Rope (50 ft)', item_type: 'Adventuring Gear', weight: '10.00' },
  item_slug: 'phb:rope-hempen',
  is_dangling: 'false',
  custom_name: null,
  custom_description: null,
  quantity: 1,
  equipped: false,
  location: 'inventory'
}

const mockMagicRing: CharacterEquipment = {
  id: 5,
  item: { name: 'Ring of Protection', item_type: 'Ring', requires_attunement: true },
  item_slug: 'dmg:ring-of-protection',
  is_dangling: 'false',
  custom_name: null,
  custom_description: null,
  quantity: 1,
  equipped: true,
  location: 'attuned'
}

const mockEquipment = [mockWeapon, mockArmor, mockPotion, mockGear, mockMagicRing]

describe('ItemTable', () => {
  describe('grouping', () => {
    it('groups items by type', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: mockEquipment, editable: false }
      })

      expect(wrapper.text()).toContain('Weapons')
      expect(wrapper.text()).toContain('Armor')
      expect(wrapper.text()).toContain('Consumables')
      expect(wrapper.text()).toContain('Gear')
    })

    it('shows item count in group header', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: mockEquipment, editable: false }
      })

      // Weapons has 1 item
      expect(wrapper.text()).toMatch(/Weapons\s*\(1\)/)
      // Consumables has 1 item (the potion)
      expect(wrapper.text()).toMatch(/Consumables\s*\(1\)/)
    })

    it('hides empty groups', async () => {
      const weaponsOnly = [mockWeapon]
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: weaponsOnly, editable: false }
      })

      expect(wrapper.text()).toContain('Weapons')
      expect(wrapper.text()).not.toContain('Armor')
      expect(wrapper.text()).not.toContain('Consumables')
    })

    it('toggles collapsed state when header clicked', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: mockEquipment, editable: false }
      })

      // Initially should show chevron-down (expanded)
      const header = wrapper.find('[data-testid="group-header-weapons"]')
      expect(header.html()).toContain('chevron-down')

      // Click to collapse
      await header.trigger('click')
      await nextTick()

      // Should show chevron-right (collapsed)
      expect(header.html()).toContain('chevron-right')
    })
  })

  describe('item display', () => {
    it('displays item names', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: mockEquipment, editable: false }
      })

      expect(wrapper.text()).toContain('Longsword')
      expect(wrapper.text()).toContain('Chain Mail')
      expect(wrapper.text()).toContain('Potion of Healing')
    })

    it('displays quantity for stacked items', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [mockPotion], editable: false }
      })

      expect(wrapper.text()).toContain('3×')
    })

    it('does not display quantity for single items', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [mockWeapon], editable: false }
      })

      expect(wrapper.text()).not.toContain('1×')
    })

    it('displays location badge for equipped items', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [mockWeapon], editable: false }
      })

      expect(wrapper.text()).toContain('Main Hand')
    })

    it('uses custom_name when present', async () => {
      const customItem: CharacterEquipment = {
        ...mockWeapon,
        custom_name: 'Flametongue'
      }

      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [customItem], editable: false }
      })

      expect(wrapper.text()).toContain('Flametongue')
      expect(wrapper.text()).not.toContain('Longsword')
    })
  })

  describe('search filtering', () => {
    it('filters items by search query', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: mockEquipment, editable: false, searchQuery: 'sword' }
      })

      expect(wrapper.text()).toContain('Longsword')
      expect(wrapper.text()).not.toContain('Chain Mail')
      expect(wrapper.text()).not.toContain('Potion')
    })

    it('shows empty search state when no matches', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: mockEquipment, editable: false, searchQuery: 'nonexistent' }
      })

      expect(wrapper.find('[data-testid="empty-search"]').exists()).toBe(true)
    })
  })

  describe('empty states', () => {
    it('shows empty state when no items', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [], editable: false }
      })

      expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('No items in inventory')
    })
  })

  describe('actions (editable mode)', () => {
    it('shows action buttons in editable mode', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [mockWeapon], editable: true }
      })

      expect(wrapper.find('[data-testid="action-unequip"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="action-menu"]').exists()).toBe(true)
    })

    it('hides action buttons when not editable', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [mockWeapon], editable: false }
      })

      expect(wrapper.find('[data-testid="action-unequip"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="action-menu"]').exists()).toBe(false)
    })

    it('shows equip button for unequipped equippable items', async () => {
      const unequippedWeapon: CharacterEquipment = {
        ...mockWeapon,
        equipped: false,
        location: 'inventory'
      }

      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [unequippedWeapon], editable: true }
      })

      expect(wrapper.find('[data-testid="action-equip"]').exists()).toBe(true)
    })

    it('shows unequip button for equipped items', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [mockWeapon], editable: true }
      })

      expect(wrapper.find('[data-testid="action-unequip"]').exists()).toBe(true)
    })

    it('hides equip button for non-equippable items (potions)', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [mockPotion], editable: true }
      })

      expect(wrapper.find('[data-testid="action-equip"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="action-unequip"]').exists()).toBe(false)
    })

    it('shows quantity buttons for stacked items', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [mockPotion], editable: true }
      })

      expect(wrapper.find('[data-testid="action-increment"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="action-decrement"]').exists()).toBe(true)
    })

    it('hides quantity buttons for single items', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [mockWeapon], editable: true }
      })

      expect(wrapper.find('[data-testid="action-increment"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="action-decrement"]').exists()).toBe(false)
    })
  })

  describe('events', () => {
    it('emits item-click when row clicked', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [mockWeapon], editable: false }
      })

      const row = wrapper.find('[data-testid="item-row-1"]')
      await row.trigger('click')

      expect(wrapper.emitted('item-click')).toBeTruthy()
      expect(wrapper.emitted('item-click')![0][0]).toEqual(mockWeapon)
    })

    it('emits unequip when unequip button clicked', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [mockWeapon], editable: true }
      })

      const btn = wrapper.find('[data-testid="action-unequip"]')
      await btn.trigger('click')

      expect(wrapper.emitted('unequip')).toBeTruthy()
      expect(wrapper.emitted('unequip')![0]).toEqual([1])
    })

    it('emits equip with correct slot when equip button clicked', async () => {
      const unequippedWeapon: CharacterEquipment = {
        ...mockWeapon,
        equipped: false,
        location: 'inventory'
      }

      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [unequippedWeapon], editable: true }
      })

      const btn = wrapper.find('[data-testid="action-equip"]')
      await btn.trigger('click')

      expect(wrapper.emitted('equip')).toBeTruthy()
      // Weapon should default to main_hand
      expect(wrapper.emitted('equip')![0]).toEqual([1, 'main_hand'])
    })

    it('emits decrement-qty when minus button clicked', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [mockPotion], editable: true }
      })

      const btn = wrapper.find('[data-testid="action-decrement"]')
      await btn.trigger('click')

      expect(wrapper.emitted('decrement-qty')).toBeTruthy()
      expect(wrapper.emitted('decrement-qty')![0]).toEqual([3])
    })

    it('emits increment-qty when plus button clicked', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [mockPotion], editable: true }
      })

      const btn = wrapper.find('[data-testid="action-increment"]')
      await btn.trigger('click')

      expect(wrapper.emitted('increment-qty')).toBeTruthy()
      expect(wrapper.emitted('increment-qty')![0]).toEqual([3])
    })
  })

  describe('equipped row highlighting', () => {
    it('applies border class to equipped items', async () => {
      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [mockWeapon], editable: false }
      })

      const row = wrapper.find('[data-testid="item-row-1"]')
      expect(row.classes()).toContain('border-l-3')
      expect(row.classes()).toContain('border-primary')
    })

    it('does not apply border class to unequipped items', async () => {
      const unequippedItem: CharacterEquipment = {
        ...mockWeapon,
        equipped: false,
        location: 'inventory'
      }

      const wrapper = await mountSuspended(ItemTable, {
        props: { items: [unequippedItem], editable: false }
      })

      const row = wrapper.find('[data-testid="item-row-1"]')
      expect(row.classes()).not.toContain('border-primary')
    })
  })
})
