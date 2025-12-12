// app/composables/useCharacterSheet.ts
import { computed, type Ref, type ComputedRef } from 'vue'
import type {
  Character,
  CharacterStats,
  CharacterProficiency,
  CharacterFeature,
  CharacterEquipment,
  CharacterSpell,
  CharacterLanguage,
  CharacterSkill,
  CharacterSavingThrow,
  CharacterNote,
  SkillReference,
  AbilityScoreCode,
  SkillAdvantage
} from '~/types/character'

export interface HitDice {
  die: string
  total: number
  current: number
}

export interface UseCharacterSheetReturn {
  // Raw API data
  character: ComputedRef<Character | null>
  stats: ComputedRef<CharacterStats | null>
  proficiencies: ComputedRef<CharacterProficiency[]>
  features: ComputedRef<CharacterFeature[]>
  equipment: ComputedRef<CharacterEquipment[]>
  spells: ComputedRef<CharacterSpell[]>
  languages: ComputedRef<CharacterLanguage[]>
  notes: ComputedRef<Record<string, CharacterNote[]>>

  // Computed/derived
  skills: ComputedRef<CharacterSkill[]>
  skillAdvantages: ComputedRef<SkillAdvantage[]>
  savingThrows: ComputedRef<CharacterSavingThrow[]>
  hitDice: ComputedRef<HitDice[]>

  // State
  loading: ComputedRef<boolean>
  error: ComputedRef<Error | null>
  refresh: () => Promise<void>
}

/**
 * Composable for fetching and computing all character sheet data
 *
 * Fetches 7 API endpoints in parallel and computes derived values
 * like skill modifiers and saving throw proficiencies.
 */
