import type { CharacterClass, CounterFromAPI, OptionalFeatureResource } from '~/types/api/entities'
import type { components } from '~/types/api/generated'

type ClassFeatureResource = components['schemas']['ClassFeatureResource']

/**
 * Composable for class detail pages.
 *
 * Provides shared data fetching and computed helpers for all three class detail views
 * (Overview, Journey, Reference). Data is cached across view navigation.
 *
 * @example
 * ```typescript
 * const slug = computed(() => route.params.slug as string)
 * const {
 *   entity,
 *   pending,
 *   error,
 *   isSubclass,
 *   parentClass,
 *   features,
 *   // ... more
 * } = useClassDetail(slug)
 * ```
 */
export function useClassDetail(slug: Ref<string>) {
  // Fetch class data with caching and SEO
  // Pass the reactive ref directly so useEntityDetail can watch for changes
  const { data: entity, loading: pending, error, refresh } = useEntityDetail<CharacterClass>({
    slug,
    endpoint: '/classes',
    cacheKey: 'class',
    seo: {
      titleTemplate: (name: string) => `${name} - D&D 5e Class`,
      descriptionExtractor: (cls: unknown) => {
        const c = cls as CharacterClass
        return c.description?.substring(0, 160) ?? ''
      },
      fallbackTitle: 'Class - D&D 5e Compendium'
    }
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Basic computed properties
  // ─────────────────────────────────────────────────────────────────────────────

  const isSubclass = computed(() => entity.value ? !entity.value.is_base_class : false)
  const parentClass = computed(() => entity.value?.parent_class ?? null)
  const inheritedData = computed(() => isSubclass.value ? entity.value?.inherited_data : null)

  // ─────────────────────────────────────────────────────────────────────────────
  // Features
  // ─────────────────────────────────────────────────────────────────────────────

  const features = computed<ClassFeatureResource[]>(() => entity.value?.features ?? [])

  // ─────────────────────────────────────────────────────────────────────────────
  // Counters (Ki, Rage, Sorcery Points, etc.)
  // ─────────────────────────────────────────────────────────────────────────────

  const counters = computed<CounterFromAPI[]>(() => {
    if (isSubclass.value) {
      // Subclass may have own counters + inherited
      // Note: inherited_data.counters type in OpenAPI spec is out of sync with actual API response
      const ownCounters = entity.value?.counters ?? []
      const inheritedCounters = (inheritedData.value?.counters as unknown as CounterFromAPI[]) ?? []
      // Combine, avoiding duplicates by name
      const seen = new Set<string>()
      return [...ownCounters, ...inheritedCounters].filter((c) => {
        if (seen.has(c.name)) return false
        seen.add(c.name)
        return true
      })
    }
    return entity.value?.counters ?? []
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Proficiencies (with helpers by type)
  // ─────────────────────────────────────────────────────────────────────────────

  const proficiencies = computed(() => {
    if (isSubclass.value) {
      return inheritedData.value?.proficiencies ?? []
    }
    return entity.value?.proficiencies ?? []
  })

  const savingThrows = computed(() =>
    proficiencies.value.filter(p => p.proficiency_type === 'saving_throw')
  )

  const armorProficiencies = computed(() =>
    proficiencies.value.filter(p => p.proficiency_type === 'armor')
  )

  const weaponProficiencies = computed(() =>
    proficiencies.value.filter(p => p.proficiency_type === 'weapon')
  )

  const skillChoices = computed(() =>
    proficiencies.value.filter(p => p.proficiency_type === 'skill')
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // Equipment & Traits
  // ─────────────────────────────────────────────────────────────────────────────

  const equipment = computed(() => {
    if (isSubclass.value) {
      return inheritedData.value?.equipment ?? []
    }
    return entity.value?.equipment ?? []
  })

  const traits = computed(() => {
    if (isSubclass.value) {
      return inheritedData.value?.traits ?? []
    }
    return entity.value?.traits ?? []
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Optional Features (Invocations, Infusions, Disciplines, etc.)
  // ─────────────────────────────────────────────────────────────────────────────

  const optionalFeatures = computed<OptionalFeatureResource[]>(() => {
    // For subclasses, check both own and inherited optional features
    if (isSubclass.value) {
      const ownFeatures = entity.value?.optional_features ?? []
      // Note: inherited_data may include optional_features in future API versions
      return ownFeatures
    }
    return entity.value?.optional_features ?? []
  })

  const hasOptionalFeatures = computed(() => optionalFeatures.value.length > 0)

  const optionalFeaturesByType = computed(() => {
    const grouped = new Map<string, OptionalFeatureResource[]>()
    for (const feature of optionalFeatures.value) {
      const type = feature.feature_type_label
      if (!grouped.has(type)) grouped.set(type, [])
      grouped.get(type)!.push(feature)
    }
    return grouped
  })

  /**
   * Get options available at or before a specific level
   */
  function getOptionsAvailableAtLevel(level: number): OptionalFeatureResource[] {
    return optionalFeatures.value.filter(f =>
      f.level_requirement === null || f.level_requirement <= level
    )
  }

  /**
   * Get options that unlock exactly at a specific level
   */
  function getOptionsUnlockingAtLevel(level: number): OptionalFeatureResource[] {
    return optionalFeatures.value.filter(f => f.level_requirement === level)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Subclasses (only for base classes)
  // ─────────────────────────────────────────────────────────────────────────────

  const subclasses = computed(() => entity.value?.subclasses ?? [])

  const subclassLevel = computed(() => entity.value?.subclass_level ?? null)

  const subclassName = computed(() => {
    // Use archetype field from API (preferred)
    if (entity.value?.archetype) {
      return entity.value.archetype
    }
    // Fallback patterns (defensive - should rarely be needed)
    const patterns: Record<string, string> = {
      barbarian: 'Primal Path',
      bard: 'Bard College',
      cleric: 'Divine Domain',
      druid: 'Druid Circle',
      fighter: 'Martial Archetype',
      monk: 'Monastic Tradition',
      paladin: 'Sacred Oath',
      ranger: 'Ranger Archetype',
      rogue: 'Roguish Archetype',
      sorcerer: 'Sorcerous Origin',
      warlock: 'Otherworldly Patron',
      wizard: 'Arcane Tradition',
      artificer: 'Artificer Specialist'
    }
    return patterns[entity.value?.slug ?? ''] || 'Subclass'
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed data from backend
  // ─────────────────────────────────────────────────────────────────────────────

  const hitPoints = computed(() => entity.value?.computed?.hit_points ?? null)

  // Progression table - now properly typed in API schema (Issue #80 fixed)
  const progressionTable = computed(() => entity.value?.computed?.progression_table ?? null)

  const spellSlotSummary = computed(() => entity.value?.computed?.spell_slot_summary ?? null)

  // ─────────────────────────────────────────────────────────────────────────────
  // Spellcasting helpers
  // ─────────────────────────────────────────────────────────────────────────────

  const spellcastingAbility = computed(() => {
    if (entity.value?.spellcasting_ability) {
      return entity.value.spellcasting_ability
    }
    // Subclass inherits from parent
    if (isSubclass.value && parentClass.value?.spellcasting_ability) {
      return parentClass.value.spellcasting_ability
    }
    return null
  })

  const isCaster = computed(() => spellcastingAbility.value !== null)

  const levelProgression = computed(() => {
    if (isSubclass.value) {
      return inheritedData.value?.level_progression ?? []
    }
    return entity.value?.level_progression ?? []
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Hit Die helper
  // ─────────────────────────────────────────────────────────────────────────────

  const hitDie = computed(() => {
    if (entity.value?.hit_die && entity.value.hit_die > 0) {
      return entity.value.hit_die
    }
    // Fallback to computed data
    return hitPoints.value?.hit_die_numeric ?? null
  })

  return {
    // Core
    entity,
    pending,
    error,
    refresh,

    // Identity
    isSubclass,
    parentClass,
    inheritedData,

    // Features
    features,

    // Resources
    counters,

    // Proficiencies
    proficiencies,
    savingThrows,
    armorProficiencies,
    weaponProficiencies,
    skillChoices,

    // Equipment & Traits
    equipment,
    traits,

    // Optional Features
    optionalFeatures,
    hasOptionalFeatures,
    optionalFeaturesByType,
    getOptionsAvailableAtLevel,
    getOptionsUnlockingAtLevel,

    // Subclasses
    subclasses,
    subclassLevel,
    subclassName,

    // Computed data
    hitPoints,
    hitDie,
    progressionTable,
    spellSlotSummary,

    // Spellcasting
    spellcastingAbility,
    isCaster,
    levelProgression
  }
}
