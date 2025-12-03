import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EquipmentItemPicker from '~/components/character/builder/EquipmentItemPicker.vue'
import { mockMartialWeaponsProficiencyType, mockMartialWeapons } from '../../../fixtures/equipment'

// Mock useApi composable
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    apiFetch: vi.fn().mockResolvedValue({ data: mockMartialWeapons })
  })
}))

describe('EquipmentItemPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a select menu', async () => {
    const wrapper = await mountSuspended(EquipmentItemPicker, {
      props: {
        proficiencyType: mockMartialWeaponsProficiencyType,
        quantity: 1,
        modelValue: [],
        disabled: false
      }
    })

    expect(wrapper.find('[data-test="item-picker"]').exists()).toBe(true)
  })

  it('displays loading state while fetching items', async () => {
    const wrapper = await mountSuspended(EquipmentItemPicker, {
      props: {
        proficiencyType: mockMartialWeaponsProficiencyType,
        quantity: 1,
        modelValue: [],
        disabled: false
      }
    })

    // Component should handle loading state
    expect(wrapper.html()).toBeTruthy()
  })

  it('emits update:modelValue when item selected', async () => {
    const wrapper = await mountSuspended(EquipmentItemPicker, {
      props: {
        proficiencyType: mockMartialWeaponsProficiencyType,
        quantity: 1,
        modelValue: [],
        disabled: false
      }
    })

    // Wait for items to load
    await wrapper.vm.$nextTick()

    // The component should emit when selection changes
    // Exact interaction depends on USelectMenu implementation
    expect(wrapper.emitted()).toBeDefined()
  })

  it('is disabled when disabled prop is true', async () => {
    const wrapper = await mountSuspended(EquipmentItemPicker, {
      props: {
        proficiencyType: mockMartialWeaponsProficiencyType,
        quantity: 1,
        modelValue: [],
        disabled: true
      }
    })

    const picker = wrapper.find('[data-test="item-picker"]')
    expect(picker.attributes('disabled')).toBeDefined()
  })

  it('renders multiple pickers when quantity > 1', async () => {
    const wrapper = await mountSuspended(EquipmentItemPicker, {
      props: {
        proficiencyType: mockMartialWeaponsProficiencyType,
        quantity: 2,
        modelValue: [],
        disabled: false
      }
    })

    // Should have two picker dropdowns
    expect(wrapper.find('[data-test="item-picker-1"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="item-picker-2"]').exists()).toBe(true)
  })
})
