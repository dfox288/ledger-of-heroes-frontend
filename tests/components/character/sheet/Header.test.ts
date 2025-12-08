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

  describe('alignment display', () => {
    it('displays alignment after background when present', async () => {
      const wrapper = await mountSuspended(Header, {
        props: { character: { ...mockCharacter, alignment: 'Lawful Good' } }
      })
      expect(wrapper.text()).toContain('Soldier • Lawful Good')
    })

    it('displays different alignments correctly', async () => {
      const wrapper = await mountSuspended(Header, {
        props: { character: { ...mockCharacter, alignment: 'Chaotic Neutral' } }
      })
      expect(wrapper.text()).toContain('Chaotic Neutral')
    })

    it('omits alignment when null', async () => {
      const wrapper = await mountSuspended(Header, {
        props: { character: { ...mockCharacter, alignment: null } }
      })
      // Should show background but not alignment
      expect(wrapper.text()).toContain('Soldier')
      expect(wrapper.text()).not.toMatch(/Soldier\s*•\s*[A-Z]/)
    })

    it('omits alignment when background is null', async () => {
      const wrapper = await mountSuspended(Header, {
        props: { character: { ...mockCharacter, background: null, alignment: 'Lawful Good' } }
      })
      // Should show alignment after classes
      expect(wrapper.text()).toContain('Lawful Good')
      expect(wrapper.text()).not.toContain('Soldier')
    })

    it('displays alignment without background', async () => {
      const wrapper = await mountSuspended(Header, {
        props: { character: { ...mockCharacter, background: null, alignment: 'Neutral Evil' } }
      })
      // Should show: "Dwarf • Fighter 3 / Cleric 2 • Neutral Evil"
      expect(wrapper.text()).toContain('Neutral Evil')
      expect(wrapper.text()).toMatch(/Cleric 2\s*•\s*Neutral Evil/)
    })
  })

  describe('portrait display', () => {
    it('displays portrait image when portrait is present with thumb', async () => {
      const wrapper = await mountSuspended(Header, {
        props: {
          character: {
            ...mockCharacter,
            portrait: {
              original: 'https://example.com/portrait.jpg',
              thumb: 'https://example.com/portrait-thumb.jpg',
              medium: 'https://example.com/portrait-medium.jpg',
              is_uploaded: true
            }
          }
        }
      })
      const img = wrapper.find('[data-testid="portrait-image"]')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://example.com/portrait-thumb.jpg')
      expect(img.attributes('alt')).toBe('Thorin Ironforge portrait')
    })

    it('uses medium size when thumb is null', async () => {
      const wrapper = await mountSuspended(Header, {
        props: {
          character: {
            ...mockCharacter,
            portrait: {
              original: 'https://example.com/portrait.jpg',
              thumb: null,
              medium: 'https://example.com/portrait-medium.jpg',
              is_uploaded: true
            }
          }
        }
      })
      const img = wrapper.find('[data-testid="portrait-image"]')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://example.com/portrait-medium.jpg')
    })

    it('shows fallback icon when portrait is null', async () => {
      const wrapper = await mountSuspended(Header, {
        props: { character: { ...mockCharacter, portrait: null } }
      })
      expect(wrapper.find('[data-testid="portrait-image"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="portrait-fallback"]').exists()).toBe(true)
    })

    it('shows fallback icon when portrait exists but thumb and medium are null', async () => {
      const wrapper = await mountSuspended(Header, {
        props: {
          character: {
            ...mockCharacter,
            portrait: {
              original: 'https://example.com/portrait.jpg',
              thumb: null,
              medium: null,
              is_uploaded: true
            }
          }
        }
      })
      expect(wrapper.find('[data-testid="portrait-image"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="portrait-fallback"]').exists()).toBe(true)
    })

    it('portrait container has proper styling classes', async () => {
      const wrapper = await mountSuspended(Header, {
        props: {
          character: {
            ...mockCharacter,
            portrait: {
              original: 'https://example.com/portrait.jpg',
              thumb: 'https://example.com/portrait-thumb.jpg',
              medium: null,
              is_uploaded: true
            }
          }
        }
      })
      const container = wrapper.find('[data-testid="portrait-container"]')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('rounded-full')
    })

    it('fallback icon has proper size and styling', async () => {
      const wrapper = await mountSuspended(Header, {
        props: { character: { ...mockCharacter, portrait: null } }
      })
      const icon = wrapper.find('[data-testid="portrait-fallback"]')
      expect(icon.exists()).toBe(true)
      expect(icon.classes()).toContain('text-gray-400')
    })
  })
})
