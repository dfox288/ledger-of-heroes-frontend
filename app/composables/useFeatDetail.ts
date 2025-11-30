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
 *   sources,
 *   tags
 * } = useFeatDetail(slug)
 * ```
 */
export function useFeatDetail(slug: Ref<string>) {
  const { apiFetch } = useApi()

  // Fetch feat data with caching
  const { data: response, pending, error, refresh } = useAsyncData(
    `feat-detail-${slug.value}`,
    async () => {
      const result = await apiFetch<{ data: Feat }>(`/feats/${slug.value}`)
      return result?.data || null
    },
    { watch: [slug] }
  )

  // Main entity accessor
  const entity = computed(() => response.value as Feat | null)

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
    // Handle both boolean and string types (API type uncertainty)
    return value === true || value === 'true'
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
    entity.value.prerequisites?.forEach((p) => {
      if (p.description) {
        list.push(p.description)
      } else if (p.prerequisite?.name) {
        list.push(p.prerequisite.name)
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
   * Fetch related variants when this feat has a parent
   * All feats with the same parent_feat_slug are variants
   */
  const { data: variantsData } = useAsyncData(
    `feat-variants-${slug.value}`,
    async () => {
      const parent = parentFeatSlug.value
      if (!parent) return []

      try {
        const response = await apiFetch<{ data: Feat[] }>('/feats', {
          query: { filter: `parent_feat_slug = ${parent}` }
        })
        return response.data ?? []
      } catch (err) {
        console.error('Failed to fetch feat variants:', err)
        return []
      }
    },
    {
      watch: [parentFeatSlug],
      immediate: false // Only fetch when parentFeatSlug changes
    }
  )

  const relatedVariants = computed(() => variantsData.value ?? [])

  // ─────────────────────────────────────────────────────────────────────────────
  // Sources and Tags
  // ─────────────────────────────────────────────────────────────────────────────

  const sources = computed(() => entity.value?.sources ?? [])
  const tags = computed(() => entity.value?.tags ?? [])

  // ─────────────────────────────────────────────────────────────────────────────
  // SEO
  // ─────────────────────────────────────────────────────────────────────────────

  useSeoMeta({
    title: computed(() =>
      entity.value?.name
        ? `${entity.value.name} - D&D 5e Feat`
        : 'Feat - D&D 5e Compendium'
    ),
    description: computed(() =>
      entity.value?.description?.substring(0, 160) ?? ''
    )
  })

  useHead({
    title: computed(() =>
      entity.value?.name
        ? `${entity.value.name} - D&D 5e Feat`
        : 'Feat - D&D 5e Compendium'
    )
  })

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

    // Metadata
    sources,
    tags
  }
}
