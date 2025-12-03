import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StepBackground from '~/components/character/builder/StepBackground.vue'

const mockBackgrounds = [
  {
    id: 1,
    slug: 'acolyte',
    name: 'Acolyte',
    feature_name: 'Shelter of the Faithful',
    proficiencies: [],
    languages: [],
    equipment: []
  },
  {
    id: 2,
    slug: 'soldier',
    name: 'Soldier',
    feature_name: 'Military Rank',
    proficiencies: [],
    languages: [],
    equipment: []
  }
]

// Mock useApi
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    apiFetch: vi.fn().mockResolvedValue({ data: mockBackgrounds })
  })
}))

describe('StepBackground', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('displays search input', async () => {
    const wrapper = await mountSuspended(StepBackground)

    expect(wrapper.find('input[placeholder*="Search"]').exists()).toBe(true)
  })

  it('displays background picker cards', async () => {
    const wrapper = await mountSuspended(StepBackground)

    // Wait for async data
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Acolyte')
    expect(wrapper.text()).toContain('Soldier')
  })

  it('filters backgrounds by search query', async () => {
    const wrapper = await mountSuspended(StepBackground)
    await wrapper.vm.$nextTick()

    const input = wrapper.find('input[placeholder*="Search"]')
    await input.setValue('soldier')

    expect(wrapper.text()).toContain('Soldier')
    expect(wrapper.text()).not.toContain('Acolyte')
  })

  it('disables continue button until selection made', async () => {
    const wrapper = await mountSuspended(StepBackground)
    await wrapper.vm.$nextTick()

    // Find button by text content
    const buttons = wrapper.findAll('button')
    const continueButton = buttons.find(btn => btn.text().includes('Continue'))

    expect(continueButton).toBeDefined()
    expect(continueButton?.attributes('disabled')).toBeDefined()
  })
})
