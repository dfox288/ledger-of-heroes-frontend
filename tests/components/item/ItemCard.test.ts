import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ItemCard from '~/components/item/ItemCard.vue'
import { createMockItem } from '../../helpers/mockFactories'
import { testBadgeVisibility } from '../../helpers/badgeVisibilityBehavior'

describe('ItemCard', () => {
  const mockItem = createMockItem()

  // Item-specific tests (domain logic)

  it('renders item name', async () => {
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: mockItem }
    })

    expect(wrapper.text()).toContain('Longsword')
  })

  it('renders item type when provided', async () => {
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: mockItem }
    })

    expect(wrapper.text()).toContain('Martial Weapon')
  })

  it('handles missing item type gracefully', async () => {
    const itemWithoutType = { ...mockItem, item_type: undefined }
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: itemWithoutType }
    })

    expect(wrapper.text()).toContain('Longsword')
    expect(wrapper.text()).not.toContain('Martial Weapon')
  })

  it('formats rarity text with proper capitalization', async () => {
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: mockItem }
    })

    expect(wrapper.text()).toContain('Common')
  })

  it('formats multi-word rarity correctly', async () => {
    const rareItem = { ...mockItem, rarity: 'very rare' }
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: rareItem }
    })

    expect(wrapper.text()).toContain('Very Rare')
  })

  it('handles missing rarity with default', async () => {
    const itemWithoutRarity = { ...mockItem, rarity: undefined }
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: itemWithoutRarity }
    })

    expect(wrapper.text()).toContain('Common')
  })

  it('formats cost in gold pieces when >= 1 gp', async () => {
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: mockItem }
    })

    expect(wrapper.text()).toContain('15 gp')
  })

  it('formats cost in copper pieces when < 1 gp', async () => {
    const cheapItem = { ...mockItem, cost_cp: 50 }
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: cheapItem }
    })

    expect(wrapper.text()).toContain('50 cp')
  })

  it('handles fractional gold pieces', async () => {
    const fractionalItem = { ...mockItem, cost_cp: 155 }
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: fractionalItem }
    })

    expect(wrapper.text()).toContain('1.6 gp')
  })

  it('hides cost when not provided', async () => {
    const itemWithoutCost = { ...mockItem, cost_cp: undefined }
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: itemWithoutCost }
    })

    const text = wrapper.text()
    expect(text).not.toContain('gp')
    expect(text).not.toContain('cp')
  })

  it('renders weight when provided', async () => {
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: mockItem }
    })

    expect(wrapper.text()).toContain('3 lb')
  })

  it('hides weight when not provided', async () => {
    const itemWithoutWeight = { ...mockItem, weight: undefined }
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: itemWithoutWeight }
    })

    expect(wrapper.text()).not.toContain('lb')
  })

  // Badge visibility tests (consolidated via helper)
  testBadgeVisibility(ItemCard, createMockItem, 'item', [
    { badgeText: 'Magic', propField: 'is_magic' },
    { badgeText: 'Attunement', propField: 'requires_attunement' }
  ])

  it('handles items with both magic and attunement', async () => {
    const specialItem = {
      ...mockItem,
      is_magic: true,
      requires_attunement: true
    }
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: specialItem }
    })

    const text = wrapper.text()
    expect(text).toContain('Magic')
    expect(text).toContain('Attunement')
  })

  it('renders description when provided', async () => {
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: mockItem }
    })

    expect(wrapper.text()).toContain('A versatile martial weapon')
  })

  it('shows default description when not provided', async () => {
    const itemWithoutDescription = { ...mockItem, description: undefined }
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: itemWithoutDescription }
    })

    expect(wrapper.text()).toContain('No description available')
  })

  it('displays all key information in organized layout', async () => {
    const fullItem = {
      ...mockItem,
      is_magic: true,
      requires_attunement: true
    }
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: fullItem }
    })

    const text = wrapper.text()
    expect(text).toContain('Longsword')
    expect(text).toContain('Martial Weapon')
    expect(text).toContain('Common')
    expect(text).toContain('15 gp')
    expect(text).toContain('3 lb')
    expect(text).toContain('Magic')
    expect(text).toContain('Attunement')
  })

  it.each([
    ['common'],
    ['uncommon'],
    ['rare'],
    ['very rare'],
    ['legendary'],
    ['artifact']
  ])('handles different rarity levels: %s', async (rarity) => {
    const rarityItem = { ...mockItem, rarity }
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: rarityItem }
    })

    expect(wrapper.html()).toBeTruthy()
  })

  it.each([
    ['Simple Weapon'],
    ['Martial Weapon'],
    ['Bow'],
    ['Sword']
  ])('handles weapon item types: %s', async (typeName) => {
    const weaponItem = { ...mockItem, item_type: { id: 1, name: typeName } }
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: weaponItem }
    })

    expect(wrapper.text()).toContain(typeName)
  })

  it('handles armor item types', async () => {
    const armorItem = {
      ...mockItem,
      item_type: { id: 2, name: 'Heavy Armor' }
    }
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: armorItem }
    })

    expect(wrapper.text()).toContain('Heavy Armor')
  })

  it('handles potion item types', async () => {
    const potionItem = {
      ...mockItem,
      item_type: { id: 3, name: 'Potion' },
      is_magic: true
    }
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: potionItem }
    })

    expect(wrapper.text()).toContain('Potion')
    expect(wrapper.text()).toContain('Magic')
  })

  it('handles zero-cost items', async () => {
    const freeItem = { ...mockItem, cost_cp: 0 }
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: freeItem }
    })

    const text = wrapper.text()
    expect(text).not.toContain('gp')
    expect(text).not.toContain('cp')
  })

  it('handles zero-weight items', async () => {
    const weightlessItem = { ...mockItem, weight: 0 }
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: weightlessItem }
    })

    expect(wrapper.text()).not.toContain('lb')
  })

  // Proficiency Category Tests (Issue #56)

  it('shows proficiency category badge when set', async () => {
    const weapon = createMockItem({ proficiency_category: 'martial_melee' })
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: weapon }
    })

    expect(wrapper.text()).toContain('Martial Melee')
  })

  it('hides proficiency category when null', async () => {
    const potion = createMockItem({
      proficiency_category: null,
      item_type: { id: 3, name: 'Potion' }
    })
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: potion }
    })

    expect(wrapper.text()).not.toContain('Martial')
    expect(wrapper.text()).not.toContain('Simple')
  })

  it('formats proficiency category nicely', async () => {
    const rangedWeapon = createMockItem({ proficiency_category: 'simple_ranged' })
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: rangedWeapon }
    })

    expect(wrapper.text()).toContain('Simple Ranged')
    expect(wrapper.text()).not.toContain('simple_ranged')
  })

  it('handles all proficiency categories', async () => {
    const categories = ['simple_melee', 'martial_melee', 'simple_ranged', 'martial_ranged']

    for (const category of categories) {
      const weapon = createMockItem({ proficiency_category: category })
      const wrapper = await mountSuspended(ItemCard, {
        props: { item: weapon }
      })

      const expectedText = category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      expect(wrapper.text()).toContain(expectedText)
    }
  })

  // Magic Bonus Tests (Issue #56)

  it('shows magic bonus badge when magic_bonus is set', async () => {
    const magicSword = createMockItem({ magic_bonus: '2', is_magic: true })
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: magicSword }
    })

    expect(wrapper.text()).toContain('+2')
  })

  it('hides magic bonus badge when magic_bonus is null', async () => {
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: mockItem }
    })

    expect(wrapper.text()).not.toContain('+1')
    expect(wrapper.text()).not.toContain('+2')
    expect(wrapper.text()).not.toContain('+3')
  })

  it('handles all magic bonus values', async () => {
    const bonuses = ['1', '2', '3']

    for (const bonus of bonuses) {
      const magicItem = createMockItem({ magic_bonus: bonus, is_magic: true })
      const wrapper = await mountSuspended(ItemCard, {
        props: { item: magicItem }
      })

      expect(wrapper.text()).toContain(`+${bonus}`)
    }
  })

  it('shows both magic bonus and proficiency together', async () => {
    const magicLongbow = createMockItem({
      magic_bonus: '1',
      proficiency_category: 'martial_ranged',
      is_magic: true
    })
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: magicLongbow }
    })

    expect(wrapper.text()).toContain('+1')
    expect(wrapper.text()).toContain('Martial Ranged')
  })

  it('shows magic bonus prominently for magic weapons', async () => {
    const magicSword = createMockItem({
      name: 'Longsword +2',
      magic_bonus: '2',
      proficiency_category: 'martial_melee',
      is_magic: true,
      rarity: 'rare'
    })
    const wrapper = await mountSuspended(ItemCard, {
      props: { item: magicSword }
    })

    const text = wrapper.text()
    expect(text).toContain('+2')
    expect(text).toContain('Martial Melee')
    expect(text).toContain('Rare')
    expect(text).toContain('Magic')
  })
})