export function useCharacterSheet(characterId: Ref<string | number>): UseCharacterSheetReturn {
  const { apiFetch } = useApi()

  // Fetch character base data
  const { data: characterData, pending: characterPending, error: characterError, refresh: refreshCharacter }
    = useAsyncData(
      `character-${characterId.value}`,
      () => apiFetch<{ data: Character }>(`/characters/${characterId.value}`)
    )

  // Fetch character stats
  const { data: statsData, pending: statsPending, refresh: refreshStats }
    = useAsyncData(
      `character-${characterId.value}-stats`,
      () => apiFetch<{ data: CharacterStats }>(`/characters/${characterId.value}/stats`)
    )

  // Fetch proficiencies
  const { data: proficienciesData, pending: proficienciesPending, refresh: refreshProficiencies }
    = useAsyncData(
      `character-${characterId.value}-proficiencies`,
      () => apiFetch<{ data: CharacterProficiency[] }>(`/characters/${characterId.value}/proficiencies`)
    )

  // Fetch features
  const { data: featuresData, pending: featuresPending, refresh: refreshFeatures }
    = useAsyncData(
      `character-${characterId.value}-features`,
      () => apiFetch<{ data: CharacterFeature[] }>(`/characters/${characterId.value}/features`)
    )

  // Fetch equipment
  const { data: equipmentData, pending: equipmentPending, refresh: refreshEquipment }
    = useAsyncData(
      `character-${characterId.value}-equipment`,
      () => apiFetch<{ data: CharacterEquipment[] }>(`/characters/${characterId.value}/equipment`)
    )

  // Fetch spells
  const { data: spellsData, pending: spellsPending, refresh: refreshSpells }
    = useAsyncData(
      `character-${characterId.value}-spells`,
      () => apiFetch<{ data: CharacterSpell[] }>(`/characters/${characterId.value}/spells`)
    )

  // Fetch languages
  const { data: languagesData, pending: languagesPending, refresh: refreshLanguages }
    = useAsyncData(
      `character-${characterId.value}-languages`,
      () => apiFetch<{ data: CharacterLanguage[] }>(`/characters/${characterId.value}/languages`)
    )

  // Fetch notes (grouped by category)
  const { data: notesData, pending: notesPending, refresh: refreshNotes }
    = useAsyncData(
      `character-${characterId.value}-notes`,
      () => apiFetch<{ data: Record<string, CharacterNote[]> }>(`/characters/${characterId.value}/notes`)
    )

  // Fetch skills reference data
  const { data: skillsReference } = useReferenceData<SkillReference>('/skills')

  // Computed: Extract data from responses
  const character = computed(() => characterData.value?.data ?? null)
  const stats = computed(() => statsData.value?.data ?? null)
  const proficiencies = computed(() => proficienciesData.value?.data ?? [])
  const features = computed(() => featuresData.value?.data ?? [])
  const equipment = computed(() => equipmentData.value?.data ?? [])
  const spells = computed(() => spellsData.value?.data ?? [])
  const languages = computed(() => languagesData.value?.data ?? [])
  const notes = computed(() => notesData.value?.data ?? {})

  // Computed: Aggregate loading state
  const loading = computed(() =>
    characterPending.value
    || statsPending.value
    || proficienciesPending.value
    || featuresPending.value
    || equipmentPending.value
    || spellsPending.value
    || languagesPending.value
    || notesPending.value
  )

  // Computed: First error encountered
  const error = computed(() => characterError.value as Error | null)

  // Computed: Calculate all 18 skill modifiers
  const skills = computed<CharacterSkill[]>(() => {
    if (!skillsReference.value || !stats.value || !character.value) return []

    const proficiencyBonus = character.value.proficiency_bonus

    return skillsReference.value.map((skill) => {
      // Find if character is proficient in this skill
      const profRecord = proficiencies.value.find(
        p => p.skill?.slug === skill.slug
      )
      const isProficient = !!profRecord
      const hasExpertise = profRecord?.expertise ?? false

      // Get ability modifier from stats
      const abilityMod = stats.value?.ability_scores[skill.ability_code]?.modifier ?? 0

      // Calculate modifier: ability mod + proficiency (+ expertise)
      let modifier = abilityMod
      if (isProficient) modifier += proficiencyBonus
      if (hasExpertise) modifier += proficiencyBonus

      return {
        id: skill.id,
        name: skill.name,
        slug: skill.slug,
        ability_code: skill.ability_code,
        modifier,
        proficient: isProficient,
        expertise: hasExpertise
      }
    })
  })

  // Computed: Skill advantages (unconditional only)
  // Filters out conditional advantages (those belong in DefensesPanel)
  const skillAdvantages = computed<SkillAdvantage[]>(() => {
    // Stats may include skill_advantages even though it's not in the OpenAPI spec yet
    const rawAdvantages = (stats.value as CharacterStats & { skill_advantages?: SkillAdvantage[] })?.skill_advantages
    if (!rawAdvantages) return []

    // Only return unconditional advantages (condition === null)
    return rawAdvantages.filter(adv => adv.condition === null)
  })

  // Computed: Saving throws with proficiency info
  const savingThrows = computed<CharacterSavingThrow[]>(() => {
    if (!stats.value) return []

    const abilities: AbilityScoreCode[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']

    return abilities.map((ability) => {
      // API returns { modifier, proficient, total } for each saving throw
      const saveData = stats.value?.saving_throws[ability]
      // Handle both object format (new API) and number format (legacy/type definition)
      const modifier = typeof saveData === 'object' && saveData !== null
        ? (saveData as { total: number }).total
        : (saveData ?? 0)
      const proficient = typeof saveData === 'object' && saveData !== null
        ? (saveData as { proficient: boolean }).proficient
        : false

      return {
        ability,
        modifier,
        proficient
      }
    })
  })

  // Computed: Transform hit dice from object to array format
  // API returns: { d8: { available: 1, max: 1, spent: 0 } }
  // Component expects: [{ die: 'd8', total: 1, current: 1 }]
  const hitDice = computed<HitDice[]>(() => {
    const rawHitDice = stats.value?.hit_dice
    if (!rawHitDice || typeof rawHitDice !== 'object') return []

    return Object.entries(rawHitDice).map(([die, data]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hitDiceData = data as any
      return {
        die,
        total: hitDiceData.max,
        current: hitDiceData.available
      }
    })
  })

  // Refresh all data
  const refresh = async () => {
    await Promise.all([
      refreshCharacter(),
      refreshStats(),
      refreshProficiencies(),
      refreshFeatures(),
      refreshEquipment(),
      refreshSpells(),
      refreshLanguages(),
      refreshNotes()
    ])
  }

  return {
    character,
    stats,
    proficiencies,
    features,
    equipment,
    spells,
    languages,
    notes,
    skills,
    skillAdvantages,
    savingThrows,
    hitDice,
    loading,
    error,
    refresh
  }
}
