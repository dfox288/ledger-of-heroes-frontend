/**
 * Spell Grouping Composable
 *
 * Provides utilities for grouping spells by level, a common pattern
 * used across multiple spell-related components.
 *
 * @see Issue #778 - Extract spell grouping logic to composable
 */
import type { CharacterSpell } from '~/types/character'

/**
 * Generic function to group any spell-like objects by level.
 *
 * Works with both CharacterSpell and raw Spell objects by accepting
 * accessor functions for level and name.
 *
 * @param items - Array of spell-like objects
 * @param getLevel - Function to extract level from item
 * @param getName - Function to extract name for sorting
 * @returns Record mapping level number to sorted array of items
 *
 * @example
 * // For raw Spell objects
 * const grouped = groupByLevel(spells, s => s.level, s => s.name)
 *
 * // For CharacterSpell objects
 * const grouped = groupByLevel(spells, s => s.spell!.level, s => s.spell!.name)
 */
export function groupByLevel<T>(
  items: T[],
  getLevel: (item: T) => number,
  getName: (item: T) => string
): Record<number, T[]> {
  const grouped: Record<number, T[]> = {}

  for (const item of items) {
    const level = getLevel(item)
    if (!grouped[level]) grouped[level] = []
    grouped[level].push(item)
  }

  // Sort alphabetically within each level
  for (const level in grouped) {
    grouped[level]!.sort((a, b) => getName(a).localeCompare(getName(b)))
  }

  return grouped
}

/**
 * Group spells by their level and sort alphabetically within each level.
 *
 * @param spells - Array of CharacterSpell objects (must have valid spell data)
 * @returns Record mapping level number to sorted array of spells
 */
export function groupSpellsByLevel(spells: CharacterSpell[]): Record<number, CharacterSpell[]> {
  const grouped: Record<number, CharacterSpell[]> = {}

  for (const spell of spells) {
    if (!spell.spell) continue // Skip spells with missing spell data
    const level = spell.spell.level
    if (!grouped[level]) grouped[level] = []
    grouped[level].push(spell)
  }

  // Sort alphabetically within each level
  for (const level in grouped) {
    grouped[level]!.sort((a, b) => a.spell!.name.localeCompare(b.spell!.name))
  }

  return grouped
}

/**
 * Get sorted level keys from a grouped spells object.
 *
 * @param grouped - Record mapping level to spells (from groupSpellsByLevel or groupByLevel)
 * @returns Array of level numbers sorted numerically (0, 1, 2, ...)
 */
export function getSortedLevels<T>(grouped: Record<number, T[]>): number[] {
  return Object.keys(grouped).map(Number).sort((a, b) => a - b)
}

/**
 * Reactive spell grouping composable.
 *
 * Takes a reactive spell source (ref or computed) and returns
 * reactive grouped spells and sorted levels.
 *
 * @param spells - Ref or computed containing CharacterSpell array
 * @returns Object with spellsByLevel and sortedLevels computed refs
 *
 * @example
 * const { spellsByLevel, sortedLevels } = useSpellGrouping(validSpells)
 *
 * // In template:
 * <div v-for="level in sortedLevels" :key="level">
 *   <div v-for="spell in spellsByLevel[level]" :key="spell.id">
 *     {{ spell.spell.name }}
 *   </div>
 * </div>
 */
export function useSpellGrouping(spells: Ref<CharacterSpell[]> | ComputedRef<CharacterSpell[]>) {
  const spellsByLevel = computed(() => groupSpellsByLevel(spells.value))
  const sortedLevels = computed(() => getSortedLevels(spellsByLevel.value))

  return {
    spellsByLevel,
    sortedLevels
  }
}
