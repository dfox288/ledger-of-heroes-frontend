/**
 * Centralized filter options for entity list pages.
 * Static options that don't change based on API data.
 */

// =============================================================================
// SPELL OPTIONS
// =============================================================================

export const SPELL_LEVEL_OPTIONS = [
  { label: 'Cantrip', value: '0' },
  { label: '1st Level', value: '1' },
  { label: '2nd Level', value: '2' },
  { label: '3rd Level', value: '3' },
  { label: '4th Level', value: '4' },
  { label: '5th Level', value: '5' },
  { label: '6th Level', value: '6' },
  { label: '7th Level', value: '7' },
  { label: '8th Level', value: '8' },
  { label: '9th Level', value: '9' }
]

export const SPELL_TAG_OPTIONS = [
  { label: 'Ritual Caster', value: 'ritual-caster' },
  { label: 'Touch Spells', value: 'touch-spells' }
]

// =============================================================================
// MONSTER OPTIONS
// =============================================================================

export const CR_OPTIONS = [
  { label: 'CR 0', value: '0' },
  { label: 'CR 1/8', value: '0.125' },
  { label: 'CR 1/4', value: '0.25' },
  { label: 'CR 1/2', value: '0.5' },
  { label: 'CR 1', value: '1' },
  { label: 'CR 2', value: '2' },
  { label: 'CR 3', value: '3' },
  { label: 'CR 4', value: '4' },
  { label: 'CR 5', value: '5' },
  { label: 'CR 6', value: '6' },
  { label: 'CR 7', value: '7' },
  { label: 'CR 8', value: '8' },
  { label: 'CR 9', value: '9' },
  { label: 'CR 10', value: '10' },
  { label: 'CR 11', value: '11' },
  { label: 'CR 12', value: '12' },
  { label: 'CR 13', value: '13' },
  { label: 'CR 14', value: '14' },
  { label: 'CR 15', value: '15' },
  { label: 'CR 16', value: '16' },
  { label: 'CR 17', value: '17' },
  { label: 'CR 18', value: '18' },
  { label: 'CR 19', value: '19' },
  { label: 'CR 20', value: '20' },
  { label: 'CR 21', value: '21' },
  { label: 'CR 22', value: '22' },
  { label: 'CR 23', value: '23' },
  { label: 'CR 24', value: '24' },
  { label: 'CR 25', value: '25' },
  { label: 'CR 26', value: '26' },
  { label: 'CR 27', value: '27' },
  { label: 'CR 28', value: '28' },
  { label: 'CR 29', value: '29' },
  { label: 'CR 30', value: '30' }
]

export const MOVEMENT_TYPE_OPTIONS = [
  { label: 'Fly', value: 'fly' },
  { label: 'Swim', value: 'swim' },
  { label: 'Burrow', value: 'burrow' },
  { label: 'Climb', value: 'climb' },
  { label: 'Hover', value: 'hover' }
]

// =============================================================================
// ITEM OPTIONS
// =============================================================================

export const DAMAGE_DICE_OPTIONS = [
  { label: '1d4', value: '1d4' },
  { label: '1d6', value: '1d6' },
  { label: '1d8', value: '1d8' },
  { label: '1d10', value: '1d10' },
  { label: '1d12', value: '1d12' },
  { label: '2d6', value: '2d6' }
]

export const VERSATILE_DAMAGE_OPTIONS = [
  { label: '1d8', value: '1d8' },
  { label: '1d10', value: '1d10' },
  { label: '1d12', value: '1d12' }
]

export const RECHARGE_TIMING_OPTIONS = [
  { label: 'Dawn', value: 'dawn' },
  { label: 'Dusk', value: 'dusk' }
]

export const STRENGTH_REQ_OPTIONS = [
  { label: 'Any', value: null },
  { label: 'STR 13+', value: '13' },
  { label: 'STR 15+', value: '15' }
]

export const MAGIC_FILTER_OPTIONS = [
  { label: 'All Items', value: null },
  { label: 'Magic Items', value: 'true' },
  { label: 'Non-Magic Items', value: 'false' }
]

export const ITEM_RANGE_OPTIONS = [
  { label: 'Any', value: null },
  { label: 'Short (<30ft)', value: 'under-30' },
  { label: 'Medium (30-80ft)', value: '30-80' },
  { label: 'Long (80-150ft)', value: '80-150' },
  { label: 'Very Long (>150ft)', value: 'over-150' }
]

// =============================================================================
// RACE OPTIONS
// =============================================================================

export const SPEED_RANGE_OPTIONS = [
  { label: 'All Speeds', value: null },
  { label: 'Slow (≤25 ft)', value: 'slow' },
  { label: '30 ft', value: '30' },
  { label: 'Fast (≥35 ft)', value: 'fast' }
]

