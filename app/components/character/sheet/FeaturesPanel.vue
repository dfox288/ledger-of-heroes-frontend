<!-- app/components/character/sheet/FeaturesPanel.vue -->
<script setup lang="ts">
/**
 * Features Panel Component
 *
 * Displays character features in an accordion layout with:
 * - Search/filter functionality
 * - Expand all / Collapse all controls
 * - Grouping by source (Race, Class, Subclass, Background, Feats)
 * - Visual indicators for level acquired and limited uses
 *
 * @see Issue #558 - Features tab implementation
 */
import type { CharacterFeature } from '~/types/character'

const props = withDefaults(defineProps<{
  features?: CharacterFeature[]
}>(), {
  features: () => []
})

/** Valid NuxtUI badge colors */
type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

/** Source display order and labels */
const SOURCE_CONFIG: Record<string, { label: string, color: BadgeColor, order: number }> = {
  race: { label: 'Racial Traits', color: 'success', order: 1 },
  class: { label: 'Class Features', color: 'info', order: 2 },
  subclass: { label: 'Subclass Features', color: 'secondary', order: 3 },
  background: { label: 'Background Feature', color: 'warning', order: 4 },
  feat: { label: 'Feats', color: 'error', order: 5 }
}

/** Search query */
const searchQuery = ref('')

/** Expanded feature IDs - using array for proper Vue reactivity */
const expandedIds = ref<number[]>([])

/** Filter features by search query */
const filteredFeatures = computed(() => {
  const featuresList = props.features
  if (!featuresList || !Array.isArray(featuresList)) return []

  if (!searchQuery.value.trim()) return featuresList

  const query = searchQuery.value.toLowerCase()
  return featuresList.filter(f =>
    f.feature?.name?.toLowerCase().includes(query)
    || f.feature?.description?.toLowerCase().includes(query)
  )
})

/** Group features by source */
const featuresBySource = computed(() => {
  const grouped: Record<string, CharacterFeature[]> = {}

  for (const feature of filteredFeatures.value) {
    const source = feature.source || 'other'
    if (!grouped[source]) {
      grouped[source] = []
    }
    grouped[source].push(feature)
  }

  // Sort each group by level_acquired
  for (const source of Object.keys(grouped)) {
    grouped[source]?.sort((a, b) => (a.level_acquired ?? 0) - (b.level_acquired ?? 0))
  }

  return grouped
})

/** Get sources in display order */
const orderedSources = computed(() => {
  return Object.keys(featuresBySource.value).sort((a, b) => {
    const orderA = SOURCE_CONFIG[a]?.order ?? 99
    const orderB = SOURCE_CONFIG[b]?.order ?? 99
    return orderA - orderB
  })
})

/** Total feature count for header */
const totalCount = computed(() => props.features?.length ?? 0)

/** Filtered count */
const filteredCount = computed(() => filteredFeatures.value.length)

/** Check if a feature is expanded */
function isExpanded(featureId: number): boolean {
  return expandedIds.value.includes(featureId)
}

/** Toggle a single feature */
function toggleFeature(featureId: number) {
  const index = expandedIds.value.indexOf(featureId)
  if (index >= 0) {
    expandedIds.value.splice(index, 1)
  } else {
    expandedIds.value.push(featureId)
  }
}

/** Expand all features */
function expandAll() {
  expandedIds.value = filteredFeatures.value.map(f => f.id)
}

/** Collapse all features */
function collapseAll() {
  expandedIds.value = []
}

/** Check if all are expanded */
const allExpanded = computed(() => {
  if (filteredFeatures.value.length === 0) return false
  return filteredFeatures.value.every(f => expandedIds.value.includes(f.id))
})

/** Clear expansion state when search changes */
watch(searchQuery, () => {
  expandedIds.value = []
})

/** Get source badge color */
function getSourceColor(source: string): BadgeColor {
  return SOURCE_CONFIG[source]?.color ?? 'neutral'
}

