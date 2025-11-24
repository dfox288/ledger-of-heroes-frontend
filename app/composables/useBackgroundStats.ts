import type { Ref } from 'vue'
import type { Background } from '~/types/api/entities'
import { ITEM_ID_GOLD_PIECE } from '~/constants/items'

/**
 * useBackgroundStats
 *
 * Extracts proficiency, language, and equipment data from a Background entity.
 * Used by both BackgroundCard and backgrounds detail page for consistency.
 *
 * @param background - Reactive Background entity (can be null during loading)
 * @returns Computed stats (skills, tools, languages, equipment, gold)
 *
 * @example
 * const { skillProficiencies, languages, startingGold } = useBackgroundStats(entity)
 */
export function useBackgroundStats(background: Ref<Background | null>) {
  /**
   * Extract skill proficiency names
   * Filters by proficiency_type='skill' and extracts skill.name
   */
  const skillProficiencies = computed(() => {
    if (!background.value?.proficiencies) return []

    return background.value.proficiencies
      .filter(p => p.proficiency_type === 'skill')
      .map(p => p.skill?.name)
      .filter(Boolean) as string[]
  })

  /**
   * Extract tool proficiency names
   * Filters by proficiency_type='tool' and extracts item.name (tools are stored as items)
   */
  const toolProficiencies = computed(() => {
    if (!background.value?.proficiencies) return []

    return background.value.proficiencies
      .filter(p => p.proficiency_type === 'tool')
      .map(p => p.item?.name)
      .filter(Boolean) as string[]
  })

  /**
   * Extract language names
   */
  const languages = computed(() => {
    if (!background.value?.languages) return []

    return background.value.languages
      .map(l => l.language?.name)
      .filter(Boolean) as string[]
  })

  /**
   * Count equipment items (excluding gold)
   */
  const equipmentCount = computed(() => {
    if (!background.value?.equipment) return 0

    return background.value.equipment.filter(
      eq => eq.item_id !== ITEM_ID_GOLD_PIECE
    ).length
  })

  /**
   * Extract starting gold quantity
   */
  const startingGold = computed(() => {
    if (!background.value?.equipment) return null

    const goldItem = background.value.equipment.find(
      eq => eq.item_id === ITEM_ID_GOLD_PIECE
    )

    return goldItem?.quantity || null
  })

  return {
    skillProficiencies,
    toolProficiencies,
    languages,
    equipmentCount,
    startingGold
  }
}
