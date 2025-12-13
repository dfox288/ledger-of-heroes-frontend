/**
 * useInventoryActions Composable Tests
 *
 * Tests the inventory action functions: equip, unequip, add, drop, sell
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useInventoryActions } from '~/composables/useInventoryActions'

// Mock useApi
const mockApiFetch = vi.fn()
vi.mock('#app', async () => {
  const actual = await vi.importActual('#app')
  return {
    ...actual,
    useNuxtApp: () => ({
      $api: { apiFetch: mockApiFetch }
    })
  }
})

// Mock useApi composable
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({ apiFetch: mockApiFetch })
}))

describe('useInventoryActions', () => {
  beforeEach(() => {
    mockApiFetch.mockReset()
  })

  describe('equipItem', () => {
    it('calls PATCH with correct location', async () => {
      mockApiFetch.mockResolvedValueOnce({ data: { id: 1, location: 'main_hand' } })

      const { equipItem } = useInventoryActions('test-char-123')
      await equipItem(1, 'main_hand')

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/test-char-123/equipment/1',
        {
          method: 'PATCH',
          body: { location: 'main_hand' }
        }
      )
    })

    it('returns updated equipment data', async () => {
      const mockResponse = { data: { id: 1, location: 'main_hand', equipped: true } }
      mockApiFetch.mockResolvedValueOnce(mockResponse)

      const { equipItem } = useInventoryActions('test-char-123')
      const result = await equipItem(1, 'main_hand')

      expect(result).toEqual(mockResponse)
    })
  })

  describe('unequipItem', () => {
    it('calls PATCH with backpack location', async () => {
      mockApiFetch.mockResolvedValueOnce({ data: { id: 1, location: 'backpack' } })

      const { unequipItem } = useInventoryActions('test-char-123')
      await unequipItem(1)

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/test-char-123/equipment/1',
        {
          method: 'PATCH',
          body: { location: 'backpack' }
        }
      )
    })
  })

  describe('addItem', () => {
    it('calls POST with item data', async () => {
      mockApiFetch.mockResolvedValueOnce({ data: { id: 99 } })

      const { addItem } = useInventoryActions('test-char-123')
      await addItem({ item_slug: 'phb:longsword', quantity: 1 })

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/test-char-123/equipment',
        {
          method: 'POST',
          body: { item_slug: 'phb:longsword', quantity: 1 }
        }
      )
    })

    it('supports custom items without slug', async () => {
      mockApiFetch.mockResolvedValueOnce({ data: { id: 99 } })

      const { addItem } = useInventoryActions('test-char-123')
      await addItem({
        item_slug: null,
        quantity: 1,
        custom_name: 'Magic Sword',
        custom_description: 'A mysterious blade'
      })

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/test-char-123/equipment',
        {
          method: 'POST',
          body: {
            item_slug: null,
            quantity: 1,
            custom_name: 'Magic Sword',
            custom_description: 'A mysterious blade'
          }
        }
      )
    })
  })

  describe('dropItem', () => {
    it('calls DELETE for the equipment', async () => {
      mockApiFetch.mockResolvedValueOnce({})

      const { dropItem } = useInventoryActions('test-char-123')
      await dropItem(5)

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/test-char-123/equipment/5',
        { method: 'DELETE' }
      )
    })
  })

  describe('sellItem', () => {
    it('deletes item and adds currency', async () => {
      mockApiFetch
        .mockResolvedValueOnce({}) // DELETE equipment
        .mockResolvedValueOnce({ data: { gp: 15 } }) // PATCH currency

      const { sellItem } = useInventoryActions('test-char-123')
      await sellItem(5, 1500) // 1500 cp = 15 gp

      // First call: delete the equipment
      expect(mockApiFetch).toHaveBeenNthCalledWith(
        1,
        '/characters/test-char-123/equipment/5',
        { method: 'DELETE' }
      )

      // Second call: add currency
      expect(mockApiFetch).toHaveBeenNthCalledWith(
        2,
        '/characters/test-char-123/currency',
        {
          method: 'PATCH',
          body: { cp: { add: 1500 } }
        }
      )
    })
  })

  describe('updateQuantity', () => {
    it('calls PATCH with new quantity', async () => {
      mockApiFetch.mockResolvedValueOnce({ data: { id: 1, quantity: 5 } })

      const { updateQuantity } = useInventoryActions('test-char-123')
      await updateQuantity(1, 5)

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/test-char-123/equipment/1',
        {
          method: 'PATCH',
          body: { quantity: 5 }
        }
      )
    })
  })

  describe('purchaseItem', () => {
    it('adds item and subtracts currency', async () => {
      mockApiFetch
        .mockResolvedValueOnce({ data: { id: 99 } }) // POST equipment
        .mockResolvedValueOnce({ data: { gp: 5 } }) // PATCH currency

      const { purchaseItem } = useInventoryActions('test-char-123')
      await purchaseItem('phb:longsword', 1, 1500) // 1500 cp = 15 gp

      // First call: add the equipment
      expect(mockApiFetch).toHaveBeenNthCalledWith(
        1,
        '/characters/test-char-123/equipment',
        {
          method: 'POST',
          body: { item_slug: 'phb:longsword', quantity: 1 }
        }
      )

      // Second call: subtract currency
      expect(mockApiFetch).toHaveBeenNthCalledWith(
        2,
        '/characters/test-char-123/currency',
        {
          method: 'PATCH',
          body: { cp: { subtract: 1500 } }
        }
      )
    })
  })
})
