/**
 * StepSubclassChoice Component Tests
 *
 * Tests the level-up wizard subclass selection step, including:
 * - Basic subclass selection (e.g., Fighter, Wizard)
 * - Subclass with variant_choices (e.g., Circle of the Land terrain)
 * - Submission with and without variant_choices
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import StepSubclassChoice from '~/components/character/levelup/StepSubclassChoice.vue'

// Mock useApi
const mockApiFetch = vi.fn()
mockNuxtImport('useApi', () => () => ({ apiFetch: mockApiFetch }))

// Mock useToast
const mockToast = { add: vi.fn() }
mockNuxtImport('useToast', () => () => mockToast)

// Mock useUnifiedChoices - needs to return reactive values that update
const mockFetchChoices = vi.fn()
let choicesByTypeValue: Record<string, any> = {}

mockNuxtImport('useUnifiedChoices', () => () => ({
  choicesByType: computed(() => choicesByTypeValue),
  pending: ref(false),
  error: ref(null),
  fetchChoices: mockFetchChoices
}))

// Mock store
const mockStoreFetchPendingChoices = vi.fn()
mockNuxtImport('useCharacterLevelUpStore', () => () => ({
  fetchPendingChoices: mockStoreFetchPendingChoices
}))

// Helper to find continue button
function findContinueButton(wrapper: any) {
  return wrapper.findAll('button').find((b: any) => b.text().includes('Continue'))
}

// ════════════════════════════════════════════════════════════════
// TEST DATA
// ════════════════════════════════════════════════════════════════

const basicSubclassChoice = {
  id: 'subclass|class|phb:fighter|3|martial_archetype',
  type: 'subclass',
  source: 'class',
  source_name: 'Fighter',
  level_granted: 3,
  required: true,
  quantity: 1,
  remaining: 1,
  selected: [],
  options: [
    { slug: 'phb:champion', name: 'Champion', description: 'A master of martial combat.' },
    { slug: 'phb:battle-master', name: 'Battle Master', description: 'A tactician and strategist.' }
  ],
  metadata: { class_slug: 'phb:fighter' }
}

const druidSubclassChoiceWithVariants = {
  id: 'subclass|class|phb:druid|2|druid_circle',
  type: 'subclass',
  source: 'class',
  source_name: 'Druid',
  level_granted: 2,
  required: true,
  quantity: 1,
  remaining: 1,
  selected: [],
  options: [
    {
      slug: 'phb:druid-circle-of-the-land',
      name: 'Circle of the Land',
      description: 'Mystics and sages who safeguard ancient knowledge.',
      variant_choices: {
        terrain: {
          required: true,
          label: 'Choose your terrain',
          options: [
            { value: 'arctic', name: 'Arctic', description: 'Frozen reaches', spells: ['Hold Person', 'Spike Growth'] },
            { value: 'forest', name: 'Forest', description: 'Ancient woodlands', spells: ['Barkskin', 'Spider Climb'] }
          ]
        }
      }
    },
    {
      slug: 'phb:druid-circle-of-the-moon',
      name: 'Circle of the Moon',
      description: 'Fierce guardians of the wilds.'
      // No variant_choices
    }
  ],
  metadata: { class_slug: 'phb:druid' }
}

// ════════════════════════════════════════════════════════════════
// TESTS
// ════════════════════════════════════════════════════════════════

describe('StepSubclassChoice', () => {
  const nextStep = vi.fn()

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    choicesByTypeValue = {}
    mockApiFetch.mockReset()
    mockStoreFetchPendingChoices.mockReset()
  })

  describe('Basic Subclass Selection (no variants)', () => {
    beforeEach(() => {
      choicesByTypeValue = { subclass: basicSubclassChoice }
    })

    it('renders subclass options', async () => {
      const wrapper = await mountSuspended(StepSubclassChoice, {
        props: { characterId: 1, nextStep }
      })

      expect(wrapper.text()).toContain('Champion')
      expect(wrapper.text()).toContain('Battle Master')
    })

    it('allows selecting a subclass', async () => {
      const wrapper = await mountSuspended(StepSubclassChoice, {
        props: { characterId: 1, nextStep }
      })

      const championButton = wrapper.findAll('button').find(b => b.text().includes('Champion'))
      await championButton?.trigger('click')
      await flushPromises()

      expect(championButton?.classes()).toContain('border-primary')
    })

    it('submits subclass selection without variant_choices', async () => {
      mockApiFetch.mockResolvedValue({ data: { success: true } })
      mockStoreFetchPendingChoices.mockResolvedValue(undefined)

      const wrapper = await mountSuspended(StepSubclassChoice, {
        props: { characterId: 1, nextStep }
      })

      // Select Champion
      const championButton = wrapper.findAll('button').find(b => b.text().includes('Champion'))
      await championButton?.trigger('click')
      await flushPromises()

      // Click Continue
      const continueButton = findContinueButton(wrapper)
      expect(continueButton).toBeDefined()
      await continueButton?.trigger('click')
      await flushPromises()

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/1/classes/phb:fighter/subclass',
        expect.objectContaining({
          method: 'PUT',
          body: { subclass_slug: 'phb:champion' }
        })
      )
    })
  })

  describe('Subclass with Variant Choices (Circle of the Land)', () => {
    beforeEach(() => {
      choicesByTypeValue = { subclass: druidSubclassChoiceWithVariants }
    })

    it('renders both subclass options', async () => {
      const wrapper = await mountSuspended(StepSubclassChoice, {
        props: { characterId: 1, nextStep }
      })

      expect(wrapper.text()).toContain('Circle of the Land')
      expect(wrapper.text()).toContain('Circle of the Moon')
    })

    it('shows terrain selection when Circle of the Land is selected', async () => {
      const wrapper = await mountSuspended(StepSubclassChoice, {
        props: { characterId: 1, nextStep }
      })

      // Select Circle of the Land
      const landButton = wrapper.findAll('button').find(b => b.text().includes('Circle of the Land'))
      await landButton?.trigger('click')
      await flushPromises()

      // Should show terrain options
      expect(wrapper.text()).toContain('Choose your terrain')
      expect(wrapper.text()).toContain('Arctic')
      expect(wrapper.text()).toContain('Forest')
    })

    it('does not show terrain selection for Circle of the Moon', async () => {
      const wrapper = await mountSuspended(StepSubclassChoice, {
        props: { characterId: 1, nextStep }
      })

      // Select Circle of the Moon
      const moonButton = wrapper.findAll('button').find(b => b.text().includes('Circle of the Moon'))
      await moonButton?.trigger('click')
      await flushPromises()

      // Should NOT show terrain options
      expect(wrapper.text()).not.toContain('Choose your terrain')
      expect(wrapper.text()).not.toContain('Arctic')
    })

    it('blocks submission until terrain is selected for Circle of the Land', async () => {
      const wrapper = await mountSuspended(StepSubclassChoice, {
        props: { characterId: 1, nextStep }
      })

      // Select Circle of the Land but no terrain
      const landButton = wrapper.findAll('button').find(b => b.text().includes('Circle of the Land'))
      await landButton?.trigger('click')
      await flushPromises()

      // Continue button should be disabled (UButton sets disabled attribute on inner button)
      const continueButton = findContinueButton(wrapper)
      expect(continueButton).toBeDefined()
      // Check if it has disabled attribute or aria-disabled
      expect(
        continueButton?.attributes('disabled') !== undefined
        || continueButton?.attributes('aria-disabled') === 'true'
      ).toBe(true)
    })

    it('enables submission when terrain is selected', async () => {
      const wrapper = await mountSuspended(StepSubclassChoice, {
        props: { characterId: 1, nextStep }
      })

      // Select Circle of the Land
      const landButton = wrapper.findAll('button').find(b => b.text().includes('Circle of the Land'))
      await landButton?.trigger('click')
      await flushPromises()

      // Select Arctic terrain
      const arcticButton = wrapper.findAll('button').find(b => b.text().includes('Arctic'))
      await arcticButton?.trigger('click')
      await flushPromises()

      // Continue button should be enabled
      const continueButton = findContinueButton(wrapper)
      expect(continueButton).toBeDefined()
      expect(continueButton?.attributes('disabled')).toBeUndefined()
    })

    it('submits subclass with variant_choices for Circle of the Land', async () => {
      mockApiFetch.mockResolvedValue({ data: { success: true } })
      mockStoreFetchPendingChoices.mockResolvedValue(undefined)

      const wrapper = await mountSuspended(StepSubclassChoice, {
        props: { characterId: 1, nextStep }
      })

      // Select Circle of the Land
      const landButton = wrapper.findAll('button').find(b => b.text().includes('Circle of the Land'))
      await landButton?.trigger('click')
      await flushPromises()

      // Select Arctic terrain
      const arcticButton = wrapper.findAll('button').find(b => b.text().includes('Arctic'))
      await arcticButton?.trigger('click')
      await flushPromises()

      // Click Continue
      const continueButton = findContinueButton(wrapper)
      expect(continueButton).toBeDefined()
      await continueButton?.trigger('click')
      await flushPromises()

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/1/classes/phb:druid/subclass',
        expect.objectContaining({
          method: 'PUT',
          body: {
            subclass_slug: 'phb:druid-circle-of-the-land',
            variant_choices: { terrain: 'arctic' }
          }
        })
      )
    })

    it('shows terrain spells when terrain is selected', async () => {
      const wrapper = await mountSuspended(StepSubclassChoice, {
        props: { characterId: 1, nextStep }
      })

      // Select Circle of the Land
      const landButton = wrapper.findAll('button').find(b => b.text().includes('Circle of the Land'))
      await landButton?.trigger('click')
      await flushPromises()

      // Select Arctic terrain
      const arcticButton = wrapper.findAll('button').find(b => b.text().includes('Arctic'))
      await arcticButton?.trigger('click')
      await flushPromises()

      // Should show Arctic spells
      expect(wrapper.text()).toContain('Hold Person')
      expect(wrapper.text()).toContain('Spike Growth')
    })

    it('clears terrain selection when switching to non-variant subclass', async () => {
      mockApiFetch.mockResolvedValue({ data: { success: true } })
      mockStoreFetchPendingChoices.mockResolvedValue(undefined)

      const wrapper = await mountSuspended(StepSubclassChoice, {
        props: { characterId: 1, nextStep }
      })

      // Select Circle of the Land and Arctic
      const landButton = wrapper.findAll('button').find(b => b.text().includes('Circle of the Land'))
      await landButton?.trigger('click')
      await flushPromises()

      const arcticButton = wrapper.findAll('button').find(b => b.text().includes('Arctic'))
      await arcticButton?.trigger('click')
      await flushPromises()

      // Switch to Circle of the Moon
      const moonButton = wrapper.findAll('button').find(b => b.text().includes('Circle of the Moon'))
      await moonButton?.trigger('click')
      await flushPromises()

      // Click Continue - should NOT include variant_choices
      const continueButton = findContinueButton(wrapper)
      expect(continueButton).toBeDefined()
      await continueButton?.trigger('click')
      await flushPromises()

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/characters/1/classes/phb:druid/subclass',
        expect.objectContaining({
          method: 'PUT',
          body: { subclass_slug: 'phb:druid-circle-of-the-moon' }
        })
      )
      // Verify variant_choices is NOT in the body
      const callBody = mockApiFetch.mock.calls[0][1].body
      expect(callBody.variant_choices).toBeUndefined()
    })
  })
})
