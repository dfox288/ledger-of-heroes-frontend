// tests/pages/characters/index.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'
import CharacterListPage from '~/pages/characters/index.vue'

// Mock useAsyncData
vi.mock('#app', async () => {
  const actual = await vi.importActual('#app')
  return {
    ...actual,
    useAsyncData: vi.fn().mockReturnValue({
      data: ref({ data: [] }),
      pending: ref(false),
      error: ref(null),
      refresh: vi.fn()
    })
  }
})

describe('CharacterListPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the page title', async () => {
    const wrapper = await mountSuspended(CharacterListPage)
    expect(wrapper.text()).toContain('Your Characters')
  })

  it('shows create button', async () => {
    const wrapper = await mountSuspended(CharacterListPage)
    expect(wrapper.text()).toContain('Create Character')
  })

  it('shows empty state when no characters', async () => {
    const wrapper = await mountSuspended(CharacterListPage)
    expect(wrapper.text()).toContain('No characters yet')
  })
})
