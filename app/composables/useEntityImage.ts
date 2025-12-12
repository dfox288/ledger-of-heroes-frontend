/**
 * Entity image composable
 * Provides image paths for all entity types (main + reference)
 */

export type EntityType
  // Main entities
  = | 'races' | 'classes' | 'backgrounds' | 'feats' | 'spells' | 'items' | 'monsters'
  // Reference entities
    | 'ability-scores' | 'conditions' | 'damage-types' | 'item-types'
    | 'languages' | 'proficiency-types' | 'sizes' | 'skills'
    | 'spell-schools' | 'sources'

export type ImageSize = 256 | 512 | 'original'

/**
 * Entity type to folder name mapping
 * Handles kebab-case (frontend routes) → snake_case (image folders)
 */
const ENTITY_FOLDER_MAP: Record<EntityType, string> = {
  // Main entities (direct match)
  'races': 'races',
  'classes': 'classes',
  'backgrounds': 'backgrounds',
  'feats': 'feats',
  'spells': 'spells',
  'items': 'items',
  'monsters': 'monsters',

  // Reference entities (conversion needed)
  'ability-scores': 'ability_scores',
  'spell-schools': 'spell_schools',
  'item-types': 'item_types',
  'proficiency-types': 'proficiency_types',
  'damage-types': 'damage_types',

  // Reference entities (direct match)
  'conditions': 'conditions',
  'languages': 'languages',
  'sizes': 'sizes',
  'skills': 'skills',
  'sources': 'sources'
}

/**
 * Get image path for entity
 */
export function useEntityImage() {
  const config = useRuntimeConfig()
  const provider = config.public.imageProvider || 'stability-ai'

  return {
    /**
     * Generate image path for entity
     * @param entityType - Entity type (e.g., 'skills', 'spell-schools')
     * @param slug - Entity slug (e.g., 'acrobatics', 'fireball')
     * @param size - Image size variant (default: 256)
     * @returns Image path or null if invalid
     */
    getImagePath(
      entityType: EntityType,
      slug: string,
      size: ImageSize = 256
    ): string | null {
      // Validate slug
      if (!slug || slug.trim() === '') {
        return null
      }

      // Map entity type to folder name
      const folderName = ENTITY_FOLDER_MAP[entityType]
      if (!folderName) {
        return null
      }

      // Convert namespaced slug to filesystem-safe filename
      // e.g., "phb:fireball" → "phb--fireball"
      const filename = slug.replace(':', '--')

      // Build path based on size
      if (size === 'original') {
        return `/images/generated/${folderName}/${provider}/${filename}.webp`
      }

      return `/images/generated/conversions/${size}/${folderName}/${provider}/${filename}.webp`
    }
  }
}
