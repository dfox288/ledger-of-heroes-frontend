import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StepHitPoints from '~/components/character/levelup/StepHitPoints.vue'

// Mock refs for controlling test behavior
const mockSelectedClassSlug = ref('phb:fighter')
const mockCharacterClasses = ref([
  {
    class: { id: 1, name: 'Fighter', slug: 'phb:fighter', hit_die: 10 },
    level: 3,
    is_primary: true
  }
])

// Mock the stores and composables
vi.mock('~/stores/characterLevelUp', () => ({
  useCharacterLevelUpStore: vi.fn(() => ({
    characterId: 1,
    get selectedClassSlug() { return mockSelectedClassSlug.value },
    get characterClasses() { return mockCharacterClasses.value }
  }))
}))

// Mock ability scores for CON modifier
const mockAbilityScores = ref([
  { code: 'STR', name: 'Strength', score: 16, modifier: 3, formattedModifier: '+3', formatted: '16 (+3)' },
  { code: 'DEX', name: 'Dexterity', score: 14, modifier: 2, formattedModifier: '+2', formatted: '14 (+2)' },
  { code: 'CON', name: 'Constitution', score: 14, modifier: 2, formattedModifier: '+2', formatted: '14 (+2)' },
  { code: 'INT', name: 'Intelligence', score: 10, modifier: 0, formattedModifier: '+0', formatted: '10 (+0)' },
  { code: 'WIS', name: 'Wisdom', score: 12, modifier: 1, formattedModifier: '+1', formatted: '12 (+1)' },
  { code: 'CHA', name: 'Charisma', score: 8, modifier: -1, formattedModifier: '-1', formatted: '8 (-1)' }
])

vi.mock('~/composables/useCharacterStats', () => ({
  useCharacterStats: vi.fn(() => ({
    abilityScores: mockAbilityScores,
    isLoading: ref(false),
    error: ref(null),
    refresh: vi.fn()
  }))
}))

vi.mock('~/composables/useUnifiedChoices', () => ({
  useUnifiedChoices: vi.fn(() => ({
    choices: ref([]),
    choicesByType: computed(() => ({ hitPoints: [] })),
    pending: ref(false),
    fetchChoices: vi.fn(),
    resolveChoice: vi.fn()
  }))
}))

vi.mock('~/composables/useLevelUpWizard', () => ({
  useLevelUpWizard: vi.fn(() => ({
    nextStep: vi.fn()
  }))
}))

