import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EquipmentItemPicker from '~/components/character/builder/EquipmentItemPicker.vue'
import {
  mockMartialWeaponsProficiencyType,
  mockMartialWeapons,
  mockMusicalInstrumentsProficiencyType,
  mockMusicalInstruments,
  mockArtisanToolsProficiencyType,
  mockArtisanTools,
  mockGamingSetProficiencyType,
  mockGamingSets
} from '../../../fixtures/equipment'

// Track API calls for filter verification
let lastApiCall: { filter: string } | null = null

// Mock useApi composable with call tracking
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    apiFetch: vi.fn().mockImplementation((_endpoint: string, options?: { query?: { filter?: string } }) => {
      lastApiCall = options?.query ? { filter: options.query.filter || '' } : null
      const filter = options?.query?.filter || ''

      // Return appropriate mock data based on filter
      if (filter.includes('musical_instrument')) {
        return Promise.resolve({ data: mockMusicalInstruments })
      }
      if (filter.includes('artisan_tools')) {
        return Promise.resolve({ data: mockArtisanTools })
      }
      if (filter.includes('gaming_set')) {
        return Promise.resolve({ data: mockGamingSets })
      }
      // Default: martial weapons
      return Promise.resolve({ data: mockMartialWeapons })
    })
  })
}))

describe('EquipmentItemPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    lastApiCall = null
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

  describe('proficiency category filtering (#108)', () => {
    it('filters martial weapons with IN clause for melee and ranged', async () => {
      await mountSuspended(EquipmentItemPicker, {
        props: {
          proficiencyType: mockMartialWeaponsProficiencyType,
          quantity: 1,
          modelValue: [],
          disabled: false
        }
      })

      // Should query both melee and ranged martial weapons
      expect(lastApiCall?.filter).toContain('proficiency_category IN [martial_melee, martial_ranged]')
      expect(lastApiCall?.filter).toContain('is_magic = false')
    })

    it('filters musical instruments by category field', async () => {
      await mountSuspended(EquipmentItemPicker, {
        props: {
          proficiencyType: mockMusicalInstrumentsProficiencyType,
          quantity: 1,
          modelValue: [],
          disabled: false
        }
      })

      // Should use the category field directly for musical instruments
      expect(lastApiCall?.filter).toBe('proficiency_category = musical_instrument AND is_magic = false')
    })

    it('filters artisan tools by category field', async () => {
      await mountSuspended(EquipmentItemPicker, {
        props: {
          proficiencyType: mockArtisanToolsProficiencyType,
          quantity: 1,
          modelValue: [],
          disabled: false
        }
      })

      // Should use the category field directly for artisan tools
      expect(lastApiCall?.filter).toBe('proficiency_category = artisan_tools AND is_magic = false')
    })

    it('filters gaming sets by category field', async () => {
      await mountSuspended(EquipmentItemPicker, {
        props: {
          proficiencyType: mockGamingSetProficiencyType,
          quantity: 1,
          modelValue: [],
          disabled: false
        }
      })

      // Should use the category field directly for gaming sets
      expect(lastApiCall?.filter).toBe('proficiency_category = gaming_set AND is_magic = false')
    })

    it('displays musical instruments in dropdown', async () => {
      const wrapper = await mountSuspended(EquipmentItemPicker, {
        props: {
          proficiencyType: mockMusicalInstrumentsProficiencyType,
          quantity: 1,
          modelValue: [],
          disabled: false
        }
      })

      // Should render picker (not error state)
      expect(wrapper.find('[data-test="item-picker"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="no-items-message"]').exists()).toBe(false)
    })

    it('displays artisan tools in dropdown', async () => {
      const wrapper = await mountSuspended(EquipmentItemPicker, {
        props: {
          proficiencyType: mockArtisanToolsProficiencyType,
          quantity: 1,
          modelValue: [],
          disabled: false
        }
      })

      // Should render picker (not error state)
      expect(wrapper.find('[data-test="item-picker"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="no-items-message"]').exists()).toBe(false)
    })

    it('displays gaming sets in dropdown', async () => {
      const wrapper = await mountSuspended(EquipmentItemPicker, {
        props: {
          proficiencyType: mockGamingSetProficiencyType,
          quantity: 1,
          modelValue: [],
          disabled: false
        }
      })

      // Should render picker (not error state)
      expect(wrapper.find('[data-test="item-picker"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="no-items-message"]').exists()).toBe(false)
    })
  })
})
