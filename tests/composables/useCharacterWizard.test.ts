// tests/composables/useCharacterWizard.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import type { Race, CharacterClass } from '~/types'

// Mock useRoute
const mockRoute = ref({ path: '/characters/new/sourcebooks' })
vi.mock('#app', async () => {
  const actual = await vi.importActual('#app')
  return {
    ...actual,
    useRoute: () => mockRoute.value,
    navigateTo: vi.fn(),
  }
})

// Mock race data
const mockElf: Race = {
  id: 1,
  name: 'Elf',
  slug: 'elf',
  subrace_required: true,
  subraces: [{ id: 2, name: 'High Elf', slug: 'high-elf' }],
} as Race

const mockHuman: Race = {
  id: 4,
  name: 'Human',
  slug: 'human',
  subrace_required: false,
  subraces: [{ id: 5, name: 'Variant Human', slug: 'variant-human' }],
} as Race

// Mock class data
const mockCleric: CharacterClass = {
  id: 1,
  name: 'Cleric',
  slug: 'cleric',
  subclass_level: 1,
  spellcasting_ability: { id: 5, code: 'WIS', name: 'Wisdom' },
  level_progression: [{ level: 1, cantrips_known: 3 }],
} as unknown as CharacterClass

const mockFighter: CharacterClass = {
  id: 2,
  name: 'Fighter',
  slug: 'fighter',
  subclass_level: 3,
  spellcasting_ability: null,
  level_progression: [],
} as unknown as CharacterClass

