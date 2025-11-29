<script setup lang="ts">
/**
 * Journey Level Node
 *
 * Single level in the journey timeline.
 * Shows level number, features, spell slots, milestones, and progression info.
 */

import type { components } from '~/types/api/generated'

type ClassFeatureResource = components['schemas']['ClassFeatureResource']

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
}

interface Props {
  level: TimelineLevel
  isLast: boolean
  showParentFeatures: boolean
  parentClassName?: string
}

const props = defineProps<Props>()

/**
 * Truncate description for preview
 */
function truncateDescription(text: string, maxLength: number = 150): string {
  if (!text || text.length <= maxLength) return text

  const truncated = text.substring(0, maxLength)
  const lastPeriod = truncated.lastIndexOf('.')
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastPeriod > maxLength * 0.6) {
    return truncated.substring(0, lastPeriod + 1)
  }
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...'
  }
  return truncated + '...'
}

/**
 * Get icon for level
 */
const levelIcon = computed(() => {
  if (props.level.milestoneType === 'subclass') return 'i-heroicons-star-solid'
  if (props.level.milestoneType === 'asi') return 'i-heroicons-arrow-trending-up'
  if (props.level.milestoneType === 'spell_tier') return 'i-heroicons-sparkles'
  if (props.level.milestoneType === 'capstone') return 'i-heroicons-trophy'
  if (props.level.level === 1) return 'i-heroicons-play'
  return 'i-heroicons-star'
})
</script>

<template>
  <div
    :class="[
      'relative pb-8',
      { 'pb-0': isLast }
    ]"
  >
    <!-- Level indicator circle -->
    <div class="flex items-start gap-4">
      <div
        :class="[
          'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ring-4 ring-white dark:ring-gray-900',
          level.isMilestone
            ? 'bg-warning-100 dark:bg-warning-900 border-warning-500 dark:border-warning-400 text-warning-700 dark:text-warning-300'
            : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
        ]"
      >
        <UIcon
          :name="levelIcon"
          class="w-4 h-4"
        />
      </div>

      <!-- Level content -->
      <div class="flex-1 min-w-0 pt-0.5">
        <!-- Level header -->
        <div class="flex items-center gap-2 mb-3 flex-wrap">
          <h4 class="text-lg font-bold text-gray-900 dark:text-gray-100">
            Level {{ level.level }}
          </h4>
          <UBadge
            color="neutral"
            variant="subtle"
            size="xs"
          >
            {{ level.proficiencyBonus }} Proficiency
          </UBadge>

          <!-- Milestone badge -->
          <ClassJourneyMilestoneBadge
            v-if="level.isMilestone && level.milestoneType"
            :type="level.milestoneType"
            :label="level.milestoneLabel"
          />
        </div>

        <!-- Resource counter (Ki, Rage, etc.) -->
        <div
          v-if="level.resourceValue && level.resourceName"
          class="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800 text-sm"
        >
          <span class="font-medium text-blue-900 dark:text-blue-100">{{ level.resourceName }}:</span>
          <span class="text-blue-700 dark:text-blue-300 ml-1">{{ level.resourceValue }}</span>
        </div>

        <!-- Spell slots -->
        <ClassJourneySpellSlotIndicator
          v-if="level.spellSlots || level.cantripsKnown"
          :spell-slots="level.spellSlots || {}"
          :cantrips-known="level.cantripsKnown"
          class="mb-3"
        />

        <!-- Parent class features (muted) -->
        <div
          v-if="showParentFeatures && level.parentFeatures && level.parentFeatures.length > 0"
          class="space-y-3 mb-4"
        >
          <div
            v-for="feature in level.parentFeatures"
            :key="feature.id"
            class="relative pl-4 border-l-2 border-gray-300 dark:border-gray-600 opacity-75"
          >
            <div class="flex items-start gap-2 mb-1">
              <span class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                {{ parentClassName }}
              </span>
            </div>
            <h5 class="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {{ feature.feature_name }}
            </h5>
            <p
              v-if="feature.description"
              class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line"
            >
              {{ truncateDescription(feature.description) }}
            </p>

            <!-- Expand for long descriptions -->
            <details
              v-if="feature.description && feature.description.length > 150"
              class="mt-2"
            >
              <summary class="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 hover:underline">
                Show full description
              </summary>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {{ feature.description }}
              </p>
            </details>
          </div>
        </div>

        <!-- Subclass/class features -->
        <div
          v-if="level.features.length > 0"
          class="space-y-3"
        >
          <div
            v-for="feature in level.features"
            :key="feature.id"
            class="relative pl-4 border-l-2 border-class-500 dark:border-class-400 hover:border-class-600 dark:hover:border-class-300 transition-colors"
          >
            <h5 class="font-semibold text-gray-800 dark:text-gray-200 mb-1">
              {{ feature.feature_name }}
            </h5>
            <p
              v-if="feature.description"
              class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line"
            >
              {{ truncateDescription(feature.description) }}
            </p>

            <!-- Expand for long descriptions -->
            <details
              v-if="feature.description && feature.description.length > 150"
              class="mt-2"
            >
              <summary class="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 hover:underline">
                Show full description
              </summary>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {{ feature.description }}
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
