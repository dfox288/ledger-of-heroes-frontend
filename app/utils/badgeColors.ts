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
 * Includes both semantic colors and entity-specific colors
 */
export type BadgeColor
  // Semantic colors
  = | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'error'
  // Entity colors (main types)
    | 'spell'
    | 'item'
    | 'race'
    | 'class'
    | 'background'
    | 'feat'
    | 'monster'
  // Entity colors (reference types)
    | 'ability'
    | 'condition'
    | 'damage'
    | 'itemtype'
    | 'language'
    | 'proficiency'
    | 'size'
    | 'skill'
    | 'school'
    | 'source'
  // Neutral
    | 'neutral'

/**
 * Valid NuxtUI badge size values
 */
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg'

/**
 * Valid NuxtUI badge variant values
 */
export type BadgeVariant = 'solid' | 'outline' | 'soft' | 'subtle'

/**
 * Get badge color for spell level (0-9)
 * Used on spell list cards for compact display
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
 * Get badge color for spell level on detail pages
 * Uses more granular color scale for hero headers
 *
 * Mapping per Issue #78:
 * - Cantrip (0): neutral (gray)
 * - 1-2: success (green)
 * - 3-4: info (blue)
 * - 5-6: primary (purple)
 * - 7-8: warning (orange)
 * - 9: error (red)
 *
 * @param level - Spell level (0 = cantrip, 1-9 = spell levels)
 * @returns NuxtUI v4 semantic color name
 *
 * @example
 * getSpellLevelColorDetailed(0) // 'neutral' (cantrip - gray)
 * getSpellLevelColorDetailed(1) // 'success' (green)
 * getSpellLevelColorDetailed(3) // 'info' (blue)
 * getSpellLevelColorDetailed(5) // 'primary' (purple)
 * getSpellLevelColorDetailed(9) // 'error' (red)
 */
export function getSpellLevelColorDetailed(level: number): BadgeColor {
  if (level === 0) return 'neutral' // Cantrip (gray)
  if (level <= 2) return 'success' // 1-2 (green)
  if (level <= 4) return 'info' // 3-4 (blue)
  if (level <= 6) return 'primary' // 5-6 (purple)
  if (level <= 8) return 'warning' // 7-8 (orange)
  return 'error' // 9 (red)
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

/**
 * Get color for class counter reset timing
 */
export function getResetTimingColor(timing: string): BadgeColor {
  switch (timing) {
    case 'Short Rest':
      return 'info'
    case 'Long Rest':
      return 'primary'
    case 'Does Not Reset':
      return 'neutral'
    default:
      return 'neutral'
  }
}

/**
 * Get color for condition effect type
 */
export function getConditionEffectColor(effectType: string): BadgeColor {
  switch (effectType) {
    case 'immunity':
      return 'success'
    case 'resistance':
      return 'info'
    case 'vulnerability':
      return 'error'
    case 'inflicts':
      return 'warning'
    default:
      return 'neutral'
  }
}

/**
 * Get badge color for damage types
 *
 * @param damageType - Damage type name (case-insensitive)
 * @returns NuxtUI v4 semantic color name
 *
 * Damage Types:
 * - Fire → error (red/orange)
 * - Cold → info (blue)
 * - Lightning → warning (yellow)
 * - Acid → success (green)
 * - Poison → primary (purple)
 * - Necrotic → neutral (dark)
 * - Radiant → warning (gold)
 * - Force → info (blue-purple)
 * - Psychic → primary (pink/purple)
 * - Thunder → info (gray-blue)
 * - Bludgeoning/Piercing/Slashing → neutral (gray)
 *
 * @example
 * getDamageTypeColor('Fire')     // 'error'
 * getDamageTypeColor('cold')     // 'info'
 * getDamageTypeColor('Lightning') // 'warning'
 */
export function getDamageTypeColor(damageType: string): BadgeColor {
  const type = damageType.toLowerCase()

  // Fire (red/orange)
  if (type === 'fire') return 'error'

  // Cold (blue)
  if (type === 'cold') return 'info'

  // Lightning (yellow/amber)
  if (type === 'lightning') return 'warning'

  // Acid (green)
  if (type === 'acid') return 'success'

  // Poison (purple)
  if (type === 'poison') return 'primary'

  // Necrotic (dark/neutral)
  if (type === 'necrotic') return 'neutral'

  // Radiant (gold/amber)
  if (type === 'radiant') return 'warning'

  // Force (blue-purple)
  if (type === 'force') return 'info'

  // Psychic (pink/purple)
  if (type === 'psychic') return 'primary'

  // Thunder (gray-blue)
  if (type === 'thunder') return 'info'

  // Physical damage types (gray)
  if (type === 'bludgeoning' || type === 'piercing' || type === 'slashing') {
    return 'neutral'
  }

  // Default fallback
  return 'neutral'
}
