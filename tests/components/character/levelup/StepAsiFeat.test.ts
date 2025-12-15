/**
 * StepAsiFeat Component Tests
 *
 * Tests the ASI/Feat selection step for level-up wizard.
 * Fixes #690 - ASI/Feat step shows empty state due to choice type mismatch.
 *
 * The API returns ASI/Feat choices with:
 * - type: 'ability_score'
 * - subtype: 'asi_or_feat'
 * - options: [{ type: 'asi', ... }, { type: 'feat', slug: '...', ... }]
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import StepAsiFeat from '~/components/character/levelup/StepAsiFeat.vue'
import type { components } from '~/types/api/generated'

type PendingChoice = components['schemas']['PendingChoiceResource']

// ════════════════════════════════════════════════════════════════
// MOCK DATA - Based on halfling-rogue-l4.ts fixture
// ════════════════════════════════════════════════════════════════

const mockAsiOrFeatChoice: PendingChoice = {
  id: 'ability_score|class|phb:rogue|4|asi',
  type: 'ability_score',
  subtype: 'asi_or_feat',
  source: 'class',
  source_name: 'Rogue',
  level_granted: 4,
  required: true,
  quantity: 1,
  remaining: 1,
  selected: [],
  options: [
    // ASI Option
    {
      type: 'asi',
      label: 'Ability Score Improvement',
      description: 'Increase one ability score by 2, or two ability scores by 1 each.'
    },
    // Feat options
    { slug: 'phb:alert', name: 'Alert', type: 'feat' },
    { slug: 'phb:lucky', name: 'Lucky', type: 'feat' },
    { slug: 'phb:mobile', name: 'Mobile', type: 'feat' },
    { slug: 'phb:skulker', name: 'Skulker', type: 'feat' },
    { slug: 'phb:tough', name: 'Tough', type: 'feat' }
  ]
}

// ════════════════════════════════════════════════════════════════
// MOCKS
// ════════════════════════════════════════════════════════════════

const mockResolveChoice = vi.fn()
const mockFetchChoices = vi.fn()
const mockNextStep = vi.fn()
const mockChoices = ref<PendingChoice[]>([])

vi.mock('~/stores/characterLevelUp', () => ({
  useCharacterLevelUpStore: vi.fn(() => ({
    characterId: 1,
    publicId: 'shadow-whisper-R4m9',
    selectedClassSlug: 'phb:rogue',
    refreshChoices: vi.fn()
  }))
}))

vi.mock('~/composables/useUnifiedChoices', () => ({
  useUnifiedChoices: vi.fn(() => ({
    choices: mockChoices,
    choicesByType: computed(() => ({
      abilityScores: mockChoices.value.filter(
        (c: PendingChoice) => c.type === 'ability_score'
      )
    })),
    pending: ref(false),
    error: ref(null),
    fetchChoices: mockFetchChoices,
    resolveChoice: mockResolveChoice
  }))
}))

// Mock ability scores for ASI allocation
const mockAbilityScores = ref([
  { code: 'STR', name: 'Strength', score: 8, modifier: -1 },
  { code: 'DEX', name: 'Dexterity', score: 18, modifier: 4 },
  { code: 'CON', name: 'Constitution', score: 14, modifier: 2 },
  { code: 'INT', name: 'Intelligence', score: 12, modifier: 1 },
  { code: 'WIS', name: 'Wisdom', score: 10, modifier: 0 },
  { code: 'CHA', name: 'Charisma', score: 15, modifier: 2 }
])

vi.mock('~/composables/useCharacterStats', () => ({
  useCharacterStats: vi.fn(() => ({
    abilityScores: mockAbilityScores,
    isLoading: ref(false),
    error: ref(null),
    refresh: vi.fn()
  }))
}))

// ════════════════════════════════════════════════════════════════
// TESTS
// ════════════════════════════════════════════════════════════════

describe('StepAsiFeat', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockChoices.value = [mockAsiOrFeatChoice]
  })

  const mountComponent = async () => {
    return await mountSuspended(StepAsiFeat, {
      props: {
        characterId: 1,
        publicId: 'shadow-whisper-R4m9',
        nextStep: mockNextStep
      }
    })
  }

  // ──────────────────────────────────────────────────────────────
  // RENDERING TESTS
  // ──────────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the step title', async () => {
      const wrapper = await mountComponent()

      expect(wrapper.text()).toContain('Ability Score Improvement')
    })

    it('shows ASI option card', async () => {
      const wrapper = await mountComponent()

      expect(wrapper.find('[data-testid="asi-option"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Ability Score Improvement')
    })

    it('shows Feat option card', async () => {
      const wrapper = await mountComponent()

      expect(wrapper.find('[data-testid="feat-option"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Feat')
    })

    it('shows source information (class and level)', async () => {
      const wrapper = await mountComponent()

      expect(wrapper.text()).toContain('Rogue')
      expect(wrapper.text()).toContain('4')
    })
  })

  // ──────────────────────────────────────────────────────────────
  // ASI SELECTION TESTS
  // ──────────────────────────────────────────────────────────────

  describe('ASI selection', () => {
    it('shows ability score allocation UI when ASI is selected', async () => {
      const wrapper = await mountComponent()

      // Click ASI option
      await wrapper.find('[data-testid="asi-option"]').trigger('click')
      await flushPromises()

      // Should show allocation UI
      expect(wrapper.find('[data-testid="asi-allocation"]').exists()).toBe(true)
    })

    it('allows +2 to a single ability', async () => {
      const wrapper = await mountComponent()

      await wrapper.find('[data-testid="asi-option"]').trigger('click')
      await flushPromises()

      // Select DEX twice for +2
      const dexButton = wrapper.find('[data-testid="asi-DEX"]')
      await dexButton.trigger('click')
      await dexButton.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('+2')
    })

    it('allows +1 to two different abilities', async () => {
      const wrapper = await mountComponent()

      await wrapper.find('[data-testid="asi-option"]').trigger('click')
      await flushPromises()

      // Select DEX and CON for +1 each
      await wrapper.find('[data-testid="asi-DEX"]').trigger('click')
      await wrapper.find('[data-testid="asi-CON"]').trigger('click')
      await flushPromises()

      // Both should show +1
      expect(wrapper.findAll('.asi-bonus').length).toBe(2)
    })

    it('prevents selecting more than 2 total points', async () => {
      const wrapper = await mountComponent()

      await wrapper.find('[data-testid="asi-option"]').trigger('click')
      await flushPromises()

      // Try to select 3 abilities
      await wrapper.find('[data-testid="asi-DEX"]').trigger('click')
      await wrapper.find('[data-testid="asi-CON"]').trigger('click')
      await wrapper.find('[data-testid="asi-STR"]').trigger('click')
      await flushPromises()

      // Third should be ignored - only 2 total bonuses
      const bonuses = wrapper.findAll('.asi-bonus')
      expect(bonuses.length).toBeLessThanOrEqual(2)
    })

    it('caps ability scores at 20', async () => {
      // DEX is already 18, so +2 should show warning
      const wrapper = await mountComponent()

      await wrapper.find('[data-testid="asi-option"]').trigger('click')
      await flushPromises()

      // Select DEX twice
      const dexButton = wrapper.find('[data-testid="asi-DEX"]')
      await dexButton.trigger('click')
      await dexButton.trigger('click')
      await flushPromises()

      // Should show final score of 20
      expect(wrapper.text()).toContain('20')
    })
  })

  // ──────────────────────────────────────────────────────────────
  // FEAT SELECTION TESTS
  // ──────────────────────────────────────────────────────────────

  describe('Feat selection', () => {
    it('shows feat list when Feat is selected', async () => {
      const wrapper = await mountComponent()

      await wrapper.find('[data-testid="feat-option"]').trigger('click')
      await flushPromises()

      expect(wrapper.find('[data-testid="feat-list"]').exists()).toBe(true)
    })

    it('displays available feats from options', async () => {
      const wrapper = await mountComponent()

      await wrapper.find('[data-testid="feat-option"]').trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('Alert')
      expect(wrapper.text()).toContain('Lucky')
      expect(wrapper.text()).toContain('Mobile')
    })

    it('allows selecting a single feat', async () => {
      const wrapper = await mountComponent()

      await wrapper.find('[data-testid="feat-option"]').trigger('click')
      await flushPromises()

      await wrapper.find('[data-testid="feat-phb:lucky"]').trigger('click')
      await flushPromises()

      expect(wrapper.find('[data-testid="feat-phb:lucky"]').classes()).toContain('selected')
    })
  })

  // ──────────────────────────────────────────────────────────────
  // CONFIRMATION TESTS
  // ──────────────────────────────────────────────────────────────

  describe('confirmation', () => {
    it('shows confirm button disabled initially', async () => {
      const wrapper = await mountComponent()

      const confirmBtn = wrapper.find('[data-testid="confirm-btn"]')
      expect(confirmBtn.attributes('disabled')).toBeDefined()
    })

    it('enables confirm button when ASI allocation is complete', async () => {
      const wrapper = await mountComponent()

      await wrapper.find('[data-testid="asi-option"]').trigger('click')
      await flushPromises()

      // Allocate +2 to DEX
      const dexButton = wrapper.find('[data-testid="asi-DEX"]')
      await dexButton.trigger('click')
      await dexButton.trigger('click')
      await flushPromises()

      const confirmBtn = wrapper.find('[data-testid="confirm-btn"]')
      expect(confirmBtn.attributes('disabled')).toBeUndefined()
    })

    it('enables confirm button when feat is selected', async () => {
      const wrapper = await mountComponent()

      await wrapper.find('[data-testid="feat-option"]').trigger('click')
      await flushPromises()

      await wrapper.find('[data-testid="feat-phb:lucky"]').trigger('click')
      await flushPromises()

      const confirmBtn = wrapper.find('[data-testid="confirm-btn"]')
      expect(confirmBtn.attributes('disabled')).toBeUndefined()
    })

    it('resolves choice with ASI payload when confirmed', async () => {
      const wrapper = await mountComponent()

      await wrapper.find('[data-testid="asi-option"]').trigger('click')
      await flushPromises()

      // +2 DEX
      const dexButton = wrapper.find('[data-testid="asi-DEX"]')
      await dexButton.trigger('click')
      await dexButton.trigger('click')
      await flushPromises()

      await wrapper.find('[data-testid="confirm-btn"]').trigger('click')
      await flushPromises()

      expect(mockResolveChoice).toHaveBeenCalledWith(
        'ability_score|class|phb:rogue|4|asi',
        expect.objectContaining({
          type: 'asi',
          ability_scores: { DEX: 2 }
        })
      )
    })

    it('resolves choice with feat payload when confirmed', async () => {
      const wrapper = await mountComponent()

      await wrapper.find('[data-testid="feat-option"]').trigger('click')
      await flushPromises()

      await wrapper.find('[data-testid="feat-phb:lucky"]').trigger('click')
      await flushPromises()

      await wrapper.find('[data-testid="confirm-btn"]').trigger('click')
      await flushPromises()

      expect(mockResolveChoice).toHaveBeenCalledWith(
        'ability_score|class|phb:rogue|4|asi',
        expect.objectContaining({
          type: 'feat',
          selected: 'phb:lucky'
        })
      )
    })

    it('calls nextStep after successful confirmation', async () => {
      const wrapper = await mountComponent()

      await wrapper.find('[data-testid="feat-option"]').trigger('click')
      await flushPromises()

      await wrapper.find('[data-testid="feat-phb:lucky"]').trigger('click')
      await flushPromises()

      await wrapper.find('[data-testid="confirm-btn"]').trigger('click')
      await flushPromises()

      expect(mockNextStep).toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────────────────────────
  // EMPTY STATE TESTS
  // ──────────────────────────────────────────────────────────────

  describe('empty state', () => {
    it('shows empty state when no ASI/Feat choice exists', async () => {
      mockChoices.value = []

      const wrapper = await mountComponent()

      expect(wrapper.text()).toContain('No ability score improvement')
    })

    it('does NOT show empty state when choice exists (fixes #690)', async () => {
      // This is the key test - ensures we find the choice with correct type filter
      mockChoices.value = [mockAsiOrFeatChoice]

      const wrapper = await mountComponent()

      expect(wrapper.text()).not.toContain('No ability score improvement')
      expect(wrapper.find('[data-testid="asi-option"]').exists()).toBe(true)
    })
  })

  // ──────────────────────────────────────────────────────────────
  // CHOICE DETECTION TESTS (Issue #690 core fix)
  // ──────────────────────────────────────────────────────────────

  describe('choice detection (issue #690)', () => {
    it('finds choice with type=ability_score and subtype=asi_or_feat', async () => {
      const wrapper = await mountComponent()

      // Should find and display the choice
      expect(wrapper.find('[data-testid="asi-option"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="feat-option"]').exists()).toBe(true)
    })

    it('ignores choices without subtype=asi_or_feat', async () => {
      // Regular ability_score choice (like racial bonuses) should not appear here
      mockChoices.value = [{
        id: 'ability_score|race|phb:half-elf|1|bonus',
        type: 'ability_score',
        // No subtype - this is a racial bonus, not ASI/Feat
        source: 'race',
        source_name: 'Half-Elf',
        level_granted: 1,
        required: true,
        quantity: 2,
        remaining: 2,
        selected: [],
        options: []
      }]

      const wrapper = await mountComponent()

      // Should show empty state, not the racial bonus choice
      expect(wrapper.text()).toContain('No ability score improvement')
    })
  })
})
