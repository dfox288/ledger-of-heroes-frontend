<script setup lang="ts">
import type { components } from '~/types/api/generated'

// Use API types directly - TraitResource has id: string
type TraitResource = components['schemas']['TraitResource']
type ClassFeatureResource = components['schemas']['ClassFeatureResource']

// Union type to handle both background traits and class features
type TraitOrFeature = TraitResource | (ClassFeatureResource & { name?: string, category?: string })

interface Props {
  traits: TraitOrFeature[]
  showLevel?: boolean
  showCategory?: boolean
}

withDefaults(defineProps<Props>(), {
  showLevel: false,
  showCategory: false
})
</script>

<template>
  <div class="p-4 space-y-3">
    <div
      v-for="trait in traits"
      :key="trait.id"
      class="space-y-3"
    >
      <!-- Existing trait display -->
      <div
        class="py-2"
      >
        <div class="flex items-center gap-2 mb-1">
          <UBadge
            v-if="showLevel && 'level' in trait && trait.level"
            color="info"
            variant="soft"
            size="xs"
          >
            Level {{ trait.level }}
          </UBadge>
          <span class="font-semibold text-gray-900 dark:text-gray-100">
            {{ ('feature_name' in trait ? trait.feature_name : null) || trait.name }}
          </span>
          <UBadge
            v-if="showCategory && trait.category"
            color="primary"
            variant="soft"
            size="xs"
          >
            {{ trait.category }}
          </UBadge>
        </div>
        <div
          v-if="trait.description"
          class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line"
        >
          {{ trait.description }}
        </div>
      </div>

      <!-- Data tables display (random tables, etc.) -->
      <UiAccordionRandomTablesList
        v-if="'data_tables' in trait && trait.data_tables && trait.data_tables.length > 0"
        :tables="trait.data_tables"
      />
    </div>
  </div>
</template>
