<!-- app/components/character/FeatCard.vue -->
<script setup lang="ts">
import type { Feat } from '~/types'

interface Props {
  feat: Feat
  selected: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  'toggle': [feat: Feat]
  'view-details': []
}>()

/**
 * Check if feat has prerequisites
 */
const hasPrerequisites = computed(() => {
  return props.feat.prerequisites && props.feat.prerequisites.length > 0
})

/**
 * Format a single prerequisite for display
 */
function formatPrerequisite(prereq: NonNullable<typeof props.feat.prerequisites>[number]): string {
  if (prereq.ability_score) {
    return `${prereq.ability_score.code} ${prereq.minimum_value}+`
  }
  if (prereq.race?.slug) {
    return prereq.race.name
  }
  if (prereq.skill?.slug) {
    return prereq.skill.name
  }
  if (prereq.proficiency_type?.slug) {
    return prereq.proficiency_type.name
  }
  return prereq.description || 'Prerequisites'
}

/**
 * Get prerequisites summary for badge
 */
const prerequisitesSummary = computed(() => {
  if (!hasPrerequisites.value) return null

  const prereqs = props.feat.prerequisites!
  const first = prereqs[0]

  // Single prerequisite: show full text
  if (prereqs.length === 1 && first) {
    return formatPrerequisite(first)
  }

  // Multiple prerequisites
  return `${prereqs.length} prerequisites`
})

/**
 * Check if this is a half-feat (grants +1 to ability score)
 */
const isHalfFeat = computed(() => {
  if (!props.feat.modifiers) return false
  return props.feat.modifiers.some(
    m => m.modifier_category === 'ability_score' && String(m.value) === '1'
  )
})

/**
 * Handle select event from EntityPickerCard
 */
function handleSelect() {
  emit('toggle', props.feat)
}

/**
 * Handle view-details event from EntityPickerCard
 */
function handleViewDetails() {
  emit('view-details')
}
</script>

<template>
  <CharacterEntityPickerCard
    :entity="feat"
    :selected="selected"
    :disabled="disabled"
    color="feat"
    test-id="feat-card"
    hide-view-details
    @select="handleSelect"
    @view-details="handleViewDetails"
  >
    <template #badges>
      <UBadge
        v-if="hasPrerequisites"
        color="warning"
        variant="subtle"
        size="md"
      >
        {{ prerequisitesSummary }}
      </UBadge>
      <UBadge
        v-else
        color="success"
        variant="subtle"
        size="md"
      >
        No Prerequisites
      </UBadge>
      <UBadge
        v-if="isHalfFeat"
        color="feat"
        variant="subtle"
        size="md"
      >
        Half-Feat
      </UBadge>
    </template>

    <template #stats>
      <!-- View Details as a stats item since we hide the default button -->
      <button
        data-testid="view-details-btn"
        type="button"
        class="text-xs text-feat-600 dark:text-feat-400 hover:underline"
        @click.stop="handleViewDetails"
      >
        View Details
      </button>
    </template>
  </CharacterEntityPickerCard>
</template>
