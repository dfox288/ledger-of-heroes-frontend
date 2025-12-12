// tests/components/character/levelup/StepSummary.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StepSummary from '~/components/character/levelup/StepSummary.vue'
import type { LevelUpResult } from '~/types/character'

// Mock refs for controlling test behavior
const mockLevelUpResult = ref<LevelUpResult | null>({
  previous_level: 3,
  new_level: 4,
  hp_increase: 9,
  new_max_hp: 38,
  features_gained: [
    { id: 1, name: 'Ability Score Improvement', description: 'Increase ability scores' }
  ],
  spell_slots: {},
  asi_pending: false,
  hp_choice_pending: false
})

const mockSelectedClassSlug = ref('phb:fighter')
const mockCharacterClasses = ref([
  {
    class: { id: 1, name: 'Fighter', slug: 'phb:fighter', hit_die: 10 },
    level: 4,
    is_primary: true
  }
])

// Mock the store
vi.mock('~/stores/characterLevelUp', () => ({
  useCharacterLevelUpStore: vi.fn(() => ({
    get levelUpResult() { return mockLevelUpResult.value },
    get selectedClassSlug() { return mockSelectedClassSlug.value },
    get characterClasses() { return mockCharacterClasses.value },
    closeWizard: vi.fn(),
    reset: vi.fn()
  }))
}))

describe('StepSummary', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Reset mock values to defaults
    mockLevelUpResult.value = {
      previous_level: 3,
      new_level: 4,
      hp_increase: 9,
      new_max_hp: 38,
      features_gained: [
        { id: 1, name: 'Ability Score Improvement', description: 'Increase ability scores' }
      ],
      spell_slots: {},
      asi_pending: false,
      hp_choice_pending: false
    }
    mockSelectedClassSlug.value = 'phb:fighter'
    mockCharacterClasses.value = [
      {
        class: { id: 1, name: 'Fighter', slug: 'phb:fighter', hit_die: 10 },
        level: 4,
        is_primary: true
      }
    ]
  })

  const mountComponent = async (props = {}) => {
    return await mountSuspended(StepSummary, { props })
  }

  it('shows level up complete message', async () => {
    const wrapper = await mountComponent()

    expect(wrapper.text()).toContain('Level Up Complete')
  })

  it('shows level transition from store data', async () => {
    const wrapper = await mountComponent()

    expect(wrapper.text()).toContain('Fighter 3')
    expect(wrapper.text()).toContain('Fighter 4')
  })

  it('shows HP gained from store', async () => {
    const wrapper = await mountComponent()

    expect(wrapper.text()).toContain('+9')
    expect(wrapper.text()).toContain('38')
  })

  it('shows features gained from store', async () => {
    const wrapper = await mountComponent()

    expect(wrapper.text()).toContain('Ability Score Improvement')
  })

  it('has button to return to character sheet', async () => {
    const wrapper = await mountComponent()

    expect(wrapper.find('[data-testid="view-sheet-button"]').exists()).toBe(true)
  })

  it('emits complete event when button clicked', async () => {
    const wrapper = await mountComponent()

    await wrapper.find('[data-testid="view-sheet-button"]').trigger('click')
    expect(wrapper.emitted('complete')).toBeTruthy()
  })

  it('shows ASI choice when provided via props', async () => {
    const wrapper = await mountComponent({ asiChoice: 'STR +2' })

    expect(wrapper.text()).toContain('Ability Score Increase')
    expect(wrapper.text()).toContain('STR +2')
  })

  it('shows feat name when provided via props', async () => {
    const wrapper = await mountComponent({ featName: 'Great Weapon Master' })

    expect(wrapper.text()).toContain('Feat')
    expect(wrapper.text()).toContain('Great Weapon Master')
  })

  it('hides ASI/Feat section when neither provided', async () => {
    const wrapper = await mountComponent()

    expect(wrapper.html()).not.toContain('Ability Score Increase')
    expect(wrapper.html()).not.toContain('i-heroicons-arrow-trending-up')
  })

  it('handles empty features list', async () => {
    mockLevelUpResult.value = {
      ...mockLevelUpResult.value!,
      features_gained: []
    }

    const wrapper = await mountComponent()

    expect(wrapper.html()).not.toContain('New Features')
  })

  it('derives class name from store', async () => {
    mockSelectedClassSlug.value = 'phb:wizard'
    mockCharacterClasses.value = [
      {
        class: { id: 2, name: 'Wizard', slug: 'phb:wizard', hit_die: 6 },
        level: 2,
        is_primary: true
      }
    ]
    mockLevelUpResult.value = {
      ...mockLevelUpResult.value!,
      previous_level: 1,
      new_level: 2
    }

    const wrapper = await mountComponent()

    expect(wrapper.text()).toContain('Wizard 1')
    expect(wrapper.text()).toContain('Wizard 2')
  })
})
