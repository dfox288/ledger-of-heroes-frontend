// app/composables/useCharacterStats.ts
import { logger } from '~/utils/logger'
import { getPrimarySpellcasting } from '~/utils/classColors'

/**
 * Composable for fetching and displaying character stats
 *
 * Provides formatted display values for combat stats, ability scores,
 * saving throws, and spellcasting information.
 *
 * @example
 * const characterId = ref(1)
 * const {
 *   stats,
 *   isLoading,
 *   hitPoints,
 *   armorClass,
 *   initiative,
 *   refresh
 * } = useCharacterStats(characterId)
 */
import type { Ref } from 'vue'
import type { CharacterStats, AbilityScoreCode } from '~/types/character'

export interface AbilityScoreDisplay {
  code: AbilityScoreCode
  name: string
  score: number | null
  modifier: number | null
  formattedModifier: string
  formatted: string
}

export interface SavingThrowDisplay {
  code: AbilityScoreCode
  name: string
  bonus: number | null
  formattedBonus: string
  isProficient: boolean
}

export interface SpellcastingDisplay {
  ability: AbilityScoreCode
  abilityName: string
  saveDC: number
  attackBonus: number
  formattedAttackBonus: string
}

const ABILITY_NAMES: Record<AbilityScoreCode, string> = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma'
}

/**
 * Format a modifier number for display
 * Positive: +2, Zero: +0, Negative: -1, Null: —
 */
export function formatModifier(mod: number | null | undefined): string {
  if (mod == null) return '—'
  return mod >= 0 ? `+${mod}` : `${mod}`
}

export function useCharacterStats(characterId: Ref<number | null>) {
  const { apiFetch } = useApi()

  // ══════════════════════════════════════════════════════════════
  // STATE
  // ══════════════════════════════════════════════════════════════

  const stats = ref<CharacterStats | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ══════════════════════════════════════════════════════════════
  // COMPUTED: Combat Stats
  // ══════════════════════════════════════════════════════════════

  /** Max hit points, or '—' if not set */
  const hitPoints = computed(() => stats.value?.hit_points?.max ?? '—')

  /** Current hit points, or '—' if not set */
  const currentHitPoints = computed(() => stats.value?.hit_points?.current ?? '—')

  /** Temporary hit points */
  const tempHitPoints = computed(() => stats.value?.hit_points?.temporary ?? 0)

  /** Armor class, or 10 (unarmored) if not calculated */
  const armorClass = computed(() => stats.value?.armor_class ?? 10)

  /** Initiative bonus formatted (e.g., "+2" or "-1") */
  const initiative = computed(() => formatModifier(stats.value?.initiative_bonus))

  /** Proficiency bonus formatted (e.g., "+2") */
  const proficiencyBonus = computed(() => `+${stats.value?.proficiency_bonus ?? 2}`)

  /** Passive perception value */
  const passivePerception = computed(() => stats.value?.passive_perception ?? 10)

  /** Character level */
  const level = computed(() => stats.value?.level ?? 1)

  // ══════════════════════════════════════════════════════════════
  // COMPUTED: Ability Scores
  // ══════════════════════════════════════════════════════════════

  /**
   * All ability scores with display formatting
   */
  const abilityScores = computed<AbilityScoreDisplay[] | null>(() => {
    if (!stats.value?.ability_scores) return null

    const codes: AbilityScoreCode[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']

    return codes.map((code) => {
      const data = stats.value!.ability_scores[code]
      const formattedMod = formatModifier(data.modifier)
      return {
        code,
        name: ABILITY_NAMES[code],
        score: data.score,
        modifier: data.modifier,
        formattedModifier: formattedMod,
        formatted: `${data.score} (${formattedMod})`
      }
    })
  })

  // ══════════════════════════════════════════════════════════════
  // COMPUTED: Saving Throws
  // ══════════════════════════════════════════════════════════════

  /**
   * All saving throws with display formatting
   * Now uses proficient flag directly from API
   */
  const savingThrows = computed<SavingThrowDisplay[] | null>(() => {
    if (!stats.value?.saving_throws) return null

    const codes: AbilityScoreCode[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']

    return codes.map((code) => {
      const saveData = stats.value!.saving_throws[code]
      const bonus = saveData?.total ?? null
      const isProficient = saveData?.proficient ?? false

      return {
        code,
        name: ABILITY_NAMES[code],
        bonus,
        formattedBonus: formatModifier(bonus),
        isProficient
      }
    })
  })

  // ══════════════════════════════════════════════════════════════
  // COMPUTED: Spellcasting
  // ══════════════════════════════════════════════════════════════

  /**
   * Spellcasting info if character is a spellcaster
   *
   * For multiclass casters, returns the primary (first) class's stats.
   * Use stats.spellcasting directly for per-class stats.
   */
  const spellcasting = computed<SpellcastingDisplay | null>(() => {
    const primary = getPrimarySpellcasting(stats.value?.spellcasting)
    if (!primary) return null

    const sc = primary.info
    return {
      ability: sc.ability,
      abilityName: ABILITY_NAMES[sc.ability],
      saveDC: sc.spell_save_dc,
      attackBonus: sc.spell_attack_bonus,
      formattedAttackBonus: formatModifier(sc.spell_attack_bonus)
    }
  })

  /** Spell slots by level (e.g., { '1': 2, '2': 1 }) */
  const spellSlots = computed(() => stats.value?.spell_slots ?? {})

  /** How many spells can be prepared (for prepared casters) */
  const preparationLimit = computed(() => stats.value?.preparation_limit ?? null)

  /** How many spells are currently prepared */
  const preparedSpellCount = computed(() => stats.value?.prepared_spell_count ?? 0)

  /** Is this character a spellcaster? Check for any class entries in spellcasting object */
  const isSpellcaster = computed(() => {
    const spellcasting = stats.value?.spellcasting
    return spellcasting !== null && typeof spellcasting === 'object' && Object.keys(spellcasting).length > 0
  })

  // ══════════════════════════════════════════════════════════════
  // ACTIONS
  // ══════════════════════════════════════════════════════════════

  /**
   * Fetch/refresh stats from backend
   */
  async function refresh(): Promise<void> {
    if (!characterId.value) {
      stats.value = null
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await apiFetch<{ data: CharacterStats }>(
        `/characters/${characterId.value}/stats`
      )
      stats.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch stats'
      logger.error('Failed to fetch character stats:', err)
    } finally {
      isLoading.value = false
    }
  }

  // ══════════════════════════════════════════════════════════════
  // WATCH
  // ══════════════════════════════════════════════════════════════

  // Auto-refresh when characterId changes
  watch(
    characterId,
    (newId) => {
      if (newId) {
        refresh()
      } else {
        stats.value = null
      }
    },
    { immediate: true }
  )

  // ══════════════════════════════════════════════════════════════
  // RETURN
  // ══════════════════════════════════════════════════════════════

  return {
    // Raw data
    stats,
    isLoading,
    error,

    // Combat stats
    hitPoints,
    currentHitPoints,
    tempHitPoints,
    armorClass,
    initiative,
    proficiencyBonus,
    passivePerception,
    level,

    // Ability scores
    abilityScores,

    // Saving throws
    savingThrows,

    // Spellcasting
    spellcasting,
    spellSlots,
    preparationLimit,
    preparedSpellCount,
    isSpellcaster,

    // Actions
    refresh
  }
}
