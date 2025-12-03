// tests/pages/characters/create.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

// Mock useApi
const mockApiFetch = vi.fn()
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    apiFetch: mockApiFetch
  })
}))

describe('CharacterCreatePage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockApiFetch.mockReset()
  })

  it('calls API to create empty character on mount', async () => {
    mockApiFetch.mockResolvedValueOnce({ data: { id: 42 } })

    const CharacterCreatePage = await import('~/pages/characters/create.vue')
    await mountSuspended(CharacterCreatePage.default)
    await flushPromises()

    expect(mockApiFetch).toHaveBeenCalledWith('/characters', {
      method: 'POST',
      body: { name: 'New Character' }
    })
  })

  it('shows loading spinner while creating', async () => {
    // Don't resolve immediately
    mockApiFetch.mockReturnValue(new Promise(() => {}))

    const CharacterCreatePage = await import('~/pages/characters/create.vue')
    const wrapper = await mountSuspended(CharacterCreatePage.default)

    expect(wrapper.text()).toContain('Creating character')
  })

  it('handles API error gracefully', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Failed'))

    const CharacterCreatePage = await import('~/pages/characters/create.vue')
    // Should not throw
    await expect(mountSuspended(CharacterCreatePage.default)).resolves.toBeDefined()
  })
})
