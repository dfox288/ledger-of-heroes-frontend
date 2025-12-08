// tests/components/character/sheet/Header.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Header from '~/components/character/sheet/Header.vue'

const mockCharacter = {
  id: 1,
  name: 'Thorin Ironforge',
  level: 5,
  is_complete: true,
  has_inspiration: true,
  race: { id: 1, name: 'Dwarf', slug: 'dwarf' },
  class: { id: 1, name: 'Fighter', slug: 'fighter' },
  classes: [
    { class: { id: 1, name: 'Fighter', slug: 'fighter' }, level: 3, is_primary: true },
    { class: { id: 2, name: 'Cleric', slug: 'cleric' }, level: 2, is_primary: false }
  ],
  background: { id: 1, name: 'Soldier', slug: 'soldier' }
}

describe('CharacterSheetHeader', () => {
  it('displays character name', async () => {
    const wrapper = await mountSuspended(Header, {
      props: { character: mockCharacter }
    })
    expect(wrapper.text()).toContain('Thorin Ironforge')
  })

  it('displays race name', async () => {
    const wrapper = await mountSuspended(Header, {
      props: { character: mockCharacter }
    })
    expect(wrapper.text()).toContain('Dwarf')
  })

  it('displays all classes with levels', async () => {
    const wrapper = await mountSuspended(Header, {
      props: { character: mockCharacter }
    })
    expect(wrapper.text()).toContain('Fighter 3')
    expect(wrapper.text()).toContain('Cleric 2')
  })

  it('shows Complete badge when is_complete is true', async () => {
    const wrapper = await mountSuspended(Header, {
      props: { character: mockCharacter }
    })
    expect(wrapper.text()).toContain('Complete')
  })

  it('shows Draft badge when is_complete is false', async () => {
    const wrapper = await mountSuspended(Header, {
      props: { character: { ...mockCharacter, is_complete: false } }
    })
    expect(wrapper.text()).toContain('Draft')
  })

  it('shows Inspiration badge when has_inspiration is true', async () => {
    const wrapper = await mountSuspended(Header, {
      props: { character: mockCharacter }
    })
    expect(wrapper.find('[data-testid="inspiration-badge"]').exists()).toBe(true)
  })

  it('hides Inspiration badge when has_inspiration is false', async () => {
    const wrapper = await mountSuspended(Header, {
      props: { character: { ...mockCharacter, has_inspiration: false } }
    })
    expect(wrapper.find('[data-testid="inspiration-badge"]').exists()).toBe(false)
  })

  it('shows Edit button for incomplete characters', async () => {
    const wrapper = await mountSuspended(Header, {
      props: { character: { ...mockCharacter, is_complete: false } }
    })
    expect(wrapper.find('[data-testid="edit-button"]').exists()).toBe(true)
  })

  describe('size display', () => {
    it('displays size in parentheses after race name', async () => {
      const wrapper = await mountSuspended(Header, {
        props: { character: { ...mockCharacter, size: 'Medium' } }
      })
      expect(wrapper.text()).toContain('Dwarf (Medium)')
    })

    it('displays Small size for halflings', async () => {
      const wrapper = await mountSuspended(Header, {
        props: {
          character: {
            ...mockCharacter,
            race: { id: 2, name: 'Halfling', slug: 'halfling' },
            size: 'Small'
          }
        }
      })
      expect(wrapper.text()).toContain('Halfling (Small)')
    })

    it('omits size when null', async () => {
      const wrapper = await mountSuspended(Header, {
        props: { character: { ...mockCharacter, size: null } }
      })
      // Should show just "Dwarf" without parentheses
      expect(wrapper.text()).toContain('Dwarf')
      expect(wrapper.text()).not.toContain('(')
    })

    it('omits size when race is null', async () => {
      const wrapper = await mountSuspended(Header, {
        props: { character: { ...mockCharacter, race: null, size: 'Medium' } }
      })
      // No race = no size shown (size is derived from race anyway)
      expect(wrapper.text()).not.toContain('Medium')
    })
  })
})
