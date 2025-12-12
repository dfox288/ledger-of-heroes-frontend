// tests/composables/useWizardChoiceSelection.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed, nextTick } from 'vue'
import { useWizardChoiceSelection } from '~/composables/useWizardChoiceSelection'

// Mock PendingChoice type for testing
interface MockPendingChoice {
  id: string
  type: string
  subtype: string | null
  source: string
  source_name: string
  quantity: number
  remaining: number
  selected: string[]
  options: Array<{ slug: string, name: string }> | null
  options_endpoint: string | null
}

// Sample test data
const mockSkillChoices: MockPendingChoice[] = [
  {
    id: 'proficiency:class:1:1:skills',
    type: 'proficiency',
    subtype: 'skill',
    source: 'class',
    source_name: 'Rogue',
    quantity: 4,
    remaining: 4,
    selected: [],
    options: [
      { slug: 'acrobatics', name: 'Acrobatics' },
      { slug: 'athletics', name: 'Athletics' },
      { slug: 'deception', name: 'Deception' },
      { slug: 'insight', name: 'Insight' },
      { slug: 'intimidation', name: 'Intimidation' },
      { slug: 'perception', name: 'Perception' },
      { slug: 'stealth', name: 'Stealth' }
    ],
    options_endpoint: null
  }
]

const mockLanguageChoices: MockPendingChoice[] = [
  {
    id: 'language:race:1:1:languages',
    type: 'language',
    subtype: null,
    source: 'race',
    source_name: 'High Elf',
    quantity: 1,
    remaining: 1,
    selected: [],
    options: [
      { slug: 'core:dwarvish', name: 'Dwarvish' },
      { slug: 'core:elvish', name: 'Elvish' },
      { slug: 'core:giant', name: 'Giant' },
      { slug: 'core:gnomish', name: 'Gnomish' }
    ],
    options_endpoint: null
  },
  {
    id: 'language:background:1:1:languages',
    type: 'language',
    subtype: null,
    source: 'background',
    source_name: 'Sage',
    quantity: 2,
    remaining: 2,
    selected: [],
    options: [
      { slug: 'core:dwarvish', name: 'Dwarvish' },
      { slug: 'core:elvish', name: 'Elvish' },
      { slug: 'core:giant', name: 'Giant' },
      { slug: 'core:gnomish', name: 'Gnomish' }
    ],
    options_endpoint: null
  }
]

