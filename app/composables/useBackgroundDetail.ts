import type { Background } from '~/types/api/entities'
import type { components } from '~/types/api/generated'

type TraitResource = components['schemas']['TraitResource']
type EntityDataTableResource = components['schemas']['EntityDataTableResource']
type ProficiencyResource = components['schemas']['ProficiencyResource']

/**
 * Skill with its associated ability score code
 */
export interface SkillWithAbility {
  name: string
  abilityCode: string | null
}

/**
 * Composable for background detail pages.
 *
 * Provides data fetching and computed helpers that extract:
 * - Feature trait (signature background ability)
 * - Description trait
 * - Characteristics trait with rollable data tables
 * - Skills with ability score codes
 * - Language choice information
 *
 * @example
 * ```typescript
 * const slug = computed(() => route.params.slug as string)
 * const {
 *   entity,
 *   pending,
 *   error,
 *   feature,
 *   description,
 *   dataTables,
 *   skillsWithAbilities,
 *   languageDisplay
 * } = useBackgroundDetail(slug)
 * ```
 */
export function useBackgroundDetail(slug: Ref<string>) {
  // Fetch background data with caching and SEO
  const { data: entity, loading: pending, error, refresh } = useEntityDetail<Background>({
    slug: slug.value,
    endpoint: '/backgrounds',
    cacheKey: 'background',
    seo: {
      titleTemplate: (name: string) => `${name} - D&D 5e Background`,
      descriptionExtractor: (background: unknown) => {
        const b = background as Background
        // Extract description from description trait (category=null, name="Description")
        const descTrait = b.traits?.find(t => t.category === null && t.name === 'Description')
        return descTrait?.description?.substring(0, 160) ?? ''
      },
      fallbackTitle: 'Background - D&D 5e Compendium'
    }
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Trait Extraction
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * All traits from the background
   */
  const traits = computed<TraitResource[]>(() => entity.value?.traits ?? [])

  /**
   * The Feature - signature background ability (extracted from API)
   * e.g., "Shelter of the Faithful" for Acolyte
   *
   * Note: Now uses pre-extracted feature_name and feature_description fields
   * from the API instead of searching through traits array (Issue #67)
   */
  const feature = computed<{ name: string, description: string } | null>(() => {
    const name = entity.value?.feature_name?.trim() || ''
    const description = entity.value?.feature_description?.trim() || ''

    // Only return if both fields have content
    if (!name || !description) return null

    return { name, description }
  })

  /**
   * The Description trait - background lore/flavor
   * Usually has category=null and name="Description"
   */
  const descriptionTrait = computed<TraitResource | null>(() =>
    traits.value.find(t => t.category === null && t.name === 'Description') ?? null
  )

  /**
   * The Characteristics trait - contains rollable tables
   * Has category="characteristics" and includes data_tables
   */
  const characteristics = computed<TraitResource | null>(() =>
    traits.value.find(t => t.category === 'characteristics') ?? null
  )

  /**
   * Rollable data tables (Personality, Ideal, Bond, Flaw)
   */
  const dataTables = computed<EntityDataTableResource[]>(() =>
    characteristics.value?.data_tables ?? []
  )

  /**
   * Get a specific table by name
   */
  const getTableByName = (name: string): EntityDataTableResource | null => {
    return dataTables.value.find(t =>
      t.table_name?.toLowerCase().includes(name.toLowerCase())
    ) ?? null
  }

  // Specific table accessors for convenience
  const personalityTable = computed(() => getTableByName('personality'))
  const idealTable = computed(() => getTableByName('ideal'))
  const bondTable = computed(() => getTableByName('bond'))
  const flawTable = computed(() => getTableByName('flaw'))

  // ─────────────────────────────────────────────────────────────────────────────
  // Proficiency Extraction (with ability scores)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * All proficiencies
   */
  const proficiencies = computed<ProficiencyResource[]>(() =>
    entity.value?.proficiencies ?? []
  )

  /**
   * Skill proficiencies with their associated ability score codes
   * e.g., [{ name: "Insight", abilityCode: "WIS" }, { name: "Religion", abilityCode: "INT" }]
   */
  const skillsWithAbilities = computed<SkillWithAbility[]>(() =>
    proficiencies.value
      .filter(p => p.proficiency_type === 'skill' && p.skill)
      .map(p => ({
        name: p.skill!.name,
        abilityCode: p.skill!.ability_score?.code ?? null
      }))
  )

  /**
   * Tool proficiency names
   */
  const toolProficiencies = computed<string[]>(() =>
    proficiencies.value
      .filter(p => p.proficiency_type === 'tool')
      .map(p => p.proficiency_name || p.item?.name)
      .filter(Boolean) as string[]
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // Language Extraction
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Raw languages array
   */
  const languages = computed(() => entity.value?.languages ?? [])

  /**
   * Human-readable language display
   * Handles choice languages like "2 of your choice"
   */
  const languageDisplay = computed<string>(() => {
    if (languages.value.length === 0) return ''

    // Check for choice languages
    const choiceLanguage = languages.value.find(l => l.is_choice)
    if (choiceLanguage) {
      const quantity = choiceLanguage.quantity || 1
      return quantity === 1 ? '1 of your choice' : `${quantity} of your choice`
    }

    // Fixed languages
    const fixedNames = languages.value
      .filter(l => !l.is_choice && l.language)
      .map(l => l.language!.name)

    return fixedNames.join(', ')
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Equipment Extraction
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * All equipment items
   */
  const equipment = computed(() => entity.value?.equipment ?? [])

  /**
   * Starting gold amount (extracted from equipment)
   * Note: Must check slug first to avoid matching items like "Cloth-of-gold vestments"
   */
  const startingGold = computed<number | null>(() => {
    const goldItem = equipment.value.find(eq =>
      eq.item?.slug === 'gold-gp'
      || eq.item?.name?.toLowerCase() === 'gold (gp)'
    )
    return goldItem?.quantity ?? null
  })

  /**
   * Equipment count (excluding gold)
   */
  const equipmentCount = computed<number>(() =>
    equipment.value.filter(eq =>
      !eq.item?.name?.toLowerCase().includes('gold')
      && eq.item?.slug !== 'gold-gp'
    ).length
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

    // Traits
    traits,
    feature,
    descriptionTrait,
    characteristics,

    // Rollable Tables
    dataTables,
    personalityTable,
    idealTable,
    bondTable,
    flawTable,

    // Proficiencies
    proficiencies,
    skillsWithAbilities,
    toolProficiencies,

    // Languages
    languages,
    languageDisplay,

    // Equipment
    equipment,
    startingGold,
    equipmentCount,

    // Metadata
    sources,
    tags
  }
}
