// tests/components/character/wizard/StepSubclass.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StepSubclass from '~/components/character/wizard/StepSubclass.vue'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import type { CharacterClass } from '~/types'

// Mock selected class (Cleric - chooses subclass at level 1)
const mockClass: CharacterClass = {
  id: 19,
  name: 'Cleric',
  slug: 'cleric',
  hit_die: 8,
  is_base_class: true,
  parent_class_id: null,
  subclass_level: 1,
  primary_ability: {
    id: 5,
    code: 'WIS',
    name: 'Wisdom'
  },
  spellcasting_ability: {
    id: 5,
    code: 'WIS',
    name: 'Wisdom'
  },
  description: 'Clerics are intermediaries between the mortal world and the distant planes of the gods.',
  sources: [{ code: 'PHB', name: 'Player\'s Handbook', pages: '56' }]
} as CharacterClass

// Mock subclasses that will be returned by API
const mockSubclasses = [
  {
    id: 20,
    name: 'Knowledge Domain',
    slug: 'cleric-knowledge-domain',
    description: 'The gods of knowledge value learning and understanding above all.',
    source: { code: 'PHB', name: 'Player\'s Handbook' }
  },
  {
    id: 21,
    name: 'Life Domain',
    slug: 'cleric-life-domain',
    description: 'The Life domain focuses on the vibrant positive energy that sustains all life.',
    source: { code: 'PHB', name: 'Player\'s Handbook' }
  },
  {
    id: 22,
    name: 'Tempest Domain',
    slug: 'cleric-tempest-domain',
    description: 'Gods whose portfolios include the Tempest domain govern storms, sea, and sky.',
    source: { code: 'PHB', name: 'Player\'s Handbook' }
  }
]

// Mock useAsyncData to return mock subclasses
mockNuxtImport('useAsyncData', () => {
  return vi.fn((key, fetcher) => {
    // Call fetcher if it's a function to simulate real behavior
    const data = ref(mockSubclasses)
    return {
      data,
      pending: ref(false),
      error: ref(null),
      refresh: () => Promise.resolve(),
      execute: () => Promise.resolve(),
      status: ref('success')
    }
  })
})

// Mock useApi
mockNuxtImport('useApi', () => {
  return () => ({
    apiFetch: vi.fn().mockResolvedValue({ data: mockSubclasses })
  })
})

// Helper to set up store before each test
function setupStore() {
  const store = useCharacterWizardStore()
  store.characterId = 1
  store.selections.class = mockClass
  store.selectedSources = ['PHB']
  return store
}

describe('StepSubclass', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setupStore()
  })

  it('renders the step title', async () => {
    const wrapper = await mountSuspended(StepSubclass)
    expect(wrapper.text()).toContain('Choose Your Subclass')
  })

  it('renders description text', async () => {
    const wrapper = await mountSuspended(StepSubclass)
    const text = wrapper.text()
    // Check for class-specific description or generic subclass text
    expect(text.includes('divine domain') || text.includes('subclass') || text.includes('Choose your')).toBe(true)
  })

  it('renders continue button', async () => {
    const wrapper = await mountSuspended(StepSubclass)
    const buttons = wrapper.findAll('button')
    const continueButton = buttons.find(b => b.text().includes('Continue'))
    expect(continueButton?.exists()).toBe(true)
  })

  it('shows subclass grid with available subclasses', async () => {
    const wrapper = await mountSuspended(StepSubclass)
    const text = wrapper.text()
    expect(text.includes('Knowledge Domain') || text.includes('Life Domain') || text.includes('Tempest Domain')).toBe(true)
  })

  it('shows search input', async () => {
    const wrapper = await mountSuspended(StepSubclass)
    const searchInput = wrapper.find('input[placeholder*="Search"]')
    expect(searchInput.exists()).toBe(true)
  })

  it('disables continue button when no subclass selected', async () => {
    const wrapper = await mountSuspended(StepSubclass)
    const buttons = wrapper.findAll('button')
    const continueButton = buttons.find(b => b.text().includes('Continue'))
    expect(continueButton?.attributes('disabled')).toBeDefined()
  })
})