describe('useWizardChoiceSelection', () => {
  let resolveChoice: ReturnType<typeof vi.fn>

  beforeEach(() => {
    resolveChoice = vi.fn().mockResolvedValue(undefined)
  })

  describe('initialization', () => {
    it('initializes with empty selections', () => {
      const choices = computed(() => mockSkillChoices as unknown as MockPendingChoice[])

      const { localSelections, isSaving } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      expect(localSelections.value.size).toBe(0)
      expect(isSaving.value).toBe(false)
    })

    it('initializes selections from already-selected choices', async () => {
      const choicesWithSelected: MockPendingChoice[] = [{
        ...mockSkillChoices[0],
        selected: ['stealth', 'perception'],
        remaining: 2
      }]
      const choices = computed(() => choicesWithSelected as unknown as MockPendingChoice[])

      const { localSelections, getSelectedCount } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      await nextTick()

      expect(getSelectedCount('proficiency:class:1:1:skills')).toBe(2)
    })

    it('handles empty choices array', () => {
      const choices = computed(() => [] as MockPendingChoice[])

      const { localSelections, allComplete } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      expect(localSelections.value.size).toBe(0)
      expect(allComplete.value).toBe(true)
    })
  })

  describe('selection helpers', () => {
    it('getSelectedCount returns 0 for unselected choice', () => {
      const choices = computed(() => mockSkillChoices as unknown as MockPendingChoice[])

      const { getSelectedCount } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      expect(getSelectedCount('proficiency:class:1:1:skills')).toBe(0)
    })

    it('isOptionSelected returns false for unselected option', () => {
      const choices = computed(() => mockSkillChoices as unknown as MockPendingChoice[])

      const { isOptionSelected } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      expect(isOptionSelected('proficiency:class:1:1:skills', 'stealth')).toBe(false)
    })

    it('isOptionSelected returns true for selected option', () => {
      const choices = computed(() => mockSkillChoices as unknown as MockPendingChoice[])

      const { isOptionSelected, handleToggle } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      handleToggle(mockSkillChoices[0] as any, 'stealth')

      expect(isOptionSelected('proficiency:class:1:1:skills', 'stealth')).toBe(true)
    })
  })

  describe('handleToggle', () => {
    it('adds option to selection', () => {
      const choices = computed(() => mockSkillChoices as unknown as MockPendingChoice[])

      const { handleToggle, getSelectedCount, isOptionSelected } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      handleToggle(mockSkillChoices[0] as any, 'stealth')

      expect(getSelectedCount('proficiency:class:1:1:skills')).toBe(1)
      expect(isOptionSelected('proficiency:class:1:1:skills', 'stealth')).toBe(true)
    })

    it('removes option when toggled again', () => {
      const choices = computed(() => mockSkillChoices as unknown as MockPendingChoice[])

      const { handleToggle, getSelectedCount, isOptionSelected } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      handleToggle(mockSkillChoices[0] as any, 'stealth')
      handleToggle(mockSkillChoices[0] as any, 'stealth')

      expect(getSelectedCount('proficiency:class:1:1:skills')).toBe(0)
      expect(isOptionSelected('proficiency:class:1:1:skills', 'stealth')).toBe(false)
    })

    it('respects quantity limit', () => {
      const limitedChoice: MockPendingChoice = {
        ...mockSkillChoices[0],
        quantity: 2
      }
      const choices = computed(() => [limitedChoice] as unknown as MockPendingChoice[])

      const { handleToggle, getSelectedCount } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      handleToggle(limitedChoice as any, 'stealth')
      handleToggle(limitedChoice as any, 'perception')
      handleToggle(limitedChoice as any, 'acrobatics') // Should be ignored - at limit

      expect(getSelectedCount('proficiency:class:1:1:skills')).toBe(2)
    })

    it('allows deselection when at limit', () => {
      const limitedChoice: MockPendingChoice = {
        ...mockSkillChoices[0],
        quantity: 2
      }
      const choices = computed(() => [limitedChoice] as unknown as MockPendingChoice[])

      const { handleToggle, getSelectedCount, isOptionSelected } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      handleToggle(limitedChoice as any, 'stealth')
      handleToggle(limitedChoice as any, 'perception')
      handleToggle(limitedChoice as any, 'stealth') // Deselect

      expect(getSelectedCount('proficiency:class:1:1:skills')).toBe(1)
      expect(isOptionSelected('proficiency:class:1:1:skills', 'stealth')).toBe(false)
      expect(isOptionSelected('proficiency:class:1:1:skills', 'perception')).toBe(true)
    })
  })

  describe('cross-choice validation', () => {
    it('detects option selected in another choice', () => {
      const choices = computed(() => mockLanguageChoices as unknown as MockPendingChoice[])

      const { handleToggle, isOptionDisabled, getDisabledReason } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      // Select Dwarvish from race choice
      handleToggle(mockLanguageChoices[0] as any, 'core:dwarvish')

      // Dwarvish should be disabled in background choice
      expect(isOptionDisabled('language:background:1:1:languages', 'core:dwarvish')).toBe(true)
      expect(getDisabledReason('language:background:1:1:languages', 'core:dwarvish')).toContain('Already selected')
    })

    it('allows same option in same choice', () => {
      const choices = computed(() => mockLanguageChoices as unknown as MockPendingChoice[])

      const { handleToggle, isOptionDisabled } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      // Select Dwarvish from race choice
      handleToggle(mockLanguageChoices[0] as any, 'core:dwarvish')

      // Dwarvish should NOT be disabled in the same choice (for deselection)
      expect(isOptionDisabled('language:race:1:1:languages', 'core:dwarvish')).toBe(false)
    })
  })

  describe('alreadyGrantedIds', () => {
    it('disables options that are already granted', () => {
      const choices = computed(() => mockLanguageChoices as unknown as MockPendingChoice[])
      const alreadyGrantedIds = computed(() => new Set(['core:elvish']))

      const { isOptionDisabled, getDisabledReason } = useWizardChoiceSelection(choices, {
        resolveChoice,
        alreadyGrantedIds
      })

      expect(isOptionDisabled('language:race:1:1:languages', 'core:elvish')).toBe(true)
      expect(getDisabledReason('language:race:1:1:languages', 'core:elvish')).toBe('Already known')
    })

    it('allows selection of non-granted options', () => {
      const choices = computed(() => mockLanguageChoices as unknown as MockPendingChoice[])
      const alreadyGrantedIds = computed(() => new Set(['core:elvish']))

      const { isOptionDisabled } = useWizardChoiceSelection(choices, {
        resolveChoice,
        alreadyGrantedIds
      })

      expect(isOptionDisabled('language:race:1:1:languages', 'core:dwarvish')).toBe(false)
    })

    it('prevents toggling of granted options', () => {
      const choices = computed(() => mockLanguageChoices as unknown as MockPendingChoice[])
      const alreadyGrantedIds = computed(() => new Set(['core:elvish']))

      const { handleToggle, isOptionSelected } = useWizardChoiceSelection(choices, {
        resolveChoice,
        alreadyGrantedIds
      })

      // Try to select Elvish (already granted) - should be ignored
      handleToggle(mockLanguageChoices[0] as any, 'core:elvish')

      expect(isOptionSelected('language:race:1:1:languages', 'core:elvish')).toBe(false)
    })
  })

  describe('allComplete', () => {
    it('returns false when choices are incomplete', () => {
      const choices = computed(() => mockSkillChoices as unknown as MockPendingChoice[])

      const { allComplete } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      expect(allComplete.value).toBe(false)
    })

    it('returns true when all choices are complete', () => {
      const choices = computed(() => mockSkillChoices as unknown as MockPendingChoice[])

      const { handleToggle, allComplete } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      // Select 4 skills (the required quantity)
      handleToggle(mockSkillChoices[0] as any, 'stealth')
      handleToggle(mockSkillChoices[0] as any, 'perception')
      handleToggle(mockSkillChoices[0] as any, 'acrobatics')
      handleToggle(mockSkillChoices[0] as any, 'athletics')

      expect(allComplete.value).toBe(true)
    })

    it('accounts for already-selected options', async () => {
      const partiallyComplete: MockPendingChoice[] = [{
        ...mockSkillChoices[0],
        quantity: 2,
        remaining: 1,
        selected: ['stealth']
      }]
      const choices = computed(() => partiallyComplete as unknown as MockPendingChoice[])

      const { handleToggle, allComplete } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      await nextTick()

      // Need to select 1 more
      expect(allComplete.value).toBe(false)

      handleToggle(partiallyComplete[0] as any, 'perception')

      expect(allComplete.value).toBe(true)
    })
  })

  describe('saveAllChoices', () => {
    it('calls resolveChoice for each choice with selections', async () => {
      const choices = computed(() => mockSkillChoices as unknown as MockPendingChoice[])

      const { handleToggle, saveAllChoices } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      handleToggle(mockSkillChoices[0] as any, 'stealth')
      handleToggle(mockSkillChoices[0] as any, 'perception')

      await saveAllChoices()

      expect(resolveChoice).toHaveBeenCalledWith(
        'proficiency:class:1:1:skills',
        { selected: expect.arrayContaining(['stealth', 'perception']) }
      )
    })

    it('calls resolveChoice for multiple choices', async () => {
      const choices = computed(() => mockLanguageChoices as unknown as MockPendingChoice[])

      const { handleToggle, saveAllChoices } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      handleToggle(mockLanguageChoices[0] as any, 'core:dwarvish')
      handleToggle(mockLanguageChoices[1] as any, 'core:giant')
      handleToggle(mockLanguageChoices[1] as any, 'core:gnomish')

      await saveAllChoices()

      expect(resolveChoice).toHaveBeenCalledTimes(2)
    })

    it('sets isSaving during save operation', async () => {
      const choices = computed(() => mockSkillChoices as unknown as MockPendingChoice[])
      let savingDuringSave = false

      resolveChoice.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      const { handleToggle, saveAllChoices, isSaving } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      handleToggle(mockSkillChoices[0] as any, 'stealth')

      const savePromise = saveAllChoices()
      savingDuringSave = isSaving.value

      await savePromise

      expect(savingDuringSave).toBe(true)
      expect(isSaving.value).toBe(false)
    })

    it('propagates errors from resolveChoice', async () => {
      const choices = computed(() => mockSkillChoices as unknown as MockPendingChoice[])
      const error = new Error('Save failed')
      resolveChoice.mockRejectedValue(error)

      const { handleToggle, saveAllChoices } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      handleToggle(mockSkillChoices[0] as any, 'stealth')

      await expect(saveAllChoices()).rejects.toThrow('Save failed')
    })

    it('skips choices with no new selections', async () => {
      const alreadyComplete: MockPendingChoice[] = [{
        ...mockSkillChoices[0],
        quantity: 2,
        remaining: 0,
        selected: ['stealth', 'perception']
      }]
      const choices = computed(() => alreadyComplete as unknown as MockPendingChoice[])

      const { saveAllChoices } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      await nextTick()
      await saveAllChoices()

      // Should not call resolveChoice because selections match what's already saved
      expect(resolveChoice).not.toHaveBeenCalled()
    })
  })

  describe('getDisplayOptions', () => {
    it('returns options from choice', () => {
      const choices = computed(() => mockSkillChoices as unknown as MockPendingChoice[])

      const { getDisplayOptions } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      const options = getDisplayOptions(mockSkillChoices[0] as any)

      expect(options).toHaveLength(7)
      expect(options[0]).toEqual({ id: 'acrobatics', name: 'Acrobatics' })
    })

    it('uses prefixed slug for display options', () => {
      const choices = computed(() => mockLanguageChoices as unknown as MockPendingChoice[])

      const { getDisplayOptions } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      const options = getDisplayOptions(mockLanguageChoices[0] as any)

      expect(options[0].id).toBe('core:dwarvish')
    })

    it('returns empty array for null options', () => {
      const choiceWithNoOptions: MockPendingChoice = {
        ...mockSkillChoices[0],
        options: null
      }
      const choices = computed(() => [choiceWithNoOptions] as unknown as MockPendingChoice[])

      const { getDisplayOptions } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      const options = getDisplayOptions(choiceWithNoOptions as any)

      expect(options).toEqual([])
    })
  })

  describe('reactivity', () => {
    it('updates allComplete when choices change', async () => {
      const choicesRef = ref<MockPendingChoice[]>(mockSkillChoices)
      const choices = computed(() => choicesRef.value as unknown as MockPendingChoice[])

      const { allComplete, handleToggle } = useWizardChoiceSelection(choices, {
        resolveChoice
      })

      expect(allComplete.value).toBe(false)

      // Reduce quantity to 1 and select 1
      choicesRef.value = [{
        ...mockSkillChoices[0],
        quantity: 1
      }]
      await nextTick()

      handleToggle(choicesRef.value[0] as any, 'stealth')

      expect(allComplete.value).toBe(true)
    })
  })
})
