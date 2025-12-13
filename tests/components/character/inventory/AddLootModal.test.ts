// tests/components/character/inventory/AddLootModal.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AddLootModal from '~/components/character/inventory/AddLootModal.vue'

// Mock useApi to return items
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    apiFetch: vi.fn().mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Longsword',
          slug: 'phb:longsword',
          description: 'A versatile martial weapon',
          weight: 3,
          item_type: { id: 1, code: 'W', name: 'Weapon' }
        },
        {
          id: 2,
          name: 'Shield',
          slug: 'phb:shield',
          description: 'A wooden or metal shield',
          weight: 6,
          item_type: { id: 2, code: 'A', name: 'Armor' }
        }
      ]
    })
  })
}))

/**
 * Type for accessing AddLootModal internal state in tests
 */
interface AddLootModalVM {
  searchQuery: string
  searchResults: Array<{ id: number, name: string, slug: string }>
  selectedItem: { id: number, name: string, slug: string } | null
  quantity: number
  isCustomMode: boolean
  customName: string
  customDescription: string
  canAdd: boolean
  handleAdd: () => void
  handleCancel: () => void
  selectItem: (item: { id: number, name: string, slug: string }) => void
  toggleCustomMode: () => void
  clearSelection: () => void
}

// Mock items for testing
const mockItem = {
  id: 1,
  name: 'Longsword',
  slug: 'phb:longsword',
  description: 'A versatile martial weapon',
  weight: 3,
  item_type: { id: 1, code: 'W', name: 'Weapon' }
}

/**
 * AddLootModal Tests
 *
 * Note: UModal uses teleportation which makes DOM testing complex.
 * These tests focus on component interface (props/events/internal state).
 * Actual modal interaction is tested via e2e tests.
 *
 * @see Design doc: docs/frontend/plans/2025-12-13-inventory-tab-design-v2.md
 */
