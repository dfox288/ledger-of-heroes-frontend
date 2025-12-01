import { computed, isRef, ref, type ComputedRef, type Ref } from 'vue'
import type { Spell } from '~/types/api/entities'
import type { components } from '~/types/api/generated'

type SpellEffectResource = components['schemas']['SpellEffectResource']
type ClassResource = components['schemas']['ClassResource']

/**
 * Return type for useSpellDetail composable
 */
export interface UseSpellDetailReturn {
  /** Spell data from API */
  entity: ComputedRef<Spell | null>

  /** Loading state */
  pending: Ref<boolean>

  /** Error state */
  error: Ref<unknown>

  /** Refresh spell data */
  refresh: () => Promise<void>

  /** Formatted spell level text (e.g., "3rd-level Evocation" or "Evocation cantrip") */
  spellLevelText: ComputedRef<string>

  /** Whether spell has multiple scaling effects */
  hasScalingEffects: ComputedRef<boolean>

  /** Type of scaling: spell_slot_level or character_level */
  scalingType: ComputedRef<'spell_slot_level' | 'character_level' | null>

  /** Base damage effect from spell */
  baseDamage: ComputedRef<SpellEffectResource | null>

  /** Whether combat mechanics section should be visible */
  combatMechanicsVisible: ComputedRef<boolean>

  /** Classes grouped into base classes and subclasses */
  groupedClasses: ComputedRef<{ baseClasses: ClassResource[], subclasses: ClassResource[] }>

  /** Parsed area of effect into structured data */
  parsedAreaOfEffect: ComputedRef<{ type: string, size: number } | null>
}

/**
 * Composable for spell detail pages.
 *
 * Provides data fetching and computed properties that:
 * - Fetch spell data from API
 * - Format spell level text (e.g., "3rd-level Evocation" or "Evocation cantrip")
 * - Detect and categorize spell scaling effects
 * - Extract base damage information
 * - Determine if combat mechanics section should be visible
 * - Group classes into base classes and subclasses
 * - Parse area of effect into structured data
 *
 * @example
 * ```typescript
 * const slug = computed(() => route.params.slug as string)
 * const {
 *   entity,
 *   pending,
 *   error,
 *   spellLevelText,
 *   hasScalingEffects,
 *   scalingType,
 *   baseDamage,
 *   combatMechanicsVisible,
 *   groupedClasses,
 *   parsedAreaOfEffect
 * } = useSpellDetail(slug)
 * ```
 */
export function useSpellDetail(slug: Ref<string> | string): UseSpellDetailReturn {
  const slugRef = isRef(slug) ? slug : ref(slug)

  // Fetch spell data with caching and SEO
  const { data: entity, loading: pending, error, refresh } = useEntityDetail<Spell>({
    slug: slugRef.value,
    endpoint: '/spells',
    cacheKey: 'spell',
    seo: {
      titleTemplate: (name: string) => `${name} - D&D 5e Spell`,
      descriptionExtractor: (spell: unknown) => {
        const s = spell as Spell
        return s.description?.substring(0, 160) ?? ''
      },
      fallbackTitle: 'Spell - D&D 5e Compendium'
    }
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Spell Level Text
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Formatted spell level text
   * Examples: "3rd-level Evocation", "Evocation cantrip"
   */
  const spellLevelText = computed(() => {
    const level = entity.value?.level
    const schoolName = entity.value?.school?.name

    if (!level && level !== 0) return 'Unknown Spell'
    if (!schoolName) return 'Unknown Spell'

    if (level === 0) {
      return `${schoolName} cantrip`
    }

    const levelSuffix = ['th', 'st', 'nd', 'rd'][level % 10 > 3 ? 0 : level % 10]
    return `${level}${levelSuffix}-level ${schoolName}`
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Scaling Detection
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Does this spell have scaling effects?
   * True if effects have different min_spell_slot values
   */
  const hasScalingEffects = computed(() => {
    const effects = entity.value?.effects
    if (!effects || effects.length === 0) return false

    // Has scaling if any effect has different min_spell_slot values
    const slotLevels = new Set(effects.map(e => e.min_spell_slot).filter(s => s != null))
    return slotLevels.size > 1
  })

  /**
   * Type of scaling: spell_slot_level or character_level
   * Returns null if no scaling type is set
   */
  const scalingType = computed((): 'spell_slot_level' | 'character_level' | null => {
    const effects = entity.value?.effects
    if (!effects || effects.length === 0) return null

    // Check if any effect has scaling_type set
    const scalingTypes = effects
      .map(e => e.scaling_type)
      .filter(t => t != null)

    if (scalingTypes.length === 0) return null

    // Return the first scaling type found
    return scalingTypes[0] as 'spell_slot_level' | 'character_level'
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Damage Extraction
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Base damage effect (first damage effect found)
   */
  const baseDamage = computed((): SpellEffectResource | null => {
    const effects = entity.value?.effects
    if (!effects || effects.length === 0) return null

    // Find first damage effect
    return effects.find(e => e.effect_type === 'damage') || null
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Combat Mechanics Visibility
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Should the combat mechanics section be visible?
   * True if spell has effects, saving throws, or area of effect
   */
  const combatMechanicsVisible = computed(() => {
    const hasEffects = (entity.value?.effects?.length ?? 0) > 0
    const hasSavingThrows = (entity.value?.saving_throws?.length ?? 0) > 0
    const hasAreaOfEffect = !!entity.value?.area_of_effect

    return hasEffects || hasSavingThrows || hasAreaOfEffect
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Class Grouping
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Classes grouped into base classes and subclasses
   */
  const groupedClasses = computed((): { baseClasses: ClassResource[], subclasses: ClassResource[] } => {
    const classes = entity.value?.classes
    if (!classes) return { baseClasses: [], subclasses: [] }

    const baseClasses: ClassResource[] = []
    const subclasses: ClassResource[] = []

    for (const cls of classes) {
      // is_base_class is a string "0" or "1" in the API
      if (cls.is_base_class === '1') {
        baseClasses.push(cls)
      } else {
        subclasses.push(cls)
      }
    }

    return { baseClasses, subclasses }
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Area of Effect Parsing
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Parsed area of effect into structured data
   * API returns: { type: "sphere", size: 20 }
   */
  const parsedAreaOfEffect = computed((): { type: string, size: number } | null => {
    const areaOfEffect = entity.value?.area_of_effect
    if (!areaOfEffect) return null

    // API returns object directly: { type: "sphere", size: 20 }
    // Cast to unknown first to handle both object and legacy string formats
    const aoe = areaOfEffect as unknown

    if (typeof aoe === 'object' && aoe !== null) {
      const parsed = aoe as { type?: string, size?: number }
      if (parsed.type && typeof parsed.size === 'number') {
        return {
          type: parsed.type,
          size: parsed.size
        }
      }
    }

    // Fallback: parse string patterns like "20-foot radius" (legacy format)
    if (typeof aoe === 'string') {
      const match = aoe.match(/^(\d+)-foot\s+(.+)$/i)
      if (!match) return null

      const size = parseInt(match[1] ?? '0', 10)
      if (isNaN(size)) return null

      return {
        size,
        type: match[2] ?? ''
      }
    }

    return null
  })

  return {
    // Core
    entity,
    pending,
    error,
    refresh,

    // Computed Properties
    spellLevelText,
    hasScalingEffects,
    scalingType,
    baseDamage,
    combatMechanicsVisible,
    groupedClasses,
    parsedAreaOfEffect
  }
}
