// app/utils/classColors.ts
/**
 * Class color utilities for multiclass spellcasting UI
 *
 * Provides consistent color mapping for spellcasting class identification
 * in tabs, badges, and other UI elements.
 *
 * @see Issue #631 - Multiclass spellcasting support
 */

import type { ClassSpellcastingInfo } from '~/types/character'

/**
 * Extract the primary (first) spellcasting info from the keyed object
 *
 * For single-class casters, returns the only entry.
 * For multiclass casters, returns the first entry (arbitrary but consistent).
 *
 * @param spellcasting - Spellcasting object keyed by class slug
 * @returns Primary spellcasting info or null if not a spellcaster
 */
export function getPrimarySpellcasting(
  spellcasting: Record<string, ClassSpellcastingInfo> | null | undefined
): { slug: string, info: ClassSpellcastingInfo } | null {
  if (!spellcasting) return null

  const entries = Object.entries(spellcasting)
  if (entries.length === 0) return null

  const first = entries[0]
  if (!first) return null

  return { slug: first[0], info: first[1] }
}

/**
 * Tailwind color names mapped to each spellcasting class
 */
export const CLASS_COLORS: Record<string, string> = {
  wizard: 'violet',
  cleric: 'amber',
  druid: 'emerald',
  bard: 'pink',
  sorcerer: 'sky',
  warlock: 'purple',
  paladin: 'yellow',
  ranger: 'green',
  artificer: 'teal',
  fighter: 'slate', // Eldritch Knight
  rogue: 'indigo' // Arcane Trickster
}

/**
 * Get the Tailwind color name for a class
 *
 * @param classSlug - Full class slug (e.g., "phb:wizard") or class name
 * @returns Tailwind color name (e.g., "violet")
 *
 * @example
 * getClassColor('phb:wizard') // 'violet'
 * getClassColor('wizard') // 'violet'
 * getClassColor('unknown') // 'gray'
 */
export function getClassColor(classSlug: string): string {
  const className = classSlug.split(':').pop()?.toLowerCase() ?? ''
  return CLASS_COLORS[className] ?? 'gray'
}

/**
 * Class abbreviations for compact display
 */
const CLASS_ABBREVIATIONS: Record<string, string> = {
  wizard: 'WIZ',
  cleric: 'CLR',
  druid: 'DRU',
  bard: 'BRD',
  sorcerer: 'SOR',
  warlock: 'WLK',
  paladin: 'PAL',
  ranger: 'RNG',
  artificer: 'ART',
  fighter: 'FTR',
  rogue: 'ROG'
}

/**
 * Get the abbreviated class name for badges
 *
 * @param classSlug - Full class slug (e.g., "phb:wizard") or class name
 * @returns 3-letter abbreviation (e.g., "WIZ")
 *
 * @example
 * getClassAbbreviation('phb:wizard') // 'WIZ'
 * getClassAbbreviation('cleric') // 'CLR'
 */
export function getClassAbbreviation(classSlug: string): string {
  const className = classSlug.split(':').pop()?.toLowerCase() ?? ''
  return CLASS_ABBREVIATIONS[className] ?? className.slice(0, 3).toUpperCase()
}

/**
 * Get the display name for a class from its slug
 *
 * @param classSlug - Full class slug (e.g., "phb:wizard")
 * @returns Capitalized class name (e.g., "Wizard")
 *
 * @example
 * getClassName('phb:wizard') // 'Wizard'
 * getClassName('tce:artificer') // 'Artificer'
 */
export function getClassName(classSlug: string): string {
  const className = classSlug.split(':').pop() ?? ''
  return className.charAt(0).toUpperCase() + className.slice(1).toLowerCase()
}
