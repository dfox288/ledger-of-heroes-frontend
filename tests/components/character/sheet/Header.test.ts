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
    expect(wrapper.find('[data-test="inspiration-badge"]').exists()).toBe(true)
  })

  it('hides Inspiration badge when has_inspiration is false', async () => {
    const wrapper = await mountSuspended(Header, {
      props: { character: { ...mockCharacter, has_inspiration: false } }
    })
    expect(wrapper.find('[data-test="inspiration-badge"]').exists()).toBe(false)
  })

  it('shows Edit button for incomplete characters', async () => {
    const wrapper = await mountSuspended(Header, {
      props: { character: { ...mockCharacter, is_complete: false } }
    })
    expect(wrapper.find('[data-test="edit-button"]').exists()).toBe(true)
  })
})
