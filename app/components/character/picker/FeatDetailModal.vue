<!-- app/components/character/picker/FeatDetailModal.vue -->
<script setup lang="ts">
import type { Feat } from '~/types'

interface Props {
  feat: Feat | null
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

// Use local ref for v-model binding (matches other detail modal patterns)
const isOpen = computed({
  get: () => props.open,
  set: (value) => {
    if (!value) emit('close')
  }
})

/**
 * Check if feat has prerequisites
 */
const hasPrerequisites = computed(() => {
  return props.feat?.prerequisites && props.feat.prerequisites.length > 0
})

/**
 * Get prerequisites list for display
 */
const prerequisitesList = computed(() => {
  if (!hasPrerequisites.value || !props.feat?.prerequisites) return []

  return props.feat.prerequisites.map((prereq) => {
    if (prereq.ability_score) {
      return `${prereq.ability_score.name} ${prereq.minimum_value}+`
    }
    return prereq.description || 'Unknown prerequisite'
  })
})

/**
 * Check if this is a half-feat (grants +1 to ability score)
 */
const isHalfFeat = computed(() => {
  if (!props.feat?.modifiers) return false
  return props.feat.modifiers.some(
    m => m.modifier_category === 'ability_score' && m.value === '1'
  )
})

/**
 * Get ability score modifiers
 */
const abilityModifiers = computed(() => {
  if (!props.feat?.modifiers) return []
  return props.feat.modifiers
    .filter(m => m.modifier_category === 'ability_score')
    .map(m => ({
      code: m.ability_score?.code || 'Choice',
      value: m.value,
      isChoice: m.is_choice
    }))
})

/**
 * Get granted proficiencies
 * Note: Proficiency modifiers store the skill in the skill property
 */
const grantedProficiencies = computed(() => {
  if (!props.feat?.modifiers) return []
  return props.feat.modifiers
    .filter(m => m.modifier_category === 'proficiency')
    .map(m => m.skill?.name || m.value || 'Proficiency')
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="feat?.name ?? 'Feat Details'"
  >
    <template #body>
      <div
        v-if="feat"
        class="space-y-4"
      >
        <!-- Type Badges -->
        <div class="flex items-center gap-2 flex-wrap">
          <UBadge
            color="feat"
            variant="subtle"
            size="md"
          >
            Feat
          </UBadge>
          <UBadge
            v-if="isHalfFeat"
            color="success"
            variant="subtle"
            size="md"
          >
            Half-Feat
          </UBadge>
          <UBadge
            v-if="!hasPrerequisites"
            color="info"
            variant="subtle"
            size="md"
          >
            No Prerequisites
          </UBadge>
        </div>

        <!-- Prerequisites -->
        <div
          v-if="hasPrerequisites"
          class="bg-warning-50 dark:bg-warning-900/20 rounded-lg p-3"
        >
          <h4 class="font-semibold text-warning-900 dark:text-warning-100 mb-2">
            Prerequisites
          </h4>
          <ul class="space-y-1 text-sm text-warning-700 dark:text-warning-300">
            <li
              v-for="(prereq, idx) in prerequisitesList"
              :key="idx"
            >
              • {{ prereq }}
            </li>
          </ul>
        </div>

        <!-- Benefits Grid -->
        <div
          v-if="abilityModifiers.length > 0 || grantedProficiencies.length > 0"
          class="grid grid-cols-2 gap-3"
        >
          <!-- Ability Score Bonuses -->
          <div
            v-if="abilityModifiers.length > 0"
            class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
          >
            <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm">
              Ability Score
            </h4>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="(mod, idx) in abilityModifiers"
                :key="idx"
                color="primary"
                variant="subtle"
                size="md"
              >
                {{ mod.isChoice ? 'Choice' : mod.code }} +{{ mod.value }}
              </UBadge>
            </div>
          </div>

          <!-- Proficiencies -->
          <div
            v-if="grantedProficiencies.length > 0"
            class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
          >
            <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm">
              Proficiencies
            </h4>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="(prof, idx) in grantedProficiencies"
                :key="idx"
                color="secondary"
                variant="subtle"
                size="md"
              >
                {{ prof }}
              </UBadge>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div
          v-if="feat.description"
          class="prose prose-sm dark:prose-invert max-w-none"
        >
          <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {{ feat.description }}
          </p>
        </div>

        <!-- Source -->
        <div
          v-if="feat.sources && feat.sources.length > 0"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          Source: {{ feat.sources.map(s => s.name || s.code).join(', ') }}
        </div>
      </div>
    </template>
  </UModal>
</template>
