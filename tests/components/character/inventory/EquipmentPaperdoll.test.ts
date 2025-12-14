// tests/components/character/inventory/EquipmentPaperdoll.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EquipmentPaperdoll from '~/components/character/inventory/EquipmentPaperdoll.vue'
import type { CharacterEquipment } from '~/types/character'

const mockEquipment: CharacterEquipment[] = [
  {
    id: 1,
    item_slug: 'phb:longsword',
    item: { name: 'Longsword', item_type: 'Melee Weapon' },
    custom_name: null,
    custom_description: null,
    quantity: 1,
    equipped: true,
    location: 'main_hand',
    is_attuned: false
  },
  {
    id: 2,
    item_slug: 'phb:chain-mail',
    item: { name: 'Chain Mail', item_type: 'Heavy Armor', armor_class: 16 },
    custom_name: null,
    custom_description: null,
    quantity: 1,
    equipped: true,
    location: 'armor',
    is_attuned: false
  },
  {
    id: 3,
    item_slug: 'dmg:cloak-of-elvenkind',
    item: { name: 'Cloak of Elvenkind', item_type: 'Wondrous Item' },
    custom_name: null,
    custom_description: null,
    quantity: 1,
    equipped: true,
    location: 'cloak',
    is_attuned: true
  }
]

describe('EquipmentPaperdoll', () => {
  it('renders all 12 equipment slots', async () => {
    const wrapper = await mountSuspended(EquipmentPaperdoll, {
      props: { equipment: [] }
    })

    expect(wrapper.find('[data-testid="slot-head"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="slot-neck"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="slot-cloak"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="slot-armor"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="slot-clothes"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="slot-belt"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="slot-hands"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="slot-ring_1"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="slot-ring_2"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="slot-feet"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="slot-main_hand"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="slot-off_hand"]').exists()).toBe(true)
  })

  it('shows empty indicator for unoccupied slots', async () => {
    const wrapper = await mountSuspended(EquipmentPaperdoll, {
      props: { equipment: [] }
    })

    const headSlot = wrapper.find('[data-testid="slot-head"]')
    // Empty slots show "—" (em dash) as visual indicator
    expect(headSlot.text()).toContain('—')
  })

  it('shows item name in occupied slot', async () => {
    const wrapper = await mountSuspended(EquipmentPaperdoll, {
      props: { equipment: mockEquipment }
    })

    const mainHandSlot = wrapper.find('[data-testid="slot-main_hand"]')
    expect(mainHandSlot.text()).toContain('Longsword')

    const armorSlot = wrapper.find('[data-testid="slot-armor"]')
    expect(armorSlot.text()).toContain('Chain Mail')
  })

  it('emits item-click when clicking equipped item', async () => {
    const wrapper = await mountSuspended(EquipmentPaperdoll, {
      props: { equipment: mockEquipment }
    })

    const mainHandItem = wrapper.find('[data-testid="slot-main_hand"] button')
    await mainHandItem.trigger('click')

    expect(wrapper.emitted('item-click')).toBeTruthy()
    expect(wrapper.emitted('item-click')![0]).toEqual([1])
  })

  it('does not emit click for empty slots', async () => {
    const wrapper = await mountSuspended(EquipmentPaperdoll, {
      props: { equipment: [] }
    })

    const headSlot = wrapper.find('[data-testid="slot-head"]')
    await headSlot.trigger('click')

    expect(wrapper.emitted('item-click')).toBeFalsy()
  })

  it('shows custom name if provided', async () => {
    const customEquipment: CharacterEquipment[] = [{
      id: 1,
      item_slug: 'phb:longsword',
      item: { name: 'Longsword' },
      custom_name: 'Dragonfang',
      custom_description: null,
      quantity: 1,
      equipped: true,
      location: 'main_hand',
      is_attuned: false
    }]

    const wrapper = await mountSuspended(EquipmentPaperdoll, {
      props: { equipment: customEquipment }
    })

    expect(wrapper.text()).toContain('Dragonfang')
    expect(wrapper.text()).not.toContain('Longsword')
  })
})
