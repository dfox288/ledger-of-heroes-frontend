// tests/components/character/inventory/ShopModal.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ShopModal from '~/components/character/inventory/ShopModal.vue'

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
          cost_cp: 1500, // 15 gp
          item_type: { id: 1, code: 'W', name: 'Weapon' }
        },
        {
          id: 2,
          name: 'Shield',
          slug: 'phb:shield',
          description: 'A wooden or metal shield',
          weight: 6,
          cost_cp: 1000, // 10 gp
          item_type: { id: 2, code: 'A', name: 'Armor' }
        },
        {
          id: 3,
          name: 'Potion of Healing',
          slug: 'phb:potion-of-healing',
          description: 'Regain 2d4+2 HP',
          weight: 0.5,
          cost_cp: 5000, // 50 gp
          item_type: { id: 3, code: 'P', name: 'Potion' }
        }
      ]
    })
  })
}))

/**
 * Type for accessing ShopModal internal state in tests
 */
interface ShopModalVM {
  searchQuery: string
  searchResults: Array<{ id: number, name: string, slug: string, cost_cp: number | null }>
  selectedItem: { id: number, name: string, slug: string, cost_cp: number | null } | null
  quantity: number
  customPrice: number | null
  canPurchase: boolean
  isInsufficientFunds: boolean
  totalCost: number
  remainingGold: number
  handlePurchase: () => void
  handleCancel: () => void
  selectItem: (item: { id: number, name: string, slug: string, cost_cp: number | null }) => void
  clearSelection: () => void
  formatCurrency: (copperPieces: number) => string
}

// Mock item for testing
const mockItem = {
  id: 1,
  name: 'Longsword',
  slug: 'phb:longsword',
  description: 'A versatile martial weapon',
  weight: 3,
  cost_cp: 1500, // 15 gp
  item_type: { id: 1, code: 'W', name: 'Weapon' }
}

// Mock currency (10gp worth = 1000cp)
const mockCurrency = {
  pp: 0,
  gp: 10,
  ep: 0,
  sp: 0,
  cp: 0
}

// Mock rich currency (100gp worth)
const richCurrency = {
  pp: 0,
  gp: 100,
  ep: 0,
  sp: 0,
  cp: 0
}

/**
 * ShopModal Tests
 *
 * Note: UModal uses teleportation which makes DOM testing complex.
 * These tests focus on component interface (props/events/internal state).
 * Actual modal interaction is tested via e2e tests.
 *
 * @see Design doc: docs/frontend/plans/2025-12-13-inventory-tab-design-v2.md
 */
