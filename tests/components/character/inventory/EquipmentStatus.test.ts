// tests/components/character/inventory/EquipmentStatus.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EquipmentStatus from '~/components/character/inventory/EquipmentStatus.vue'
import type { CharacterEquipment } from '~/types/character'

// Mock equipment with various locations
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
    item: { name: 'Chain Mail', weight: '55.00', armor_class: 16, item_type: 'Heavy Armor' },
    item_slug: 'phb:chain-mail',
    is_dangling: 'false',
    custom_name: null,
    custom_description: null,
    quantity: 1,
    equipped: true,
    location: 'worn'
  },
  {
    id: 4,
    item: { name: 'Ring of Protection', requires_attunement: true },
    item_slug: 'dmg:ring-of-protection',
    is_dangling: 'false',
    custom_name: null,
    custom_description: null,
    quantity: 1,
    equipped: true,
    location: 'attuned'
  },
  {
    id: 5,
    item: { name: 'Backpack', weight: '5.00' },
    item_slug: 'phb:backpack',
    is_dangling: 'false',
    custom_name: null,
    custom_description: null,
    quantity: 1,
    equipped: false,
    location: 'inventory'
  }
]

describe('EquipmentStatus', () => {
  it('displays wielded section with main hand and off hand', async () => {
    const wrapper = await mountSuspended(EquipmentStatus, {
      props: { equipment: mockEquipment }
    })

    expect(wrapper.text()).toContain('Wielded')
    expect(wrapper.text()).toContain('Main Hand')
    expect(wrapper.text()).toContain('Off Hand')
    expect(wrapper.text()).toContain('Longsword')
    expect(wrapper.text()).toContain('Shield')
  })

  it('displays worn armor with AC', async () => {
    const wrapper = await mountSuspended(EquipmentStatus, {
      props: { equipment: mockEquipment }
    })

    expect(wrapper.text()).toContain('Armor')
    expect(wrapper.text()).toContain('Chain Mail')
    expect(wrapper.text()).toContain('AC 16')
  })

  it('displays attuned items with count', async () => {
    const wrapper = await mountSuspended(EquipmentStatus, {
      props: { equipment: mockEquipment }
    })

    expect(wrapper.text()).toContain('Attuned')
    expect(wrapper.text()).toContain('1/3')
    expect(wrapper.text()).toContain('Ring of Protection')
  })

  it('shows empty states when nothing equipped', async () => {
    const emptyEquipment: CharacterEquipment[] = []

    const wrapper = await mountSuspended(EquipmentStatus, {
      props: { equipment: emptyEquipment }
    })

    // Wielded and Armor show "Empty" / "No armor"
    expect(wrapper.text()).toContain('Empty')
    expect(wrapper.text()).toContain('No armor')
    // Attuned shows "None" instead of empty slot placeholders
    expect(wrapper.text()).toContain('None')
    expect(wrapper.text()).toContain('0/3')
  })

  it('shows two-handed indicator when main hand has two-handed weapon', async () => {
    const twoHandedEquipment: CharacterEquipment[] = [
      {
        id: 1,
        item: { name: 'Greatsword', properties: ['Two-Handed'] },
        item_slug: 'phb:greatsword',
        is_dangling: 'false',
        custom_name: null,
        custom_description: null,
        quantity: 1,
        equipped: true,
        location: 'main_hand'
      }
    ]

    const wrapper = await mountSuspended(EquipmentStatus, {
      props: { equipment: twoHandedEquipment }
    })

    expect(wrapper.text()).toContain('Greatsword')
    // Off hand should indicate two-handed
    expect(wrapper.text()).toMatch(/two.handed/i)
  })

  it('emits item-click when clicking on an equipped item', async () => {
    const wrapper = await mountSuspended(EquipmentStatus, {
      props: { equipment: mockEquipment }
    })

    // Find and click the main hand item
    const mainHandItem = wrapper.find('[data-testid="main-hand-item"]')
    await mainHandItem.trigger('click')

    expect(wrapper.emitted('item-click')).toBeTruthy()
    expect(wrapper.emitted('item-click')![0]).toEqual([1]) // itemId = 1
  })

  it('uses custom_name when present', async () => {
    const customNameEquipment: CharacterEquipment[] = [
      {
        id: 1,
        item: { name: 'Longsword' },
        item_slug: 'phb:longsword',
        is_dangling: 'false',
        custom_name: 'Flametongue',
        custom_description: null,
        quantity: 1,
        equipped: true,
        location: 'main_hand'
      }
    ]

    const wrapper = await mountSuspended(EquipmentStatus, {
      props: { equipment: customNameEquipment }
    })

    expect(wrapper.text()).toContain('Flametongue')
    expect(wrapper.text()).not.toContain('Longsword')
  })
})
