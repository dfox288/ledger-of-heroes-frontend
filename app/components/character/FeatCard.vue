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

function handleClick() {
  if (!props.disabled) {
    emit('toggle', props.feat)
  }
}

function handleViewDetails(event: Event) {
  event.stopPropagation()
  emit('view-details')
}
</script>

<template>
  <div
    data-testid="feat-card"
    role="button"
    :aria-label="`Select ${feat.name} feat`"
    :aria-pressed="selected"
    :tabindex="disabled ? -1 : 0"
    class="relative p-3 rounded-lg border-2 transition-all cursor-pointer"
    :class="[
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      selected
        ? 'ring-2 ring-feat-500 border-feat-500 bg-feat-50 dark:bg-feat-900/30'
        : 'border-gray-200 dark:border-gray-700 hover:border-feat-300'
    ]"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Selected Checkmark -->
    <div
      v-if="selected"
      data-testid="selected-check"
      class="absolute top-2 right-2 w-5 h-5 bg-feat-500 rounded-full flex items-center justify-center"
    >
      <UIcon
        name="i-heroicons-check"
        class="w-3 h-3 text-white"
      />
    </div>

    <div class="flex flex-col gap-2">
      <!-- Top row: badges -->
      <div class="flex items-center gap-2 flex-wrap">
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
      </div>

      <!-- Feat name -->
      <h4 class="font-semibold text-gray-900 dark:text-white pr-6">
        {{ feat.name }}
      </h4>

      <!-- View Details link -->
      <button
        data-testid="view-details-btn"
        type="button"
        class="text-xs text-feat-600 dark:text-feat-400 hover:underline self-start"
        @click="handleViewDetails"
      >
        View Details
      </button>
    </div>
  </div>
</template>
