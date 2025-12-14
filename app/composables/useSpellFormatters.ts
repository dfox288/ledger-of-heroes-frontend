/**
 * Spell formatting utilities
 *
 * Provides reusable functions for formatting spell-related values
 * like level ordinals and modifiers.
 *
 * @see Issue #556 - Spells Tab
 */

/**
 * Format spell level as ordinal or "Cantrip"
 *
 * @example
 * formatSpellLevel(0) // "Cantrip"
 * formatSpellLevel(1) // "1st"
 * formatSpellLevel(3) // "3rd"
 * formatSpellLevel(11) // "11th"
 */
export function formatSpellLevel(level: number): string {
  if (level === 0) return 'Cantrip'

  // Handle 11th, 12th, 13th specially (all use 'th')
  if (level >= 11 && level <= 13) {
    return `${level}th`
  }

  const suffixes = ['th', 'st', 'nd', 'rd']
  const lastDigit = level % 10
  const suffix = suffixes[lastDigit] || 'th'
  return `${level}${suffix}`
}

/**
 * Composable wrapper for spell formatters
 *
 * @example
 * const { formatSpellLevel } = useSpellFormatters()
 */
export function useSpellFormatters() {
  return {
    formatSpellLevel
  }
}
