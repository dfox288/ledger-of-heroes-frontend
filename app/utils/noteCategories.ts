/**
 * Note Categories Configuration
 *
 * Shared constant for note categories used across the application.
 * Combines category metadata (value, label, requiresTitle) with display ordering.
 *
 * @see Issue #803 - Extract note CATEGORIES to shared constant
 */

/** Constant for custom category selection value */
export const CUSTOM_CATEGORY_VALUE = '__custom__' as const

/**
 * Note category configuration
 *
 * Order follows D&D character sheet conventions:
 * 1. Character traits (personality, ideal, bond, flaw)
 * 2. Character description (backstory, appearance)
 * 3. Gameplay notes (campaign, session, quest)
 * 4. World-building (npc, location, lore, item)
 * 5. Custom categories (user-defined)
 */
/** Note category item shape */
export interface NoteCategoryItem {
  value: string
  label: string
  requiresTitle: boolean
  order: number
}

export const NOTE_CATEGORIES: NoteCategoryItem[] = [
  // Character traits (from background)
  { value: 'personality_trait', label: 'Personality Trait', requiresTitle: false, order: 1 },
  { value: 'ideal', label: 'Ideal', requiresTitle: false, order: 2 },
  { value: 'bond', label: 'Bond', requiresTitle: false, order: 3 },
  { value: 'flaw', label: 'Flaw', requiresTitle: false, order: 4 },
  // Character description
  { value: 'backstory', label: 'Backstory', requiresTitle: true, order: 5 },
  { value: 'appearance', label: 'Appearance', requiresTitle: false, order: 6 },
  // Gameplay notes
  { value: 'campaign', label: 'Campaign', requiresTitle: true, order: 7 },
  { value: 'session', label: 'Session', requiresTitle: true, order: 8 },
  { value: 'quest', label: 'Quest', requiresTitle: true, order: 9 },
  // World-building
  { value: 'npc', label: 'NPC', requiresTitle: true, order: 10 },
  { value: 'location', label: 'Location', requiresTitle: true, order: 11 },
  { value: 'lore', label: 'Lore', requiresTitle: true, order: 12 },
  { value: 'item', label: 'Item', requiresTitle: true, order: 13 },
  // Custom - shows text input for user-defined category
  { value: CUSTOM_CATEGORY_VALUE, label: 'Custom...', requiresTitle: true, order: 99 }
]

/** Type for predefined note category values */
export type NoteCategoryValue
  = | 'personality_trait'
    | 'ideal'
    | 'bond'
    | 'flaw'
    | 'backstory'
    | 'appearance'
    | 'campaign'
    | 'session'
    | 'quest'
    | 'npc'
    | 'location'
    | 'lore'
    | 'item'

/** Type for all category values including custom */
export type NoteCategory = NoteCategoryValue | typeof CUSTOM_CATEGORY_VALUE

/**
 * Get category order for sorting
 * Returns 99 for unknown categories (custom categories sort last, alphabetically)
 */
export function getCategoryOrder(category: string): number {
  const found = NOTE_CATEGORIES.find(c => c.value === category)
  return found?.order ?? 99
}

/**
 * Check if a category requires a title
 */
export function categoryRequiresTitle(category: string): boolean {
  if (category === CUSTOM_CATEGORY_VALUE) return true
  const found = NOTE_CATEGORIES.find(c => c.value === category)
  return found?.requiresTitle ?? false
}

/**
 * Check if a category value is in the predefined list
 * Returns false for CUSTOM_CATEGORY_VALUE and user-defined custom categories
 */
export function isPredefinedCategory(category: string): boolean {
  return NOTE_CATEGORIES.some(c => c.value === category && c.value !== CUSTOM_CATEGORY_VALUE)
}
