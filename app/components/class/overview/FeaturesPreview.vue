<script setup lang="ts">
import type { components } from '~/types/api/generated'

type ClassFeatureResource = components['schemas']['ClassFeatureResource']

interface Props {
  features: ClassFeatureResource[]
  slug: string
}

const props = defineProps<Props>()

const { filterDisplayFeatures } = useFeatureFiltering()

/**
 * Filter features for overview display
 * - No multiclass features
 * - No choice options
 * - No starting features
 * - No ASI features
 */
const displayFeatures = computed(() => {
  const filtered = filterDisplayFeatures(props.features)

  // Further filter out ASI (not in the composable yet)
  return filtered
    .filter(f => f.feature_name !== 'Ability Score Improvement')
    .slice(0, 6) // Show max 6 features in preview
})

/**
 * Truncate description for preview
 */
function truncateDescription(text: string | null | undefined, maxLength = 120): string {
  if (!text) return ''

  if (text.length <= maxLength) return text

  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...'
  }

  return truncated + '...'
}

/**
 * Get badge color for level
 */
type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'

function getLevelBadgeColor(level: number): BadgeColor {
  if (level === 1) return 'success'
  if (level <= 5) return 'info'
  if (level <= 10) return 'warning'
  if (level <= 15) return 'error'
  return 'primary'
}
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Key Features
        </h3>
        <NuxtLink
          :to="`/classes/${slug}/reference`"
          class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
        >
          <span>View All</span>
          <UIcon
            name="i-heroicons-arrow-right"
            class="w-4 h-4"
          />
        </NuxtLink>
      </div>

      <!-- Features List -->
      <div
        v-if="displayFeatures.length > 0"
        class="space-y-3"
      >
        <div
          v-for="feature in displayFeatures"
          :key="feature.id"
          class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div class="flex items-start justify-between gap-3 mb-2">
            <h4 class="font-semibold text-gray-900 dark:text-gray-100">
              {{ feature.feature_name }}
            </h4>
            <UBadge
              :color="getLevelBadgeColor(feature.level)"
              variant="soft"
              size="xs"
              class="flex-shrink-0"
            >
              Level {{ feature.level }}
            </UBadge>
          </div>

          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ truncateDescription(feature.description) }}
          </p>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        <UIcon
          name="i-heroicons-sparkles"
          class="w-8 h-8 mx-auto mb-2 opacity-50"
        />
        <p class="text-sm">
          No features available for preview
        </p>
      </div>

      <!-- Link to Reference -->
      <div
        v-if="displayFeatures.length > 0"
        class="pt-3 border-t border-gray-200 dark:border-gray-700"
      >
        <NuxtLink
          :to="`/classes/${slug}/reference`"
          class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center justify-center gap-1 group"
        >
          <span>See all features in Reference view</span>
          <UIcon
            name="i-heroicons-arrow-right"
            class="w-4 h-4 transition-transform group-hover:translate-x-1"
          />
        </NuxtLink>
      </div>
    </div>
  </UCard>
</template>
