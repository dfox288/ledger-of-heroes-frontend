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
 * Mock proficiency type for musical instruments (uses category-based filtering)
 */
export const mockMusicalInstrumentsProficiencyType = {
  id: 15,
  slug: 'musical-instrument',
  name: 'Musical Instrument',
  category: 'musical_instrument',
  subcategory: null
}

/**
 * Mock proficiency type for artisan tools (uses category-based filtering)
 */
export const mockArtisanToolsProficiencyType = {
  id: 16,
  slug: 'artisan-tools',
  name: 'Artisan\'s Tools',
  category: 'artisan_tools',
  subcategory: null
}

/**
 * Mock proficiency type for gaming sets (uses category-based filtering)
 */
export const mockGamingSetProficiencyType = {
  id: 17,
  slug: 'gaming-set',
  name: 'Gaming Set',
  category: 'gaming_set',
  subcategory: null
}

/**
 * Mock musical instruments for picker dropdown
 */
export const mockMusicalInstruments = [
  { id: 100, name: 'Lute', slug: 'lute', proficiency_category: 'musical_instrument', is_magic: false },
  { id: 101, name: 'Drum', slug: 'drum', proficiency_category: 'musical_instrument', is_magic: false },
  { id: 102, name: 'Flute', slug: 'flute', proficiency_category: 'musical_instrument', is_magic: false },
  { id: 103, name: 'Bagpipes', slug: 'bagpipes', proficiency_category: 'musical_instrument', is_magic: false }
]

/**
 * Mock artisan tools for picker dropdown
 */
export const mockArtisanTools = [
  { id: 110, name: 'Smith\'s Tools', slug: 'smiths-tools', proficiency_category: 'artisan_tools', is_magic: false },
  { id: 111, name: 'Carpenter\'s Tools', slug: 'carpenters-tools', proficiency_category: 'artisan_tools', is_magic: false },
  { id: 112, name: 'Brewer\'s Supplies', slug: 'brewers-supplies', proficiency_category: 'artisan_tools', is_magic: false }
]

/**
 * Mock gaming sets for picker dropdown
 */
export const mockGamingSets = [
  { id: 120, name: 'Dice Set', slug: 'dice-set', proficiency_category: 'gaming_set', is_magic: false },
  { id: 121, name: 'Playing Card Set', slug: 'playing-card-set', proficiency_category: 'gaming_set', is_magic: false }
]

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
 * Mock equipment pack with contents (e.g., Explorer's Pack)
 */
export const mockExplorersPack = {
  id: 999,
  name: 'Explorer\'s Pack',
  slug: 'explorers-pack',
  description: 'Includes a backpack, a bedroll, a mess kit, a tinderbox, 10 torches, 10 days of rations, and a waterskin. The pack also has 50 feet of hempen rope strapped to the side of it.',
  item_type_id: 4,
  item_type: { id: 4, code: 'EG', name: 'Equipment', description: null },
  cost_cp: 1000,
  weight: '59',
  is_magic: false,
  requires_attunement: false,
  rarity: null,
  proficiency_category: 'none',
  contents: [
    { quantity: '1', item: { id: 1, name: 'Backpack', slug: 'backpack', weight: '5', cost_cp: '200' } },
    { quantity: '1', item: { id: 2, name: 'Bedroll', slug: 'bedroll', weight: '7', cost_cp: '100' } },
    { quantity: '1', item: { id: 3, name: 'Mess Kit', slug: 'mess-kit', weight: '1', cost_cp: '20' } },
    { quantity: '1', item: { id: 4, name: 'Tinderbox', slug: 'tinderbox', weight: '1', cost_cp: '50' } },
    { quantity: '10', item: { id: 5, name: 'Torch', slug: 'torch', weight: '1', cost_cp: '1' } },
    { quantity: '10', item: { id: 6, name: 'Rations (1 day)', slug: 'rations-1-day', weight: '2', cost_cp: '50' } },
    { quantity: '1', item: { id: 7, name: 'Waterskin', slug: 'waterskin', weight: '5', cost_cp: '20' } },
    { quantity: '50', item: { id: 8, name: 'Hempen Rope (50 feet)', slug: 'hempen-rope-50-feet', weight: '10', cost_cp: '100' } }
  ],
  sources: []
}

/**
 * Mock equipment choice group with a pack option
 * Represents a choice like "(a) a dungeoneer's pack or (b) an explorer's pack"
 */
export const mockPackChoiceGroup: Equipment[] = [
  {
    id: 50,
    item_id: 998,
    quantity: 1,
    is_choice: true,
    choice_group: 'choice_pack',
    choice_option: 1,
    choice_description: 'Starting equipment choice',
    proficiency_subcategory: null,
    description: null,
    item: {
      id: 998,
      name: 'Dungeoneer\'s Pack',
      slug: 'dungeoneers-pack',
      description: 'Includes basic dungeoneering gear',
      item_type_id: 4,
      item_type: { id: 4, code: 'EG', name: 'Equipment', description: null },
      cost_cp: 1200,
      weight: '61.5',
      is_magic: false,
      contents: [
        { quantity: '1', item: { id: 1, name: 'Backpack', slug: 'backpack', weight: '5', cost_cp: '200' } },
        { quantity: '1', item: { id: 9, name: 'Crowbar', slug: 'crowbar', weight: '5', cost_cp: '200' } },
        { quantity: '1', item: { id: 10, name: 'Hammer', slug: 'hammer', weight: '3', cost_cp: '100' } },
        { quantity: '10', item: { id: 11, name: 'Piton', slug: 'piton', weight: '0.25', cost_cp: '5' } },
        { quantity: '10', item: { id: 5, name: 'Torch', slug: 'torch', weight: '1', cost_cp: '1' } },
        { quantity: '10', item: { id: 6, name: 'Rations (1 day)', slug: 'rations-1-day', weight: '2', cost_cp: '50' } },
        { quantity: '1', item: { id: 7, name: 'Waterskin', slug: 'waterskin', weight: '5', cost_cp: '20' } },
        { quantity: '50', item: { id: 8, name: 'Hempen Rope (50 feet)', slug: 'hempen-rope-50-feet', weight: '10', cost_cp: '100' } }
      ]
    }
  } as Equipment,
  {
    id: 51,
    item_id: 999,
    quantity: 1,
    is_choice: true,
    choice_group: 'choice_pack',
    choice_option: 2,
    choice_description: 'Starting equipment choice',
    proficiency_subcategory: null,
    description: null,
    item: mockExplorersPack
  } as Equipment
]

/**
 * Mock fixed equipment with a pack (non-choice)
 */
export const mockFixedPackEquipment: Equipment = {
  id: 60,
  item_id: 999,
  quantity: 1,
  is_choice: false,
  choice_group: null,
  choice_option: null,
  choice_description: null,
  proficiency_subcategory: null,
  description: null,
  item: mockExplorersPack
} as Equipment

/**
 * Representative equipment array for general testing
 */
export const mockEquipmentArray: Equipment[] = [
  mockEquipmentItem,
  mockEquipmentChoice,
  mockEquipmentWithItem,
  mockEquipmentMultiple
]
