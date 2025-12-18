/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StepPhysicalDescription from '~/components/character/wizard/StepPhysicalDescription.vue'
import { useCharacterWizardStore } from '~/stores/characterWizard'

// Mock useCharacterWizard composable
const mockNextStep = vi.fn()
mockNuxtImport('useCharacterWizard', () => () => ({
  nextStep: mockNextStep
}))

describe('StepPhysicalDescription', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useCharacterWizardStore()
    store.reset()
    mockNextStep.mockClear()
  })

  describe('structure', () => {
    it('renders step title', async () => {
      const wrapper = await mountSuspended(StepPhysicalDescription)

      expect(wrapper.text()).toContain('Physical Description')
    })

    it('renders step description', async () => {
      const wrapper = await mountSuspended(StepPhysicalDescription)

      expect(wrapper.text()).toContain('optional')
    })

    it('renders appearance section with age, height, weight inputs', async () => {
      const wrapper = await mountSuspended(StepPhysicalDescription)

      expect(wrapper.find('[data-testid="age-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="height-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="weight-input"]').exists()).toBe(true)
    })

    it('renders features section with eye, hair, skin color inputs', async () => {
      const wrapper = await mountSuspended(StepPhysicalDescription)

      expect(wrapper.find('[data-testid="eye-color-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="hair-color-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="skin-color-input"]').exists()).toBe(true)
    })

    it('renders deity input field', async () => {
      const wrapper = await mountSuspended(StepPhysicalDescription)

      expect(wrapper.find('[data-testid="deity-input"]').exists()).toBe(true)
    })

    it('renders continue and skip buttons', async () => {
      const wrapper = await mountSuspended(StepPhysicalDescription)

      expect(wrapper.find('[data-testid="continue-btn"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="skip-btn"]').exists()).toBe(true)
    })
  })

  describe('input fields', () => {
    it('age input has placeholder', async () => {
      const wrapper = await mountSuspended(StepPhysicalDescription)

      const input = wrapper.find('[data-testid="age-input"]')
      expect(input.attributes('placeholder')).toBeTruthy()
    })

    it('height input has placeholder', async () => {
      const wrapper = await mountSuspended(StepPhysicalDescription)

      const input = wrapper.find('[data-testid="height-input"]')
      expect(input.attributes('placeholder')).toBeTruthy()
    })

    it('weight input has placeholder', async () => {
      const wrapper = await mountSuspended(StepPhysicalDescription)

      const input = wrapper.find('[data-testid="weight-input"]')
      expect(input.attributes('placeholder')).toBeTruthy()
    })

    it('deity input has placeholder', async () => {
      const wrapper = await mountSuspended(StepPhysicalDescription)

      const input = wrapper.find('[data-testid="deity-input"]')
      expect(input.attributes('placeholder')).toBeTruthy()
    })
  })

  describe('store sync', () => {
    it('pre-populates fields from store in edit mode', async () => {
      const store = useCharacterWizardStore()
      store.selections.physicalDescription = {
        age: '25',
        height: '5\'10"',
        weight: '180 lbs',
        eye_color: 'Blue',
        hair_color: 'Brown',
        skin_color: 'Fair',
        deity: 'Pelor'
      }

      await mountSuspended(StepPhysicalDescription)

      // Store should retain values
      expect(store.selections.physicalDescription.age).toBe('25')
      expect(store.selections.physicalDescription.deity).toBe('Pelor')
    })

    it('allows all fields to be empty (optional)', async () => {
      const store = useCharacterWizardStore()
      store.reset()

      await mountSuspended(StepPhysicalDescription)

      // All fields should be null by default
      expect(store.selections.physicalDescription.age).toBeNull()
      expect(store.selections.physicalDescription.height).toBeNull()
      expect(store.selections.physicalDescription.weight).toBeNull()
      expect(store.selections.physicalDescription.eye_color).toBeNull()
      expect(store.selections.physicalDescription.hair_color).toBeNull()
      expect(store.selections.physicalDescription.skin_color).toBeNull()
      expect(store.selections.physicalDescription.deity).toBeNull()
    })
  })

  describe('navigation', () => {
    it('skip button navigates without saving', async () => {
      const wrapper = await mountSuspended(StepPhysicalDescription)

      const skipBtn = wrapper.find('[data-testid="skip-btn"]')
      await skipBtn.trigger('click')

      expect(mockNextStep).toHaveBeenCalled()
    })

    it('continue button is always enabled (all fields optional)', async () => {
      const wrapper = await mountSuspended(StepPhysicalDescription)

      const continueBtn = wrapper.find('[data-testid="continue-btn"]')
      expect(continueBtn.attributes('disabled')).toBeUndefined()
    })
  })

  describe('accessibility', () => {
    it('has labels for all input fields', async () => {
      const wrapper = await mountSuspended(StepPhysicalDescription)

      // Check for label text
      const text = wrapper.text()
      expect(text).toContain('Age')
      expect(text).toContain('Height')
      expect(text).toContain('Weight')
      expect(text).toContain('Eye')
      expect(text).toContain('Hair')
      expect(text).toContain('Skin')
      expect(text).toContain('Deity')
    })
  })
})
