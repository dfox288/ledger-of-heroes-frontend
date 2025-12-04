import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

// Mock the store before importing the composable
vi.mock('~/stores/characterBuilder', () => ({
  useCharacterBuilderStore: vi.fn(() => ({
    hasPendingChoices: false,
    isCaster: false,
    needsSubrace: false
  }))
}))

describe('useWizardSteps', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
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
})
