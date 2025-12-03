import type { components } from '~/types/api/generated'

type Equipment = components['schemas']['EntityItemResource']

/**
 * Mock equipment item (non-choice)
 */
export const mockEquipmentItem: Equipment = {
  id: 1,
  item_id: null,
  quantity: 1,
  is_choice: false,
  choice_description: null,
  choice_group: null,
  choice_option: null,
  proficiency_subcategory: null,
  description: 'a backpack'
}

/**
 * Mock proficiency type for martial weapons category
 */
export const mockMartialWeaponsProficiencyType = {
  id: 6,
  slug: 'martial-weapons',
  name: 'Martial Weapons',
  category: 'weapon',
  subcategory: 'martial'
}

/**
 * Mock item for Shield (auto-included in compound choices)
 */
export const mockShieldItem = {
  id: 48,
  name: 'Shield',
  slug: 'shield',
  description: 'A shield provides +2 AC',
  item_type: { id: 7, name: 'Shield' },
  is_magic: false,
  sources: []
}

/**
 * Mock choice group with choice_items (Fighter-style compound choices)
 */
export const mockCompoundChoiceGroup: Equipment[] = [
  {
    id: 36,
    item_id: null,
    quantity: 2,
    is_choice: true,
    choice_group: 'choice_2',
    choice_option: 1,
    choice_description: 'Starting equipment choice',
    proficiency_subcategory: null,
    description: 'a martial weapon and a shield',
    choice_items: [
      { proficiency_type: mockMartialWeaponsProficiencyType, item: undefined, quantity: 1 },
      { proficiency_type: undefined, item: mockShieldItem, quantity: 1 }
    ]
  },
  {
    id: 37,
    item_id: null,
    quantity: 2,
    is_choice: true,
    choice_group: 'choice_2',
    choice_option: 2,
    choice_description: 'Starting equipment choice',
    proficiency_subcategory: null,
    description: 'two martial weapons',
    choice_items: [
      { proficiency_type: mockMartialWeaponsProficiencyType, item: undefined, quantity: 2 }
    ]
  }
]

/**
 * Mock items for martial weapon picker dropdown
 */
export const mockMartialWeapons = [
  { id: 42, name: 'Longsword', slug: 'longsword', proficiency_category: 'martial_melee', is_magic: false },
  { id: 43, name: 'Battleaxe', slug: 'battleaxe', proficiency_category: 'martial_melee', is_magic: false },
  { id: 44, name: 'Warhammer', slug: 'warhammer', proficiency_category: 'martial_melee', is_magic: false },
  { id: 45, name: 'Longbow', slug: 'longbow', proficiency_category: 'martial_ranged', is_magic: false }
]

/**
 * Mock equipment choice item
 */
export const mockEquipmentChoice: Equipment = {
  id: 2,
  item_id: null,
  quantity: 1,
  is_choice: true,
  choice_description: 'Starting equipment choice',
  choice_group: null,
  choice_option: null,
  proficiency_subcategory: null,
  description: 'a rapier'
}

/**
 * Mock equipment with item reference
 */
export const mockEquipmentWithItem: Equipment = {
  id: 3,
  item_id: 729,
  quantity: 1,
  is_choice: false,
  choice_description: null,
  choice_group: null,
  choice_option: null,
  proficiency_subcategory: null,
  description: null,
  item: {
    id: 729,
    name: 'Rapier',
    slug: 'rapier',
    description: 'A finesse weapon',
    item_type: { id: 1, name: 'Weapon' },
    sources: []
  } as Partial<Item>
}

/**
 * Mock equipment with quantity > 1
 */
export const mockEquipmentMultiple: Equipment = {
  id: 4,
  item_id: 1860,
  quantity: 20,
  is_choice: false,
  choice_description: null,
  choice_group: null,
  choice_option: null,
  proficiency_subcategory: null,
  description: null,
  item: {
    id: 1860,
    name: 'Arrow',
    slug: 'arrow',
    description: 'Ammunition for a bow',
    item_type: { id: 1, name: 'Ammunition' },
    sources: []
  } as Partial<Item>
}

/**
 * Mock hit points description
 */
export const mockHitPoints: Equipment = {
  id: 5,
  item_id: null,
  quantity: 1,
  is_choice: false,
  choice_description: null,
  choice_group: null,
  choice_option: null,
  proficiency_subcategory: null,
  description: 'level Rogue, you begin play with 8 + your Constitution modifier hit points.'
}

/**
 * Mock proficiencies description
 */
export const mockProficiencies: Equipment = {
  id: 6,
  item_id: null,
  quantity: 1,
  is_choice: false,
  choice_description: null,
  choice_group: null,
  choice_option: null,
  proficiency_subcategory: null,
  description: '-- Armor: light armor\n\t--- Weapons: simple weapons, hand crossbows'
}

/**
 * Mock choice group equipment (Rogue structure)
 */
export const mockChoiceGroup1: Equipment[] = [
  {
    id: 11,
    item_id: 729,
    quantity: 1,
    is_choice: true,
    choice_group: 'choice_1',
    choice_option: 1,
    choice_description: 'Starting equipment choice',
    proficiency_subcategory: null,
    description: 'a rapier'
  },
  {
    id: 12,
    item_id: 732,
    quantity: 1,
    is_choice: true,
    choice_group: 'choice_1',
    choice_option: 2,
    choice_description: 'Starting equipment choice',
    proficiency_subcategory: null,
    description: 'a shortsword'
  }
]

/**
 * Mock choice group equipment with multiple groups
 */
export const mockMultipleChoiceGroups: Equipment[] = [
  {
    id: 11,
    item_id: 729,
    quantity: 1,
    is_choice: true,
    choice_group: 'choice_1',
    choice_option: 1,
    choice_description: 'Starting equipment choice',
    proficiency_subcategory: null,
    description: 'a rapier'
  },
  {
    id: 12,
    item_id: 732,
    quantity: 1,
    is_choice: true,
    choice_group: 'choice_1',
    choice_option: 2,
    choice_description: 'Starting equipment choice',
    proficiency_subcategory: null,
    description: 'a shortsword'
  },
  {
    id: 13,
    item_id: 731,
    quantity: 1,
    is_choice: true,
    choice_group: 'choice_2',
    choice_option: 1,
    choice_description: 'Starting equipment choice',
    proficiency_subcategory: null,
    description: 'a shortbow and quiver of arrows (20)'
  },
  {
    id: 14,
    item_id: 732,
    quantity: 1,
    is_choice: true,
    choice_group: 'choice_2',
    choice_option: 2,
    choice_description: 'Starting equipment choice',
    proficiency_subcategory: null,
    description: 'a shortsword'
  }
]

/**
 * Representative equipment array for general testing
 */
export const mockEquipmentArray: Equipment[] = [
  mockEquipmentItem,
  mockEquipmentChoice,
  mockEquipmentWithItem,
  mockEquipmentMultiple
]
