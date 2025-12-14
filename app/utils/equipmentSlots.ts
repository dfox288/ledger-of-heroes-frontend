export type EquipmentSlot
  = 'head'
    | 'neck'
    | 'cloak'
    | 'armor'
    | 'clothes'
    | 'belt'
    | 'hands'
    | 'ring_1'
    | 'ring_2'
    | 'feet'
    | 'main_hand'
    | 'off_hand'

export const BODY_SLOTS: EquipmentSlot[] = ['head', 'neck', 'cloak', 'clothes', 'belt', 'hands', 'feet']

export const ALL_SLOTS: EquipmentSlot[] = [
  'head', 'neck', 'cloak', 'armor', 'clothes', 'belt', 'hands',
  'ring_1', 'ring_2', 'feet', 'main_hand', 'off_hand'
]

export const SLOT_LABELS: Record<EquipmentSlot, string> = {
  head: 'Head',
  neck: 'Neck',
  cloak: 'Cloak',
  armor: 'Armor',
  clothes: 'Clothes',
  belt: 'Belt',
  hands: 'Hands',
  ring_1: 'Ring',
  ring_2: 'Ring',
  feet: 'Feet',
  main_hand: 'Main Hand',
  off_hand: 'Off Hand'
}

// Backend equipment_slot values to frontend slot mapping
// Backend returns uppercase values like "HEAD", "RING", "ARMOR"
const BACKEND_SLOT_MAPPING: Record<string, EquipmentSlot[]> = {
  HEAD: ['head'],
  NECK: ['neck'],
  CLOAK: ['cloak'],
  ARMOR: ['armor'],
  CLOTHES: ['clothes'],
  BELT: ['belt'],
  HANDS: ['hands'],
  RING: ['ring_1', 'ring_2'],
  FEET: ['feet'],
  MAIN_HAND: ['main_hand'],
  OFF_HAND: ['off_hand'],
  WEAPON: ['main_hand', 'off_hand']
}

// Item type to valid slots mapping (legacy fallback)
const SLOT_MAPPING: Record<string, EquipmentSlot[]> = {
  'Light Armor': ['armor'],
  'Medium Armor': ['armor'],
  'Heavy Armor': ['armor'],
  'Shield': ['off_hand'],
  'Melee Weapon': ['main_hand', 'off_hand'],
  'Ranged Weapon': ['main_hand'],
  'Staff': ['main_hand'],
  'Rod': ['main_hand'],
  'Wand': ['main_hand'],
  'Ring': ['ring_1', 'ring_2'],
  'Wondrous Item': BODY_SLOTS
}

// Types that need slot picker (multiple options or no default)
const PICKER_TYPES = new Set(['Wondrous Item', 'Ring'])

// Backend slots that need picker (multiple slot options)
const BACKEND_PICKER_SLOTS = new Set(['RING', 'WEAPON'])

// Name patterns for guessing slots
const NAME_PATTERNS: Array<{ pattern: RegExp, slot: EquipmentSlot }> = [
  { pattern: /\b(boots?|shoes?)\b/i, slot: 'feet' },
  { pattern: /\b(cloak|cape|mantle)\b/i, slot: 'cloak' },
  { pattern: /\b(belt|girdle|sash)\b/i, slot: 'belt' },
  { pattern: /\b(helm|helmet|hat|circlet|crown|headband)\b/i, slot: 'head' },
  { pattern: /\b(amulet|necklace|periapt|medallion|pendant|brooch)\b/i, slot: 'neck' },
  { pattern: /\b(gloves?|gauntlets?|bracers?)\b/i, slot: 'hands' },
  { pattern: /\b(robes?|clothes|glamerweave|shiftweave)\b/i, slot: 'clothes' }
]

/**
 * Get valid equipment slots for an item type
 */
export function getValidSlots(itemType: string | null): EquipmentSlot[] {
  if (!itemType) return []
  return SLOT_MAPPING[itemType] ?? []
}

/**
 * Get the default slot for auto-equipping
 * Returns null if user must choose (wondrous items)
 */
export function getDefaultSlot(itemType: string | null): EquipmentSlot | null {
  if (!itemType) return null
  const slots = SLOT_MAPPING[itemType]
  if (!slots || slots.length === 0) return null
  if (itemType === 'Wondrous Item') return null
  return slots[0] ?? null
}

/**
 * Check if item type requires slot picker modal
 */
export function needsSlotPicker(itemType: string | null): boolean {
  if (!itemType) return false
  return PICKER_TYPES.has(itemType)
}

/**
 * Guess equipment slot from item name (for pre-selection)
 */
export function guessSlotFromName(itemName: string): EquipmentSlot | null {
  for (const { pattern, slot } of NAME_PATTERNS) {
    if (pattern.test(itemName)) {
      return slot
    }
  }
  return null
}

// ============================================================================
// Backend equipment_slot functions (Issue #589)
// ============================================================================

/**
 * Get valid equipment slots from backend's equipment_slot field
 * Falls back to item_type mapping if equipment_slot is not set
 */
export function getSlotsFromBackend(equipmentSlot: string | null | undefined, itemType: string | null): EquipmentSlot[] {
  // Use backend equipment_slot if available
  if (equipmentSlot) {
    const slots = BACKEND_SLOT_MAPPING[equipmentSlot.toUpperCase()]
    if (slots) return slots
  }

  // Fall back to item_type mapping
  return getValidSlots(itemType)
}

/**
 * Get the default slot from backend's equipment_slot
 * Returns null if user must choose (RING, WEAPON)
 */
export function getDefaultSlotFromBackend(equipmentSlot: string | null | undefined, itemType: string | null): EquipmentSlot | null {
  // Use backend equipment_slot if available
  if (equipmentSlot) {
    const upper = equipmentSlot.toUpperCase()
    // Slots that need picker return null
    if (BACKEND_PICKER_SLOTS.has(upper)) return null
    const slots = BACKEND_SLOT_MAPPING[upper]
    if (slots && slots.length === 1) return slots[0]!
    return null
  }

  // Fall back to item_type mapping
  return getDefaultSlot(itemType)
}

/**
 * Check if item needs slot picker based on backend's equipment_slot
 */
export function needsSlotPickerFromBackend(equipmentSlot: string | null | undefined, itemType: string | null): boolean {
  // Use backend equipment_slot if available
  if (equipmentSlot) {
    return BACKEND_PICKER_SLOTS.has(equipmentSlot.toUpperCase())
  }

  // Fall back to item_type mapping
  return needsSlotPicker(itemType)
}

/**
 * Check if an item is equippable based on backend's equipment_slot
 * An item is equippable if it has an equipment_slot defined
 */
export function isEquippableFromBackend(equipmentSlot: string | null | undefined): boolean {
  return !!equipmentSlot
}
