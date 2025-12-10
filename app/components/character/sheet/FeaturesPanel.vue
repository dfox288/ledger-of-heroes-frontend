<!-- app/components/character/sheet/FeaturesPanel.vue -->
<script setup lang="ts">
import type { CharacterFeature } from '~/types/character'

const props = withDefaults(defineProps<{
  features?: CharacterFeature[]
}>(), {
  features: () => []
})

const featuresBySource = computed(() => {
  const grouped: Record<string, CharacterFeature[]> = {
    class: [],
    subclass: [],
    race: [],
    background: [],
    feat: []
  }
  // Defensive check for async mounting scenarios
  const featuresList = props.features
  if (!featuresList || !Array.isArray(featuresList)) {
    return grouped
  }
  for (const feature of featuresList) {
    const list = grouped[feature.source]
    if (list) {
      list.push(feature)
    }
  }
  return grouped
})

const sourceLabels: Record<string, string> = {
  class: 'Class Features',
  subclass: 'Subclass Features',
  race: 'Racial Traits',
  background: 'Background Feature',
  feat: 'Feats'
}
</script>

<template>
  <div class="space-y-6">
    <div
      v-if="!features || features.length === 0"
      class="text-center text-gray-500 dark:text-gray-400 py-8"
    >
      No features yet
    </div>

    <template v-else>
      <div
        v-for="(featureList, source) in featuresBySource"
        :key="source"
      >
        <template v-if="featureList.length > 0">
          <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            {{ sourceLabels[source] }}
          </h4>
          <ul class="space-y-2">
            <li
              v-for="feature in featureList"
              :key="feature.id"
              class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
            >
              <div class="font-medium text-gray-900 dark:text-white">
                {{ feature.feature?.name ?? 'Unknown Feature' }}
              </div>
              <div
                v-if="feature.feature?.description"
                class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2"
              >
                {{ feature.feature.description }}
              </div>
            </li>
          </ul>
        </template>
      </div>
    </template>
  </div>
</template>
