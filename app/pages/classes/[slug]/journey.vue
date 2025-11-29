<script setup lang="ts">
/**
 * Class Detail - Journey View
 *
 * Level-by-level timeline showing the progression from 1 to 20,
 * with features, spell slots, and milestones.
 * For subclasses, interleaves parent class features with toggle.
 */

import type { components } from '~/types/api/generated'
import type { OptionalFeatureResource } from '~/types/api/entities'

type ClassFeatureResource = components['schemas']['ClassFeatureResource']
type ClassLevelProgressionResource = components['schemas']['ClassLevelProgressionResource']

interface TimelineLevel {
  level: number
  proficiencyBonus: string
  features: ClassFeatureResource[]
  parentFeatures?: ClassFeatureResource[]
  spellSlots?: Record<string, number>
  cantripsKnown?: number
  resourceValue?: number
  resourceName?: string
  isMilestone: boolean
  milestoneType?: 'subclass' | 'asi' | 'spell_tier' | 'capstone'
  milestoneLabel?: string
  availableOptions?: OptionalFeatureResource[]
}

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const {
  entity,
  pending,
  error,
  isSubclass,
  parentClass,
  features,
  counters,
  subclassLevel,
  levelProgression,
  progressionTable,
  optionalFeatures,
  getOptionsAvailableAtLevel
} = useClassDetail(slug)

// ─────────────────────────────────────────────────────────────────────────────
// Parent Features Toggle (Subclass Only)
// ─────────────────────────────────────────────────────────────────────────────

const showParentFeatures = ref(true)

// ─────────────────────────────────────────────────────────────────────────────
// Feature Filtering
// ─────────────────────────────────────────────────────────────────────────────

const { filterDisplayFeatures } = useFeatureFiltering()

/**
 * Get features at a specific level (filtered for display)
 */
function getFeaturesAtLevel(level: number, featureList: ClassFeatureResource[]): ClassFeatureResource[] {
  return filterDisplayFeatures(featureList.filter(f => f.level === level))
}

/**
 * Separate parent and subclass features
 */
const { parentFeatures, subclassFeatures } = computed(() => {
  if (!isSubclass.value || !features.value) {
    return { parentFeatures: [], subclassFeatures: features.value }
  }

  // For subclasses, we need to identify which features are from parent vs subclass
  // The API returns all features together, but we can identify parent features
  // by checking if they appear in the parent class data
  const parentClassFeatureNames = new Set(
    parentClass.value?.features?.map(f => f.feature_name) || []
  )

  const parent: ClassFeatureResource[] = []
  const subclass: ClassFeatureResource[] = []

  features.value.forEach((feature) => {
    if (parentClassFeatureNames.has(feature.feature_name)) {
      parent.push(feature)
    } else {
      subclass.push(feature)
    }
  })

  return { parentFeatures: parent, subclassFeatures: subclass }
}).value

// ─────────────────────────────────────────────────────────────────────────────
// Spell Slot Tracking
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get spell slots at a given level from progression data
 */
function getSpellSlotsAtLevel(level: number): Record<string, number> | undefined {
  const progression = levelProgression.value?.find(p => p.level === level)
  if (!progression) return undefined

  const slots: Record<string, number> = {}
  let hasSlots = false

  // Map spell slot fields to display format
  const slotMap = {
    spell_slots_1st: '1st',
    spell_slots_2nd: '2nd',
    spell_slots_3rd: '3rd',
    spell_slots_4th: '4th',
    spell_slots_5th: '5th',
    spell_slots_6th: '6th',
    spell_slots_7th: '7th',
    spell_slots_8th: '8th',
    spell_slots_9th: '9th'
  }

  Object.entries(slotMap).forEach(([key, label]) => {
    const value = (progression as any)[key]
    if (value && value > 0) {
      slots[label] = value
      hasSlots = true
    }
  })

  return hasSlots ? slots : undefined
}

/**
 * Get cantrips known at a given level
 */
function getCantripsAtLevel(level: number): number | undefined {
  const progression = levelProgression.value?.find(p => p.level === level)
  return progression?.cantrips_known || undefined
}

/**
 * Detect if a new spell tier is unlocked at this level
 */
