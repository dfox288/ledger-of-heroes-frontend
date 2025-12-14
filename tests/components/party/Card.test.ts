// tests/components/party/Card.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import PartyCard from '~/components/party/Card.vue'
import type { PartyListItem } from '~/types'

const mockParty: PartyListItem = {
  id: 1,
  name: 'Dragon Heist Campaign',
  description: 'Weekly Thursday game with the crew',
  character_count: 4,
  created_at: '2025-01-01T00:00:00Z'
}

describe('PartyCard', () => {
  it('renders party name', async () => {
    const wrapper = await mountSuspended(PartyCard, {
      props: { party: mockParty }
    })
    expect(wrapper.text()).toContain('Dragon Heist Campaign')
  })

  it('renders party description when present', async () => {
    const wrapper = await mountSuspended(PartyCard, {
      props: { party: mockParty }
    })
    expect(wrapper.text()).toContain('Weekly Thursday game')
  })

  it('renders character count', async () => {
    const wrapper = await mountSuspended(PartyCard, {
      props: { party: mockParty }
    })
    expect(wrapper.text()).toContain('4 characters')
  })

  it('renders singular "character" when count is 1', async () => {
    const wrapper = await mountSuspended(PartyCard, {
      props: { party: { ...mockParty, character_count: 1 } }
    })
    expect(wrapper.text()).toContain('1 character')
    expect(wrapper.text()).not.toContain('1 characters')
  })

  it('handles null description gracefully', async () => {
    const wrapper = await mountSuspended(PartyCard, {
      props: { party: { ...mockParty, description: null } }
    })
    expect(wrapper.text()).toContain('Dragon Heist Campaign')
    expect(wrapper.text()).not.toContain('null')
  })

  it('emits edit event', async () => {
    const wrapper = await mountSuspended(PartyCard, {
      props: { party: mockParty }
    })

    wrapper.vm.$emit('edit')
    expect(wrapper.emitted('edit')).toBeTruthy()
  })

  it('emits delete event', async () => {
    const wrapper = await mountSuspended(PartyCard, {
      props: { party: mockParty }
    })

    wrapper.vm.$emit('delete')
    expect(wrapper.emitted('delete')).toBeTruthy()
  })

  it('links to party detail page', async () => {
    const wrapper = await mountSuspended(PartyCard, {
      props: { party: mockParty }
    })

    const link = wrapper.find('a[href="/parties/1"]')
    expect(link.exists()).toBe(true)
  })
})
