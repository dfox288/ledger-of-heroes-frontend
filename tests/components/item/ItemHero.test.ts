import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ItemHero from '~/components/item/ItemHero.vue'
import { createMockItem } from '../../helpers/mockFactories'

describe('ItemHero', () => {
  const mockItem = createMockItem()

  // Basic rendering

  it('renders item name as heading', async () => {
    const wrapper = await mountSuspended(ItemHero, {
      props: {
        item: mockItem,
        imagePath: null
      }
    })

    const heading = wrapper.find('h1')
    expect(heading.exists()).toBe(true)
    expect(heading.text()).toBe('Longsword')
  })

  // Badge tests

  it('renders item type badge with correct color', async () => {
    const wrapper = await mountSuspended(ItemHero, {
      props: {
        item: mockItem,
        imagePath: null
      }
    })

    expect(wrapper.text()).toContain('Martial Weapon')
  })

  it('renders rarity badge with correct color', async () => {
    const wrapper = await mountSuspended(ItemHero, {
      props: {
        item: mockItem,
        imagePath: null
      }
    })

    expect(wrapper.text()).toContain('Common')
  })

  it('renders magic bonus badge when present', async () => {
    const magicItem = createMockItem({
      magic_bonus: '2',
      is_magic: true
    })
    const wrapper = await mountSuspended(ItemHero, {
      props: {
        item: magicItem,
        imagePath: null
      }
    })

    expect(wrapper.text()).toContain('+2')
  })

  it('does not render magic bonus badge when null', async () => {
    const wrapper = await mountSuspended(ItemHero, {
      props: {
        item: mockItem,
        imagePath: null
      }
    })

    expect(wrapper.text()).not.toContain('+1')
    expect(wrapper.text()).not.toContain('+2')
    expect(wrapper.text()).not.toContain('+3')
  })

  it('renders magic sparkle indicator when is_magic is true', async () => {
    const magicItem = createMockItem({ is_magic: true })
    const wrapper = await mountSuspended(ItemHero, {
      props: {
        item: magicItem,
        imagePath: null
      }
    })

    expect(wrapper.text()).toContain('✨')
  })

  it('does not render magic indicator when is_magic is false', async () => {
    const wrapper = await mountSuspended(ItemHero, {
      props: {
        item: mockItem,
        imagePath: null
      }
    })

    expect(wrapper.text()).not.toContain('✨')
  })

  it('renders attunement badge when requires_attunement is true', async () => {
    const attunementItem = createMockItem({ requires_attunement: true })
    const wrapper = await mountSuspended(ItemHero, {
      props: {
        item: attunementItem,
        imagePath: null
      }
    })

    expect(wrapper.text()).toContain('🔮')
    expect(wrapper.text()).toContain('Attunement')
  })

  it('does not render attunement badge when requires_attunement is false', async () => {
    const wrapper = await mountSuspended(ItemHero, {
      props: {
        item: mockItem,
        imagePath: null
      }
    })

    expect(wrapper.text()).not.toContain('Attunement')
    expect(wrapper.text()).not.toContain('🔮')
  })

  // Image tests

  it('renders image when imagePath provided', async () => {
    const wrapper = await mountSuspended(ItemHero, {
      props: {
        item: mockItem,
        imagePath: '/images/items/longsword.png'
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
  })

  it('handles missing image gracefully', async () => {
    const wrapper = await mountSuspended(ItemHero, {
      props: {
        item: mockItem,
        imagePath: null
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(false)
  })

  it('applies correct grid layout', async () => {
    const wrapper = await mountSuspended(ItemHero, {
      props: {
        item: mockItem,
        imagePath: '/images/items/longsword.png'
      }
    })

    // Check for responsive grid classes
    const container = wrapper.find('.grid')
    expect(container.exists()).toBe(true)
    expect(container.classes()).toContain('lg:grid-cols-3')
  })

  // Integration tests

  it('displays all badges together correctly', async () => {
    const fullItem = createMockItem({
      name: 'Flametongue',
      magic_bonus: '2',
      is_magic: true,
      requires_attunement: true,
      rarity: 'rare'
    })
    const wrapper = await mountSuspended(ItemHero, {
      props: {
        item: fullItem,
        imagePath: '/images/items/flametongue.png'
      }
    })

    const text = wrapper.text()
    expect(text).toContain('Flametongue')
    expect(text).toContain('Martial Weapon')
    expect(text).toContain('Rare')
    expect(text).toContain('+2')
    expect(text).toContain('✨')
    expect(text).toContain('Attunement')
  })

  it('handles different item types with appropriate colors', async () => {
    const armor = createMockItem({
      item_type: { id: 2, name: 'Heavy Armor', code: 'ARM' }
    })
    const wrapper = await mountSuspended(ItemHero, {
      props: {
        item: armor,
        imagePath: null
      }
    })

    expect(wrapper.text()).toContain('Heavy Armor')
  })

  it('handles different rarities with appropriate colors', async () => {
    const rarities = ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact']

    for (const rarity of rarities) {
      const item = createMockItem({ rarity })
      const wrapper = await mountSuspended(ItemHero, {
        props: {
          item,
          imagePath: null
        }
      })

      // Capitalize first letter of each word
      const expectedText = rarity
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      expect(wrapper.text()).toContain(expectedText)
    }
  })

  it('uses lazy loading for images', async () => {
    const wrapper = await mountSuspended(ItemHero, {
      props: {
        item: mockItem,
        imagePath: '/images/items/longsword.png'
      }
    })

    const img = wrapper.find('img')
    expect(img.attributes('loading')).toBe('lazy')
  })
})
