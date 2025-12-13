// tests/components/character/inventory/EquipmentStatus.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EquipmentStatus from '~/components/character/inventory/EquipmentStatus.vue'
import EquipmentPaperdoll from '~/components/character/inventory/EquipmentPaperdoll.vue'
import type { CharacterEquipment } from '~/types/character'

// Mock equipment with various locations (using expanded slot system)
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
    location: 'main_hand',
    is_attuned: false
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
    location: 'off_hand',
    is_attuned: false
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
    location: 'armor', // Changed from 'worn' to 'armor'
    is_attuned: false
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
    location: 'ring_1', // Specific slot instead of 'attuned'
    is_attuned: true // Attunement is now a boolean flag
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
    location: 'backpack', // Changed from 'inventory' to 'backpack'
    is_attuned: false
  }
]

describe('EquipmentStatus', () => {
  it('renders the EquipmentPaperdoll component', async () => {
    const wrapper = await mountSuspended(EquipmentStatus, {
      props: { equipment: mockEquipment }
    })

    // Should render the paperdoll component
    const paperdoll = wrapper.findComponent(EquipmentPaperdoll)
    expect(paperdoll.exists()).toBe(true)
    expect(paperdoll.props('equipment')).toEqual(mockEquipment)
  })

  it('displays attuned items section with count', async () => {
    const wrapper = await mountSuspended(EquipmentStatus, {
      props: { equipment: mockEquipment }
    })

    expect(wrapper.text()).toContain('Attuned')
    expect(wrapper.text()).toContain('1/3')
    expect(wrapper.text()).toContain('Ring of Protection')
  })

  it('shows empty state when no items are attuned', async () => {
    const emptyEquipment: CharacterEquipment[] = []

    const wrapper = await mountSuspended(EquipmentStatus, {
      props: { equipment: emptyEquipment }
    })

    // Attuned shows "None"
    expect(wrapper.text()).toContain('None')
    expect(wrapper.text()).toContain('0/3')
  })

  it('emits item-click when paperdoll emits item-click', async () => {
    const wrapper = await mountSuspended(EquipmentStatus, {
      props: { equipment: mockEquipment }
    })

    // Find the paperdoll component
    const paperdoll = wrapper.findComponent(EquipmentPaperdoll)

    // Emit item-click from paperdoll
    await paperdoll.vm.$emit('item-click', 1)

    // Should pass through to parent
    expect(wrapper.emitted('item-click')).toBeTruthy()
    expect(wrapper.emitted('item-click')![0]).toEqual([1])
  })

  it('emits item-click when clicking on attuned item', async () => {
    const wrapper = await mountSuspended(EquipmentStatus, {
      props: { equipment: mockEquipment }
    })

    // Find and click the attuned item
    const attunedItem = wrapper.find('[data-testid="attuned-item-4"]')
    await attunedItem.trigger('click')

    expect(wrapper.emitted('item-click')).toBeTruthy()
    expect(wrapper.emitted('item-click')![0]).toEqual([4])
  })

  it('displays multiple attuned items', async () => {
    const multipleAttunedEquipment: CharacterEquipment[] = [
      {
        id: 1,
        item: { name: 'Ring of Protection', requires_attunement: true },
        item_slug: 'dmg:ring-of-protection',
        is_dangling: 'false',
        custom_name: null,
        custom_description: null,
        quantity: 1,
        equipped: true,
        location: 'ring_1',
        is_attuned: true
      },
      {
        id: 2,
        item: { name: 'Cloak of Elvenkind', requires_attunement: true },
        item_slug: 'dmg:cloak-of-elvenkind',
        is_dangling: 'false',
        custom_name: null,
        custom_description: null,
        quantity: 1,
        equipped: true,
        location: 'cloak',
        is_attuned: true
      }
    ]

    const wrapper = await mountSuspended(EquipmentStatus, {
      props: { equipment: multipleAttunedEquipment }
    })

    expect(wrapper.text()).toContain('Attuned')
    expect(wrapper.text()).toContain('2/3')
    expect(wrapper.text()).toContain('Ring of Protection')
    expect(wrapper.text()).toContain('Cloak of Elvenkind')
  })

  it('uses custom_name for attuned items when present', async () => {
    const customNameEquipment: CharacterEquipment[] = [
      {
        id: 1,
        item: { name: 'Ring of Protection', requires_attunement: true },
        item_slug: 'dmg:ring-of-protection',
        is_dangling: 'false',
        custom_name: 'Lucky Ring',
        custom_description: null,
        quantity: 1,
        equipped: true,
        location: 'ring_1',
        is_attuned: true
      }
    ]

    const wrapper = await mountSuspended(EquipmentStatus, {
      props: { equipment: customNameEquipment }
    })

    expect(wrapper.text()).toContain('Lucky Ring')
    expect(wrapper.text()).not.toContain('Ring of Protection')
  })
})
