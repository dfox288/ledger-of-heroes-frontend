// tests/pages/parties/index.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PartyListPage from '~/pages/parties/index.vue'
import type { PartyListItem } from '~/types'

const mockParties: PartyListItem[] = [
  {
    id: 1,
    name: 'Dragon Heist Campaign',
    description: 'Weekly Thursday game',
    character_count: 4,
    created_at: '2025-01-01T00:00:00Z'
  }
]

// Mock apiFetch
const apiFetchMock = vi.fn()
mockNuxtImport('useApi', () => () => ({ apiFetch: apiFetchMock }))

// Mock toast
const toastMock = { add: vi.fn() }
mockNuxtImport('useToast', () => () => toastMock)

describe('PartyListPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    apiFetchMock.mockClear()
    toastMock.add.mockClear()
  })

  it('renders page title', async () => {
    apiFetchMock.mockResolvedValue({ data: mockParties })

    const wrapper = await mountSuspended(PartyListPage)
    await flushPromises()

    expect(wrapper.text()).toContain('My Parties')
  })

  it('renders party cards', async () => {
    apiFetchMock.mockResolvedValue({ data: mockParties })

    const wrapper = await mountSuspended(PartyListPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Dragon Heist Campaign')
  })

  it('shows empty state when no parties', async () => {
    apiFetchMock.mockResolvedValue({ data: [] })

    const wrapper = await mountSuspended(PartyListPage)
    await flushPromises()

    expect(wrapper.text()).toContain('No parties yet')
  })

  it('has New Party button', async () => {
    apiFetchMock.mockResolvedValue({ data: mockParties })

    const wrapper = await mountSuspended(PartyListPage)
    await flushPromises()

    expect(wrapper.text()).toContain('New Party')
  })
})