describe('AddLootModal', () => {
  const defaultProps = {
    open: true,
    loading: false
  }

  // =========================================================================
  // Props Interface Tests
  // =========================================================================

  describe('props', () => {
    it('accepts open prop', () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      expect(wrapper.props('open')).toBe(true)
    })

    it('accepts loading prop', () => {
      const wrapper = mount(AddLootModal, {
        props: { ...defaultProps, loading: true }
      })
      expect(wrapper.props('loading')).toBe(true)
    })

    it('mounts when closed', () => {
      const wrapper = mount(AddLootModal, {
        props: { ...defaultProps, open: false }
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props('open')).toBe(false)
    })
  })

  // =========================================================================
  // Component Interface Tests
  // =========================================================================

  describe('component interface', () => {
    it('mounts without error', () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('initializes with default state', () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      expect(vm.searchQuery).toBe('')
      expect(vm.selectedItem).toBe(null)
      expect(vm.quantity).toBe(1)
      expect(vm.isCustomMode).toBe(false)
      expect(vm.customName).toBe('')
      expect(vm.customDescription).toBe('')
    })

    it('canAdd is false when no item selected and not in custom mode', () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      expect(vm.canAdd).toBe(false)
    })

    it('canAdd is true when item is selected', async () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      // Select an item
      vm.selectItem(mockItem)
      await flushPromises()

      expect(vm.canAdd).toBe(true)
    })

    it('canAdd is false when loading', async () => {
      const wrapper = mount(AddLootModal, {
        props: { ...defaultProps, loading: true }
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      // Even with item selected, should be false when loading
      vm.selectItem(mockItem)
      await flushPromises()

      expect(vm.canAdd).toBe(false)
    })
  })

  // =========================================================================
  // Item Selection Tests
  // =========================================================================

  describe('item selection', () => {
    it('selectItem sets the selected item', async () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      vm.selectItem(mockItem)
      await flushPromises()

      expect(vm.selectedItem).toEqual(mockItem)
    })

    it('selectItem clears search query and results', async () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      // Set some search state first
      vm.searchQuery = 'sword'
      vm.searchResults = [mockItem]
      await flushPromises()

      vm.selectItem(mockItem)
      await flushPromises()

      expect(vm.searchQuery).toBe('')
      expect(vm.searchResults).toEqual([])
    })

    it('clearSelection clears selected item', async () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      vm.selectItem(mockItem)
      await flushPromises()
      expect(vm.selectedItem).toEqual(mockItem)

      vm.clearSelection()
      await flushPromises()

      expect(vm.selectedItem).toBe(null)
    })
  })

  // =========================================================================
  // Custom Item Mode Tests
  // =========================================================================

  describe('custom item mode', () => {
    it('toggleCustomMode switches to custom mode', async () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      expect(vm.isCustomMode).toBe(false)

      vm.toggleCustomMode()
      await flushPromises()

      expect(vm.isCustomMode).toBe(true)
    })

    it('toggling to custom mode clears selected item', async () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      // Select an item first
      vm.selectItem(mockItem)
      await flushPromises()

      vm.toggleCustomMode()
      await flushPromises()

      expect(vm.selectedItem).toBe(null)
    })

    it('canAdd is false in custom mode when name is empty', () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      vm.toggleCustomMode()
      expect(vm.isCustomMode).toBe(true)
      expect(vm.customName).toBe('')
      expect(vm.canAdd).toBe(false)
    })

    it('canAdd is true in custom mode when name is provided', async () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      vm.toggleCustomMode()
      vm.customName = 'Mysterious Amulet'
      await flushPromises()

      expect(vm.canAdd).toBe(true)
    })

    it('toggling back from custom mode clears custom fields', async () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      vm.toggleCustomMode()
      vm.customName = 'Test Item'
      vm.customDescription = 'Test Description'
      await flushPromises()

      vm.toggleCustomMode() // Toggle back to search mode
      await flushPromises()

      expect(vm.customName).toBe('')
      expect(vm.customDescription).toBe('')
    })
  })

  // =========================================================================
  // Event Emission Tests
  // =========================================================================

  describe('events', () => {
    it('emits add event with compendium item data', async () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      vm.selectItem(mockItem)
      vm.quantity = 2
      await flushPromises()

      vm.handleAdd()

      expect(wrapper.emitted('add')).toBeTruthy()
      expect(wrapper.emitted('add')![0]).toEqual([{
        item_slug: 'phb:longsword',
        quantity: 2,
        custom_name: null,
        custom_description: null
      }])
    })

    it('emits add event with custom item data', async () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      vm.toggleCustomMode()
      vm.customName = 'Mysterious Amulet'
      vm.customDescription = 'Glows faintly in moonlight'
      vm.quantity = 1
      await flushPromises()

      vm.handleAdd()

      expect(wrapper.emitted('add')).toBeTruthy()
      expect(wrapper.emitted('add')![0]).toEqual([{
        item_slug: null,
        quantity: 1,
        custom_name: 'Mysterious Amulet',
        custom_description: 'Glows faintly in moonlight'
      }])
    })

    it('emits custom item with null description when empty', async () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      vm.toggleCustomMode()
      vm.customName = 'Plain Ring'
      vm.customDescription = '' // Empty description
      vm.quantity = 1
      await flushPromises()

      vm.handleAdd()

      expect(wrapper.emitted('add')![0]).toEqual([{
        item_slug: null,
        quantity: 1,
        custom_name: 'Plain Ring',
        custom_description: null
      }])
    })

    it('does not emit add when canAdd is false', async () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      // No item selected
      vm.handleAdd()

      expect(wrapper.emitted('add')).toBeFalsy()
    })

    it('emits update:open(false) on cancel', () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      vm.handleCancel()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })
  })

  // =========================================================================
  // State Reset Tests
  // =========================================================================

  describe('state reset', () => {
    it('resets state when modal opens', async () => {
      const wrapper = mount(AddLootModal, {
        props: { ...defaultProps, open: false }
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      // Set some state
      vm.searchQuery = 'test'
      vm.selectItem(mockItem)
      vm.quantity = 5
      vm.isCustomMode = true
      vm.customName = 'Custom'
      vm.customDescription = 'Desc'
      await flushPromises()

      // Open the modal
      await wrapper.setProps({ open: true })
      await flushPromises()

      // State should be reset
      expect(vm.searchQuery).toBe('')
      expect(vm.selectedItem).toBe(null)
      expect(vm.quantity).toBe(1)
      expect(vm.isCustomMode).toBe(false)
      expect(vm.customName).toBe('')
      expect(vm.customDescription).toBe('')
    })
  })

  // =========================================================================
  // Quantity Validation Tests
  // =========================================================================

  describe('quantity validation', () => {
    it('canAdd is false when quantity is less than 1', async () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      vm.selectItem(mockItem)
      vm.quantity = 0
      await flushPromises()

      expect(vm.canAdd).toBe(false)
    })

    it('canAdd is true when quantity is 1 or more', async () => {
      const wrapper = mount(AddLootModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as AddLootModalVM

      vm.selectItem(mockItem)
      vm.quantity = 1
      await flushPromises()

      expect(vm.canAdd).toBe(true)

      vm.quantity = 100
      await flushPromises()

      expect(vm.canAdd).toBe(true)
    })
  })
})
