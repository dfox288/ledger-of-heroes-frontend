<script setup lang="ts">
import type { components } from '~/types/api/generated'

type ClassFeatureResource = components['schemas']['ClassFeatureResource']

interface Props {
  features: ClassFeatureResource[]
}

const props = defineProps<Props>()

// Use centralized feature filtering composable
const { filterDisplayFeatures } = useFeatureFiltering()

/**
 * Group features by level, filtering out choice options, multiclass, and starting features
 */
const featuresByLevel = computed(() => {
  const filtered = filterDisplayFeatures(props.features)
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
    .filter(([, features]) => features.length > 0)
})

/**
 * Build timeline items from grouped features
 */
const timelineItems = computed(() => {
  return featuresByLevel.value.map(([level, features]) => {
    const featureCount = features.length
    const countText = featureCount === 1 ? '1 feature' : `${featureCount} features`

    return {
      value: `level-${level}`,
      title: `Level ${level}`,
      description: countText,
      icon: getLevelIcon(level),
      features
    }
  })
})

/**
 * Get an icon based on level milestones
 */
function getLevelIcon(level: number): string {
  // ASI levels
  if ([4, 8, 12, 16, 19].includes(level)) {
    return 'i-heroicons-arrow-trending-up'
  }
  // Subclass levels (typically 1, 3)
  if (level === 1) {
    return 'i-heroicons-play'
  }
  if (level === 3) {
    return 'i-heroicons-sparkles'
  }
  // Capstone
  if (level === 20) {
    return 'i-heroicons-trophy'
  }
  // Extra Attack levels
  if ([5, 11, 20].includes(level)) {
    return 'i-heroicons-bolt'
  }
  // Default
  return 'i-heroicons-star'
}

/**
 * Truncate description for preview, keeping it readable
 */
function truncateDescription(text: string, maxLength: number = 150): string {
  if (!text || text.length <= maxLength) return text

  // Find a good break point (end of sentence or word)
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
</script>

<template>
  <div
    v-if="timelineItems.length > 0"
    class="space-y-0"
  >
    <!-- Timeline using native structure for better control -->
    <div class="relative">
      <!-- Vertical line -->
      <div
        class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"
        aria-hidden="true"
      />

      <!-- Timeline items -->
      <div
        v-for="item in timelineItems"
        :key="item.value"
        class="relative pb-8 last:pb-0"
      >
        <!-- Level indicator -->
        <div class="flex items-start gap-4">
          <!-- Circle indicator - softer neutral style -->
          <div
            class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 ring-4 ring-white dark:ring-gray-900"
          >
            <UIcon
              :name="item.icon"
              class="w-4 h-4"
            />
          </div>

          <!-- Level header -->
          <div class="flex-1 min-w-0 pt-0.5">
            <div class="flex items-center gap-2 mb-3">
              <h4 class="text-lg font-bold text-gray-900 dark:text-gray-100">
                {{ item.title }}
              </h4>
              <UBadge
                color="neutral"
                variant="subtle"
                size="xs"
              >
                {{ item.description }}
              </UBadge>
            </div>

            <!-- Features at this level -->
            <div class="space-y-3 ml-1">
              <div
                v-for="feature in item.features"
                :key="feature.id"
                class="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
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

                <!-- Expand button for long descriptions -->
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
    </div>
  </div>

  <!-- Empty state -->
  <div
    v-else
    class="text-center py-8 text-gray-500 dark:text-gray-400"
  >
    <UIcon
      name="i-heroicons-document-text"
      class="w-12 h-12 mx-auto mb-2 opacity-50"
    />
    <p>No features to display</p>
  </div>
</template>
