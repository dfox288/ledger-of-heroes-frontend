<script setup lang="ts">
/**
 * Journey Timeline
 *
 * Vertical timeline showing level-by-level class progression.
 * Displays features, milestones, spell slots, and resources for each level.
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
  resourceValue?: number | string // Can be "Unlimited" at level 20
  resourceName?: string
  isMilestone: boolean
  milestoneType?: 'subclass' | 'asi' | 'spell_tier' | 'capstone'
  milestoneLabel?: string
}

interface Props {
  levels: TimelineLevel[]
  showParentFeatures?: boolean
  parentClassName?: string
}

withDefaults(defineProps<Props>(), {
  showParentFeatures: false,
  parentClassName: undefined
})
</script>

<template>
  <div
    v-if="levels.length > 0"
    class="space-y-0"
  >
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Your Path to Power
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        Follow your progression from level 1 to 20
      </p>
    </div>

    <!-- Timeline structure -->
    <div class="relative">
      <!-- Vertical connecting line -->
      <div
        class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"
        aria-hidden="true"
      />

      <!-- Level nodes -->
      <ClassJourneyLevelNode
        v-for="(level, index) in levels"
        :key="level.level"
        :level="level"
        :is-last="index === levels.length - 1"
        :show-parent-features="showParentFeatures"
        :parent-class-name="parentClassName"
      />
    </div>
  </div>

  <!-- Empty state -->
  <div
    v-else
    class="text-center py-12 text-gray-500 dark:text-gray-400"
  >
    <UIcon
      name="i-heroicons-map"
      class="w-12 h-12 mx-auto mb-3 opacity-50"
    />
    <p>No progression data available</p>
  </div>
</template>
