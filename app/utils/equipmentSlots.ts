export type EquipmentSlot =
  | 'head'
  | 'neck'
  | 'cloak'
  | 'armor'
  | 'belt'
  | 'hands'
  | 'ring_1'
  | 'ring_2'
  | 'feet'
  | 'main_hand'
  | 'off_hand'

export const BODY_SLOTS: EquipmentSlot[] = ['head', 'neck', 'cloak', 'belt', 'hands', 'feet']

export const ALL_SLOTS: EquipmentSlot[] = [
  'head', 'neck', 'cloak', 'armor', 'belt', 'hands',
  'ring_1', 'ring_2', 'feet', 'main_hand', 'off_hand'
]

export const SLOT_LABELS: Record<EquipmentSlot, string> = {
  head: 'Head',
  neck: 'Neck',
  cloak: 'Cloak',
  armor: 'Armor',
  belt: 'Belt',
  hands: 'Hands',
  ring_1: 'Ring',
  ring_2: 'Ring',
  feet: 'Feet',
  main_hand: 'Main Hand',
  off_hand: 'Off Hand'
}

// Item type to valid slots mapping
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

// Name patterns for guessing slots
const NAME_PATTERNS: Array<{ pattern: RegExp; slot: EquipmentSlot }> = [
  { pattern: /\b(boots?|shoes?)\b/i, slot: 'feet' },
  { pattern: /\b(cloak|cape|mantle)\b/i, slot: 'cloak' },
  { pattern: /\b(belt|girdle|sash)\b/i, slot: 'belt' },
  { pattern: /\b(helm|helmet|hat|circlet|crown|headband)\b/i, slot: 'head' },
  { pattern: /\b(amulet|necklace|periapt|medallion|pendant|brooch)\b/i, slot: 'neck' },
  { pattern: /\b(gloves?|gauntlets?|bracers?)\b/i, slot: 'hands' }
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