describe('StepHitPoints', () => {
  const mockNextStep = vi.fn()

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Reset mock values to defaults
    mockSelectedClassSlug.value = 'phb:fighter'
    mockCharacterClasses.value = [
      {
        class: { id: 1, name: 'Fighter', slug: 'phb:fighter', hit_die: 10 },
        level: 3,
        is_primary: true
      }
    ]
    mockAbilityScores.value = [
      { code: 'STR', name: 'Strength', score: 16, modifier: 3, formattedModifier: '+3', formatted: '16 (+3)' },
      { code: 'DEX', name: 'Dexterity', score: 14, modifier: 2, formattedModifier: '+2', formatted: '14 (+2)' },
      { code: 'CON', name: 'Constitution', score: 14, modifier: 2, formattedModifier: '+2', formatted: '14 (+2)' },
      { code: 'INT', name: 'Intelligence', score: 10, modifier: 0, formattedModifier: '+0', formatted: '10 (+0)' },
      { code: 'WIS', name: 'Wisdom', score: 12, modifier: 1, formattedModifier: '+1', formatted: '12 (+1)' },
      { code: 'CHA', name: 'Charisma', score: 8, modifier: -1, formattedModifier: '-1', formatted: '8 (-1)' }
    ]
  })

  const mountComponent = async () => {
    return await mountSuspended(StepHitPoints, {
      props: {
        characterId: 1,
        publicId: 'test-hero-Ab12',
        nextStep: mockNextStep
      }
    })
  }

  it('renders HP choice options', async () => {
    const wrapper = await mountComponent()

    expect(wrapper.text()).toContain('Hit Point Increase')
    expect(wrapper.find('[data-testid="roll-button"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="average-button"]').exists()).toBe(true)
  })

  it('shows hit die type from store (Fighter d10)', async () => {
    const wrapper = await mountComponent()

    expect(wrapper.text()).toContain('d10')
  })

  it('calculates average value correctly (rounded up)', async () => {
    // Fighter d10 → Average = (10+1)/2 = 5.5, rounded up = 6
    const wrapper = await mountComponent()

    expect(wrapper.text()).toContain('6')
  })

  it('calculates average correctly for d8 (Rogue)', async () => {
    // Change to Rogue with d8
    mockSelectedClassSlug.value = 'phb:rogue'
    mockCharacterClasses.value = [
      {
        class: { id: 2, name: 'Rogue', slug: 'phb:rogue', hit_die: 8 },
        level: 3,
        is_primary: true
      }
    ]

    const wrapper = await mountComponent()

    // d8 → Average = (8+1)/2 = 4.5, rounded up = 5
    expect(wrapper.text()).toContain('5')
  })

  it('calculates average correctly for d6 (Wizard)', async () => {
    // Change to Wizard with d6
    mockSelectedClassSlug.value = 'phb:wizard'
    mockCharacterClasses.value = [
      {
        class: { id: 3, name: 'Wizard', slug: 'phb:wizard', hit_die: 6 },
        level: 2,
        is_primary: true
      }
    ]

    const wrapper = await mountComponent()

    // d6 → Average = (6+1)/2 = 3.5, rounded up = 4
    expect(wrapper.text()).toContain('4')
  })

  it('calculates total with CON modifier', async () => {
    // Set CON modifier to 3
    mockAbilityScores.value = mockAbilityScores.value.map(a =>
      a.code === 'CON' ? { ...a, modifier: 3 } : a
    )

    const wrapper = await mountComponent()

    // Click average button
    await wrapper.find('[data-testid="average-button"]').trigger('click')
    await wrapper.vm.$nextTick()

    // Average 6 + CON 3 = 9
    expect(wrapper.text()).toContain('9')
  })

  it('shows confirm button disabled initially', async () => {
    const wrapper = await mountComponent()

    const confirmBtn = wrapper.find('[data-testid="confirm-hp-btn"]')
    expect(confirmBtn.exists()).toBe(true)
    expect(confirmBtn.attributes('disabled')).toBeDefined()
  })

  it('enables confirm button after selection', async () => {
    const wrapper = await mountComponent()

    // Click average button
    await wrapper.find('[data-testid="average-button"]').trigger('click')
    await wrapper.vm.$nextTick()

    const confirmBtn = wrapper.find('[data-testid="confirm-hp-btn"]')
    expect(confirmBtn.attributes('disabled')).toBeUndefined()
  })

  it('displays negative CON modifier correctly', async () => {
    // Set CON modifier to -1
    mockAbilityScores.value = mockAbilityScores.value.map(a =>
      a.code === 'CON' ? { ...a, modifier: -1 } : a
    )

    const wrapper = await mountComponent()

    expect(wrapper.text()).toContain('-1')
  })

  it('displays positive CON modifier with plus sign', async () => {
    // Set CON modifier to 3
    mockAbilityScores.value = mockAbilityScores.value.map(a =>
      a.code === 'CON' ? { ...a, modifier: 3 } : a
    )

    const wrapper = await mountComponent()

    expect(wrapper.text()).toContain('+3')
  })

  it('derives hit die from selected class slug', async () => {
    // Test multiclass scenario - leveling Rogue while Fighter is also in classes
    mockSelectedClassSlug.value = 'phb:rogue'
    mockCharacterClasses.value = [
      {
        class: { id: 1, name: 'Fighter', slug: 'phb:fighter', hit_die: 10 },
        level: 3,
        is_primary: true
      },
      {
        class: { id: 2, name: 'Rogue', slug: 'phb:rogue', hit_die: 8 },
        level: 1,
        is_primary: false
      }
    ]

    const wrapper = await mountComponent()

    // Should show d8 (Rogue) since that's the class being leveled
    expect(wrapper.text()).toContain('d8')
  })
})
