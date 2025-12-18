/**
 * Composable for multiclass spellcasting class detection and tab generation
 *
 * Extracts spellcasting classes from character stats and generates
 * tab items for the multiclass spellcaster UI.
 *
 * @see Issue #780 - Extract multiclass spellcasting logic to composables
 */

import type { Ref, ComputedRef } from 'vue'
import type { CharacterStats, ClassSpellcastingInfo } from '~/types/character'
import { getClassColor, getClassName } from '~/utils/classColors'

/**
 * Represents a spellcasting class with display info
 */
export interface SpellcastingClass {
  /** Class slug (e.g., "phb:wizard") */
  slug: string
  /** Safe slot name for UTabs (e.g., "phb-wizard") */
  slotName: string
  /** Display name (e.g., "Wizard") */
  name: string
  /** Tailwind color class (e.g., "arcane") */
  color: string
  /** Full spellcasting info from API */
  info: ClassSpellcastingInfo
}

/**
 * Tab item structure for UTabs component
 */
export interface SpellcastingTabItem {
  label: string
  slot: string
  value: string
}

/**
 * Extract spellcasting classes from character stats and generate tab items
 *
 * @param stats - Reactive reference to character stats
 * @returns Spellcasting classes, multiclass detection, and tab items
 *
 * @example
 * ```ts
 * const { spellcastingClasses, isMulticlassSpellcaster, tabItems } = useSpellcastingTabs(stats)
 *
 * // Use with UTabs
 * <UTabs :items="tabItems" default-value="all-spells">
 *   <template v-for="sc in spellcastingClasses" #[sc.slotName]>
 *     ...
 *   </template>
 * </UTabs>
 * ```
 */
export function useSpellcastingTabs(stats: Ref<CharacterStats | null>) {
  /**
   * Extract spellcasting classes from stats
   * Returns array of { slug, slotName, name, color, info } for each spellcasting class
   */
  const spellcastingClasses = computed<SpellcastingClass[]>(() => {
    const spellcasting = stats.value?.spellcasting
    if (!spellcasting) return []

    return Object.entries(spellcasting).map(([slug, info]) => ({
      slug,
      slotName: slug.replace(':', '-'), // Safe slot name (e.g., "phb-wizard")
      name: getClassName(slug),
      color: getClassColor(slug),
      info
    }))
  })

  /**
   * Is this a multiclass spellcaster? (more than one spellcasting class)
   */
  const isMulticlassSpellcaster = computed(() => spellcastingClasses.value.length > 1)

  /**
   * Primary spellcasting class (first entry, for single-class display)
   */
  const primarySpellcasting = computed(() => spellcastingClasses.value[0] ?? null)

  /**
   * Build tab items for multiclass view
   * Each item has a `value` for UTabs to track selection
   * "All Prepared Spells" is first (default) - shows combined prepared spells
   */
  const tabItems = computed<SpellcastingTabItem[]>(() => {
    if (spellcastingClasses.value.length === 0) return []

    const items = spellcastingClasses.value.map(sc => ({
      label: sc.name,
      slot: sc.slotName,
      value: sc.slotName
    }))

    // Add "All Prepared Spells" tab at the START - shows only prepared/ready spells
    items.unshift({ label: 'All Prepared Spells', slot: 'all-spells', value: 'all-spells' })

    return items
  })

  return {
    spellcastingClasses,
    isMulticlassSpellcaster,
    primarySpellcasting,
    tabItems
  }
}
