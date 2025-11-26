<script setup lang="ts">
import type { ClassHitPoints } from '~/types/api/entities'

interface Props {
  hitPoints: ClassHitPoints
}

defineProps<Props>()
</script>

<template>
  <UCard>
    <div class="flex items-start gap-4">
      <div class="flex-shrink-0">
        <div class="w-12 h-12 rounded-lg bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
          <UIcon
            name="i-heroicons-heart"
            class="w-6 h-6 text-error-600 dark:text-error-400"
          />
        </div>
      </div>

      <div class="flex-1 space-y-3">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Hit Points
        </h3>

        <dl class="space-y-2 text-sm">
          <div class="flex flex-col sm:flex-row sm:gap-2">
            <dt class="font-medium text-gray-600 dark:text-gray-400 sm:w-32">
              Hit Dice
            </dt>
            <dd class="text-gray-900 dark:text-gray-100">
              1{{ hitPoints.hit_die }} per level
            </dd>
          </div>

          <div class="flex flex-col sm:flex-row sm:gap-2">
            <dt class="font-medium text-gray-600 dark:text-gray-400 sm:w-32">
              HP at 1st Level
            </dt>
            <dd class="text-gray-900 dark:text-gray-100">
              {{ hitPoints.first_level.description }}
            </dd>
          </div>

          <div class="flex flex-col sm:flex-row sm:gap-2">
            <dt class="font-medium text-gray-600 dark:text-gray-400 sm:w-32">
              HP at Higher Levels
            </dt>
            <dd class="text-gray-900 dark:text-gray-100">
              {{ hitPoints.higher_levels.description }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </UCard>
</template>