// =============================================================================
// RANGE PRESETS (for useMeilisearchFilters rangePreset type - future use)
// =============================================================================

export interface RangePreset {
  label: string
  /** Minimum value (null for open-ended: no lower bound, generates `field < max`) */
  min: number | null
  /** Maximum value (null for open-ended: no upper bound, generates `field >= min`) */
  max: number | null
}

// Monster AC ranges
export const AC_RANGE_PRESETS: Record<string, RangePreset> = {
  '10-14': { label: 'Low (10-14)', min: 10, max: 14 },
  '15-17': { label: 'Medium (15-17)', min: 15, max: 17 },
  '18-25': { label: 'High (18+)', min: 18, max: 25 }
}

export const MONSTER_AC_RANGE_OPTIONS = [
  { label: 'All AC', value: null },
  { label: 'Low (10-14)', value: '10-14' },
  { label: 'Medium (15-17)', value: '15-17' },
  { label: 'High (18+)', value: '18-25' }
]

// Monster HP ranges
export const HP_RANGE_PRESETS: Record<string, RangePreset> = {
  '1-50': { label: 'Low (1-50)', min: 1, max: 50 },
  '51-150': { label: 'Medium (51-150)', min: 51, max: 150 },
  '151-300': { label: 'High (151-300)', min: 151, max: 300 },
  '301-600': { label: 'Very High (301+)', min: 301, max: 600 }
}

export const MONSTER_HP_RANGE_OPTIONS = [
  { label: 'All HP', value: null },
  { label: 'Low (1-50)', value: '1-50' },
  { label: 'Medium (51-150)', value: '51-150' },
  { label: 'High (151-300)', value: '151-300' },
  { label: 'Very High (301+)', value: '301-600' }
]

// Item cost ranges (in copper pieces)
// Note: null min/max = open-ended range (< or >= only)
export const COST_RANGE_PRESETS: Record<string, RangePreset> = {
  'under-100': { label: 'Under 1 gp', min: null, max: 99 },
  '100-1000': { label: '1-10 gp', min: 100, max: 1000 },
  '1000-10000': { label: '10-100 gp', min: 1000, max: 10000 },
  '10000-100000': { label: '100-1000 gp', min: 10000, max: 100000 },
  'over-100000': { label: '1000+ gp', min: 100000, max: null }
}

export const COST_RANGE_OPTIONS = [
  { label: 'All Prices', value: null },
  { label: 'Under 1 gp', value: 'under-100' },
  { label: '1-10 gp', value: '100-1000' },
  { label: '10-100 gp', value: '1000-10000' },
  { label: '100-1000 gp', value: '10000-100000' },
  { label: '1000+ gp', value: 'over-100000' }
]

// Item AC ranges (armor)
export const ITEM_AC_RANGE_PRESETS: Record<string, RangePreset> = {
  '11-14': { label: 'Light (11-14)', min: 11, max: 14 },
  '15-16': { label: 'Medium (15-16)', min: 15, max: 16 },
  '17-21': { label: 'Heavy (17+)', min: 17, max: 21 }
}

export const ITEM_AC_RANGE_OPTIONS = [
  { label: 'All AC', value: null },
  { label: 'Light (11-14)', value: '11-14' },
  { label: 'Medium (15-16)', value: '15-16' },
  { label: 'Heavy (17+)', value: '17-21' }
]

// Weapon range presets
// Note: null min/max = open-ended range (< or > only)
export const WEAPON_RANGE_PRESETS: Record<string, RangePreset> = {
  'under-30': { label: 'Short (<30ft)', min: null, max: 29 },
  '30-80': { label: 'Medium (30-80ft)', min: 30, max: 80 },
  '80-150': { label: 'Long (80-150ft)', min: 80, max: 150 },
  'over-150': { label: 'Very Long (>150ft)', min: 151, max: null }
}

// Race speed ranges (used by filter logic, not exposed as select options)
export const RACE_SPEED_RANGE_PRESETS: Record<string, RangePreset> = {
  slow: { label: 'Slow (≤25 ft)', min: 0, max: 25 },
  30: { label: '30 ft', min: 30, max: 30 },
  fast: { label: 'Fast (≥35 ft)', min: 35, max: 999 }
}

// =============================================================================
// SORT OPTIONS (reusable)
// =============================================================================

export const NAME_SORT_OPTIONS = [
  { label: 'Name (A-Z)', value: 'name:asc' },
  { label: 'Name (Z-A)', value: 'name:desc' }
]

// =============================================================================
// HELPER: Convert range presets to select options
// =============================================================================

export function rangePresetsToOptions(
  presets: Record<string, RangePreset>,
  allLabel: string = 'All'
): Array<{ label: string, value: string | null }> {
  return [
    { label: allLabel, value: null },
    ...Object.entries(presets).map(([key, preset]) => ({
      label: preset.label,
      value: key
    }))
  ]
}
