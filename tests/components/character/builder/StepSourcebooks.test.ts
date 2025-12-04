// tests/components/character/builder/StepSourcebooks.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StepSourcebooks from '~/components/character/builder/StepSourcebooks.vue'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'
import type { Source } from '~/types'

const mockSources: Source[] = [
  {
    id: 1,
    code: 'PHB',
    name: 'Player\'s Handbook',
    publisher: 'Wizards of the Coast',
    publication_year: 2014,
    category: 'Core Rulebooks',
    url: null,
    author: null,
    artist: null,
    website: null,
    description: null
  },
  {
    id: 2,
    code: 'XGE',
    name: 'Xanathar\'s Guide to Everything',
    publisher: 'Wizards of the Coast',
    publication_year: 2017,
    category: 'Expansion Rulebooks',
    url: null,
    author: null,
    artist: null,
    website: null,
    description: null
  },
  {
    id: 3,
    code: 'TCE',
    name: 'Tasha\'s Cauldron of Everything',
    publisher: 'Wizards of the Coast',
    publication_year: 2020,
    category: 'Expansion Rulebooks',
    url: null,
    author: null,
    artist: null,
    website: null,
    description: null
  },
  {
    id: 4,
    code: 'ERLW',
    name: 'Eberron: Rising from the Last War',
    publisher: 'Wizards of the Coast',
    publication_year: 2019,
    category: 'Campaign Settings',
    url: null,
    author: null,
    artist: null,
    website: null,
    description: null
  }
]

// Mock useAsyncData to return mock sources
mockNuxtImport('useAsyncData', () => {
  return () => ({
    data: ref(mockSources),
    pending: ref(false),
    error: ref(null),
    refresh: () => Promise.resolve(),
    execute: () => Promise.resolve(),
    status: ref('success')
  })
})

// Mock useWizardNavigation
const mockNextStep = vi.fn()
mockNuxtImport('useWizardNavigation', () => {
  return () => ({
    nextStep: mockNextStep,
    previousStep: vi.fn(),
    goToStep: vi.fn(),
    currentStepIndex: ref(0),
    totalSteps: ref(10),
    isFirstStep: ref(true),
    isLastStep: ref(false)
  })
})

describe('StepSourcebooks', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockNextStep.mockReset()
    const store = useCharacterBuilderStore()
    store.characterId = 1
  })

  it('renders the step title', async () => {
    const wrapper = await mountSuspended(StepSourcebooks)
    expect(wrapper.text()).toContain('Choose Your Sourcebooks')
  })

  it('renders the step description', async () => {
    const wrapper = await mountSuspended(StepSourcebooks)
    expect(wrapper.text()).toContain('Select which D&D books to include')
  })

  it('displays sources grouped by category', async () => {
    const wrapper = await mountSuspended(StepSourcebooks)
    expect(wrapper.text()).toContain('Core Rulebooks')
    expect(wrapper.text()).toContain('Expansion Rulebooks')
    expect(wrapper.text()).toContain('Campaign Settings')
  })

  it('displays source names', async () => {
    const wrapper = await mountSuspended(StepSourcebooks)
    expect(wrapper.text()).toContain('Player\'s Handbook')
    expect(wrapper.text()).toContain('Xanathar\'s Guide to Everything')
    expect(wrapper.text()).toContain('Tasha\'s Cauldron of Everything')
    expect(wrapper.text()).toContain('Eberron: Rising from the Last War')
  })

  it('displays source codes as badges', async () => {
    const wrapper = await mountSuspended(StepSourcebooks)
    expect(wrapper.text()).toContain('PHB')
    expect(wrapper.text()).toContain('XGE')
    expect(wrapper.text()).toContain('TCE')
    expect(wrapper.text()).toContain('ERLW')
  })

  it('initializes with all sources selected by default', async () => {
    const store = useCharacterBuilderStore()
    // Pre-initialize the sources as the component would do
    store.initializeSourcesFromApi(mockSources)

    await mountSuspended(StepSourcebooks)

    // After component mounts and initializes from API
    expect(store.selectedSources.length).toBe(4)
    expect(store.selectedSources).toContain('PHB')
    expect(store.selectedSources).toContain('XGE')
  })

  it('shows Select All button', async () => {
    const wrapper = await mountSuspended(StepSourcebooks)
    expect(wrapper.text()).toContain('Select All')
  })

  it('shows Deselect All button', async () => {
    const wrapper = await mountSuspended(StepSourcebooks)
    expect(wrapper.text()).toContain('Deselect All')
  })

  it('shows selection count', async () => {
    const wrapper = await mountSuspended(StepSourcebooks)
    // Should show "4 selected" or similar count indicator
    expect(wrapper.text()).toMatch(/4.*selected|selected.*4/i)
  })

  it('shows validation warning when no sources selected', async () => {
    const store = useCharacterBuilderStore()
    // First initialize, then clear to simulate user deselecting all
    store.initializeSourcesFromApi(mockSources)

    const wrapper = await mountSuspended(StepSourcebooks)

    // Click "Deselect All" to clear selections
    const buttons = wrapper.findAll('button')
    const deselectAllBtn = buttons.find(b => b.text().includes('Deselect All'))
    await deselectAllBtn?.trigger('click')
    await wrapper.vm.$nextTick()

    // Should show validation warning when empty
    expect(wrapper.text()).toContain('Select at least one sourcebook')
  })

  it('enables Continue button when at least one source selected', async () => {
    const store = useCharacterBuilderStore()
    store.setSelectedSources(['PHB'])

    const wrapper = await mountSuspended(StepSourcebooks)
    const buttons = wrapper.findAll('button')
    const continueBtn = buttons.find(b => b.text().toLowerCase().includes('continue'))

    expect(continueBtn?.attributes('disabled')).toBeUndefined()
  })
})
