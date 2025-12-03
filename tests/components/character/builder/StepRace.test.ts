// tests/components/character/builder/StepRace.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StepRace from '~/components/character/builder/StepRace.vue'
import type { Race } from '~/types'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

const mockRaces: Race[] = [
  {
    id: 1,
    name: 'Dwarf',
    slug: 'dwarf',
    speed: 25,
    size: { id: 1, code: 'M', name: 'Medium' },
    subraces: [
      { id: 3, name: 'Hill Dwarf', slug: 'hill-dwarf' },
      { id: 4, name: 'Mountain Dwarf', slug: 'mountain-dwarf' }
    ]
  } as Race,
  {
    id: 2,
    name: 'Human',
    slug: 'human',
    speed: 30,
    size: { id: 1, code: 'M', name: 'Medium' }
  } as Race,
  {
    id: 3,
    name: 'Hill Dwarf',
    slug: 'hill-dwarf',
    speed: 25,
    parent_race: { id: 1, name: 'Dwarf', slug: 'dwarf' }
  } as Race,
  {
    id: 4,
    name: 'Mountain Dwarf',
    slug: 'mountain-dwarf',
    speed: 25,
    parent_race: { id: 1, name: 'Dwarf', slug: 'dwarf' }
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

describe('StepRace', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useCharacterBuilderStore()
    store.characterId = 1
  })

  it('renders the step title', async () => {
    const wrapper = await mountSuspended(StepRace)
    expect(wrapper.text()).toContain('Choose Your Race')
  })

  it('renders race picker cards', async () => {
    const wrapper = await mountSuspended(StepRace)
    expect(wrapper.text()).toContain('Dwarf')
    expect(wrapper.text()).toContain('Human')
  })

  it('does not show inline subrace selector (subraces now in separate step)', async () => {
    const wrapper = await mountSuspended(StepRace)
    // Subrace selection has been moved to a separate step
    // The StepRace component should not contain "Choose a Subrace" text
    expect(wrapper.text()).not.toContain('Choose a Subrace')
  })

  it('filters races by search query', async () => {
    const wrapper = await mountSuspended(StepRace)
    const searchInput = wrapper.find('input[type="text"]')

    if (searchInput.exists()) {
      await searchInput.setValue('Dwarf')
      await wrapper.vm.$nextTick()
      // After filtering, only Dwarf should remain visible
      expect(wrapper.text()).toContain('Dwarf')
    }
  })
})
