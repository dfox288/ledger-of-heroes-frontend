import type { Race } from '~/types/api/entities'
import type { components } from '~/types/api/generated'

type TraitResource = components['schemas']['TraitResource']
type ModifierResource = components['schemas']['ModifierResource']
type ProficiencyResource = components['schemas']['ProficiencyResource']
type EntityLanguageResource = components['schemas']['EntityLanguageResource']
type EntitySenseResource = components['schemas']['EntitySenseResource']
type EntitySpellResource = components['schemas']['EntitySpellResource']
type EntityConditionResource = components['schemas']['EntityConditionResource']
type EntityChoiceResource = components['schemas']['EntityChoiceResource']

/**
 * Composable for race detail pages.
 *
 * Provides shared data fetching and computed helpers for both race detail views
 * (Overview, Reference). Data is cached across view navigation.
 *
 * @example
 * ```typescript
 * const slug = computed(() => route.params.slug as string)
 * const {
 *   entity,
 *   pending,
 *   error,
 *   isSubrace,
 *   parentRace,
 *   abilityScoreIncreases,
 *   speciesTraits,
 *   // ... more
 * } = useRaceDetail(slug)
 * ```
 */
export function useRaceDetail(slug: Ref<string>) {
  // Fetch race data with caching and SEO
  // Pass the reactive ref directly so useEntityDetail can watch for changes
  const { data: entity, loading: pending, error, refresh } = useEntityDetail<Race>({
    slug,
    endpoint: '/races',
    cacheKey: 'race',
    seo: {
      titleTemplate: (name: string) => `${name} - D&D 5e Race`,
      descriptionExtractor: (race: unknown) => {
        const r = race as Race
        return r.description?.substring(0, 160) ?? ''
      },
      fallbackTitle: 'Race - D&D 5e Compendium'
    }
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Basic computed properties
  // ─────────────────────────────────────────────────────────────────────────────

  const isSubrace = computed(() => entity.value?.is_subrace ?? false)
  const parentRace = computed(() => entity.value?.parent_race ?? null)
  const inheritedData = computed(() => isSubrace.value ? entity.value?.inherited_data : null)

  const inheritedSpeciesTraits = computed<TraitResource[]>(() => {
    if (!isSubrace.value || !inheritedData.value?.traits) return []
    return inheritedData.value.traits.filter(t => t.category === 'species')
  })

  const inheritedDescriptionTraits = computed<TraitResource[]>(() => {
    if (!isSubrace.value || !inheritedData.value?.traits) return []
    return inheritedData.value.traits.filter(t => t.category === 'description')
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Modifiers (ability scores and damage resistances)
  // ─────────────────────────────────────────────────────────────────────────────

  const abilityScoreIncreases = computed<ModifierResource[]>(() => {
    const modifiers = entity.value?.modifiers ?? []
    return modifiers.filter(m => m.modifier_category === 'ability_score')
  })

  const damageResistances = computed<ModifierResource[]>(() => {
    const modifiers = entity.value?.modifiers ?? []
    return modifiers.filter(m => m.modifier_category === 'damage_resistance')
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Choices (EntityChoiceResource array)
  // ─────────────────────────────────────────────────────────────────────────────

  const choices = computed<EntityChoiceResource[]>(() =>
    entity.value?.choices ?? []
  )

  const abilityScoreChoices = computed<EntityChoiceResource[]>(() =>
    choices.value.filter(c => c.choice_type === 'ability_score')
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // Traits (filtered by category)
  // ─────────────────────────────────────────────────────────────────────────────

  const traits = computed<TraitResource[]>(() => entity.value?.traits ?? [])

  const speciesTraits = computed<TraitResource[]>(() =>
    traits.value.filter(t => t.category === 'species')
  )

  const subspeciesTraits = computed<TraitResource[]>(() =>
    traits.value.filter(t => t.category === 'subspecies')
  )

  const descriptionTraits = computed<TraitResource[]>(() =>
    traits.value.filter(t => t.category === 'description')
  )

  const mechanicalTraits = computed<TraitResource[]>(() =>
    traits.value.filter(t => t.category === null)
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // Proficiencies, Languages, Conditions
  // ─────────────────────────────────────────────────────────────────────────────

  const proficiencies = computed<ProficiencyResource[]>(() =>
    entity.value?.proficiencies ?? []
  )

  const languages = computed<EntityLanguageResource[]>(() =>
    entity.value?.languages ?? []
  )

  const conditions = computed<EntityConditionResource[]>(() =>
    entity.value?.conditions ?? []
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // Senses and Spells
  // ─────────────────────────────────────────────────────────────────────────────

  const senses = computed<EntitySenseResource[]>(() =>
    entity.value?.senses ?? []
  )

  const spells = computed<EntitySpellResource[]>(() =>
    entity.value?.spells ?? []
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // Subraces (only for base races)
  // ─────────────────────────────────────────────────────────────────────────────

  const subraces = computed(() => entity.value?.subraces ?? [])

  // ─────────────────────────────────────────────────────────────────────────────
  // Tags
  // ─────────────────────────────────────────────────────────────────────────────

  const tags = computed(() => entity.value?.tags ?? [])

  return {
    // Core
    entity,
    pending,
    error,
    refresh,

    // Identity
    isSubrace,
    parentRace,
    inheritedData,

    // Modifiers
    abilityScoreIncreases,
    damageResistances,

    // Choices
    choices,
    abilityScoreChoices,

    // Traits
    traits,
    speciesTraits,
    subspeciesTraits,
    descriptionTraits,
    mechanicalTraits,
    inheritedSpeciesTraits,
    inheritedDescriptionTraits,

    // Proficiencies & Languages
    proficiencies,
    languages,
    conditions,

    // Senses & Spells
    senses,
    spells,

    // Subraces
    subraces,

    // Tags
    tags
  }
}
