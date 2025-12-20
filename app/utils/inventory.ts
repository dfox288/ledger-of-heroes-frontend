/**
 * Inventory utility functions
 *
 * Shared utilities for working with CharacterEquipment data.
 *
 * @see Issue #775 - Extract duplicate inventory utility functions
 */
import type { CharacterEquipment } from '~/types/character'

/**
 * Equipment location values (matches backend enum)
 */
export type EquipmentLocation
  = | 'main_hand'
    | 'off_hand'
    | 'head'
    | 'neck'
    | 'cloak'
    | 'armor'
    | 'clothes'
    | 'belt'
    | 'hands'
    | 'ring_1'
    | 'ring_2'
    | 'feet'
    | 'backpack' // For unequipped items in inventory

/**
 * Display-only equipment locations (excludes backpack which means unequipped)
 */
type DisplayableLocation = Exclude<EquipmentLocation, 'backpack'>

/**
 * Location display labels
 */
const LOCATION_LABELS: Record<DisplayableLocation, string> = {
  main_hand: 'Main Hand',
  off_hand: 'Off Hand',
  head: 'Head',
  neck: 'Neck',
  cloak: 'Cloak',
  armor: 'Armor',
  clothes: 'Clothes',
  belt: 'Belt',
  hands: 'Hands',
  ring_1: 'Ring',
  ring_2: 'Ring',
  feet: 'Feet'
}

/**
 * Get the display name for an equipment item.
 * Returns custom_name if set, otherwise the item's base name.
 *
 * @param equipment - The character equipment record
 * @returns Display name string
 */
export function getEquipmentDisplayName(equipment: CharacterEquipment): string {
  if (equipment.custom_name) return equipment.custom_name
  return equipment.item?.name ?? 'Unknown Item'
}

/**
 * Get human-readable display text for an equipment location.
 *
 * @param location - Equipment location code (e.g., 'main_hand', 'armor')
 * @returns Display text (e.g., 'Main Hand', 'Armor') or null if invalid/backpack
 */
export function getLocationDisplayText(location: EquipmentLocation | string | null | undefined): string | null {
  if (!location || location === 'backpack') return null
  return LOCATION_LABELS[location as DisplayableLocation] ?? null
}
