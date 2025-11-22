/**
 * Generate image path for entity
 * @param slug - Entity slug (e.g., 'dragonborn', 'fireball')
 * @param entity - Entity type
 * @param size - Image size variant (default: '512')
 * @returns Image path or null if invalid
 */
export function useEntityImage(
  slug: string,
  entity: 'races' | 'classes' | 'backgrounds' | 'feats' | 'spells' | 'items',
  size: '256' | '512' | 'original' = '512'
): string | null {
  // Validate inputs
  if (!slug || slug.trim() === '') {
    return null
  }

  const validEntities = ['races', 'classes', 'backgrounds', 'feats', 'spells', 'items']
  if (!validEntities.includes(entity)) {
    return null
  }

  const validSizes = ['256', '512', 'original']
  if (!validSizes.includes(size)) {
    return null
  }

  // Get provider from runtime config
  const config = useRuntimeConfig()
  const provider = config.public.imageProvider

  // Build path based on size
  if (size === 'original') {
    return `/images/generated/${entity}/${provider}/${slug}.png`
  }

  return `/images/generated/conversions/${size}/${entity}/${provider}/${slug}.png`
}
