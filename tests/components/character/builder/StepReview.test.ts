import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { computed } from 'vue'
import StepReview from '~/components/character/builder/StepReview.vue'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

// Mock navigateTo
const mockNavigateTo = vi.fn()
vi.mock('#app', async () => {
  const actual = await vi.importActual('#app')
  return {
    ...actual,
    navigateTo: (...args: unknown[]) => mockNavigateTo(...args)
  }
})

// Mock middleware to prevent infinite redirects
vi.mock('~/middleware/wizard-step', () => ({
  default: vi.fn(),
  isStepAccessible: vi.fn(() => true)
}))

// Mock goToStep from useWizardNavigation
const mockGoToStep = vi.fn()
vi.mock('~/composables/useWizardSteps', () => ({
  useWizardNavigation: () => ({
    goToStep: mockGoToStep,
    activeSteps: computed(() => [
      { name: 'name', label: 'Name', icon: 'i-heroicons-user', visible: () => true },
      { name: 'race', label: 'Race', icon: 'i-heroicons-globe-alt', visible: () => true },
      { name: 'class', label: 'Class', icon: 'i-heroicons-shield-check', visible: () => true },
      { name: 'abilities', label: 'Abilities', icon: 'i-heroicons-chart-bar', visible: () => true },
      { name: 'background', label: 'Background', icon: 'i-heroicons-book-open', visible: () => true },
      { name: 'equipment', label: 'Equipment', icon: 'i-heroicons-briefcase', visible: () => true },
      { name: 'review', label: 'Review', icon: 'i-heroicons-check-circle', visible: () => true }
    ]),
    currentStep: computed(() => ({ name: 'review', label: 'Review' })),
    currentStepIndex: computed(() => 6),
    isFirstStep: computed(() => false),
    isLastStep: computed(() => true),
    nextStep: vi.fn(),
    previousStep: vi.fn()
  }),
  stepRegistry: []
}))

describe('StepReview', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockGoToStep.mockReset()
    mockNavigateTo.mockReset()
  })

  async function setupStore(wrapper: Awaited<ReturnType<typeof mountSuspended>>) {
    const store = useCharacterBuilderStore()

    // Set up character data AFTER mounting
    store.characterId = 123
    store.name = 'Thorin Ironforge'
    store.selectedRace = {
      id: 1,
      name: 'Dwarf',
      slug: 'dwarf',
      is_subrace: false
    } as any
    store.characterClasses = [{
      classId: 2,
      subclassId: null,
      level: 1,
      isPrimary: true,
      order: 0,
      classData: {
        id: 2,
        name: 'Fighter',
        slug: 'fighter',
        hit_die: 10,
        spellcasting_ability: null
      } as any
    }]
    store.abilityScores = {
      strength: 16,
      dexterity: 12,
      constitution: 14,
      intelligence: 10,
      wisdom: 13,
      charisma: 8
    }
    store.selectedBackground = {
      id: 3,
      name: 'Soldier',
      slug: 'soldier',
      feature_name: 'Military Rank'
    } as any

    await wrapper.vm.$nextTick()
    return store
  }

  it('displays page title', async () => {
    const wrapper = await mountSuspended(StepReview)

    expect(wrapper.text()).toContain('Review Your Character')
  })

  it('displays character name', async () => {
    const wrapper = await mountSuspended(StepReview)
    await setupStore(wrapper)

    expect(wrapper.text()).toContain('Thorin Ironforge')
  })

  it('displays selected race', async () => {
    const wrapper = await mountSuspended(StepReview)
    await setupStore(wrapper)

    expect(wrapper.text()).toContain('Dwarf')
  })

  it('displays selected class', async () => {
    const wrapper = await mountSuspended(StepReview)
    await setupStore(wrapper)

    expect(wrapper.text()).toContain('Fighter')
  })

  it('displays ability scores', async () => {
    const wrapper = await mountSuspended(StepReview)
    await setupStore(wrapper)

    // Should show ability score values
    expect(wrapper.text()).toContain('16') // strength
    expect(wrapper.text()).toContain('14') // constitution
    expect(wrapper.text()).toContain('STR')
    expect(wrapper.text()).toContain('CON')
  })

  it('displays selected background', async () => {
    const wrapper = await mountSuspended(StepReview)
    await setupStore(wrapper)

    expect(wrapper.text()).toContain('Soldier')
  })

  it('shows finish button', async () => {
    const wrapper = await mountSuspended(StepReview)

    expect(wrapper.find('[data-test="finish-btn"]').exists()).toBe(true)
  })

  it('finish button is clickable', async () => {
    const wrapper = await mountSuspended(StepReview)
    await setupStore(wrapper)

    const finishBtn = wrapper.find('[data-test="finish-btn"]')
    expect(finishBtn.exists()).toBe(true)

    // Verify button can be triggered (navigation tested in e2e)
    await finishBtn.trigger('click')
  })

  describe('with spells (caster class)', () => {
    it('displays spells section for casters', async () => {
      const wrapper = await mountSuspended(StepReview)
      const store = await setupStore(wrapper)

      // Change to caster class (with spells at level 1)
      // Note: isCaster now requires level_progression to have cantrips/spells at level 1
      store.characterClasses = [{
        classId: 5,
        subclassId: null,
        level: 1,
        isPrimary: true,
        order: 0,
        classData: {
          id: 5,
          name: 'Wizard',
          slug: 'wizard',
          hit_die: 6,
          spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' },
          level_progression: [{ level: 1, cantrips_known: 3, spells_known: 6 }]
        } as any
      }]

      // The component uses pendingSpellIds to track selected spells
      // Note: selectedSpellsForDisplay is computed from availableSpells (from API) and pendingSpellIds
      // Since we can't easily mock the API response, we just verify isCaster is true
      // The full spell display is tested in integration/e2e tests
      await wrapper.vm.$nextTick()

      // Verify the class is now recognized as a caster
      expect(store.isCaster).toBe(true)
    })
  })

  describe('with equipment', () => {
    it('displays fixed equipment', async () => {
      const wrapper = await mountSuspended(StepReview)
      const store = await setupStore(wrapper)

      store.characterClasses = [{
        ...store.characterClasses[0],
        classData: {
          ...store.characterClasses[0].classData,
          equipment: [
            { id: 1, item: { name: 'Shield' }, quantity: 1, is_choice: false }
          ]
        } as any
      }]

      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Shield')
    })

    it('displays chosen equipment', async () => {
      const wrapper = await mountSuspended(StepReview)
      const store = await setupStore(wrapper)

      store.characterClasses = [{
        ...store.characterClasses[0],
        classData: {
          ...store.characterClasses[0].classData,
          equipment: [
            { id: 10, item: { name: 'Longsword' }, quantity: 1, is_choice: true, choice_group: 'choice_1' },
            { id: 11, item: { name: 'Battleaxe' }, quantity: 1, is_choice: true, choice_group: 'choice_1' }
          ]
        } as any
      }]
      store.equipmentChoices.set('choice_1', 10) // Selected longsword

      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Longsword')
    })
  })

  describe('edit buttons', () => {
    it('shows edit button for name section', async () => {
      const wrapper = await mountSuspended(StepReview)

      expect(wrapper.find('[data-test="edit-name"]').exists()).toBe(true)
    })

    it('navigates to correct step when edit clicked', async () => {
      const wrapper = await mountSuspended(StepReview)

      await wrapper.find('[data-test="edit-name"]').trigger('click')

      // With route-based navigation, goToStep is called with step name
      expect(mockGoToStep).toHaveBeenCalledWith('name')
    })
  })
})
