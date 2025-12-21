import type {
  DamageDefense,
  ConditionAdvantage,
  ConditionDisadvantage,
  ConditionImmunity
} from '~/types/character'

/**
 * Defense Formatters
 *
 * Utilities for formatting defense-related data for display in badges.
 * Used by DefensesPanel and potentially other components that display
 * character resistances, immunities, and condition effects.
 *
 * @see DefensesPanel.vue
 */

/**
 * Format damage defense badge text
 * @returns "Type (Source)" or "Type (Source) - condition text"
 *
 * @example
 * formatDamageDefense({ type: 'Fire', source: 'Red Dragonborn', condition: null })
 * // => "Fire (Red Dragonborn)"
 *
 * formatDamageDefense({ type: 'Bludgeoning', source: 'Rage', condition: 'from nonmagical attacks' })
 * // => "Bludgeoning (Rage) - from nonmagical attacks"
 */
export function formatDamageDefense(defense: DamageDefense): string {
  const base = `${defense.type} (${defense.source})`
  return defense.condition ? `${base} - ${defense.condition}` : base
}

/**
 * Format condition advantage badge text
 * @returns "vs Condition (Source)"
 *
 * @example
 * formatConditionAdvantage({ condition: 'Poisoned', effect: '...', source: 'Dwarf' })
 * // => "vs Poisoned (Dwarf)"
 */
export function formatConditionAdvantage(advantage: ConditionAdvantage): string {
  return `vs ${advantage.condition} (${advantage.source})`
}

/**
 * Format condition disadvantage badge text
 * @returns "vs Condition (Source)"
 *
 * @example
 * formatConditionDisadvantage({ condition: 'Stunned', effect: '...', source: 'Curse' })
 * // => "vs Stunned (Curse)"
 */
export function formatConditionDisadvantage(disadvantage: ConditionDisadvantage): string {
  return `vs ${disadvantage.condition} (${disadvantage.source})`
}

/**
 * Format condition immunity badge text
 * @returns "Condition (Source)"
 *
 * @example
 * formatConditionImmunity({ condition: 'Poisoned', effect: '...', source: 'Dwarf' })
 * // => "Poisoned (Dwarf)"
 */
export function formatConditionImmunity(immunity: ConditionImmunity): string {
  return `${immunity.condition} (${immunity.source})`
}
