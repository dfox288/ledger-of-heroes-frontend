/**
 * Color mapping utilities for D&D entity attributes.
 * Provides consistent color coding across the application.
 *
 * This composable wraps the badge color utilities from ~/utils/badgeColors
 * for convenient auto-import in components.
 */

import {
  getSpellSchoolColor,
  getSizeColor,
  getItemRarityColor
} from '~/utils/badgeColors'

/**
 * Composable for entity color mapping
 * Auto-imported by Nuxt in all components
 *
 * @returns Object containing color mapping functions
 *
 * @example
 * const { getSpellSchoolColor } = useEntityColorMap()
 * const color = getSpellSchoolColor('EV') // 'error'
 */
export function useEntityColorMap() {
  return {
    /**
     * Maps spell school codes to UI colors.
     * @param schoolCode - Single letter or two-letter school code (A, C, D, EN, EV, I, N, T)
     */
    getSpellSchoolColor,

    /**
     * Maps creature size codes to UI colors.
     * @param sizeCode - Size code (T, S, M, L, H, G)
     */
    getSizeColor,

    /**
     * Maps item rarity to UI colors.
     * @param rarity - Rarity string (common, uncommon, rare, very rare, legendary, artifact)
     */
    getItemRarityColor
  }
}
