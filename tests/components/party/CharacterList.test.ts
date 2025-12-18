// tests/components/party/CharacterList.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CharacterList from '~/components/party/CharacterList.vue'
import type { PartyCharacter } from '~/types'

const mockCharacters: PartyCharacter[] = [
  {
    id: 1,
    public_id: 'brave-falcon-x7Kp',
    name: 'Thorin Ironforge',
    class_name: 'Fighter',
    total_level: 5,
    portrait: null,
    parties: []
  },
  {
    id: 2,
    public_id: 'swift-hawk-y8Lq',
    name: 'Elara Moonwhisper',
    class_name: 'Wizard',
    total_level: 5,
    portrait: { thumb: '/images/elara.jpg' },
    parties: []
  }
]

describe('PartyCharacterList', () => {
  it('renders all characters', async () => {
    const wrapper = await mountSuspended(CharacterList, {
      props: { characters: mockCharacters }
    })

    expect(wrapper.text()).toContain('Thorin Ironforge')
    expect(wrapper.text()).toContain('Elara Moonwhisper')
  })

  it('renders character class and level', async () => {
    const wrapper = await mountSuspended(CharacterList, {
      props: { characters: mockCharacters }
    })

    expect(wrapper.text()).toContain('Fighter')
    expect(wrapper.text()).toContain('Level 5')
  })

  it('shows empty state when no characters', async () => {
    const wrapper = await mountSuspended(CharacterList, {
      props: { characters: [] }
    })

    expect(wrapper.text()).toContain('No characters in this party')
  })

  it('emits remove event with character id', async () => {
    const wrapper = await mountSuspended(CharacterList, {
      props: { characters: mockCharacters }
    })

    wrapper.vm.$emit('remove', 1)

    expect(wrapper.emitted('remove')).toBeTruthy()
    expect(wrapper.emitted('remove')![0]).toEqual([1])
  })

  it('links character name to character page', async () => {
    const wrapper = await mountSuspended(CharacterList, {
      props: { characters: mockCharacters }
    })

    const link = wrapper.find('a[href="/characters/brave-falcon-x7Kp"]')
    expect(link.exists()).toBe(true)
  })
})
