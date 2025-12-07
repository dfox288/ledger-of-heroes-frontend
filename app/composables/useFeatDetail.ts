import type { Feat } from '~/types/api/entities'

/**
 * Ability modifier extracted from feat modifiers
 */
export interface AbilityModifier {
  ability: string
  code: string
  value: number
}

/**
 * Proficiency granted by feat
 */
export interface GrantedProficiency {
  name: string
  type: string
}

/**
 * Advantage/condition from feat
 */
export interface FeatAdvantage {
  effectType: string
  description: string
}

/**
 * Composable for feat detail pages.
 *
 * Provides data fetching and computed helpers that extract:
 * - Half-feat status
 * - Ability score modifiers for badges
 * - Granted proficiencies
 * - Advantages/conditions
 * - Prerequisites (text + structured)
 * - Related variants via parent_feat_slug
 * - Granted spells
 *
 * @example
 * ```typescript
 * const slug = computed(() => route.params.slug as string)
 * const {
 *   entity,
 *   pending,
 *   error,
 *   isHalfFeat,
 *   abilityModifiers,
 *   grantedProficiencies,
 *   advantages,
 *   hasBenefits,
 *   hasPrerequisites,
 *   prerequisitesList,
 *   relatedVariants,
 *   spells,
 *   hasSpells,
 *   sources,
 *   tags
 * } = useFeatDetail(slug)
 * ```
 */
export function useFeatDetail(slug: Ref<string>) {
  // Fetch feat data with caching and SEO
  // Pass the reactive ref directly so useEntityDetail can watch for changes
  const { data: entity, loading: pending, error, refresh } = useEntityDetail<Feat>({
    slug,
    endpoint: '/feats',
    cacheKey: 'feat',
    seo: {
      titleTemplate: (name: string) => `${name} - D&D 5e Feat`,
      descriptionExtractor: (feat: unknown) => {
        const f = feat as Feat
        return f.description?.substring(0, 160) ?? ''
      },
      fallbackTitle: 'Feat - D&D 5e Compendium'
    }
  })

  const { apiFetch } = useApi()

  // ─────────────────────────────────────────────────────────────────────────────
  // Half-Feat Status
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Is this a half-feat? (grants +1 ability score)
   * Note: API returns string 'true'/'false', coerce to boolean
   */
  const isHalfFeat = computed(() => {
    const value = entity.value?.is_half_feat
    if (!value) return false
    // API returns string 'true'/'false', coerce to boolean
    // Use String() cast to satisfy TypeScript while handling potential type drift
    return String(value) === 'true'
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Ability Modifiers
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Ability score modifiers for header badges
   * e.g., [{ ability: 'Charisma', code: 'CHA', value: 1 }]
   */
  const abilityModifiers = computed<AbilityModifier[]>(() => {
    if (!entity.value?.modifiers) return []
    return entity.value.modifiers
      .filter(m => m.modifier_category === 'ability_score')
      .map(m => ({
        ability: m.ability_score?.name ?? 'Unknown',
        code: m.ability_score?.code ?? '?',
        value: parseInt(m.value || '0') || 0
      }))
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Proficiencies
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Proficiencies granted by this feat (grants: true)
   * Excludes prerequisites (grants: false)
   */
  const grantedProficiencies = computed<GrantedProficiency[]>(() => {
    if (!entity.value?.proficiencies) return []
    return entity.value.proficiencies
      .filter(p => p.grants)
      .map(p => ({
        name: p.proficiency_name || 'Unknown',
        type: p.proficiency_type || 'unknown'
      }))
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Advantages/Conditions
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Advantages and special abilities from conditions
   * e.g., advantage on concentration saves, can cast with hands full, etc.
   */
  const advantages = computed<FeatAdvantage[]>(() => {
    if (!entity.value?.conditions) return []
    return entity.value.conditions.map(c => ({
      effectType: c.effect_type || 'special',
      description: c.description || ''
    }))
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Benefits Check
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Does this feat have any displayable benefits?
   * (Used to conditionally show the "What You Get" section)
   */
  const hasBenefits = computed(() =>
    abilityModifiers.value.length > 0
    || grantedProficiencies.value.length > 0
    || advantages.value.length > 0
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // Prerequisites
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Does this feat have prerequisites?
   */
  const hasPrerequisites = computed(() =>
    (entity.value?.prerequisites?.length ?? 0) > 0
    || !!entity.value?.prerequisites_text
  )

  /**
   * Combined prerequisites list (text + structured)
   */
  const prerequisitesList = computed<string[]>(() => {
    if (!entity.value) return []
    const list: string[] = []

    // Add text prerequisite if exists
    if (entity.value.prerequisites_text) {
      list.push(entity.value.prerequisites_text)
    }

    // Add structured prerequisites
    // Each prerequisite can have one of: ability_score, race, skill, proficiency_type, class
    entity.value.prerequisites?.forEach((p) => {
      if (p.description) {
        list.push(p.description)
      } else if (p.ability_score?.name) {
        const minVal = p.minimum_value ? ` ${p.minimum_value}+` : ''
        list.push(`${p.ability_score.name}${minVal}`)
      } else if (p.race?.name) {
        list.push(p.race.name)
      } else if (p.skill?.name) {
        list.push(`Proficiency in ${p.skill.name}`)
      } else if (p.proficiency_type?.name) {
        list.push(`${p.proficiency_type.name} proficiency`)
      }
    })

    return list
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Related Variants
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Parent feat slug (for variant feats like Resilient (STR), Resilient (DEX), etc.)
   */
  const parentFeatSlug = computed(() => entity.value?.parent_feat_slug || null)

  /**
   * Related variants - fetched client-side only after main entity loads
   */
  const variantsData = ref<Feat[]>([])

  // Fetch variants when entity loads and has parent_feat_slug
  watch(
    () => entity.value?.parent_feat_slug,
    async (parent) => {
      if (!parent) {
        variantsData.value = []
        return
      }

      try {
        const response = await apiFetch<{ data: Feat[] }>('/feats', {
          query: { filter: `parent_feat_slug = ${parent}` }
        })
        variantsData.value = response.data ?? []
      } catch (err) {
        console.error('Failed to fetch feat variants:', err)
        variantsData.value = []
      }
    },
    { immediate: true }
  )

  const relatedVariants = computed(() => variantsData.value)

  // ─────────────────────────────────────────────────────────────────────────────
  // Granted Spells
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Spells granted by this feat (includes both fixed spells and choice placeholders)
   */
  const spells = computed(() => entity.value?.spells ?? [])

  /**
   * Spell choices - aggregated groups for player selection
   * (e.g., "Choose 1 Divination or Enchantment spell")
   */
  const spellChoices = computed(() => entity.value?.spell_choices ?? [])

  /**
   * Does this feat grant any spells (fixed or choice)?
   */
  const hasSpells = computed(() =>
    (entity.value?.spells?.length ?? 0) > 0
    || (entity.value?.spell_choices?.length ?? 0) > 0
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // Sources and Tags
  // ─────────────────────────────────────────────────────────────────────────────

  const sources = computed(() => entity.value?.sources ?? [])
  const tags = computed(() => entity.value?.tags ?? [])

  return {
    // Core
    entity,
    pending,
    error,
    refresh,

    // Half-feat status
    isHalfFeat,

    // Benefits
    abilityModifiers,
    grantedProficiencies,
    advantages,
    hasBenefits,

    // Prerequisites
    hasPrerequisites,
    prerequisitesList,

    // Variants
    parentFeatSlug,
    relatedVariants,

    // Granted Spells
    spells,
    spellChoices,
    hasSpells,

    // Metadata
    sources,
    tags
  }
}
