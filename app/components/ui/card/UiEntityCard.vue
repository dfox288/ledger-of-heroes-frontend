<script setup lang="ts">
import type { EntityType } from '~/composables/useEntityImage'
import type { EntitySource } from '~/types/api/common'

interface Props {
  to: string // NuxtLink destination
  entityType: EntityType // 'spells' | 'monsters' | 'items' | etc.
  slug: string // Entity slug for image lookup
  color: string // Border color: 'spell' | 'monster' | 'item' | etc.
  description?: string // Optional description to truncate
  sources?: EntitySource[]
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  sources: () => []
})

/**
 * Truncate description to specified length
 */
const truncatedDescription = useTruncateDescription(
  computed(() => props.description)
)

/**
 * Get background image path (256px variant)
 */
const { getImagePath } = useEntityImage()
const backgroundImage = computed(() =>
  getImagePath(props.entityType, props.slug, 256)
)
</script>

<template>
  <NuxtLink
    :to="to"
    class="block h-full group"
  >
    <UCard
      :class="[
        'relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2',
        `border-${color}-300 dark:border-${color}-700 hover:border-${color}-500`
      ]"
    >
      <!-- Background Image Layer -->
      <div
        v-if="backgroundImage"
        data-testid="card-background"
        class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-3"
        :style="{ backgroundImage: `url(${backgroundImage})` }"
      />

      <!-- Content Layer -->
      <div class="relative z-10 flex flex-col h-full">
        <div class="space-y-3 flex-1">
          <!-- Badges row -->
          <div class="flex items-center gap-2 flex-wrap justify-between">
            <slot name="badges" />
          </div>

          <!-- Title -->
          <slot name="title" />

          <!-- Stats row -->
          <div class="flex items-center gap-4 flex-wrap text-sm text-gray-600 dark:text-gray-400">
            <slot name="stats" />
          </div>

          <!-- Description -->
          <p
            v-if="truncatedDescription"
            class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3"
          >
            {{ truncatedDescription }}
          </p>

          <!-- Extra content slot (optional) -->
          <slot name="extra" />
        </div>

        <UiCardSourceFooter
          v-if="sources && sources.length"
          :sources="sources"
        />
      </div>
    </UCard>
  </NuxtLink>
</template>
