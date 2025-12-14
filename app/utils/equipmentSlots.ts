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
  ring_1: 'Ring 1',
  ring_2: 'Ring 2',
  feet: 'Feet',
  main_hand: 'Main Hand',
  off_hand: 'Off Hand'
}

// Backend equipment_slot values to frontend slot mapping
// Backend returns uppercase values like "HEAD", "RING", "ARMOR", "HAND"
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
  SHIELD: ['off_hand'],
  WEAPON: ['main_hand', 'off_hand'],
  HAND: ['main_hand', 'off_hand'],
  // Aliases for flexibility
  GLOVES: ['hands'],
  BOOTS: ['feet'],
  HELMET: ['head'],
  AMULET: ['neck'],
  CAPE: ['cloak']
}

// Backend slots that need picker (multiple slot options)
const BACKEND_PICKER_SLOTS = new Set(['RING', 'WEAPON', 'HAND'])

// Name patterns for guessing slots (used for pre-selection in picker)
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
 * Guess equipment slot from item name (for pre-selection in slot picker)
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
// Backend equipment_slot functions
// These require equipment_slot from backend - no legacy fallbacks
// Backend issue: https://github.com/dfox288/ledger-of-heroes/issues/598
// ============================================================================

/**
 * Get valid equipment slots from backend's equipment_slot field
 * Returns empty array if equipment_slot is not set
 */
export function getSlotsFromBackend(equipmentSlot: string | null | undefined): EquipmentSlot[] {
  if (!equipmentSlot) return []

  const slots = BACKEND_SLOT_MAPPING[equipmentSlot.toUpperCase()]
  return slots ?? []
}

/**
 * Get the default slot from backend's equipment_slot
 * Returns null if user must choose (RING, WEAPON, HAND) or equipment_slot is not set
 */
export function getDefaultSlotFromBackend(equipmentSlot: string | null | undefined): EquipmentSlot | null {
  if (!equipmentSlot) return null

  const upper = equipmentSlot.toUpperCase()
  // Slots that need picker return null
  if (BACKEND_PICKER_SLOTS.has(upper)) return null

  const slots = BACKEND_SLOT_MAPPING[upper]
  if (slots && slots.length === 1) return slots[0]!
  return null
}

/**
 * Check if item needs slot picker based on backend's equipment_slot
 * Returns false if equipment_slot is not set
 */
export function needsSlotPickerFromBackend(equipmentSlot: string | null | undefined): boolean {
  if (!equipmentSlot) return false
  return BACKEND_PICKER_SLOTS.has(equipmentSlot.toUpperCase())
}
