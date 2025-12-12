// tests/pages/characters/level-up/index.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import LevelUpPreviewPage from '~/pages/characters/[publicId]/level-up/index.vue'

// Mock route
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRoute: () => ({
      params: { publicId: 'test-hero-Ab12' }
    }),
    useRouter: () => ({
      push: vi.fn()
    })
  }
})

// Mock API
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    apiFetch: vi.fn().mockResolvedValue({
      data: {
        id: 1,
        public_id: 'test-hero-Ab12',
        name: 'Test Hero',
        classes: [{ class: { name: 'Fighter', slug: 'fighter', hit_die: 10 }, level: 4, is_primary: true }],
        is_complete: true
      }
    })
  })
}))

describe('LevelUpPreviewPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders character name in title', async () => {
    const wrapper = await mountSuspended(LevelUpPreviewPage)
    expect(wrapper.text()).toContain('Test Hero')
  })

  it('shows Begin Level Up button', async () => {
    const wrapper = await mountSuspended(LevelUpPreviewPage)
    expect(wrapper.text()).toContain('Begin Level Up')
  })

  it('shows current and target level', async () => {
    const wrapper = await mountSuspended(LevelUpPreviewPage)
    expect(wrapper.text()).toContain('4')
    expect(wrapper.text()).toContain('5')
  })
})