function isNewSpellTierLevel(level: number): boolean {
  const currentSlots = getSpellSlotsAtLevel(level)
  const previousSlots = level > 1 ? getSpellSlotsAtLevel(level - 1) : undefined

  if (!currentSlots) return false

  // Check if any spell level appears for the first time
  return Object.keys(currentSlots).some((slotLevel) => {
    return !previousSlots || !(slotLevel in previousSlots)
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Counter/Resource Tracking
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Counter from API - actual structure: { name, reset_timing, progression: [{level, value}] }
 */
interface CounterFromAPI {
  name: string
  reset_timing: string
  progression: Array<{ level: number, value: number }>
}

/**
 * Get counter value at a specific level
 */
function getCounterValueAtLevel(level: number): { value: number, name: string } | undefined {
  if (!counters.value || counters.value.length === 0) return undefined

  // Get the first counter (primary resource like Ki, Rage, etc.)
  const firstCounter = counters.value[0] as unknown as CounterFromAPI
  if (!firstCounter?.progression) return undefined

  // Find the progression entry for this level or the most recent one before it
  const sorted = [...firstCounter.progression].sort((a, b) => a.level - b.level)
  const applicableEntry = sorted.filter(p => p.level <= level).pop()

  if (!applicableEntry) return undefined

  return {
    value: applicableEntry.value,
    name: firstCounter.name
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Milestone Detection
// ─────────────────────────────────────────────────────────────────────────────

const ASI_LEVELS = [4, 8, 12, 16, 19]

/**
 * Determine if a level is a milestone and what type
 */
function getMilestone(level: number): { isMilestone: boolean, type?: TimelineLevel['milestoneType'], label?: string } {
  // Subclass choice (convert subclass_level string to number for comparison)
  const subclassLevelNum = subclassLevel.value ? parseInt(String(subclassLevel.value)) : null
  if (subclassLevelNum && level === subclassLevelNum) {
    return {
      isMilestone: true,
      type: 'subclass',
      label: isSubclass.value ? 'Your Subclass' : 'Choose Subclass'
    }
  }

  // Capstone
  if (level === 20) {
    return {
      isMilestone: true,
      type: 'capstone',
      label: 'Capstone'
    }
  }

  // ASI
  if (ASI_LEVELS.includes(level)) {
    return {
      isMilestone: true,
      type: 'asi',
      label: 'Ability Score Improvement'
    }
  }

  // New spell tier
  if (isNewSpellTierLevel(level)) {
    return {
      isMilestone: true,
      type: 'spell_tier',
      label: 'New Spell Tier'
    }
  }

  return { isMilestone: false }
}

/**
 * Get proficiency bonus for a level
 */
function getProficiencyBonus(level: number): string {
  if (level <= 4) return '+2'
  if (level <= 8) return '+3'
  if (level <= 12) return '+4'
  if (level <= 16) return '+5'
  return '+6'
}

/**
 * Get the first level where optional features become available
 */
function getFirstOptionsLevel(): number {
  if (optionalFeatures.value.length === 0) return 0

  // Find minimum level requirement, or assume level 2 if none have requirements
  const minLevel = optionalFeatures.value.reduce((min, f) => {
    if (f.level_requirement === null) return min
    return Math.min(min, f.level_requirement)
  }, Infinity)

  return minLevel === Infinity ? 2 : minLevel
}

// ─────────────────────────────────────────────────────────────────────────────
// Timeline Data Construction
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build timeline data for all 20 levels
 * Only include levels where something happens (features, resources, spell slots, etc.)
 */
const timelineLevels = computed<TimelineLevel[]>(() => {
  if (!entity.value) return []

  const levels: TimelineLevel[] = []

  for (let level = 1; level <= 20; level++) {
    const classFeatures = isSubclass.value
      ? getFeaturesAtLevel(level, subclassFeatures)
      : getFeaturesAtLevel(level, features.value)

    const parentClassFeatures = isSubclass.value
      ? getFeaturesAtLevel(level, parentFeatures)
      : []

    const spellSlots = getSpellSlotsAtLevel(level)
    const cantripsKnown = getCantripsAtLevel(level)
    const counterData = getCounterValueAtLevel(level)
    const milestone = getMilestone(level)

    // Calculate available options and determine if this is the first level they appear
    const availableOptions = optionalFeatures.value.length > 0
      ? getOptionsAvailableAtLevel(level)
      : []

    // Only show options at the first level they become available
    const isFirstOptionsLevel = level === getFirstOptionsLevel()

    // Only include levels where something happens
    const hasContent
      = classFeatures.length > 0
        || parentClassFeatures.length > 0
        || spellSlots
        || cantripsKnown
        || counterData
        || milestone.isMilestone
        || (isFirstOptionsLevel && availableOptions.length > 0)

    if (!hasContent) continue

    levels.push({
      level,
      proficiencyBonus: getProficiencyBonus(level),
      features: classFeatures,
      parentFeatures: parentClassFeatures.length > 0 ? parentClassFeatures : undefined,
      spellSlots,
      cantripsKnown,
      resourceValue: counterData?.value,
      resourceName: counterData?.name,
      isMilestone: milestone.isMilestone,
      milestoneType: milestone.type,
      milestoneLabel: milestone.label,
      availableOptions: isFirstOptionsLevel ? availableOptions : undefined
    })
  }

  return levels
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <!-- Loading -->
    <UiDetailPageLoading
      v-if="pending"
      entity-type="class"
    />

    <!-- Error -->
    <UiDetailPageError
      v-else-if="error"
      entity-type="Class"
    />

    <!-- Content -->
    <div
      v-else-if="entity"
      class="space-y-8"
    >
      <!-- Shared Header -->
      <ClassDetailHeader
        :entity="entity"
        :is-subclass="isSubclass"
        :parent-class="parentClass"
      />

      <!-- View Navigation -->
      <ClassViewNavigation :slug="slug" />

      <!-- Parent Toggle (Subclass Only) -->
      <ClassJourneyParentToggle
        v-if="isSubclass && parentClass"
        v-model="showParentFeatures"
        :parent-name="parentClass.name"
      />

      <!-- Journey Timeline -->
      <ClassJourneyTimeline
        :levels="timelineLevels"
        :show-parent-features="showParentFeatures"
        :parent-class-name="parentClass?.name"
      />
    </div>
  </div>
</template>
