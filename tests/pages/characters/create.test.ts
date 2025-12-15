// tests/pages/characters/create.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'

describe('CharacterCreatePage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows redirect message', async () => {
    const CharacterCreatePage = await import('~/pages/characters/create.vue')
    const wrapper = await mountSuspended(CharacterCreatePage.default)

    expect(wrapper.text()).toContain('Redirecting to new character wizard')
  })

  it('shows loading spinner', async () => {
    const CharacterCreatePage = await import('~/pages/characters/create.vue')
    const wrapper = await mountSuspended(CharacterCreatePage.default)

    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })
})
