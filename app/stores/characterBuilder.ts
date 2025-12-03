// app/stores/characterBuilder.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AbilityScores, Character, CharacterStats, Race, CharacterClass, Background, CharacterSpell } from '~/types'

/**
 * Character Builder Wizard Store
 *
 * Manages state for the multi-step character creation wizard.
 * Character is created as draft on step 1, updated as user progresses.
 */
export const useCharacterBuilderStore = defineStore('characterBuilder', () => {
  // API client
  const { apiFetch } = useApi()
  // ══════════════════════════════════════════════════════════════
  // WIZARD NAVIGATION
  // ══════════════════════════════════════════════════════════════
  const currentStep = ref(1)
  const totalSteps = computed(() => isCaster.value ? 8 : 7)
  const isFirstStep = computed(() => currentStep.value === 1)
  const isLastStep = computed(() => currentStep.value === totalSteps.value)

  // ══════════════════════════════════════════════════════════════
  // CHARACTER DATA (mirrors API fields)
  // ══════════════════════════════════════════════════════════════
  const characterId = ref<number | null>(null)
  const name = ref('')
  const raceId = ref<number | null>(null)
  const subraceId = ref<number | null>(null)
  const classId = ref<number | null>(null)
  const backgroundId = ref<number | null>(null)
  const abilityScores = ref<AbilityScores>({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  })
  const abilityScoreMethod = ref<'standard_array' | 'point_buy' | 'manual'>('manual')

  // Equipment choices (choice_group → selected item_id)
  const equipmentChoices = ref<Map<string, number>>(new Map())

  // ══════════════════════════════════════════════════════════════
  // FETCHED REFERENCE DATA (for display without re-fetching)
  // ══════════════════════════════════════════════════════════════
  const selectedRace = ref<Race | null>(null)
  const selectedClass = ref<CharacterClass | null>(null)
  const selectedBackground = ref<Background | null>(null)
  const selectedSpells = ref<CharacterSpell[]>([])

  // ══════════════════════════════════════════════════════════════
  // COMPUTED STATS (from API)
  // ══════════════════════════════════════════════════════════════
  const characterData = ref<Character | null>(null)
  const characterStats = ref<CharacterStats | null>(null)

  // ══════════════════════════════════════════════════════════════
  // DERIVED STATE
  // ══════════════════════════════════════════════════════════════
  const isCaster = computed(() =>
    selectedClass.value?.spellcasting_ability !== null
    && selectedClass.value?.spellcasting_ability !== undefined
  )

  const validationStatus = computed(() =>
    characterData.value?.validation_status ?? { is_complete: false, missing: [] }
  )

  const isComplete = computed(() =>
    validationStatus.value.is_complete
  )

  const racialBonuses = computed(() =>
    selectedRace.value?.modifiers?.filter(m => m.modifier_category === 'ability_score') ?? []
  )

  // Combined equipment from class + background
  const allEquipment = computed(() => [
    ...(selectedClass.value?.equipment ?? []),
    ...(selectedBackground.value?.equipment ?? [])
  ])

  // Equipment grouped by choice_group
  const equipmentByChoiceGroup = computed(() => {
    const groups = new Map<string, typeof allEquipment.value>()
    for (const item of allEquipment.value) {
      if (item.is_choice && item.choice_group) {
        const existing = groups.get(item.choice_group) ?? []
        groups.set(item.choice_group, [...existing, item])
      }
    }
    return groups
  })

  // Fixed equipment (no choice required)
  const fixedEquipment = computed(() =>
    allEquipment.value.filter(item => !item.is_choice)
  )

  // Validation: all equipment choices made?
  const allEquipmentChoicesMade = computed(() => {
    for (const [group] of equipmentByChoiceGroup.value) {
      if (!equipmentChoices.value.has(group)) return false
    }
    return true
  })

  // ══════════════════════════════════════════════════════════════
  // LOADING STATE
  // ══════════════════════════════════════════════════════════════
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ══════════════════════════════════════════════════════════════
  // NAVIGATION ACTIONS
  // ══════════════════════════════════════════════════════════════
  function nextStep(): void {
    if (currentStep.value < totalSteps.value) {
      currentStep.value++
    }
  }

  function previousStep(): void {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  function goToStep(step: number): void {
    if (step >= 1 && step <= totalSteps.value) {
      currentStep.value = step
    }
  }

  // ══════════════════════════════════════════════════════════════
  // API ACTIONS
  // ══════════════════════════════════════════════════════════════

  /**
   * Step 1: Create a draft character with just a name
   */
  async function createDraft(characterName: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiFetch<{ data: { id: number, name: string } }>('/characters', {
        method: 'POST',
        body: { name: characterName }
      })

      characterId.value = response.data.id
      name.value = characterName
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to create character'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Refresh character stats from API
   */
  async function refreshStats(): Promise<void> {
    if (!characterId.value) return

    const response = await apiFetch<{ data: CharacterStats }>(
      `/characters/${characterId.value}/stats`
    )
    characterStats.value = response.data
  }

  /**
   * Step 2: Select race (and optional subrace)
   * API expects race_id to be the subrace ID when a subrace is selected
   */
  async function selectRace(race: Race, subrace?: Race): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await apiFetch(`/characters/${characterId.value}`, {
        method: 'PATCH',
        body: { race_id: subrace?.id ?? race.id }
      })

      raceId.value = race.id
      subraceId.value = subrace?.id ?? null
      selectedRace.value = subrace ?? race

      await refreshStats()
    } catch (err: unknown) {
      error.value = 'Failed to save race'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Step 3: Select class
   * This updates isCaster computed which affects totalSteps
   */
  async function selectClass(cls: CharacterClass): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await apiFetch(`/characters/${characterId.value}`, {
        method: 'PATCH',
        body: { class_id: cls.id }
      })

      classId.value = cls.id
      selectedClass.value = cls

      await refreshStats()
    } catch (err: unknown) {
      error.value = 'Failed to save class'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Step 4: Assign ability scores
   */
  async function saveAbilityScores(
    method: 'standard_array' | 'point_buy' | 'manual',
    scores: AbilityScores
  ): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await apiFetch(`/characters/${characterId.value}`, {
        method: 'PATCH',
        body: {
          ability_score_method: method,
          strength: scores.strength,
          dexterity: scores.dexterity,
          constitution: scores.constitution,
          intelligence: scores.intelligence,
          wisdom: scores.wisdom,
          charisma: scores.charisma
        }
      })

      abilityScores.value = scores
      abilityScoreMethod.value = method
      await refreshStats()
    } catch (err: unknown) {
      error.value = 'Failed to save ability scores'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Step 5: Select background
   */
  async function selectBackground(background: Background): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await apiFetch(`/characters/${characterId.value}`, {
        method: 'PATCH',
        body: { background_id: background.id }
      })

      backgroundId.value = background.id
      selectedBackground.value = background

      await refreshStats()
    } catch (err: unknown) {
      error.value = 'Failed to save background'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Set equipment choice (local state only)
   */
  function setEquipmentChoice(choiceGroup: string, itemId: number): void {
    equipmentChoices.value.set(choiceGroup, itemId)
  }

  // ══════════════════════════════════════════════════════════════
  // RESET ACTION
  // ══════════════════════════════════════════════════════════════
  function reset(): void {
    characterId.value = null
    name.value = ''
    raceId.value = null
    subraceId.value = null
    classId.value = null
    backgroundId.value = null
    abilityScores.value = {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    }
    abilityScoreMethod.value = 'manual'
    equipmentChoices.value = new Map()
    selectedRace.value = null
    selectedClass.value = null
    selectedBackground.value = null
    selectedSpells.value = []
    characterData.value = null
    characterStats.value = null
    currentStep.value = 1
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    characterId,
    name,
    raceId,
    subraceId,
    classId,
    backgroundId,
    abilityScores,
    abilityScoreMethod,
    equipmentChoices,
    selectedRace,
    selectedClass,
    selectedBackground,
    selectedSpells,
    characterData,
    characterStats,
    isCaster,
    validationStatus,
    isComplete,
    racialBonuses,
    allEquipment,
    equipmentByChoiceGroup,
    fixedEquipment,
    allEquipmentChoicesMade,
    isLoading,
    error,
    // Actions
    nextStep,
    previousStep,
    goToStep,
    createDraft,
    refreshStats,
    selectRace,
    selectClass,
    saveAbilityScores,
    selectBackground,
    setEquipmentChoice,
    reset
  }
})
