<script setup lang="ts">
import type { components } from '~/types/api/generated'

type ClassFeatureResource = components['schemas']['ClassFeatureResource']

interface Props {
  features: ClassFeatureResource[]
  showLevel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLevel: true
})

/**
 * Patterns that indicate choice options (not primary features).
 * These should be excluded from feature display.
 * Based on patterns from UiClassSubclassCards.
 */
const CHOICE_OPTION_PATTERNS = [
  /^Fighting Style: /,
  /^Bear \(/,
  /^Eagle \(/,
  /^Wolf \(/,
  /^Elk \(/,
  /^Tiger \(/,
  /^Aspect of the Bear/,
  /^Aspect of the Eagle/,
  /^Aspect of the Wolf/,
  /^Aspect of the Elk/,
  /^Aspect of the Tiger/
]

/**
 * Check if a feature is a choice option (not a primary feature)
 */
const isChoiceOption = (featureName: string): boolean => {
  return CHOICE_OPTION_PATTERNS.some(pattern => pattern.test(featureName))
}

/**
 * Filter out choice options from features
 */
const filterChoiceOptions = (features: ClassFeatureResource[]): ClassFeatureResource[] => {
  return features.filter((f) => {
    const name = f.feature_name || ''
    return !isChoiceOption(name)
  })
}

/**
 * Group features by level, filtering out choice options
 */
const featuresByLevel = computed(() => {
  const filtered = filterChoiceOptions(props.features)
  const grouped = new Map<number, ClassFeatureResource[]>()

  filtered.forEach((feature) => {
    const level = feature.level
    if (!grouped.has(level)) {
      grouped.set(level, [])
    }
    grouped.get(level)!.push(feature)
  })

  // Convert to array and sort by level
  return Array.from(grouped.entries())
    .sort(([levelA], [levelB]) => levelA - levelB)
    .filter(([, features]) => features.length > 0) // Hide empty levels
})

/**
 * Create accordion items for UAccordion
 */
const accordionItems = computed(() => {
  return featuresByLevel.value.map(([level, features]) => {
    const featureCount = features.length
    const countText = featureCount === 1 ? '1 feature' : `${featureCount} features`

    return {
      label: `Level ${level} (${countText})`,
      slot: `level-${level}`,
      defaultOpen: true // Open by default for better UX and testing
    }
  })
})
</script>

<template>
  <UAccordion
    v-if="featuresByLevel.length > 0"
    :items="accordionItems"
    type="multiple"
    class="border-2 border-class-500 dark:border-class-700 rounded-lg"
  >
    <!-- Render slot content for each level -->
    <template
      v-for="[level, levelFeatures] in featuresByLevel"
      :key="`slot-${level}`"
      #[`level-${level}`]
    >
      <UiAccordionTraitsList
        :traits="levelFeatures"
        :show-level="showLevel"
      />
    </template>
  </UAccordion>
</template>
