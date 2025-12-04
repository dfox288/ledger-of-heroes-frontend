// tests/components/character/builder/StepLanguages.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StepLanguages from '~/components/character/builder/StepLanguages.vue'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'
import {
  mockHumanLanguageChoices,
  mockHumanAcolyteLanguageChoices,
  mockNoLanguageChoices,
  mockPartiallySelectedLanguageChoices
} from '../../../fixtures/languageChoices'

describe('StepLanguages', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('basic rendering', () => {
    it('renders header and description', async () => {
      const wrapper = await mountSuspended(StepLanguages)
      const store = useCharacterBuilderStore()
      store.languageChoices = mockHumanLanguageChoices
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Choose Your Languages')
    })

    it('shows message when no language choices are needed', async () => {
      const wrapper = await mountSuspended(StepLanguages)
      const store = useCharacterBuilderStore()
      store.languageChoices = mockNoLanguageChoices
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('No language choices needed')
    })
  })

  describe('known languages display', () => {
    it('displays known languages from race', async () => {
      const wrapper = await mountSuspended(StepLanguages)
      const store = useCharacterBuilderStore()
      store.selectedRace = { name: 'Human' } as any
      store.languageChoices = mockHumanLanguageChoices
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Common')
      // Known languages should have visual indicator that they're automatic
      const knownSection = wrapper.find('[data-test="known-languages"]')
      expect(knownSection.exists()).toBe(true)
    })
  })

  describe('choice group rendering', () => {
    it('renders race language choices when present', async () => {
      const wrapper = await mountSuspended(StepLanguages)
      const store = useCharacterBuilderStore()
      store.selectedRace = { name: 'Human' } as any
      store.languageChoices = mockHumanLanguageChoices
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('From Race: Human')
      expect(wrapper.text()).toContain('Choose 1 language')
      expect(wrapper.text()).toContain('Dwarvish')
      expect(wrapper.text()).toContain('Elvish')
    })

    it('renders background language choices when present', async () => {
      const wrapper = await mountSuspended(StepLanguages)
      const store = useCharacterBuilderStore()
      store.selectedRace = { name: 'Human' } as any
      store.selectedBackground = { name: 'Acolyte' } as any
      store.languageChoices = mockHumanAcolyteLanguageChoices
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('From Background: Acolyte')
      expect(wrapper.text()).toContain('Choose 2 languages')
    })

    it('renders both race and background choices when both present', async () => {
      const wrapper = await mountSuspended(StepLanguages)
      const store = useCharacterBuilderStore()
      store.selectedRace = { name: 'Human' } as any
      store.selectedBackground = { name: 'Acolyte' } as any
      store.languageChoices = mockHumanAcolyteLanguageChoices
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('From Race: Human')
      expect(wrapper.text()).toContain('From Background: Acolyte')
    })

    it('shows selection count badge', async () => {
      const wrapper = await mountSuspended(StepLanguages)
      const store = useCharacterBuilderStore()
      store.selectedRace = { name: 'Human' } as any
      store.languageChoices = mockHumanLanguageChoices
      await wrapper.vm.$nextTick()

      // Should show "0/1 selected" initially
      expect(wrapper.text()).toMatch(/0\/1.*selected/i)
    })
  })

  describe('language selection buttons', () => {
    it('renders language option buttons', async () => {
      const wrapper = await mountSuspended(StepLanguages)
      const store = useCharacterBuilderStore()
      store.selectedRace = { name: 'Human' } as any
      store.languageChoices = mockHumanLanguageChoices
      await wrapper.vm.$nextTick()

      const languageButtons = wrapper.findAll('.language-option')
      expect(languageButtons.length).toBeGreaterThan(0)
    })
  })

  describe('selection interaction (store-level)', () => {
    it('toggleLanguageSelection adds language to selection', () => {
      const store = useCharacterBuilderStore()
      store.languageChoices = mockHumanLanguageChoices

      store.toggleLanguageSelection('race', 2) // Dwarvish
      expect(store.pendingLanguageSelections.get('race')?.has(2)).toBe(true)
    })

    it('toggleLanguageSelection removes language when called twice', () => {
      const store = useCharacterBuilderStore()
      store.languageChoices = mockHumanLanguageChoices

      store.toggleLanguageSelection('race', 2)
      store.toggleLanguageSelection('race', 2)
      expect(store.pendingLanguageSelections.get('race')?.has(2)).toBe(false)
    })

    it('allows selecting different language after deselecting', () => {
      const store = useCharacterBuilderStore()
      store.languageChoices = mockHumanLanguageChoices

      // Select Dwarvish
      store.toggleLanguageSelection('race', 2)
      expect(store.pendingLanguageSelections.get('race')?.has(2)).toBe(true)

      // Deselect Dwarvish
      store.toggleLanguageSelection('race', 2)
      expect(store.pendingLanguageSelections.get('race')?.has(2)).toBe(false)

      // Select Elvish
      store.toggleLanguageSelection('race', 3)
      expect(store.pendingLanguageSelections.get('race')?.has(3)).toBe(true)
    })

    it('tracks selections separately for race and background', () => {
      const store = useCharacterBuilderStore()
      store.languageChoices = mockHumanAcolyteLanguageChoices

      store.toggleLanguageSelection('race', 2) // Dwarvish for race
      store.toggleLanguageSelection('background', 3) // Elvish for background
      store.toggleLanguageSelection('background', 4) // Giant for background

      expect(store.pendingLanguageSelections.get('race')?.size).toBe(1)
      expect(store.pendingLanguageSelections.get('background')?.size).toBe(2)
    })
  })

  describe('completion validation', () => {
    it('hasLanguageChoices returns true when choices exist', () => {
      const store = useCharacterBuilderStore()
      store.languageChoices = mockHumanLanguageChoices

      expect(store.hasLanguageChoices).toBe(true)
    })

    it('hasLanguageChoices returns false when no choices needed', () => {
      const store = useCharacterBuilderStore()
      store.languageChoices = mockNoLanguageChoices

      expect(store.hasLanguageChoices).toBe(false)
    })

    it('allLanguageChoicesComplete returns false when not all selected', () => {
      const store = useCharacterBuilderStore()
      store.languageChoices = mockHumanAcolyteLanguageChoices

      // Only select 1 of 1 race language (incomplete background)
      store.toggleLanguageSelection('race', 2)

      expect(store.allLanguageChoicesComplete).toBe(false)
    })

    it('allLanguageChoicesComplete returns true when all selections made', () => {
      const store = useCharacterBuilderStore()
      store.languageChoices = mockHumanAcolyteLanguageChoices

      // Select all required: 1 race + 2 background
      store.toggleLanguageSelection('race', 2)
      store.toggleLanguageSelection('background', 3)
      store.toggleLanguageSelection('background', 4)

      expect(store.allLanguageChoicesComplete).toBe(true)
    })
  })

  describe('continue button', () => {
    it('continue button is disabled when choices incomplete', async () => {
      const wrapper = await mountSuspended(StepLanguages)
      const store = useCharacterBuilderStore()
      store.selectedRace = { name: 'Human' } as any
      store.languageChoices = mockHumanLanguageChoices
      await wrapper.vm.$nextTick()

      const continueBtn = wrapper.find('[data-test="continue-btn"]')
      expect(continueBtn.attributes('disabled')).toBeDefined()
    })

    it('continue button is enabled when all choices made', async () => {
      const wrapper = await mountSuspended(StepLanguages)
      const store = useCharacterBuilderStore()
      store.selectedRace = { name: 'Human' } as any
      store.languageChoices = mockHumanLanguageChoices
      store.toggleLanguageSelection('race', 2)
      await wrapper.vm.$nextTick()

      const continueBtn = wrapper.find('[data-test="continue-btn"]')
      expect(continueBtn.attributes('disabled')).toBeUndefined()
    })
  })

  describe('editing existing selections', () => {
    it('initializes pending selections from API response', async () => {
      const store = useCharacterBuilderStore()
      store.languageChoices = mockPartiallySelectedLanguageChoices

      // This should be called by the component on mount
      store.initializeLanguageSelections()

      expect(store.pendingLanguageSelections.get('race')?.has(3)).toBe(true) // Elvish
      expect(store.pendingLanguageSelections.get('background')?.has(11)).toBe(true) // Draconic
    })
  })
})
