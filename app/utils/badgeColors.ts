/**
 * Badge Color Utilities
 *
 * Centralized color mapping functions for entity badges
 * using NuxtUI v4 semantic color system.
 *
 * Color Palette:
 * - error (red): High-level spells, legendary items, weapons
 * - warning (amber): Mid-high spells, rare items, tools
 * - primary (purple/teal): Cantrips, magical items, wondrous items
 * - info (blue): Low-level spells, armor, common magic
 * - success (green): Potions, consumables, uncommon items
 * - neutral (gray): Common items, default fallback
 */

/**
 * Valid NuxtUI v4 badge color names
 */
export type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

/**
 * Get badge color for spell level (0-9)
 *
 * @param level - Spell level (0 = cantrip, 1-9 = spell levels)
 * @returns NuxtUI v4 semantic color name
 *
 * @example
 * getSpellLevelColor(0) // 'primary' (cantrip)
 * getSpellLevelColor(3) // 'info' (low-mid level)
 * getSpellLevelColor(7) // 'warning' (high level)
 * getSpellLevelColor(9) // 'error' (max level)
 */
export function getSpellLevelColor(level: number): BadgeColor {
  if (level === 0) return 'primary' // Cantrip
  if (level <= 3) return 'info' // Low-level (1-3)
  if (level <= 6) return 'warning' // Mid-level (4-6)
  return 'error' // High-level (7-9)
}

/**
 * Get badge color for spell school code
 *
 * @param schoolCode - School abbreviation (A, C, D, EN, EV, I, N, T)
 * @returns NuxtUI v4 semantic color name
 *
 * Schools:
 * - A (Abjuration): info
 * - C (Conjuration): primary
 * - D (Divination): info
 * - EN (Enchantment): warning
 * - EV (Evocation): error
 * - I (Illusion): primary
 * - N (Necromancy): neutral
 * - T (Transmutation): success
 *
 * @example
 * getSpellSchoolColor('EV') // 'error' (Evocation - destructive)
 * getSpellSchoolColor('A')  // 'info' (Abjuration - protective)
 */
export function getSpellSchoolColor(schoolCode: string): BadgeColor {
  const colorMap: Record<string, BadgeColor> = {
    A: 'info', // Abjuration
    C: 'primary', // Conjuration
    D: 'info', // Divination
    EN: 'warning', // Enchantment
    EV: 'error', // Evocation
    I: 'primary', // Illusion
    N: 'neutral', // Necromancy
    T: 'success' // Transmutation
  }
  return colorMap[schoolCode] || 'info'
}

/**
 * Get badge color for item rarity
 *
 * @param rarity - Item rarity (case-insensitive)
 * @returns NuxtUI v4 semantic color name
 *
 * Rarity Scale (progressive):
 * - Common → neutral (gray)
 * - Uncommon → success (green)
 * - Rare → info (blue)
 * - Very Rare → primary (teal/purple)
 * - Legendary → warning (amber/orange)
 * - Artifact → error (red)
 *
 * @example
 * getItemRarityColor('common')    // 'neutral'
 * getItemRarityColor('legendary') // 'warning'
 * getItemRarityColor('ARTIFACT')  // 'error' (case-insensitive)
 */
export function getItemRarityColor(rarity: string | null): BadgeColor {
  if (!rarity) return 'neutral'
  const colors: Record<string, BadgeColor> = {
    'common': 'neutral', // Gray - most basic
    'uncommon': 'success', // Green - slightly better
    'rare': 'info', // Blue - notable
    'very rare': 'primary', // Teal/cyan - very valuable
    'legendary': 'warning', // Orange/amber - extremely rare
    'artifact': 'error' // Red - unique/powerful
  }
  return colors[rarity.toLowerCase()] || 'neutral'
}

/**
 * Get badge color for item type based on category
 *
 * @param typeName - Item type name (case-insensitive)
 * @returns NuxtUI v4 semantic color name
 *
 * Categories:
 * - Weapons (sword, axe, bow, etc.) → error (red)
 * - Armor & Shields → info (blue)
 * - Tools & Equipment → warning (amber)
 * - Potions & Consumables → success (green)
 * - Wondrous Items & Magical → primary (teal/purple)
 * - Other → neutral (gray)
 *
 * @example
 * getItemTypeColor('Longsword')      // 'error' (weapon)
 * getItemTypeColor('Plate Armor')    // 'info' (armor)
 * getItemTypeColor('Potion of Healing') // 'success' (potion)
 */
