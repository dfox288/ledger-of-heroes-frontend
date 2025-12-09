// tests/composables/useCharacterWizard.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { reactive } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import type { Race, CharacterClass } from '~/types'

// Mock navigateTo
vi.mock('#app', async () => {
  const actual = await vi.importActual('#app')
  return {
    ...actual,
    navigateTo: vi.fn()
  }
})

// Create a reactive mock route for testing
function createMockRoute(initialPath: string = '/characters/new/sourcebooks') {
  return reactive({ path: initialPath })
}

// Mock race data
const mockElf: Race = {
  id: 1,
  name: 'Elf',
  slug: 'elf',
  subrace_required: true,
  subraces: [{ id: 2, name: 'High Elf', slug: 'high-elf' }]
} as Race

const mockHuman: Race = {
  id: 4,
  name: 'Human',
  slug: 'human',
  subrace_required: false,
  subraces: [{ id: 5, name: 'Variant Human', slug: 'variant-human' }]
} as Race

// Mock class data
const mockCleric: CharacterClass = {
  id: 1,
  name: 'Cleric',
  slug: 'cleric',
  subclass_level: 1,
  spellcasting_ability: { id: 5, code: 'WIS', name: 'Wisdom' },
  level_progression: [{ level: 1, cantrips_known: 3 }]
} as unknown as CharacterClass

const mockFighter: CharacterClass = {
  id: 2,
  name: 'Fighter',
  slug: 'fighter',
  subclass_level: 3,
  spellcasting_ability: null,
  level_progression: []
} as unknown as CharacterClass