/** Get source label */
function getSourceLabel(source: string): string {
  return SOURCE_CONFIG[source]?.label ?? source
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header with Search and Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Features
        <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
          ({{ filteredCount }}<span v-if="searchQuery"> of {{ totalCount }}</span>)
        </span>
      </h3>

      <div class="flex items-center gap-2">
        <!-- Search Input -->
        <UInput
          v-model="searchQuery"
          data-testid="feature-search"
          placeholder="Search features..."
          icon="i-heroicons-magnifying-glass"
          size="sm"
          class="w-48"
        />

        <!-- Expand/Collapse Buttons -->
        <UButton
          v-if="!allExpanded"
          data-testid="expand-all-btn"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-heroicons-arrows-pointing-out"
          @click="expandAll"
        >
          Expand All
        </UButton>
        <UButton
          v-else
          data-testid="collapse-all-btn"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-heroicons-arrows-pointing-in"
          @click="collapseAll"
        >
          Collapse All
        </UButton>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!features || features.length === 0"
      class="text-center text-gray-500 dark:text-gray-400 py-8"
    >
      <UIcon
        name="i-heroicons-sparkles"
        class="w-12 h-12 mx-auto mb-3 opacity-50"
      />
      <p>No features yet</p>
    </div>

    <!-- No Results State -->
    <div
      v-else-if="filteredFeatures.length === 0"
      class="text-center text-gray-500 dark:text-gray-400 py-8"
    >
      <UIcon
        name="i-heroicons-magnifying-glass"
        class="w-12 h-12 mx-auto mb-3 opacity-50"
      />
      <p>No features match "{{ searchQuery }}"</p>
    </div>

    <!-- Features by Source -->
    <template v-else>
      <div
        v-for="source in orderedSources"
        :key="source"
        class="space-y-2"
      >
        <!-- Source Header -->
        <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
          {{ getSourceLabel(source) }}
          <UBadge
            :color="getSourceColor(source)"
            variant="subtle"
            size="xs"
          >
            {{ featuresBySource[source]?.length ?? 0 }}
          </UBadge>
        </h4>

        <!-- Feature List -->
        <div class="space-y-2">
          <div
            v-for="feature in featuresBySource[source]"
            :key="feature.id"
            class="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden"
          >
            <!-- Feature Header (Clickable) -->
            <button
              type="button"
              :data-testid="`feature-toggle-${feature.id}`"
              class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              @click="toggleFeature(feature.id)"
            >
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <!-- Expand/Collapse Icon -->
                <UIcon
                  :name="isExpanded(feature.id) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                  class="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform"
                />

                <!-- Feature Name -->
                <span class="font-medium text-gray-900 dark:text-white truncate">
                  {{ feature.feature?.name ?? 'Unknown Feature' }}
                </span>

                <!-- Level Badge (for class/subclass features) -->
                <UBadge
                  v-if="feature.level_acquired && (source === 'class' || source === 'subclass')"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                >
                  Lvl {{ feature.level_acquired }}
                </UBadge>

                <!-- Optional/Chosen Indicator -->
                <UBadge
                  v-if="feature.feature?.is_optional === 'true'"
                  color="primary"
                  variant="subtle"
                  size="xs"
                >
                  Chosen
                </UBadge>
              </div>
            </button>

            <!-- Feature Description (Collapsible) -->
            <div
              v-if="isExpanded(feature.id) && feature.feature?.description"
              class="px-4 pb-4 pt-0"
            >
              <!-- Prerequisite (for feats only) -->
              <div
                v-if="feature.source === 'feat' && feature.feature?.prerequisite"
                class="pl-7 mb-2 text-xs text-gray-500 dark:text-gray-400 italic"
              >
                <span class="font-medium">Prerequisite:</span> {{ feature.feature.prerequisite }}
              </div>
              <div class="pl-7 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line border-l-2 border-gray-200 dark:border-gray-600 ml-0.5">
                {{ feature.feature.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
