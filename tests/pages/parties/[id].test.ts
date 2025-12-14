// tests/pages/parties/[id].test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PartyDetailPage from '~/pages/parties/[id].vue'
import type { Party, PartyCharacter } from '~/types'

const mockCharacters: PartyCharacter[] = [
  {
    id: 1,
    public_id: 'brave-falcon-x7Kp',
    name: 'Thorin Ironforge',
    class_name: 'Fighter',
    level: 5,
    portrait: null,
    parties: []
  }
]

const mockParty: Party = {
  id: 1,
  name: 'Dragon Heist Campaign',
  description: 'Weekly Thursday game',
  character_count: 1,
  characters: mockCharacters,
  created_at: '2025-01-01T00:00:00Z'
}

// Mock route
mockNuxtImport('useRoute', () => () => ({
  params: { id: '1' }
}))

// Mock apiFetch
const apiFetchMock = vi.fn()
mockNuxtImport('useApi', () => () => ({ apiFetch: apiFetchMock }))

// Mock toast
const toastMock = { add: vi.fn() }
mockNuxtImport('useToast', () => () => toastMock)

describe('PartyDetailPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    apiFetchMock.mockClear()
    toastMock.add.mockClear()
  })

  it('renders party name', async () => {
    apiFetchMock.mockResolvedValue({ data: mockParty })

    const wrapper = await mountSuspended(PartyDetailPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Dragon Heist Campaign')
  })

  it('renders party description', async () => {
    apiFetchMock.mockResolvedValue({ data: mockParty })

    const wrapper = await mountSuspended(PartyDetailPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Weekly Thursday game')
  })

  it('renders character list', async () => {
    apiFetchMock.mockResolvedValue({ data: mockParty })

    const wrapper = await mountSuspended(PartyDetailPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Thorin Ironforge')
  })

  it('has back to parties link', async () => {
    apiFetchMock.mockResolvedValue({ data: mockParty })

    const wrapper = await mountSuspended(PartyDetailPage)
    await flushPromises()

    const link = wrapper.find('a[href="/parties"]')
    expect(link.exists()).toBe(true)
  })

  it('has Add Character button', async () => {
    apiFetchMock.mockResolvedValue({ data: mockParty })

    const wrapper = await mountSuspended(PartyDetailPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Add Character')
  })
})
