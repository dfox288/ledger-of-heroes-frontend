import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SearchResultCard from '~/components/SearchResultCard.vue'

describe('SearchResultCard', () => {
  const mockSpell = {
    id: 1,
    name: 'Fireball',
    slug: 'fireball',
    level: 3,
    casting_time: '1 action',
    range: '150 feet',
    description: 'A bright streak flashes from your pointing finger...',
    is_ritual: false,
    needs_concentration: false
  }

  const mockItem = {
    id: 1,
    name: 'Sword of Sharpness',
    slug: 'sword-of-sharpness',
    rarity: 'Very Rare',
    is_magic: true,
    requires_attunement: true,
    description: 'When you attack an object with this magic sword...'
  }

  describe('Spell Results', () => {
    it('renders spell name', async () => {
      const wrapper = await mountSuspended(SearchResultCard, {
        props: {
          result: mockSpell,
          type: 'spell'
        }
      })

      expect(wrapper.text()).toContain('Fireball')
    })

    it('displays spell level and casting time', async () => {
      const wrapper = await mountSuspended(SearchResultCard, {
        props: {
          result: mockSpell,
          type: 'spell'
        }
      })

      expect(wrapper.text()).toContain('Level 3')
      expect(wrapper.text()).toContain('1 action')
    })

    it('shows concentration badge when needed', async () => {
      const concentrationSpell = {
        ...mockSpell,
        needs_concentration: true
      }

      const wrapper = await mountSuspended(SearchResultCard, {
        props: {
          result: concentrationSpell,
          type: 'spell'
        }
      })

      expect(wrapper.text()).toContain('Concentration')
    })

    it('shows ritual badge when is_ritual is true', async () => {
      const ritualSpell = {
        ...mockSpell,
        is_ritual: true
      }

      const wrapper = await mountSuspended(SearchResultCard, {
        props: {
          result: ritualSpell,
          type: 'spell'
        }
      })

      expect(wrapper.text()).toContain('Ritual')
    })
  })

  describe('Item Results', () => {
    it('renders item name', async () => {
      const wrapper = await mountSuspended(SearchResultCard, {
        props: {
          result: mockItem,
          type: 'item'
        }
      })

      expect(wrapper.text()).toContain('Sword of Sharpness')
    })

    it('displays item rarity', async () => {
      const wrapper = await mountSuspended(SearchResultCard, {
        props: {
          result: mockItem,
          type: 'item'
        }
      })

      expect(wrapper.text()).toContain('Very Rare')
    })

    it('shows Magic badge for magical items', async () => {
      const wrapper = await mountSuspended(SearchResultCard, {
        props: {
          result: mockItem,
          type: 'item'
        }
      })

      expect(wrapper.text()).toContain('Magic')
    })

    it('shows Attunement badge when required', async () => {
      const wrapper = await mountSuspended(SearchResultCard, {
        props: {
          result: mockItem,
          type: 'item'
        }
      })

      expect(wrapper.text()).toContain('Attunement')
    })
  })

  describe('Badge Colors', () => {
    it('uses correct badge colors for entity types', async () => {
      const spellWrapper = await mountSuspended(SearchResultCard, {
        props: { result: mockSpell, type: 'spell' }
      })
      expect(spellWrapper.vm.getBadgeColor).toBe('primary')

      const itemWrapper = await mountSuspended(SearchResultCard, {
        props: { result: mockItem, type: 'item' }
      })
      expect(itemWrapper.vm.getBadgeColor).toBe('warning')
    })
  })

  describe('Description Handling', () => {
    it('displays full description when short', async () => {
      const shortDescription = 'This is a short description.'
      const wrapper = await mountSuspended(SearchResultCard, {
        props: {
          result: { ...mockSpell, description: shortDescription },
          type: 'spell'
        }
      })

      expect(wrapper.text()).toContain(shortDescription)
    })

    it('truncates long descriptions', async () => {
      const longDescription = 'A'.repeat(250)
      const wrapper = await mountSuspended(SearchResultCard, {
        props: {
          result: { ...mockSpell, description: longDescription },
          type: 'spell'
        }
      })

      expect(wrapper.text()).toContain('...')
    })

    it('handles null description gracefully', async () => {
      const wrapper = await mountSuspended(SearchResultCard, {
        props: {
          result: { ...mockSpell, description: null },
          type: 'spell'
        }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })
})
