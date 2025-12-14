/**
 * Inventory Actions Composable
 *
 * Provides functions for managing character inventory:
 * - Equip/unequip items
 * - Add/drop/sell items
 * - Purchase items (with currency deduction)
 * - Update item quantities
 *
 * @example
 * const { equipItem, unequipItem, addItem } = useInventoryActions(publicId)
 * await equipItem(itemId, 'main_hand')
 */

import type { CharacterEquipment } from '~/types/character'

export interface AddItemPayload {
  item_slug: string | null
  quantity: number
  custom_name?: string | null
  custom_description?: string | null
}

export interface EquipmentResponse {
  data: CharacterEquipment
}

export type EquipmentLocation
  = | 'main_hand'
    | 'off_hand'
    | 'head'
    | 'neck'
    | 'cloak'
    | 'armor'
    | 'belt'
    | 'hands'
    | 'ring_1'
    | 'ring_2'
    | 'feet'
    | 'backpack'

export interface EquipOptions {
  /** Set attunement status (for magic items that require attunement) */
  isAttuned?: boolean
}

export function useInventoryActions(publicId: string | Ref<string>) {
  const { apiFetch } = useApi()

  // Resolve publicId whether it's a ref or string
  const resolvedId = computed(() => typeof publicId === 'string' ? publicId : publicId.value)

  /**
   * Equip an item to a specific slot
   * @param equipmentId - The character_equipment record ID
   * @param location - Target slot: main_hand, off_hand, armor, head, etc.
   * @param options - Optional settings like attunement
   */
  async function equipItem(
    equipmentId: number,
    location: EquipmentLocation,
    options?: EquipOptions
  ): Promise<EquipmentResponse> {
    const body: { location: EquipmentLocation, is_attuned?: boolean } = { location }

    if (options?.isAttuned !== undefined) {
      body.is_attuned = options.isAttuned
    }

    return await apiFetch<EquipmentResponse>(
      `/characters/${resolvedId.value}/equipment/${equipmentId}`,
      {
        method: 'PATCH',
        body
      }
    )
  }

  /**
   * Unequip an item (move to backpack)
   * @param equipmentId - The character_equipment record ID
   */
  async function unequipItem(equipmentId: number): Promise<EquipmentResponse> {
    return await apiFetch<EquipmentResponse>(
      `/characters/${resolvedId.value}/equipment/${equipmentId}`,
      {
        method: 'PATCH',
        body: { location: 'backpack' }
      }
    )
  }

  /**
   * Add an item to inventory (free, no currency cost)
   * @param payload - Item data including slug and quantity
   */
  async function addItem(payload: AddItemPayload): Promise<EquipmentResponse> {
    return await apiFetch<EquipmentResponse>(
      `/characters/${resolvedId.value}/equipment`,
      {
        method: 'POST',
        body: payload
      }
    )
  }

  /**
   * Drop an item (remove from inventory permanently)
   * @param equipmentId - The character_equipment record ID
   */
  async function dropItem(equipmentId: number): Promise<void> {
    await apiFetch(
      `/characters/${resolvedId.value}/equipment/${equipmentId}`,
      { method: 'DELETE' }
    )
  }

  /**
   * Sell an item (remove from inventory, add currency)
   * @param equipmentId - The character_equipment record ID
   * @param priceInCopper - Sale price in copper pieces
   */
  async function sellItem(equipmentId: number, priceInCopper: number): Promise<void> {
    // First delete the equipment
    await apiFetch(
      `/characters/${resolvedId.value}/equipment/${equipmentId}`,
      { method: 'DELETE' }
    )

    // Then add the currency (API expects string format: "+50" for add)
    await apiFetch(
      `/characters/${resolvedId.value}/currency`,
      {
        method: 'PATCH',
        body: { cp: `+${priceInCopper}` }
      }
    )
  }

  /**
   * Update item quantity
   * @param equipmentId - The character_equipment record ID
   * @param quantity - New quantity
   */
  async function updateQuantity(equipmentId: number, quantity: number): Promise<EquipmentResponse> {
    return await apiFetch<EquipmentResponse>(
      `/characters/${resolvedId.value}/equipment/${equipmentId}`,
      {
        method: 'PATCH',
        body: { quantity }
      }
    )
  }

  /**
   * Purchase an item (add to inventory, subtract currency)
   * @param itemSlug - The item slug (e.g., 'phb:longsword')
   * @param quantity - Number to purchase
   * @param totalCostInCopper - Total cost in copper pieces
   */
  async function purchaseItem(
    itemSlug: string,
    quantity: number,
    totalCostInCopper: number
  ): Promise<EquipmentResponse> {
    // First add the equipment
    const result = await apiFetch<EquipmentResponse>(
      `/characters/${resolvedId.value}/equipment`,
      {
        method: 'POST',
        body: { item_slug: itemSlug, quantity }
      }
    )

    // Then subtract the currency (API expects string format: "-50" for subtract)
    await apiFetch(
      `/characters/${resolvedId.value}/currency`,
      {
        method: 'PATCH',
        body: { cp: `-${totalCostInCopper}` }
      }
    )

    return result
  }

  /**
   * Set or clear attunement on an item
   * Used for:
   * - Attuning items in backpack without equipping
   * - Breaking attunement on any item
   *
   * @param equipmentId - The character_equipment record ID
   * @param attuned - Whether to attune (true) or break attunement (false)
   */
  async function setAttunement(equipmentId: number, attuned: boolean): Promise<EquipmentResponse> {
    return await apiFetch<EquipmentResponse>(
      `/characters/${resolvedId.value}/equipment/${equipmentId}`,
      {
        method: 'PATCH',
        body: { is_attuned: attuned }
      }
    )
  }

  return {
    equipItem,
    unequipItem,
    addItem,
    dropItem,
    sellItem,
    updateQuantity,
    purchaseItem,
    setAttunement
  }
}
