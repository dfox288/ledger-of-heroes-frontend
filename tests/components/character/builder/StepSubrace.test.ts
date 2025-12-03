// tests/components/character/builder/StepSubrace.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StepSubrace from '~/components/character/builder/StepSubrace.vue'
import type { Race } from '~/types'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

// The parent race (Elf) that will be set in the store
const mockParentRace: Race = {
  id: 1,
  name: 'Elf',
  slug: 'elf',
  speed: 30,
  size: { id: 1, code: 'M', name: 'Medium' },
  subraces: [
    { id: 2, name: 'High Elf', slug: 'high-elf' },
    { id: 3, name: 'Wood Elf', slug: 'wood-elf' },
    { id: 4, name: 'Dark Elf', slug: 'dark-elf' }
  ]
} as Race

// Full race data including subraces (returned by API)
const mockRaces: Race[] = [
  mockParentRace,
  {
    id: 2,
    name: 'High Elf',
    slug: 'high-elf',
    speed: 30,
    parent_race: { id: 1, name: 'Elf', slug: 'elf' },
    modifiers: [
      { id: 1, modifier_category: 'ability_score', ability_score: { code: 'INT', name: 'Intelligence' }, value: 1 }
    ],
    traits: [
      { id: 1, name: 'Elf Weapon Training', description: 'Proficiency with longsword...' }
    ]
  } as Race,
  {
    id: 3,
    name: 'Wood Elf',
    slug: 'wood-elf',
    speed: 35,
    parent_race: { id: 1, name: 'Elf', slug: 'elf' },
    modifiers: [
      { id: 2, modifier_category: 'ability_score', ability_score: { code: 'WIS', name: 'Wisdom' }, value: 1 }
    ]
  } as Race,
  {
    id: 4,
    name: 'Dark Elf',
    slug: 'dark-elf',
    speed: 30,
    parent_race: { id: 1, name: 'Elf', slug: 'elf' }
  } as Race
]

// Mock useAsyncData to return mock races
mockNuxtImport('useAsyncData', () => {
  return () => ({
    data: ref(mockRaces),
    pending: ref(false),
    error: ref(null),
    refresh: () => Promise.resolve(),
    execute: () => Promise.resolve(),
    status: ref('success')
  })
})

// Mock useApi
mockNuxtImport('useApi', () => {
  return () => ({
    apiFetch: vi.fn().mockResolvedValue({ data: mockRaces })
  })
})

// Helper to set up store before each test
function setupStore() {
  const store = useCharacterBuilderStore()
  store.characterId = 1
  store.selectedRace = mockParentRace
  store.raceId = 1
  return store
}

describe('StepSubrace', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setupStore()
  })

  it('renders the step title', async () => {
    const wrapper = await mountSuspended(StepSubrace)
    expect(wrapper.text()).toContain('Choose Your Subrace')
  })

  it('renders description text', async () => {
    const wrapper = await mountSuspended(StepSubrace)
    // The component shows "Select a subrace for your [race name]"
    expect(wrapper.text()).toContain('Select a subrace for your')
  })

  it('renders continue button', async () => {
    const wrapper = await mountSuspended(StepSubrace)
    const buttons = wrapper.findAll('button')
    const continueButton = buttons.find(b => b.text().includes('Continue'))
    expect(continueButton?.exists()).toBe(true)
  })

  it('shows subrace grid or empty state', async () => {
    const wrapper = await mountSuspended(StepSubrace)
    // Either shows subraces or empty state
    const text = wrapper.text()
    const hasSubraces = text.includes('High Elf') || text.includes('No subraces available')
    expect(hasSubraces).toBe(true)
  })
})
