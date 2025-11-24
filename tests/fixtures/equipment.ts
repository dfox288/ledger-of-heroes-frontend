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