describe('ShopModal', () => {
  const defaultProps = {
    open: true,
    currency: richCurrency,
    loading: false
  }

  // =========================================================================
  // Props Interface Tests
  // =========================================================================

  describe('props', () => {
    it('accepts open prop', () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      expect(wrapper.props('open')).toBe(true)
    })

    it('accepts currency prop', () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      expect(wrapper.props('currency')).toEqual(richCurrency)
    })

    it('accepts loading prop', () => {
      const wrapper = mount(ShopModal, {
        props: { ...defaultProps, loading: true }
      })
      expect(wrapper.props('loading')).toBe(true)
    })

    it('mounts when closed', () => {
      const wrapper = mount(ShopModal, {
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
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('initializes with default state', () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      expect(vm.searchQuery).toBe('')
      expect(vm.selectedItem).toBe(null)
      expect(vm.quantity).toBe(1)
      expect(vm.customPrice).toBe(null)
    })

    it('canPurchase is false when no item selected', () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      expect(vm.canPurchase).toBe(false)
    })

    it('canPurchase is true when item is selected and funds sufficient', async () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      vm.selectItem(mockItem)
      await flushPromises()

      expect(vm.canPurchase).toBe(true)
    })

    it('canPurchase is false when loading', async () => {
      const wrapper = mount(ShopModal, {
        props: { ...defaultProps, loading: true }
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      vm.selectItem(mockItem)
      await flushPromises()

      expect(vm.canPurchase).toBe(false)
    })
  })

  // =========================================================================
  // Price Calculation Tests
  // =========================================================================

  describe('price calculation', () => {
    it('uses item cost_cp as default price', async () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      vm.selectItem(mockItem)
      await flushPromises()

      expect(vm.totalCost).toBe(1500) // 15 gp in copper
    })

    it('multiplies price by quantity', async () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      vm.selectItem(mockItem)
      vm.quantity = 3
      await flushPromises()

      expect(vm.totalCost).toBe(4500) // 15 gp * 3 = 45 gp in copper
    })

    it('uses custom price when set', async () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      vm.selectItem(mockItem)
      vm.customPrice = 1000 // Override to 10 gp
      await flushPromises()

      expect(vm.totalCost).toBe(1000)
    })

    it('custom price is multiplied by quantity', async () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      vm.selectItem(mockItem)
      vm.customPrice = 500 // 5 gp per item
      vm.quantity = 2
      await flushPromises()

      expect(vm.totalCost).toBe(1000) // 5 gp * 2
    })
  })

  // =========================================================================
  // Currency Validation Tests
  // =========================================================================

  describe('currency validation', () => {
    it('detects insufficient funds', async () => {
      const wrapper = mount(ShopModal, {
        props: {
          ...defaultProps,
          currency: mockCurrency // Only 10 gp
        }
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      // Item costs 15 gp but we only have 10 gp
      vm.selectItem(mockItem)
      await flushPromises()

      expect(vm.isInsufficientFunds).toBe(true)
      expect(vm.canPurchase).toBe(false)
    })

    it('allows purchase when funds are sufficient', async () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps // Has 100 gp
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      vm.selectItem(mockItem) // Costs 15 gp
      await flushPromises()

      expect(vm.isInsufficientFunds).toBe(false)
      expect(vm.canPurchase).toBe(true)
    })

    it('calculates remaining gold after purchase', async () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps // Has 100 gp = 10000 cp
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      vm.selectItem(mockItem) // Costs 15 gp = 1500 cp
      await flushPromises()

      // Remaining = 10000 - 1500 = 8500 cp = 85 gp
      expect(vm.remainingGold).toBe(8500)
    })

    it('converts all currency types to copper for calculation', async () => {
      const wrapper = mount(ShopModal, {
        props: {
          ...defaultProps,
          currency: {
            pp: 1, // 1000 cp
            gp: 5, // 500 cp
            ep: 2, // 100 cp
            sp: 10, // 100 cp
            cp: 50 // 50 cp
          }
        }
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      // Total = 1000 + 500 + 100 + 100 + 50 = 1750 cp
      vm.selectItem(mockItem) // Costs 1500 cp
      await flushPromises()

      expect(vm.isInsufficientFunds).toBe(false)
      expect(vm.remainingGold).toBe(250) // 1750 - 1500 = 250 cp
    })
  })

  // =========================================================================
  // Event Emission Tests
  // =========================================================================

  describe('events', () => {
    it('emits purchase event with item data and price', async () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      vm.selectItem(mockItem)
      vm.quantity = 2
      await flushPromises()

      vm.handlePurchase()

      expect(wrapper.emitted('purchase')).toBeTruthy()
      expect(wrapper.emitted('purchase')![0]).toEqual([{
        item_slug: 'phb:longsword',
        quantity: 2,
        total_cost_cp: 3000 // 15 gp * 2 = 30 gp = 3000 cp
      }])
    })

    it('emits purchase event with custom price', async () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      vm.selectItem(mockItem)
      vm.customPrice = 1000 // Override to 10 gp
      vm.quantity = 1
      await flushPromises()

      vm.handlePurchase()

      expect(wrapper.emitted('purchase')![0]).toEqual([{
        item_slug: 'phb:longsword',
        quantity: 1,
        total_cost_cp: 1000
      }])
    })

    it('does not emit purchase when canPurchase is false', async () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      // No item selected
      vm.handlePurchase()

      expect(wrapper.emitted('purchase')).toBeFalsy()
    })

    it('does not emit purchase when funds insufficient', async () => {
      const wrapper = mount(ShopModal, {
        props: {
          ...defaultProps,
          currency: mockCurrency // Only 10 gp
        }
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      vm.selectItem(mockItem) // Costs 15 gp
      await flushPromises()

      vm.handlePurchase()

      expect(wrapper.emitted('purchase')).toBeFalsy()
    })

    it('emits update:open(false) on cancel', () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as ShopModalVM

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
      const wrapper = mount(ShopModal, {
        props: { ...defaultProps, open: false }
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      // Set some state
      vm.searchQuery = 'test'
      vm.selectItem(mockItem)
      vm.quantity = 5
      vm.customPrice = 999
      await flushPromises()

      // Open the modal
      await wrapper.setProps({ open: true })
      await flushPromises()

      // State should be reset
      expect(vm.searchQuery).toBe('')
      expect(vm.selectedItem).toBe(null)
      expect(vm.quantity).toBe(1)
      expect(vm.customPrice).toBe(null)
    })
  })

  // =========================================================================
  // Currency Formatting Tests
  // =========================================================================

  describe('currency formatting', () => {
    it('formats copper pieces to readable currency', () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      // Test various amounts
      expect(vm.formatCurrency(100)).toBe('1 gp')
      expect(vm.formatCurrency(1500)).toBe('15 gp')
      expect(vm.formatCurrency(50)).toBe('5 sp')
      expect(vm.formatCurrency(10)).toBe('1 sp')
      expect(vm.formatCurrency(5)).toBe('5 cp')
    })
  })

  // =========================================================================
  // Item Selection Tests
  // =========================================================================

  describe('item selection', () => {
    it('selectItem sets the selected item', async () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      vm.selectItem(mockItem)
      await flushPromises()

      expect(vm.selectedItem).toEqual(mockItem)
    })

    it('selectItem clears search query and results', async () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      vm.searchQuery = 'sword'
      vm.searchResults = [mockItem]
      await flushPromises()

      vm.selectItem(mockItem)
      await flushPromises()

      expect(vm.searchQuery).toBe('')
      expect(vm.searchResults).toEqual([])
    })

    it('clearSelection clears selected item and resets price', async () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      vm.selectItem(mockItem)
      vm.customPrice = 500
      await flushPromises()

      vm.clearSelection()
      await flushPromises()

      expect(vm.selectedItem).toBe(null)
      expect(vm.customPrice).toBe(null)
    })
  })

  // =========================================================================
  // Quantity Validation Tests
  // =========================================================================

  describe('quantity validation', () => {
    it('canPurchase is false when quantity is less than 1', async () => {
      const wrapper = mount(ShopModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      vm.selectItem(mockItem)
      vm.quantity = 0
      await flushPromises()

      expect(vm.canPurchase).toBe(false)
    })

    it('recalculates funds when quantity changes', async () => {
      const wrapper = mount(ShopModal, {
        props: {
          ...defaultProps,
          currency: { pp: 0, gp: 20, ep: 0, sp: 0, cp: 0 } // 20 gp = 2000 cp
        }
      })
      const vm = wrapper.vm as unknown as ShopModalVM

      vm.selectItem(mockItem) // 15 gp each
      await flushPromises()

      expect(vm.isInsufficientFunds).toBe(false) // 15 gp < 20 gp

      vm.quantity = 2 // 30 gp total
      await flushPromises()

      expect(vm.isInsufficientFunds).toBe(true) // 30 gp > 20 gp
    })
  })
})
