/**
 * NuxtUI 4 semantic color type
 * These are the only allowed color values for NuxtUI components
 */
export type NuxtUIColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

/**
 * Legacy to semantic color mapping
 * Maps old color names to NuxtUI 4 semantic colors
 */
export const legacyColorMap: Record<string, NuxtUIColor> = {
  gray: 'neutral',
  purple: 'primary',
  blue: 'info',
  red: 'error',
  green: 'success',
  amber: 'warning',
  orange: 'warning',
  yellow: 'warning'
}

/**
 * Convert legacy color to NuxtUI 4 semantic color
 */
export function toSemanticColor(color: string): NuxtUIColor {
  return legacyColorMap[color] || 'neutral'
}
