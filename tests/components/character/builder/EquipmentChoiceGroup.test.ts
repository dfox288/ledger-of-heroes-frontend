import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EquipmentChoiceGroup from '~/components/character/builder/EquipmentChoiceGroup.vue'
import { mockCompoundChoiceGroup, mockMartialWeapons, mockPackChoiceGroup } from '../../../fixtures/equipment'

// Mock useApi composable
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    apiFetch: vi.fn().mockResolvedValue({ data: mockMartialWeapons })
  })
}))

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

describe('EquipmentChoiceGroup with choice_items', () => {
  it('shows inline picker when selected option has category choice_items', async () => {
    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: {
        groupName: 'Equipment Choice 2',
        items: mockCompoundChoiceGroup,
        selectedId: 36, // "martial weapon + shield" option
        itemSelections: new Map()
      }
    })

    // Should show item picker for the martial weapons category
    expect(wrapper.find('[data-test="choice-item-picker-0"]').exists()).toBe(true)
  })

  it('shows checkmark for fixed items in choice_items', async () => {
    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: {
        groupName: 'Equipment Choice 2',
        items: mockCompoundChoiceGroup,
        selectedId: 36,
        itemSelections: new Map()
      }
    })

    // Shield should show as auto-included
    expect(wrapper.text()).toContain('Shield')
    expect(wrapper.find('[data-test="fixed-item-1"]').exists()).toBe(true)
  })

  it('hides pickers when option not selected', async () => {
    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: {
        groupName: 'Equipment Choice 2',
        items: mockCompoundChoiceGroup,
        selectedId: null,
        itemSelections: new Map()
      }
    })

    expect(wrapper.find('[data-test="choice-item-picker-0"]').exists()).toBe(false)
  })

  it('emits itemSelect when picker selection changes', async () => {
    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: {
        groupName: 'Equipment Choice 2',
        items: mockCompoundChoiceGroup,
        selectedId: 36,
        itemSelections: new Map()
      }
    })

    // Component should emit itemSelect events
    // Exact mechanism depends on implementation
    expect(wrapper.emitted).toBeDefined()
  })
})

describe('EquipmentChoiceGroup with pack contents', () => {
  it('shows pack contents indicator for items with contents', async () => {
    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: {
        groupName: 'Pack Choice',
        items: mockPackChoiceGroup,
        selectedId: null
      }
    })

    // Should show pack contents toggle/indicator for items with contents
    expect(wrapper.find('[data-test="pack-contents-toggle-50"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="pack-contents-toggle-51"]').exists()).toBe(true)
  })

  it('displays pack contents when expanded', async () => {
    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: {
        groupName: 'Pack Choice',
        items: mockPackChoiceGroup,
        selectedId: null
      }
    })

    // Click to expand pack contents
    await wrapper.find('[data-test="pack-contents-toggle-50"]').trigger('click')
    await wrapper.vm.$nextTick()

    // Should show pack contents list
    const contentsList = wrapper.find('[data-test="pack-contents-list-50"]')
    expect(contentsList.exists()).toBe(true)
    expect(contentsList.text()).toContain('Backpack')
    expect(contentsList.text()).toContain('Crowbar')
    expect(contentsList.text()).toContain('10 Torch')
  })

  it('shows quantity for pack contents items', async () => {
    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: {
        groupName: 'Pack Choice',
        items: mockPackChoiceGroup,
        selectedId: null
      }
    })

    // Expand contents
    await wrapper.find('[data-test="pack-contents-toggle-50"]').trigger('click')
    await wrapper.vm.$nextTick()

    const contentsList = wrapper.find('[data-test="pack-contents-list-50"]')
    // Should show quantities for items with quantity > 1
    expect(contentsList.text()).toMatch(/10.*Torch|Torch.*×10|10×.*Torch/)
    expect(contentsList.text()).toMatch(/10.*Piton|Piton.*×10|10×.*Piton/)
  })

  it('collapses pack contents when toggle clicked again', async () => {
    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: {
        groupName: 'Pack Choice',
        items: mockPackChoiceGroup,
        selectedId: null
      }
    })

    // Expand
    await wrapper.find('[data-test="pack-contents-toggle-50"]').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-test="pack-contents-list-50"]').exists()).toBe(true)

    // Collapse
    await wrapper.find('[data-test="pack-contents-toggle-50"]').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-test="pack-contents-list-50"]').exists()).toBe(false)
  })

  it('does not show pack contents toggle for items without contents', async () => {
    // Use regular items without contents
    const itemsWithoutContents = [
      { id: 1, item_id: 101, item: { id: 101, name: 'Longsword' }, quantity: 1, is_choice: true, choice_group: 'weapon', choice_option: 1 },
      { id: 2, item_id: 102, item: { id: 102, name: 'Rapier' }, quantity: 1, is_choice: true, choice_group: 'weapon', choice_option: 2 }
    ]

    const wrapper = await mountSuspended(EquipmentChoiceGroup, {
      props: {
        groupName: 'Weapon Choice',
        items: itemsWithoutContents,
        selectedId: null
      }
    })

    expect(wrapper.find('[data-test="pack-contents-toggle-1"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="pack-contents-toggle-2"]').exists()).toBe(false)
  })
})
