<!-- app/components/character/sheet/OptionalFeaturesPanel.vue -->
<script setup lang="ts">
/**
 * Optional Features Panel Component
 *
 * Displays selected optional features (infusions, invocations, metamagic, etc.)
 * from `feature_selections` on the character resource.
 *
 * Features are grouped by feature_type with readable labels.
 *
 * @see Issue #712 - Frontend display
 * @see Issue #710 - Backend implementation
 */
import type { FeatureSelection } from '~/types/character'

const props = withDefaults(defineProps<{
  featureSelections?: FeatureSelection[]
}>(), {
  featureSelections: () => []
})

/** Valid NuxtUI badge colors */
type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

/** Feature type display config */
const FEATURE_TYPE_CONFIG: Record<string, { label: string, color: BadgeColor, order: number }> = {
  artificer_infusion: { label: 'Infusions', color: 'info', order: 1 },
  eldritch_invocation: { label: 'Invocations', color: 'secondary', order: 2 },
  metamagic: { label: 'Metamagic', color: 'warning', order: 3 },
  fighting_style: { label: 'Fighting Styles', color: 'error', order: 4 },
  maneuver: { label: 'Maneuvers', color: 'success', order: 5 },
  ki_feature: { label: 'Ki Features', color: 'primary', order: 6 }
}

/** Search query */
const searchQuery = ref('')

/** Expanded feature indices */
const expandedIndices = ref<number[]>([])

/** Filter features by search query */
const filteredFeatures = computed(() => {
  const features = props.featureSelections
  if (!features || !Array.isArray(features)) return []

  if (!searchQuery.value.trim()) return features

  const query = searchQuery.value.toLowerCase()
  return features.filter(f =>
    f.feature.toLowerCase().includes(query)
    || (f.class?.toLowerCase().includes(query) ?? false)
    || (f.feature_type?.toLowerCase().includes(query) ?? false)
  )
})

/** Group features by feature_type */
const featuresByType = computed(() => {
  const grouped: Record<string, FeatureSelection[]> = {}

  for (const feature of filteredFeatures.value) {
    const type = feature.feature_type || 'other'
    if (!grouped[type]) {
      grouped[type] = []
    }
    grouped[type].push(feature)
  }

  // Sort each group by level_acquired
  for (const type of Object.keys(grouped)) {
    grouped[type]?.sort((a, b) => (a.level_acquired ?? 0) - (b.level_acquired ?? 0))
  }

  return grouped
})

/** Get feature types in display order */
const orderedTypes = computed(() => {
  return Object.keys(featuresByType.value).sort((a, b) => {
    const orderA = FEATURE_TYPE_CONFIG[a]?.order ?? 99
    const orderB = FEATURE_TYPE_CONFIG[b]?.order ?? 99
    return orderA - orderB
  })
})

/** Total feature count */
const totalCount = computed(() => props.featureSelections?.length ?? 0)

/** Filtered count */
const filteredCount = computed(() => filteredFeatures.value.length)

/** Check if any features exist */
const hasFeatures = computed(() => totalCount.value > 0)

/** Check if a feature is expanded */
function isExpanded(index: number): boolean {
  return expandedIndices.value.includes(index)
}

/** Toggle a single feature */
function toggleFeature(index: number) {
  if (expandedIndices.value.includes(index)) {
    expandedIndices.value = expandedIndices.value.filter(i => i !== index)
  } else {
    expandedIndices.value = [...expandedIndices.value, index]
  }
}

/** Get feature type label */
function getTypeLabel(type: string): string {
  return FEATURE_TYPE_CONFIG[type]?.label ?? type
}

/** Get feature type badge color */
function getTypeColor(type: string): BadgeColor {
  return FEATURE_TYPE_CONFIG[type]?.color ?? 'neutral'
}

/** Get global index for a feature (for expand/collapse tracking) */
function getGlobalIndex(type: string, localIndex: number): number {
  let globalIndex = 0
  for (const t of orderedTypes.value) {
    if (t === type) {
      return globalIndex + localIndex
    }
    globalIndex += featuresByType.value[t]?.length ?? 0
  }
  return globalIndex + localIndex
}

/** Clear expansion state when search changes */
watch(searchQuery, () => {
  expandedIndices.value = []
})
</script>

<template>
  <div
    v-if="hasFeatures"
    data-testid="optional-features-panel"
    class="space-y-4"
  >
    <!-- Header with Search -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Optional Features
        <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
          ({{ filteredCount }}<span v-if="searchQuery"> of {{ totalCount }}</span>)
        </span>
      </h3>

      <UInput
        v-model="searchQuery"
        data-testid="optional-feature-search"
        placeholder="Search features..."
        icon="i-heroicons-magnifying-glass"
        size="sm"
        class="w-48"
      />
    </div>

    <!-- No Results State -->
    <div
      v-if="filteredFeatures.length === 0"
      class="text-center text-gray-500 dark:text-gray-400 py-8"
    >
      <UIcon
        name="i-heroicons-magnifying-glass"
        class="w-12 h-12 mx-auto mb-3 opacity-50"
      />
      <p>No features match "{{ searchQuery }}"</p>
    </div>

    <!-- Features by Type -->
    <template v-else>
      <div
        v-for="type in orderedTypes"
        :key="type"
        class="space-y-2"
      >
        <!-- Type Header -->
        <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
          {{ getTypeLabel(type) }}
          <UBadge
            :color="getTypeColor(type)"
            variant="subtle"
            size="xs"
          >
            {{ featuresByType[type]?.length ?? 0 }}
          </UBadge>
        </h4>

        <!-- Feature List -->
        <div class="space-y-2">
          <div
            v-for="(feature, localIndex) in featuresByType[type]"
            :key="feature.feature_slug"
            class="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden"
          >
            <!-- Feature Header (Clickable) -->
            <button
              type="button"
              :data-testid="`optional-feature-toggle-${getGlobalIndex(type, localIndex)}`"
              class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              @click="toggleFeature(getGlobalIndex(type, localIndex))"
            >
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <!-- Expand/Collapse Icon -->
                <UIcon
                  :name="isExpanded(getGlobalIndex(type, localIndex)) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                  class="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform"
                />

                <!-- Feature Name -->
                <span class="font-medium text-gray-900 dark:text-white truncate">
                  {{ feature.feature }}
                </span>

                <!-- Level Badge -->
                <UBadge
                  v-if="feature.level_acquired"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                >
                  Lvl {{ feature.level_acquired }}
                </UBadge>
              </div>
            </button>

            <!-- Feature Details (Collapsible) -->
            <div
              v-if="isExpanded(getGlobalIndex(type, localIndex))"
              class="px-4 pb-4 pt-1 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700/50"
            >
              <div class="pl-7 text-sm text-gray-600 dark:text-gray-300">
                <span class="font-medium">Class:</span> {{ feature.class }}
                <span
                  v-if="feature.subclass_name"
                  class="ml-2"
                >
                  ({{ feature.subclass_name }})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
