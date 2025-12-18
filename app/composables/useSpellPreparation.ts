/**
 * Composable for spell preparation mode and limit tracking
 *
 * Handles spell preparation logic including:
 * - Preparation method detection (prepared, known, spellbook)
 * - Prepare mode state management
 * - Preparation limit tracking (per-class and combined)
 * - Cross-class spell preparation tracking
 *
 * @see Issue #780 - Extract multiclass spellcasting logic to composables
 */

import type { Ref, ComputedRef } from 'vue'
import type { CharacterStats, CharacterSpell, SpellSlotsResponse, PreparationMethod, Character } from '~/types/character'
import type { SpellcastingClass } from './useSpellcastingTabs'
import type { useCharacterPlayStateStore } from '~/stores/characterPlayState'

/**
 * Options for useSpellPreparation composable
 */
export interface UseSpellPreparationOptions {
  /** Character stats with spellcasting info */
  stats: Ref<CharacterStats | null>
  /** Spell slots response with preparation limits */
  spellSlots: Ref<SpellSlotsResponse | null>
  /** Spellcasting classes from useSpellcastingTabs */
  spellcastingClasses: ComputedRef<SpellcastingClass[]>
  /** Valid spells for this character */
  validSpells: ComputedRef<CharacterSpell[]>
  /** Play state store for reactive prepared spell tracking */
  playStateStore: ReturnType<typeof useCharacterPlayStateStore>
  /** Character data for class levels */
  character: Ref<Character | null>
}

/**
 * Manages spell preparation mode state and limit tracking
 *
 * @param options - Configuration options
 * @returns Preparation method info, mode state, limits, and utilities
 *
 * @example
 * ```ts
 * const {
 *   preparationMethod,
 *   isPreparedCaster,
 *   prepareSpellsMode,
 *   enterPrepareSpellsMode,
 *   getReactivePreparedCount
 * } = useSpellPreparation({
 *   stats,
 *   spellSlots,
 *   spellcastingClasses,
 *   validSpells,
 *   playStateStore,
 *   character
 * })
 * ```
 */
