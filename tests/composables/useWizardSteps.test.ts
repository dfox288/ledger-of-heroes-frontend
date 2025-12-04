import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

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
})
