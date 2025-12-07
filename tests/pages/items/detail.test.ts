import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { createMockItem } from '../../helpers/mockFactories'

// Mock the useItemDetail composable
vi.mock('~/composables/useItemDetail', () => ({
  useItemDetail: vi.fn()
}))

// Helper to create mock return value for useItemDetail
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMockUseItemDetail(overrides: any = {}) {
  return {
    entity: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
    isWeapon: ref(false),
    isMeleeWeapon: ref(false),
    isRangedWeapon: ref(false),
    isAmmunition: ref(false),
    isArmor: ref(false),
    isShield: ref(false),
    isCharged: ref(false),
    isMagic: ref(false),
    hasSpells: ref(false),
    requiresAttunement: ref(false),
    attunementText: ref(null),
    spellsByChargeCost: ref(new Map()),
    damageDisplay: ref(null),
    rangeDisplay: ref(null),
    acDisplay: ref(null),
    costDisplay: ref(null),
    categoryColor: ref('neutral'),
    ...overrides
  }
}

describe('Item Detail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Loading State
  it('renders loading state', async () => {
    const { useItemDetail } = await import('~/composables/useItemDetail')
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      pending: ref(true)
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'longsword' } }
    })

    expect(wrapper.text()).toContain('Loading')
  })

  // Error State
  it('renders error state', async () => {
    const { useItemDetail } = await import('~/composables/useItemDetail')
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      error: ref(new Error('Failed to load'))
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'longsword' } }
    })

    expect(wrapper.text()).toContain('Item Not Found')
  })

  // Breadcrumb
  it('renders breadcrumb with item name', async () => {
    const mockItem = createMockItem({ name: 'Longsword' })
    const { useItemDetail } = await import('~/composables/useItemDetail')
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      entity: ref(mockItem),
      isWeapon: ref(true),
      costDisplay: ref('15 gp')
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'longsword' } }
    })

    expect(wrapper.text()).toContain('Items')
    expect(wrapper.text()).toContain('Longsword')
  })

  // ItemHero - Always Renders
  it('renders ItemHero for all items', async () => {
    const mockItem = createMockItem({ name: 'Longsword' })
    const { useItemDetail } = await import('~/composables/useItemDetail')
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      entity: ref(mockItem),
      isWeapon: ref(true),
      costDisplay: ref('15 gp')
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'longsword' } }
    })

    expect(wrapper.findComponent({ name: 'ItemHero' }).exists()).toBe(true)
  })

  // ItemWeaponStats - Conditional on isWeapon
  it('renders ItemWeaponStats only for weapons (isWeapon true)', async () => {
    const mockWeapon = createMockItem({
      name: 'Longsword',
      damage_dice: '1d8',
      damage_type: { id: 1, name: 'Slashing', code: 'SLA' }
    })
    const { useItemDetail } = await import('~/composables/useItemDetail')
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      entity: ref(mockWeapon),
      isWeapon: ref(true),
      costDisplay: ref('15 gp')
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'longsword' } }
    })

    expect(wrapper.findComponent({ name: 'ItemWeaponStats' }).exists()).toBe(true)
  })

  it('does not render ItemWeaponStats for non-weapons', async () => {
    const mockArmor = createMockItem({
      name: 'Plate Armor',
      item_type: { id: 2, name: 'Heavy Armor', code: 'ARM' },
      armor_class: 18,
      damage_dice: null
    })
    const { useItemDetail } = await import('~/composables/useItemDetail')
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      entity: ref(mockArmor),
      isArmor: ref(true),
      costDisplay: ref('1500 gp')
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'plate-armor' } }
    })

    expect(wrapper.findComponent({ name: 'ItemWeaponStats' }).exists()).toBe(false)
  })

  // ItemArmorStats - Conditional on isArmor or isShield
  it('renders ItemArmorStats only for armor (isArmor true)', async () => {
    const mockArmor = createMockItem({
      name: 'Plate Armor',
      item_type: { id: 2, name: 'Heavy Armor', code: 'ARM' },
      armor_class: 18,
      strength_requirement: 15
    })
    const { useItemDetail } = await import('~/composables/useItemDetail')
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      entity: ref(mockArmor),
      isArmor: ref(true),
      costDisplay: ref('1500 gp')
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'plate-armor' } }
    })

    expect(wrapper.findComponent({ name: 'ItemArmorStats' }).exists()).toBe(true)
  })

  it('renders ItemArmorStats for shields (isShield true)', async () => {
    const mockShield = createMockItem({
      name: 'Shield',
      item_type: { id: 3, name: 'Shield', code: 'SHD' },
      armor_class: 2
    })
    const { useItemDetail } = await import('~/composables/useItemDetail')
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      entity: ref(mockShield),
      isShield: ref(true),
      costDisplay: ref('10 gp')
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'shield' } }
    })

    expect(wrapper.findComponent({ name: 'ItemArmorStats' }).exists()).toBe(true)
  })

  it('does not render ItemArmorStats for non-armor', async () => {
    const mockWeapon = createMockItem({
      name: 'Longsword',
      item_type: { id: 5, name: 'Martial Weapon', code: 'WEP' }
    })
    const { useItemDetail } = await import('~/composables/useItemDetail')
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      entity: ref(mockWeapon),
      isWeapon: ref(true),
      costDisplay: ref('15 gp')
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'longsword' } }
    })

    expect(wrapper.findComponent({ name: 'ItemArmorStats' }).exists()).toBe(false)
  })

  // ItemMagicSection - Conditional on isCharged or requiresAttunement
  it('renders ItemMagicSection for charged items', async () => {
    const mockWand = createMockItem({
      name: 'Wand of Fireballs',
      charges_max: 7,
      recharge_formula: '1d6+1',
      recharge_timing: 'dawn'
    })
    const { useItemDetail } = await import('~/composables/useItemDetail')
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      entity: ref(mockWand),
      isCharged: ref(true),
      isMagic: ref(true)
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'wand-of-fireballs' } }
    })

    expect(wrapper.findComponent({ name: 'ItemMagicSection' }).exists()).toBe(true)
  })

  it('renders ItemMagicSection for items requiring attunement', async () => {
    const mockRing = createMockItem({
      name: 'Ring of Protection',
      requires_attunement: true
    })
    const { useItemDetail } = await import('~/composables/useItemDetail')
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      entity: ref(mockRing),
      isMagic: ref(true),
      requiresAttunement: ref(true),
      attunementText: ref('Requires Attunement')
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'ring-of-protection' } }
    })

    expect(wrapper.findComponent({ name: 'ItemMagicSection' }).exists()).toBe(true)
  })

  it('does not render ItemMagicSection for mundane items', async () => {
    const mockItem = createMockItem({
      name: 'Longsword',
      charges_max: null,
      requires_attunement: false
    })
    const { useItemDetail } = await import('~/composables/useItemDetail')
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      entity: ref(mockItem),
      isWeapon: ref(true),
      costDisplay: ref('15 gp')
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'longsword' } }
    })

    expect(wrapper.findComponent({ name: 'ItemMagicSection' }).exists()).toBe(false)
  })

  // ItemSpellsTable - Conditional on hasSpells
  it('renders ItemSpellsTable when item has spells', async () => {
    const mockWand = createMockItem({
      name: 'Wand of Fireballs',
      spells: [
        { id: 1, name: 'Fireball', slug: 'fireball', level: 3, school: { id: 1, name: 'Evocation', code: 'EVO' }, charge_cost: 3 }
      ]
    })
    const { useItemDetail } = await import('~/composables/useItemDetail')
    // Create a Map for spellsByChargeCost (component expects Map<string, ItemSpellResource[]>)
    const spellsMap = new Map([
      ['3', [{ id: 1, name: 'Fireball', slug: 'fireball', level: 3, school: { id: 1, name: 'Evocation', code: 'EVO' }, charge_cost: 3 }]]
    ])
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      entity: ref(mockWand),
      isCharged: ref(true),
      isMagic: ref(true),
      hasSpells: ref(true),
      spellsByChargeCost: ref(spellsMap)
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'wand-of-fireballs' } }
    })

    expect(wrapper.findComponent({ name: 'ItemSpellsTable' }).exists()).toBe(true)
  })

  it('does not render ItemSpellsTable when no spells', async () => {
    const mockItem = createMockItem({
      name: 'Longsword',
      spells: []
    })
    const { useItemDetail } = await import('~/composables/useItemDetail')
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      entity: ref(mockItem),
      isWeapon: ref(true),
      costDisplay: ref('15 gp')
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'longsword' } }
    })

    expect(wrapper.findComponent({ name: 'ItemSpellsTable' }).exists()).toBe(false)
  })

  // Description - Always Renders
  it('renders description card', async () => {
    const mockItem = createMockItem({
      name: 'Longsword',
      description: 'A versatile martial weapon.'
    })
    const { useItemDetail } = await import('~/composables/useItemDetail')
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      entity: ref(mockItem),
      isWeapon: ref(true),
      costDisplay: ref('15 gp')
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'longsword' } }
    })

    expect(wrapper.text()).toContain('A versatile martial weapon.')
  })

  // ItemQuickInfo - Always Renders
  it('renders ItemQuickInfo with cost/weight/source', async () => {
    const mockItem = createMockItem({
      name: 'Longsword',
      cost_cp: 1500,
      weight: 3,
      sources: [{ id: 1, name: 'Player\'s Handbook', code: 'PHB', pages: '149' }]
    })
    const { useItemDetail } = await import('~/composables/useItemDetail')
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      entity: ref(mockItem),
      isWeapon: ref(true),
      costDisplay: ref('15 gp')
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'longsword' } }
    })

    expect(wrapper.findComponent({ name: 'ItemQuickInfo' }).exists()).toBe(true)
  })

  // Accordion - Abilities
  it('renders accordion with abilities when present', async () => {
    const mockItem = createMockItem({
      name: 'Cloak of Protection',
      abilities: [
        { id: 1, name: 'Protection', description: 'You gain a +1 bonus to AC and saving throws while you wear this cloak.' }
      ]
    })
    const { useItemDetail } = await import('~/composables/useItemDetail')
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      entity: ref(mockItem),
      isMagic: ref(true),
      requiresAttunement: ref(true),
      attunementText: ref('Requires Attunement')
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'cloak-of-protection' } }
    })

    expect(wrapper.text()).toContain('Abilities')
  })

  // Accordion - Data Tables
  it('renders accordion with data tables when present', async () => {
    const mockItem = createMockItem({
      name: 'Bag of Tricks',
      data_tables: [
        {
          id: 1,
          name: 'Creature Table',
          headers: ['d8', 'Creature'],
          rows: [
            { cells: ['1', 'Jackal'] },
            { cells: ['2', 'Ape'] }
          ]
        }
      ]
    })
    const { useItemDetail } = await import('~/composables/useItemDetail')
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      entity: ref(mockItem),
      isMagic: ref(true)
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'bag-of-tricks' } }
    })

    expect(wrapper.text()).toContain('Data Tables')
  })

  // Accordion - Saving Throws
  it('renders accordion with saving throws when present', async () => {
    const mockItem = createMockItem({
      name: 'Staff of Fire',
      saving_throws: [
        { id: 1, ability_score: { id: 3, name: 'Constitution', code: 'CON' }, dc: 15, description: 'On a failed save, the target takes 2d6 fire damage.' }
      ]
    })
    const { useItemDetail } = await import('~/composables/useItemDetail')
    vi.mocked(useItemDetail).mockReturnValue(createMockUseItemDetail({
      entity: ref(mockItem),
      isCharged: ref(true),
      isMagic: ref(true),
      requiresAttunement: ref(true),
      attunementText: ref('Requires Attunement by a Sorcerer, Warlock, or Wizard')
    }))

    const ItemDetailPage = await import('~/pages/items/[slug].vue').then(m => m.default)
    const wrapper = await mountSuspended(ItemDetailPage, {
      route: { params: { slug: 'staff-of-fire' } }
    })

    expect(wrapper.text()).toContain('Saving Throws')
  })
})
