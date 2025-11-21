import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ItemTypeCard from '~/components/item-type/ItemTypeCard.vue'

describe('ItemTypeCard', () => {
  const mockItemType = {
    id: 1,
    code: 'A',
    name: 'Ammunition',
    description: 'Arrows, bolts, sling bullets, and other projectiles'
  }

  it('displays item type code as large badge', async () => {
    const wrapper = await mountSuspended(ItemTypeCard, {
      props: { itemType: mockItemType }
    })

    expect(wrapper.text()).toContain('A')
  })

  it('displays item type name as title', async () => {
    const wrapper = await mountSuspended(ItemTypeCard, {
      props: { itemType: mockItemType }
    })

    expect(wrapper.text()).toContain('Ammunition')
  })

  it('displays description', async () => {
    const wrapper = await mountSuspended(ItemTypeCard, {
      props: { itemType: mockItemType }
    })

    expect(wrapper.text()).toContain('Arrows, bolts')
  })

  it('truncates long descriptions', async () => {
    const longDesc = {
      id: 2,
      code: 'W',
      name: 'Weapon',
      description: 'Weapons are used to attack enemies in combat. They come in many varieties including swords, axes, bows, and more exotic options. Each weapon has unique properties that affect how it can be used in battle. Some weapons are simple while others require special training.'
    }

    const wrapper = await mountSuspended(ItemTypeCard, {
      props: { itemType: longDesc }
    })

    const html = wrapper.html()
    expect(html).toContain('line-clamp-2')
  })

  it('displays category badge', async () => {
    const wrapper = await mountSuspended(ItemTypeCard, {
      props: { itemType: mockItemType }
    })

    expect(wrapper.text()).toContain('Item Type')
  })
})