export function getItemTypeColor(typeName: string): BadgeColor {
  const type = typeName.toLowerCase()

  // Weapons (red/error)
  if (type.includes('weapon') || type.includes('sword') || type.includes('axe')
    || type.includes('bow') || type.includes('dagger') || type.includes('mace')
    || type.includes('spear') || type.includes('hammer')) {
    return 'error'
  }

  // Armor (info/blue)
  if (type.includes('armor') || type.includes('shield')) {
    return 'info'
  }

  // Tools & Equipment (warning/amber)
  if (type.includes('tool') || type.includes('kit') || type.includes('instrument')) {
    return 'warning'
  }

  // Potions & Consumables (success/green)
  if (type.includes('potion') || type.includes('scroll') || type.includes('elixir')) {
    return 'success'
  }

  // Wondrous Items & Magical (primary/teal)
  if (type.includes('wondrous') || type.includes('ring') || type.includes('amulet')
    || type.includes('staff') || type.includes('rod') || type.includes('wand')) {
    return 'primary'
  }

  // Default
  return 'neutral'
}

/**
 * Get badge color for creature size code
 *
 * @param sizeCode - Size abbreviation (T, S, M, L, H, G)
 * @returns NuxtUI v4 semantic color name
 *
 * Size Scale (progressive):
 * - T (Tiny) → neutral (gray)
 * - S (Small) → success (green)
 * - M (Medium) → info (blue)
 * - L (Large) → warning (amber)
 * - H (Huge) → error (red)
 * - G (Gargantuan) → error (red)
 *
 * @example
 * getSizeColor('T') // 'neutral' (Tiny)
 * getSizeColor('M') // 'info' (Medium - standard)
 * getSizeColor('G') // 'error' (Gargantuan)
 */
export function getSizeColor(sizeCode: string): BadgeColor {
  const colors: Record<string, BadgeColor> = {
    T: 'neutral', // Tiny - gray
    S: 'success', // Small - green
    M: 'info', // Medium - blue (standard humanoid)
    L: 'warning', // Large - amber
    H: 'error', // Huge - red
    G: 'error' // Gargantuan - red
  }
  return colors[sizeCode] || 'info'
}

/**
 * Get badge color for Challenge Rating
 * Maps CR to D&D difficulty tiers:
 * - CR 0-4: Easy (success/green)
 * - CR 5-10: Medium (info/blue)
 * - CR 11-16: Hard (warning/yellow)
 * - CR 17+: Deadly (error/red)
 *
 * @param cr - Challenge Rating as string (supports fractions like "1/8", "1/4", "1/2")
 * @returns NuxtUI v4 semantic color name
 *
 * @example
 * getChallengeRatingColor('0') // 'success' (Easy)
 * getChallengeRatingColor('1/4') // 'success' (Easy - fractional)
 * getChallengeRatingColor('5') // 'info' (Medium)
 * getChallengeRatingColor('24') // 'error' (Deadly)
 */
export function getChallengeRatingColor(cr: string): BadgeColor {
  // CR can be fractional like "1/8", "1/4", "1/2" or whole numbers "1" through "30"
  let numericCR: number

  if (cr.includes('/')) {
    // Parse fractional CR (e.g., "1/8" -> 0.125)
    const stringParts = cr.split('/')

    // Check for empty parts (malformed fractions like "/4" or "1/")
    if (!stringParts[0] || !stringParts[1]) {
      return 'info' // Fallback for invalid CR
    }

    const parts = stringParts.map(Number)
    const numerator = parts[0]
    const denominator = parts[1]

    // Check for invalid numerator or denominator (undefined or NaN)
    if (numerator === undefined || isNaN(numerator) || denominator === undefined || isNaN(denominator)) {
      return 'info' // Fallback for invalid CR
    }

    // Check for division by zero
    if (denominator === 0) {
      return 'info' // Fallback for invalid CR
    }

    numericCR = numerator / denominator
  } else {
    numericCR = parseFloat(cr)
  }

  // Check for NaN (invalid input)
  if (isNaN(numericCR)) {
    return 'info' // Fallback for invalid CR
  }

  if (numericCR <= 4) return 'success' // Easy
  if (numericCR <= 10) return 'info' // Medium
  if (numericCR <= 16) return 'warning' // Hard
  return 'error' // Deadly
}
