import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CharacterDetailPage from '~/pages/characters/[publicId]/index.vue'

// Mock useRoute to provide character publicId
vi.mock('#app', async () => {
  const actual = await vi.importActual('#app')
  return {
    ...actual,
    useRoute: () => ({
      params: { publicId: 'shadow-warden-q3x9' }
    })
  }
})

// Mock useApi
const mockApiFetch = vi.fn()
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    apiFetch: mockApiFetch
  })
}))

describe('Character Detail Page', () => {
  const mockCharacter = {
    id: 1,
    public_id: 'shadow-warden-q3x9',
    name: 'Thorin Ironforge',
    level: 3,
    experience_points: 900,
    is_complete: true,
    validation_status: { is_complete: true, missing: [] },
    ability_scores: {
      STR: 16,
      DEX: 12,
      CON: 14,
      INT: 10,
      WIS: 13,
      CHA: 8
    },
    modifiers: {
      STR: 3,
      DEX: 1,
      CON: 2,
      INT: 0,
      WIS: 1,
      CHA: -1
    },
    proficiency_bonus: 2,
    max_hit_points: 28,
    current_hit_points: 28,
    temp_hit_points: 0,
    armor_class: 18,
    alignment: 'Lawful Good',
    has_inspiration: false,
    race: { id: 1, name: 'Dwarf', slug: 'dwarf' },
    class: { id: 2, name: 'Fighter', slug: 'fighter' },
    classes: [],
    background: { id: 3, name: 'Soldier', slug: 'soldier' },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  beforeEach(() => {
    mockApiFetch.mockReset()
    mockApiFetch.mockResolvedValue({ data: mockCharacter })
  })

  describe('inspiration display', () => {
    it('shows inspiration indicator when character has inspiration', async () => {
      mockApiFetch.mockResolvedValue({
        data: { ...mockCharacter, has_inspiration: true }
      })

      const wrapper = await mountSuspended(CharacterDetailPage)
      await wrapper.vm.$nextTick()

      const inspirationBadge = wrapper.find('[data-testid="inspiration-badge"]')
      expect(inspirationBadge.exists()).toBe(true)
      expect(inspirationBadge.text()).toContain('Inspired')
    })

    it('does not show inspiration badge when character has no inspiration', async () => {
      mockApiFetch.mockResolvedValue({
        data: { ...mockCharacter, has_inspiration: false }
      })

      const wrapper = await mountSuspended(CharacterDetailPage)
      await wrapper.vm.$nextTick()

      const inspirationBadge = wrapper.find('[data-testid="inspiration-badge"]')
      expect(inspirationBadge.exists()).toBe(false)
    })
  })
})