describe('useCharacterWizard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockRoute.value = { path: '/characters/new/sourcebooks' }
  })

  describe('activeSteps', () => {
    it('includes only visible steps', () => {
      const { activeSteps } = useCharacterWizard()

      // Without any selections, conditional steps should be hidden
      const stepNames = activeSteps.value.map(s => s.name)

      expect(stepNames).toContain('sourcebooks')
      expect(stepNames).toContain('race')
      expect(stepNames).toContain('class')
      expect(stepNames).toContain('background')
      expect(stepNames).toContain('abilities')
      expect(stepNames).toContain('equipment')
      expect(stepNames).toContain('details')
      expect(stepNames).toContain('review')

      // Conditional steps should be hidden initially
      expect(stepNames).not.toContain('subrace')
      expect(stepNames).not.toContain('subclass')
      expect(stepNames).not.toContain('spells')
      expect(stepNames).not.toContain('proficiencies')
      expect(stepNames).not.toContain('languages')
    })

    it('shows subrace step when race with subraces is selected', () => {
      const store = useCharacterWizardStore()
      store.selections.race = mockElf

      const { activeSteps } = useCharacterWizard()
      const stepNames = activeSteps.value.map(s => s.name)

      expect(stepNames).toContain('subrace')
    })

    it('shows subclass step when class has subclass at level 1', () => {
      const store = useCharacterWizardStore()
      store.selections.class = mockCleric

      const { activeSteps } = useCharacterWizard()
      const stepNames = activeSteps.value.map(s => s.name)

      expect(stepNames).toContain('subclass')
    })

    it('hides subclass step for classes with higher subclass level', () => {
      const store = useCharacterWizardStore()
      store.selections.class = mockFighter

      const { activeSteps } = useCharacterWizard()
      const stepNames = activeSteps.value.map(s => s.name)

      expect(stepNames).not.toContain('subclass')
    })

    it('shows spells step for spellcasters', () => {
      const store = useCharacterWizardStore()
      store.selections.class = mockCleric

      const { activeSteps } = useCharacterWizard()
      const stepNames = activeSteps.value.map(s => s.name)

      expect(stepNames).toContain('spells')
    })

    it('hides spells step for non-casters', () => {
      const store = useCharacterWizardStore()
      store.selections.class = mockFighter

      const { activeSteps } = useCharacterWizard()
      const stepNames = activeSteps.value.map(s => s.name)

      expect(stepNames).not.toContain('spells')
    })
  })

  describe('currentStepName', () => {
    it('extracts step from /characters/new/[step] path', () => {
      mockRoute.value = { path: '/characters/new/race' }
      const { currentStepName } = useCharacterWizard()
      expect(currentStepName.value).toBe('race')
    })

    it('extracts step from /characters/[id]/edit/[step] path', () => {
      mockRoute.value = { path: '/characters/42/edit/abilities' }
      const { currentStepName } = useCharacterWizard()
      expect(currentStepName.value).toBe('abilities')
    })

    it('defaults to sourcebooks for unknown paths', () => {
      mockRoute.value = { path: '/characters/new' }
      const { currentStepName } = useCharacterWizard()
      expect(currentStepName.value).toBe('sourcebooks')
    })
  })

  describe('currentStepIndex', () => {
    it('returns correct index for current step', () => {
      mockRoute.value = { path: '/characters/new/race' }
      const { currentStepIndex, activeSteps } = useCharacterWizard()

      const raceIndex = activeSteps.value.findIndex(s => s.name === 'race')
      expect(currentStepIndex.value).toBe(raceIndex)
    })
  })

  describe('isFirstStep / isLastStep', () => {
    it('isFirstStep is true on sourcebooks', () => {
      mockRoute.value = { path: '/characters/new/sourcebooks' }
      const { isFirstStep } = useCharacterWizard()
      expect(isFirstStep.value).toBe(true)
    })

    it('isFirstStep is false on race', () => {
      mockRoute.value = { path: '/characters/new/race' }
      const { isFirstStep } = useCharacterWizard()
      expect(isFirstStep.value).toBe(false)
    })

    it('isLastStep is true on review', () => {
      mockRoute.value = { path: '/characters/new/review' }
      const { isLastStep } = useCharacterWizard()
      expect(isLastStep.value).toBe(true)
    })

    it('isLastStep is false on other steps', () => {
      mockRoute.value = { path: '/characters/new/abilities' }
      const { isLastStep } = useCharacterWizard()
      expect(isLastStep.value).toBe(false)
    })
  })

  describe('progressPercent', () => {
    it('is 0 on first step', () => {
      mockRoute.value = { path: '/characters/new/sourcebooks' }
      const { progressPercent } = useCharacterWizard()
      expect(progressPercent.value).toBe(0)
    })

    it('is 100 on last step', () => {
      mockRoute.value = { path: '/characters/new/review' }
      const { progressPercent } = useCharacterWizard()
      expect(progressPercent.value).toBe(100)
    })
  })

  describe('canProceed', () => {
    it('allows proceeding from sourcebooks', () => {
      mockRoute.value = { path: '/characters/new/sourcebooks' }
      const { canProceed } = useCharacterWizard()
      expect(canProceed.value).toBe(true)
    })

    it('blocks proceeding from race without selection', () => {
      mockRoute.value = { path: '/characters/new/race' }
      const { canProceed } = useCharacterWizard()
      expect(canProceed.value).toBe(false)
    })

    it('allows proceeding from race with selection', () => {
      const store = useCharacterWizardStore()
      store.selections.race = mockElf
      mockRoute.value = { path: '/characters/new/race' }

      const { canProceed } = useCharacterWizard()
      expect(canProceed.value).toBe(true)
    })

    it('blocks proceeding from class without selection', () => {
      mockRoute.value = { path: '/characters/new/class' }
      const { canProceed } = useCharacterWizard()
      expect(canProceed.value).toBe(false)
    })

    it('allows proceeding from optional subrace without selection', () => {
      const store = useCharacterWizardStore()
      store.selections.race = mockHuman // optional subraces
      mockRoute.value = { path: '/characters/new/subrace' }

      const { canProceed } = useCharacterWizard()
      expect(canProceed.value).toBe(true)
    })

    it('blocks proceeding from required subrace without selection', () => {
      const store = useCharacterWizardStore()
      store.selections.race = mockElf // required subraces
      mockRoute.value = { path: '/characters/new/subrace' }

      const { canProceed } = useCharacterWizard()
      expect(canProceed.value).toBe(false)
    })

    it('blocks proceeding from details without name', () => {
      mockRoute.value = { path: '/characters/new/details' }
      const { canProceed } = useCharacterWizard()
      expect(canProceed.value).toBe(false)
    })

    it('allows proceeding from details with name', () => {
      const store = useCharacterWizardStore()
      store.selections.name = 'Thorin'
      mockRoute.value = { path: '/characters/new/details' }

      const { canProceed } = useCharacterWizard()
      expect(canProceed.value).toBe(true)
    })
  })

  describe('getStepUrl', () => {
    it('returns /new/ path when no characterId', () => {
      const { getStepUrl } = useCharacterWizard()
      expect(getStepUrl('race')).toBe('/characters/new/race')
    })

    it('returns /edit/ path when characterId is set', () => {
      const store = useCharacterWizardStore()
      store.characterId = 42

      const { getStepUrl } = useCharacterWizard()
      expect(getStepUrl('race')).toBe('/characters/42/edit/race')
    })
  })

  describe('nextStepInfo / previousStepInfo', () => {
    it('nextStepInfo returns the next step', () => {
      mockRoute.value = { path: '/characters/new/sourcebooks' }
      const { nextStepInfo } = useCharacterWizard()
      expect(nextStepInfo.value?.name).toBe('race')
    })

    it('previousStepInfo returns the previous step', () => {
      mockRoute.value = { path: '/characters/new/race' }
      const { previousStepInfo } = useCharacterWizard()
      expect(previousStepInfo.value?.name).toBe('sourcebooks')
    })

    it('nextStepInfo is null on last step', () => {
      mockRoute.value = { path: '/characters/new/review' }
      const { nextStepInfo } = useCharacterWizard()
      expect(nextStepInfo.value).toBeNull()
    })

    it('previousStepInfo is null on first step', () => {
      mockRoute.value = { path: '/characters/new/sourcebooks' }
      const { previousStepInfo } = useCharacterWizard()
      expect(previousStepInfo.value).toBeNull()
    })
  })
})
