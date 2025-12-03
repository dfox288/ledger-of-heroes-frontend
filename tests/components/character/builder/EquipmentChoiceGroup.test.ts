import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EquipmentChoiceGroup from '~/components/character/builder/EquipmentChoiceGroup.vue'

const mockItems = [
  { id: 1, item_id: 101, item: { id: 101, name: 'Longsword' }, quantity: 1, is_choice: true, choice_group: 'weapon', choice_option: 1 },
  { id: 2, item_id: 102, item: { id: 102, name: 'Rapier' }, quantity: 1, is_choice: true, choice_group: 'weapon', choice_option: 2 },
  { id: 3, item_id: 103, item: { id: 103, name: 'Two Shortswords' }, quantity: 2, is_choice: true, choice_group: 'weapon', choice_option: 3 }
]

describe('EquipmentChoiceGroup', () => {
  it('displays group label', async () => {
    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: { groupName: 'Weapon Choice', items: mockItems, selectedItemId: null }
    })

    expect(wrapper.text()).toContain('Weapon Choice')
  })

  it('displays all item options', async () => {
    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: { groupName: 'Weapon Choice', items: mockItems, selectedItemId: null }
    })

    expect(wrapper.text()).toContain('Longsword')
    expect(wrapper.text()).toContain('Rapier')
    expect(wrapper.text()).toContain('Two Shortswords')
  })

  it('shows selected state for chosen item', async () => {
    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: { groupName: 'Weapon Choice', items: mockItems, selectedItemId: 101 }
    })

    const selected = wrapper.find('[data-test="option-101"]')
    expect(selected.classes()).toContain('ring-2')
  })

  it('emits select event when option clicked', async () => {
    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: { groupName: 'Weapon Choice', items: mockItems, selectedItemId: null }
    })

    await wrapper.find('[data-test="option-102"]').trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')![0]).toEqual([102])
  })
})
