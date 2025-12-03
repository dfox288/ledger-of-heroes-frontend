import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EquipmentChoiceGroup from '~/components/character/builder/EquipmentChoiceGroup.vue'

const mockItems = [
  { id: 1, item_id: 101, item: { id: 101, name: 'Longsword' }, quantity: 1, is_choice: true, choice_group: 'weapon', choice_option: 1 },
  { id: 2, item_id: 102, item: { id: 102, name: 'Rapier' }, quantity: 1, is_choice: true, choice_group: 'weapon', choice_option: 2 },
  { id: 3, item_id: 103, item: { id: 103, name: 'Two Shortswords' }, quantity: 2, is_choice: true, choice_group: 'weapon', choice_option: 3 }
]

// Items without item reference (compound choices like "martial weapon + shield")
const mockCompoundItems = [
  { id: 10, item_id: null, item: null, quantity: 1, is_choice: true, choice_group: 'choice_2', choice_option: 1, description: 'a martial weapon and a shield' },
  { id: 11, item_id: null, item: null, quantity: 2, is_choice: true, choice_group: 'choice_2', choice_option: 2, description: 'two martial weapons' }
]

describe('EquipmentChoiceGroup', () => {
  it('displays group label', async () => {
    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: { groupName: 'Weapon Choice', items: mockItems, selectedId: null }
    })

    expect(wrapper.text()).toContain('Weapon Choice')
  })

  it('displays all item options', async () => {
    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: { groupName: 'Weapon Choice', items: mockItems, selectedId: null }
    })

    expect(wrapper.text()).toContain('Longsword')
    expect(wrapper.text()).toContain('Rapier')
    expect(wrapper.text()).toContain('Two Shortswords')
  })

  it('shows selected state for chosen item using pivot id', async () => {
    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: { groupName: 'Weapon Choice', items: mockItems, selectedId: 1 } // pivot id, not item_id
    })

    const selected = wrapper.find('[data-test="option-1"]')
    expect(selected.classes()).toContain('ring-2')
  })

  it('emits select event with pivot id when option clicked', async () => {
    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: { groupName: 'Weapon Choice', items: mockItems, selectedId: null }
    })

    await wrapper.find('[data-test="option-2"]').trigger('click') // pivot id

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')![0]).toEqual([2]) // pivot id, not item_id
  })

  it('displays description for compound choices without item', async () => {
    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: { groupName: 'Equipment Choice 2', items: mockCompoundItems, selectedId: null }
    })

    expect(wrapper.text()).toContain('a martial weapon and a shield')
    expect(wrapper.text()).toContain('two martial weapons')
  })

  it('can select compound choices without item_id', async () => {
    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: { groupName: 'Equipment Choice 2', items: mockCompoundItems, selectedId: null }
    })

    await wrapper.find('[data-test="option-10"]').trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')![0]).toEqual([10])
  })
})