describe('useCharacterWizard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('activeSteps', () => {
    it('includes only visible steps', () => {
      const route = createMockRoute()
      const { activeSteps } = useCharacterWizard({ route })

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

      // Proficiencies and languages are ALWAYS visible but use shouldSkip for navigation
      // This keeps step array indices stable after saving choices
      expect(stepNames).toContain('proficiencies')
      expect(stepNames).toContain('languages')
    })

    it('shows subrace step when race with subraces is selected', () => {
      const store = useCharacterWizardStore()
      store.selections.race = mockElf

      const route = createMockRoute()
      const { activeSteps } = useCharacterWizard({ route })
      const stepNames = activeSteps.value.map(s => s.name)

      expect(stepNames).toContain('subrace')
    })

    it('shows subclass step when class has subclass at level 1', () => {
      const store = useCharacterWizardStore()
      store.selections.class = mockCleric

      const route = createMockRoute()
      const { activeSteps } = useCharacterWizard({ route })
      const stepNames = activeSteps.value.map(s => s.name)

      expect(stepNames).toContain('subclass')
    })

    it('hides subclass step for classes with higher subclass level', () => {
      const store = useCharacterWizardStore()
      store.selections.class = mockFighter

      const route = createMockRoute()
      const { activeSteps } = useCharacterWizard({ route })
      const stepNames = activeSteps.value.map(s => s.name)

      expect(stepNames).not.toContain('subclass')
    })

    it('shows spells step for spellcasters', () => {
      const store = useCharacterWizardStore()
      store.selections.class = mockCleric

      const route = createMockRoute()
      const { activeSteps } = useCharacterWizard({ route })
      const stepNames = activeSteps.value.map(s => s.name)

      expect(stepNames).toContain('spells')
    })

    it('hides spells step for non-casters', () => {
      const store = useCharacterWizardStore()
      store.selections.class = mockFighter

      const route = createMockRoute()
      const { activeSteps } = useCharacterWizard({ route })
      const stepNames = activeSteps.value.map(s => s.name)

      expect(stepNames).not.toContain('spells')
    })

    it('proficiencies step has shouldSkip true when no choices', () => {
      const route = createMockRoute()
      const { activeSteps } = useCharacterWizard({ route })
      const profStep = activeSteps.value.find(s => s.name === 'proficiencies')

      expect(profStep?.shouldSkip?.()).toBe(true)
    })

    it('languages step has shouldSkip true when no choices', () => {
      const route = createMockRoute()
      const { activeSteps } = useCharacterWizard({ route })
      const langStep = activeSteps.value.find(s => s.name === 'languages')

      expect(langStep?.shouldSkip?.()).toBe(true)
    })
  })

  describe('currentStepName', () => {
    it('extracts step from /characters/new/[step] path', () => {
      const route = createMockRoute('/characters/new/race')
      const { currentStepName } = useCharacterWizard({ route })
      expect(currentStepName.value).toBe('race')
    })

    it('extracts step from /characters/[id]/edit/[step] path', () => {
      const route = createMockRoute('/characters/42/edit/abilities')
      const { currentStepName } = useCharacterWizard({ route })
      expect(currentStepName.value).toBe('abilities')
    })

    it('defaults to sourcebooks for unknown paths', () => {
      const route = createMockRoute('/characters/new')
      const { currentStepName } = useCharacterWizard({ route })
      expect(currentStepName.value).toBe('sourcebooks')
    })
  })

  describe('currentStepIndex', () => {
    it('returns correct index for current step', () => {
      const route = createMockRoute('/characters/new/race')
      const { currentStepIndex, activeSteps } = useCharacterWizard({ route })

      const raceIndex = activeSteps.value.findIndex(s => s.name === 'race')
      expect(currentStepIndex.value).toBe(raceIndex)
    })
  })

  describe('isFirstStep / isLastStep', () => {
    it('isFirstStep is true on sourcebooks', () => {
      const route = createMockRoute('/characters/new/sourcebooks')
      const { isFirstStep } = useCharacterWizard({ route })
      expect(isFirstStep.value).toBe(true)
    })

    it('isFirstStep is false on race', () => {
      const route = createMockRoute('/characters/new/race')
      const { isFirstStep } = useCharacterWizard({ route })
      expect(isFirstStep.value).toBe(false)
    })

    it('isLastStep is true on review', () => {
      const route = createMockRoute('/characters/new/review')
      const { isLastStep } = useCharacterWizard({ route })
      expect(isLastStep.value).toBe(true)
    })

    it('isLastStep is false on other steps', () => {
      const route = createMockRoute('/characters/new/abilities')
      const { isLastStep } = useCharacterWizard({ route })
      expect(isLastStep.value).toBe(false)
    })
  })

  describe('progressPercent', () => {
    it('is 0 on first step', () => {
      const route = createMockRoute('/characters/new/sourcebooks')
      const { progressPercent } = useCharacterWizard({ route })
      expect(progressPercent.value).toBe(0)
    })

    it('is 100 on last step', () => {
      const route = createMockRoute('/characters/new/review')
      const { progressPercent } = useCharacterWizard({ route })
      expect(progressPercent.value).toBe(100)
    })
  })

  describe('canProceed', () => {
    it('allows proceeding from sourcebooks', () => {
      const route = createMockRoute('/characters/new/sourcebooks')
      const { canProceed } = useCharacterWizard({ route })
      expect(canProceed.value).toBe(true)
    })

    it('blocks proceeding from race without selection', () => {
      const route = createMockRoute('/characters/new/race')
      const { canProceed } = useCharacterWizard({ route })
      expect(canProceed.value).toBe(false)
    })

    it('allows proceeding from race with selection', () => {
      const store = useCharacterWizardStore()
      store.selections.race = mockElf
      const route = createMockRoute('/characters/new/race')

      const { canProceed } = useCharacterWizard({ route })
      expect(canProceed.value).toBe(true)
    })

    it('blocks proceeding from class without selection', () => {
      const route = createMockRoute('/characters/new/class')
      const { canProceed } = useCharacterWizard({ route })
      expect(canProceed.value).toBe(false)
    })

    it('allows proceeding from optional subrace without selection', () => {
      const store = useCharacterWizardStore()
      store.selections.race = mockHuman // optional subraces
      const route = createMockRoute('/characters/new/subrace')

      const { canProceed } = useCharacterWizard({ route })
      expect(canProceed.value).toBe(true)
    })

    it('blocks proceeding from required subrace without selection', () => {
      const store = useCharacterWizardStore()
      store.selections.race = mockElf // required subraces
      const route = createMockRoute('/characters/new/subrace')

      const { canProceed } = useCharacterWizard({ route })
      expect(canProceed.value).toBe(false)
    })

    it('blocks proceeding from details without name', () => {
      const route = createMockRoute('/characters/new/details')
      const { canProceed } = useCharacterWizard({ route })
      expect(canProceed.value).toBe(false)
    })

    it('allows proceeding from details with name', () => {
      const store = useCharacterWizardStore()
      store.selections.name = 'Thorin'
      const route = createMockRoute('/characters/new/details')

      const { canProceed } = useCharacterWizard({ route })
      expect(canProceed.value).toBe(true)
    })
  })

  describe('getStepUrl', () => {
    it('returns /new/ path when no characterId', () => {
      const route = createMockRoute()
      const { getStepUrl } = useCharacterWizard({ route })
      expect(getStepUrl('race')).toBe('/characters/new/race')
    })

    it('returns /edit/ path when in edit mode', () => {
      const store = useCharacterWizardStore()
      // getStepUrl uses publicId (not characterId) to determine edit mode
      store.publicId = 'arcane-phoenix-M7k2'

      // Use edit mode path to test edit mode behavior
      const route = createMockRoute('/characters/arcane-phoenix-M7k2/edit/sourcebooks')
      const { getStepUrl } = useCharacterWizard({ route })
      expect(getStepUrl('race')).toBe('/characters/arcane-phoenix-M7k2/edit/race')
    })

    it('stays in /new/ mode when only characterId is set (no publicId)', () => {
      const store = useCharacterWizardStore()
      // Only characterId is set, but publicId is not - getStepUrl uses publicId
      store.characterId = 42

      // Without publicId, stays in /new/ path
      const route = createMockRoute('/characters/new/race')
      const { getStepUrl } = useCharacterWizard({ route })
      expect(getStepUrl('class')).toBe('/characters/new/class')
    })
  })

  describe('size step visibility', () => {
    it('size step is always in activeSteps (uses shouldSkip for navigation)', () => {
      const route = createMockRoute()
      const { activeSteps } = useCharacterWizard({ route })
      const stepNames = activeSteps.value.map(s => s.name)

      expect(stepNames).toContain('size')
    })

    it('size step has shouldSkip true when no size choices', () => {
      const route = createMockRoute()
      const { activeSteps } = useCharacterWizard({ route })
      const sizeStep = activeSteps.value.find(s => s.name === 'size')

      // Without summary data, hasSizeChoices is false so shouldSkip returns true
      expect(sizeStep?.shouldSkip?.()).toBe(true)
    })

    it('size step comes after subrace and before class in step order', () => {
      const store = useCharacterWizardStore()
      store.selections.race = mockElf // has subraces

      const route = createMockRoute()
      const { activeSteps } = useCharacterWizard({ route })
      const stepNames = activeSteps.value.map(s => s.name)

      const subraceIndex = stepNames.indexOf('subrace')
      const sizeIndex = stepNames.indexOf('size')
      const classIndex = stepNames.indexOf('class')

      expect(subraceIndex).toBeLessThan(sizeIndex)
      expect(sizeIndex).toBeLessThan(classIndex)
    })
  })

  describe('nextStepInfo / previousStepInfo', () => {
    it('nextStepInfo returns the next step', () => {
      const route = createMockRoute('/characters/new/sourcebooks')
      const { nextStepInfo } = useCharacterWizard({ route })
      expect(nextStepInfo.value?.name).toBe('race')
    })

    it('previousStepInfo returns the previous step', () => {
      const route = createMockRoute('/characters/new/race')
      const { previousStepInfo } = useCharacterWizard({ route })
      expect(previousStepInfo.value?.name).toBe('sourcebooks')
    })

    it('nextStepInfo is null on last step', () => {
      const route = createMockRoute('/characters/new/review')
      const { nextStepInfo } = useCharacterWizard({ route })
      expect(nextStepInfo.value).toBeNull()
    })

    it('previousStepInfo is null on first step', () => {
      const route = createMockRoute('/characters/new/sourcebooks')
      const { previousStepInfo } = useCharacterWizard({ route })
      expect(previousStepInfo.value).toBeNull()
    })

    it('nextStepInfo skips steps where shouldSkip returns true', () => {
      // From abilities step, without any proficiency/language choices,
      // nextStepInfo should skip proficiencies and languages and go to equipment
      const route = createMockRoute('/characters/new/abilities')
      const { nextStepInfo } = useCharacterWizard({ route })

      // Should skip proficiencies and languages (no choices) and go to equipment
      expect(nextStepInfo.value?.name).toBe('equipment')
    })

    it('previousStepInfo skips steps where shouldSkip returns true', () => {
      // From equipment step, without any proficiency/language choices,
      // previousStepInfo should skip proficiencies and languages and go to abilities
      const route = createMockRoute('/characters/new/equipment')
      const { previousStepInfo } = useCharacterWizard({ route })

      // Should skip languages and proficiencies (no choices) and go to abilities
      expect(previousStepInfo.value?.name).toBe('abilities')
    })
  })
})
