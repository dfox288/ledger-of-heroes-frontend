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

// Mock validation response (all characters valid by default)
const mockValidationResponse = {
  valid: true,
  dangling_references: [],
  summary: {
    total_references: 5,
    valid_references: 5,
    dangling_count: 0
  }
}

// Mock stats response
const mockStats = {
  ability_scores: {
    STR: { score: 16, modifier: 3 },
    DEX: { score: 12, modifier: 1 },
    CON: { score: 14, modifier: 2 },
    INT: { score: 10, modifier: 0 },
    WIS: { score: 13, modifier: 1 },
    CHA: { score: 8, modifier: -1 }
  },
  saving_throws: { STR: 5, DEX: 1, CON: 4, INT: 0, WIS: 1, CHA: -1 },
  proficiency_bonus: 2,
  spellcasting: null
}

// Mock skills for reference data
const mockSkills = [
  { id: 1, name: 'Acrobatics', slug: 'acrobatics', ability_code: 'DEX' },
  { id: 2, name: 'Athletics', slug: 'athletics', ability_code: 'STR' }
]

// Mock useApi with smart URL-based responses
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

  // Helper function to create smart mock that handles all endpoints
  function createSmartMock(characterOverrides = {}) {
    const character = { ...mockCharacter, ...characterOverrides }
    return (url: string) => {
      if (url.includes('/validate')) {
        return Promise.resolve({ data: mockValidationResponse })
      }
      if (url.includes('/stats')) {
        return Promise.resolve({ data: mockStats })
      }
      if (url.includes('/skills')) {
        return Promise.resolve({ data: mockSkills })
      }
      if (url.includes('/proficiencies') || url.includes('/features')
        || url.includes('/equipment') || url.includes('/spells')
        || url.includes('/languages')) {
        return Promise.resolve({ data: [] })
      }
      return Promise.resolve({ data: character })
    }
  }

  beforeEach(() => {
    mockApiFetch.mockReset()
    mockApiFetch.mockImplementation(createSmartMock())
  })

  describe('inspiration display', () => {
    it('shows inspiration indicator when character has inspiration', async () => {
      mockApiFetch.mockImplementation(createSmartMock({ has_inspiration: true }))

      const wrapper = await mountSuspended(CharacterDetailPage)
      await wrapper.vm.$nextTick()

      const inspirationBadge = wrapper.find('[data-testid="inspiration-badge"]')
      expect(inspirationBadge.exists()).toBe(true)
      expect(inspirationBadge.text()).toContain('Inspired')
    })

    it('does not show inspiration badge when character has no inspiration', async () => {
      mockApiFetch.mockImplementation(createSmartMock({ has_inspiration: false }))

      const wrapper = await mountSuspended(CharacterDetailPage)
      await wrapper.vm.$nextTick()

      const inspirationBadge = wrapper.find('[data-testid="inspiration-badge"]')
      expect(inspirationBadge.exists()).toBe(false)
    })
  })
})