export function useSpellPreparation(options: UseSpellPreparationOptions) {
  const { stats, spellSlots, spellcastingClasses, validSpells, playStateStore, character } = options

  // ══════════════════════════════════════════════════════════════
  // PREPARATION METHOD
  // ══════════════════════════════════════════════════════════════

  /**
   * Top-level preparation method from character stats
   * Used for single-class display decisions
   */
  const preparationMethod = computed<PreparationMethod>(() =>
    (stats.value as { preparation_method?: PreparationMethod } | null)?.preparation_method ?? null
  )

  /**
   * Whether this is a spellbook caster (wizard) - for spellbook view
   */
  const isSpellbookCaster = computed(() => preparationMethod.value === 'spellbook')

  /**
   * Whether to show preparation UI (counter, toggle) for single-class
   * Known casters don't need preparation - hide these UI elements
   */
  const showPreparationUI = computed(() => preparationMethod.value !== 'known')

  /**
   * Can this caster prepare spells? (prepared or spellbook casters)
   * Known casters (Sorcerer, Warlock, Bard) don't prepare spells.
   */
  const isPreparedCaster = computed(() =>
    preparationMethod.value === 'prepared' || preparationMethod.value === 'spellbook'
  )

  /**
   * Get preparation method for a specific class (multiclass support)
   * Falls back to top-level preparation method if not available per-class
   */
  function getClassPreparationMethod(classSlug: string): PreparationMethod {
    const classInfo = stats.value?.spellcasting?.[classSlug]
    return classInfo?.preparation_method ?? preparationMethod.value
  }

  // ══════════════════════════════════════════════════════════════
  // PREPARE MODE STATE
  // ══════════════════════════════════════════════════════════════

  /**
   * Mode toggle for prepared casters
   * Stores the class slug when in prepare mode, null otherwise
   * Supports both single-class and multiclass prepared casters
   */
  const prepareSpellsMode = ref<string | null>(null)

  /**
   * Check if prepare spells mode is active for a specific class
   */
  function isPrepareSpellsModeFor(classSlug: string): boolean {
    return prepareSpellsMode.value === classSlug
  }

  /**
   * Enter prepare spells mode for a specific class
   */
  function enterPrepareSpellsMode(classSlug: string): void {
    prepareSpellsMode.value = classSlug
  }

  /**
   * Exit prepare spells mode
   */
  function exitPrepareSpellsMode(): void {
    prepareSpellsMode.value = null
  }

  // ══════════════════════════════════════════════════════════════
  // SPELL LEVEL LIMITS
  // ══════════════════════════════════════════════════════════════

  /**
   * Get max castable spell level for this character
   * Based on available spell slots
   */
  const maxCastableLevel = computed(() => {
    if (!spellSlots.value?.slots) return 1
    const levels = Object.keys(spellSlots.value.slots).map(Number)
    return Math.max(...levels, 1)
  })

  /**
   * Get class level for a specific class from character data
   */
  function getClassLevel(classSlug: string): number {
    const classEntry = character.value?.classes?.find(
      (c: { class_slug: string }) => c.class_slug === classSlug
    )
    return classEntry?.level ?? 1
  }

  /**
   * Get max spell level a class can LEARN/COPY based on class level
   * For full casters (wizard, cleric, etc.): ceil(classLevel / 2)
   * This is different from max castable level (based on multiclass spell slots)
   */
  function getClassMaxSpellLevel(classSlug: string): number {
    const classLevel = getClassLevel(classSlug)
    // Full caster progression: level 1-2 = 1st, 3-4 = 2nd, 5-6 = 3rd, etc.
    return Math.min(Math.ceil(classLevel / 2), 9)
  }

  // ══════════════════════════════════════════════════════════════
  // PREPARATION LIMITS & COUNTS
  // ══════════════════════════════════════════════════════════════

  /**
   * Check if we have per-class preparation limits available
   */
  const hasPerClassLimits = computed(() =>
    spellSlots.value?.preparation_limits && Object.keys(spellSlots.value.preparation_limits).length > 0
  )

  /**
   * Get per-class preparation limit for a given class slug
   */
  function getClassPreparationLimit(classSlug: string): { limit: number; prepared: number } | null {
    return spellSlots.value?.preparation_limits?.[classSlug] ?? null
  }

  /**
   * Get REACTIVE prepared count for a specific class
   * Computes from store's preparedSpellIds instead of API data for real-time updates
   */
  function getReactivePreparedCount(classSlug: string): number {
    // Filter spells by class and check if they're in the store's prepared set
    const classSpells = validSpells.value.filter(s => s.class_slug === classSlug)
    return classSpells.filter(s =>
      playStateStore.preparedSpellIds.has(s.id) && !s.is_always_prepared
    ).length
  }

  /**
   * Check if a specific class is at its preparation limit
   * Uses REACTIVE prepared count from store for real-time limit checking
   */
  function isAtClassPreparationLimit(classSlug: string): boolean {
    const limit = getClassPreparationLimit(classSlug)
    if (!limit) return false
    // Use reactive count instead of API data
    return getReactivePreparedCount(classSlug) >= limit.limit
  }

  /**
   * REACTIVE total prepared count across all classes
   * Computes from store's preparedSpellIds for real-time updates
   */
  const reactiveTotalPreparedCount = computed(() => {
    return validSpells.value.filter(s =>
      playStateStore.preparedSpellIds.has(s.id) && !s.is_always_prepared
    ).length
  })

  // ══════════════════════════════════════════════════════════════
  // CROSS-CLASS TRACKING
  // ══════════════════════════════════════════════════════════════

  /**
   * Map of spell_slug -> class name for spells prepared by each class
   * Used to show "Already prepared as X" for cross-class duplicates
   */
  const preparedByClassMap = computed(() => {
    const map = new Map<string, string>() // spell_slug -> class name
    for (const spell of validSpells.value) {
      if (spell.is_prepared && spell.class_slug) {
        // Extract class name from slug (e.g., "phb:wizard" -> "Wizard")
        const name = spell.class_slug.split(':')[1] ?? spell.class_slug
        map.set(spell.spell_slug, name.charAt(0).toUpperCase() + name.slice(1))
      }
    }
    return map
  })

  /**
   * Check if a spell is prepared by a DIFFERENT class than the one passed
   * @param spellSlug - The spell's slug to check
   * @param currentClassSlug - The class we're currently viewing
   * @returns The class name if prepared by another class, null otherwise
   */
  function getOtherClassPrepared(spellSlug: string, currentClassSlug: string | null): string | null {
    const preparedClass = preparedByClassMap.value.get(spellSlug)
    if (!preparedClass) return null
    // Extract current class name for comparison
    const currentClassName = currentClassSlug
      ? (currentClassSlug.split(':')[1] ?? currentClassSlug).charAt(0).toUpperCase()
      + (currentClassSlug.split(':')[1] ?? currentClassSlug).slice(1)
      : null
    // Return null if it's the same class
    if (preparedClass === currentClassName) return null
    return preparedClass
  }

  // ══════════════════════════════════════════════════════════════
  // SPELLBOOK-SPECIFIC
  // ══════════════════════════════════════════════════════════════

  /**
   * Find the spellbook caster class (wizard) for multiclass support
   * Returns the class info for the wizard class, or null if none
   */
  const spellbookClass = computed(() =>
    spellcastingClasses.value.find(sc => sc.info.preparation_method === 'spellbook') ?? null
  )

  /**
   * Get preparation limit for the spellbook class
   * Falls back to combined limit if per-class not available
   */
  const spellbookPreparationLimit = computed(() => {
    if (!spellbookClass.value) return spellSlots.value?.preparation_limit ?? 0
    const perClassLimit = getClassPreparationLimit(spellbookClass.value.slug)
    return perClassLimit?.limit ?? spellSlots.value?.preparation_limit ?? 0
  })

  /**
   * Get prepared count for the spellbook class
   * Falls back to combined count if per-class not available
   */
  const spellbookPreparedCount = computed(() => {
    if (!spellbookClass.value) return spellSlots.value?.prepared_count ?? 0
    const perClassLimit = getClassPreparationLimit(spellbookClass.value.slug)
    return perClassLimit?.prepared ?? spellSlots.value?.prepared_count ?? 0
  })

  return {
    // Preparation method info
    preparationMethod,
    isSpellbookCaster,
    isPreparedCaster,
    showPreparationUI,

    // Prepare mode state
    prepareSpellsMode,
    isPrepareSpellsModeFor,
    enterPrepareSpellsMode,
    exitPrepareSpellsMode,

    // Spell level limits
    maxCastableLevel,
    getClassMaxSpellLevel,

    // Preparation limits & counts
    hasPerClassLimits,
    getClassPreparationLimit,
    getReactivePreparedCount,
    isAtClassPreparationLimit,
    reactiveTotalPreparedCount,

    // Per-class method lookup
    getClassPreparationMethod,

    // Cross-class tracking
    getOtherClassPrepared,

    // Spellbook-specific (wizard)
    spellbookClass,
    spellbookPreparationLimit,
    spellbookPreparedCount
  }
}
