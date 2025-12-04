import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

// Mock the store before importing the composable
vi.mock('~/stores/characterBuilder', () => ({
  useCharacterBuilderStore: vi.fn(() => ({
    hasPendingChoices: false,
    isCaster: false,
    needsSubrace: false,
    characterId: 5
  }))
}))

// Mock Nuxt's useRoute and navigateTo
const mockRoute = ref({ params: { id: '5', step: 'race' } })
const mockNavigateTo = vi.fn()
vi.mock('#app', () => ({
  useRoute: () => mockRoute.value,
  navigateTo: (...args: unknown[]) => mockNavigateTo(...args)
}))

describe('useWizardSteps', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockRoute.value = { params: { id: '5', step: 'race' } }
    mockNavigateTo.mockClear()
  })

  describe('stepRegistry', () => {
    it('exports a step registry array', async () => {
      const { stepRegistry } = await import('~/composables/useWizardSteps')
      expect(Array.isArray(stepRegistry)).toBe(true)
      expect(stepRegistry.length).toBeGreaterThan(0)
    })

    it('each step has required properties', async () => {
      const { stepRegistry } = await import('~/composables/useWizardSteps')
      for (const step of stepRegistry) {
        expect(step).toHaveProperty('name')
        expect(step).toHaveProperty('label')
        expect(step).toHaveProperty('icon')
        expect(step).toHaveProperty('visible')
        expect(typeof step.visible).toBe('function')
      }
    })

    it('includes core steps: name, race, class, abilities, background, equipment, review', async () => {
      const { stepRegistry } = await import('~/composables/useWizardSteps')
      const stepNames = stepRegistry.map(s => s.name)
      expect(stepNames).toContain('name')
      expect(stepNames).toContain('race')
      expect(stepNames).toContain('class')
      expect(stepNames).toContain('abilities')
      expect(stepNames).toContain('background')
      expect(stepNames).toContain('equipment')
      expect(stepNames).toContain('review')
    })

    it('includes conditional steps: subrace, proficiencies, spells', async () => {
      const { stepRegistry } = await import('~/composables/useWizardSteps')
      const stepNames = stepRegistry.map(s => s.name)
      expect(stepNames).toContain('subrace')
      expect(stepNames).toContain('proficiencies')
      expect(stepNames).toContain('spells')
    })
  })

  describe('conditional step visibility', () => {
    it('subrace step is hidden when needsSubrace is false', async () => {
      vi.mocked(useCharacterBuilderStore).mockReturnValue({
        hasPendingChoices: false,
        isCaster: false,
        needsSubrace: false
      } as ReturnType<typeof useCharacterBuilderStore>)

      vi.resetModules()
      const { stepRegistry } = await import('~/composables/useWizardSteps')
      const subraceStep = stepRegistry.find(s => s.name === 'subrace')
      expect(subraceStep?.visible()).toBe(false)
    })

    it('subrace step is visible when needsSubrace is true', async () => {
      vi.mocked(useCharacterBuilderStore).mockReturnValue({
        hasPendingChoices: false,
        isCaster: false,
        needsSubrace: true
      } as ReturnType<typeof useCharacterBuilderStore>)

      vi.resetModules()
      const { stepRegistry } = await import('~/composables/useWizardSteps')
      const subraceStep = stepRegistry.find(s => s.name === 'subrace')
      expect(subraceStep?.visible()).toBe(true)
    })

    it('proficiencies step is hidden when no pending choices', async () => {
      vi.mocked(useCharacterBuilderStore).mockReturnValue({
        hasPendingChoices: false,
        isCaster: false,
        needsSubrace: false
      } as ReturnType<typeof useCharacterBuilderStore>)

      vi.resetModules()
      const { stepRegistry } = await import('~/composables/useWizardSteps')
      const profStep = stepRegistry.find(s => s.name === 'proficiencies')
      expect(profStep?.visible()).toBe(false)
    })

    it('proficiencies step is visible when has pending choices', async () => {
      vi.mocked(useCharacterBuilderStore).mockReturnValue({
        hasPendingChoices: true,
        isCaster: false,
        needsSubrace: false
      } as ReturnType<typeof useCharacterBuilderStore>)

      vi.resetModules()
      const { stepRegistry } = await import('~/composables/useWizardSteps')
      const profStep = stepRegistry.find(s => s.name === 'proficiencies')
      expect(profStep?.visible()).toBe(true)
    })

    it('spells step is hidden for non-casters', async () => {
      vi.mocked(useCharacterBuilderStore).mockReturnValue({
        hasPendingChoices: false,
        isCaster: false,
        needsSubrace: false
      } as ReturnType<typeof useCharacterBuilderStore>)

      vi.resetModules()
      const { stepRegistry } = await import('~/composables/useWizardSteps')
      const spellsStep = stepRegistry.find(s => s.name === 'spells')
      expect(spellsStep?.visible()).toBe(false)
    })

    it('spells step is visible for casters', async () => {
      vi.mocked(useCharacterBuilderStore).mockReturnValue({
        hasPendingChoices: false,
        isCaster: true,
        needsSubrace: false
      } as ReturnType<typeof useCharacterBuilderStore>)

      vi.resetModules()
      const { stepRegistry } = await import('~/composables/useWizardSteps')
      const spellsStep = stepRegistry.find(s => s.name === 'spells')
      expect(spellsStep?.visible()).toBe(true)
    })

    it('core steps are always visible', async () => {
      vi.mocked(useCharacterBuilderStore).mockReturnValue({
        hasPendingChoices: false,
        isCaster: false,
        needsSubrace: false
      } as ReturnType<typeof useCharacterBuilderStore>)

      vi.resetModules()
      const { stepRegistry } = await import('~/composables/useWizardSteps')
      const coreSteps = ['name', 'race', 'class', 'abilities', 'background', 'equipment', 'review']

      for (const stepName of coreSteps) {
        const step = stepRegistry.find(s => s.name === stepName)
        expect(step?.visible(), `${stepName} should be visible`).toBe(true)
      }
    })
  })

  describe('useWizardNavigation', () => {
    it('returns active steps filtered by visibility and provides navigation helpers', async () => {
      // This test uses the default mock values:
      // - hasPendingChoices: false
      // - isCaster: false
      // - needsSubrace: false
      // - Route: { params: { id: '5', step: 'race' } }

      const { useWizardNavigation, stepRegistry } = await import('~/composables/useWizardSteps')
      const nav = useWizardNavigation()

      // Check activeSteps filters out conditional steps
      // With non-caster, no pending choices, no subrace should have 7 steps
      expect(nav.activeSteps.value.length).toBe(7)
      expect(nav.activeSteps.value.map(s => s.name)).toEqual([
        'name', 'race', 'class', 'abilities', 'background', 'equipment', 'review'
      ])

      // totalSteps should match activeSteps length
      expect(nav.totalSteps.value).toBe(7)

      // stepRegistry should be exported
      expect(stepRegistry.length).toBe(11) // All steps including conditional ones (+ languages step)

      // Check step names are correct in registry
      expect(stepRegistry.map(s => s.name)).toContain('subrace')
      expect(stepRegistry.map(s => s.name)).toContain('proficiencies')
      expect(stepRegistry.map(s => s.name)).toContain('spells')
    })

    it('currentStepName defaults to name when route.params.step is undefined', async () => {
      // Change mock route to have no step param
      mockRoute.value = { params: { id: '5' } }

      const { useWizardNavigation } = await import('~/composables/useWizardSteps')
      const { currentStepName } = useWizardNavigation()

      expect(currentStepName.value).toBe('name')
    })

    it('isFirstStep and isLastStep are computed based on currentStepIndex', async () => {
      // Note: After the previous test changed mockRoute to have no step,
      // currentStepName defaults to 'name' which is index 0

      const { useWizardNavigation } = await import('~/composables/useWizardSteps')
      const { activeSteps, isFirstStep, isLastStep, currentStepIndex, totalSteps } = useWizardNavigation()

      // Verify activeSteps structure
      expect(totalSteps.value).toBe(7)
      expect(activeSteps.value[0].name).toBe('name')
      expect(activeSteps.value[6].name).toBe('review')

      // currentStepIndex is 0 (name step), so:
      // - isFirstStep should be true (0 === 0)
      // - isLastStep should be false (0 !== 6)
      expect(currentStepIndex.value).toBe(0)
      expect(isFirstStep.value).toBe(true)
      expect(isLastStep.value).toBe(false)
    })

    it('includes conditional steps when conditions are met', async () => {
      // Setup mock for caster with pending choices and subrace
      vi.mocked(useCharacterBuilderStore).mockReturnValue({
        hasPendingChoices: true,
        isCaster: true,
        needsSubrace: true,
        characterId: 5
      } as ReturnType<typeof useCharacterBuilderStore>)

      // Need to reset modules so visibility functions get fresh store state
      vi.resetModules()

      // Re-mock after reset
      vi.doMock('~/stores/characterBuilder', () => ({
        useCharacterBuilderStore: () => ({
          hasPendingChoices: true,
          isCaster: true,
          needsSubrace: true,
          characterId: 5
        })
      }))

      const { useWizardNavigation } = await import('~/composables/useWizardSteps')
      const { activeSteps } = useWizardNavigation()

      // Should now include all conditional steps: subrace, proficiencies, spells
      expect(activeSteps.value.length).toBe(10) // 7 base + 3 conditional
      expect(activeSteps.value.map(s => s.name)).toContain('subrace')
      expect(activeSteps.value.map(s => s.name)).toContain('proficiencies')
      expect(activeSteps.value.map(s => s.name)).toContain('spells')
    })
  })
})
