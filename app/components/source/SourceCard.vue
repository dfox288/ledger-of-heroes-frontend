<script setup lang="ts">
import type { Source } from '~/types'

interface Props {
  source: Source
}

const props = defineProps<Props>()
const { getImagePath } = useEntityImage()

// Use lowercased code as slug (e.g., PHB -> phb)
const slug = computed(() => props.source.code.toLowerCase())
const backgroundImageUrl = computed(() =>
  getImagePath('sources', slug.value, 256)
)
</script>

<template>
  <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-source-300 dark:border-source-700 hover:border-source-500 group">
    <!-- Background Image Layer -->
    <div
      v-if="backgroundImageUrl"
      class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-3"
      :style="{ backgroundImage: `url(${backgroundImageUrl})` }"
    />

    <!-- Content Layer -->
    <div class="relative z-10 space-y-3">
      <!-- Source Code Badge -->
      <div class="flex items-center gap-2 flex-wrap">
        <UBadge
          color="source"
          variant="solid"
          size="lg"
        >
          {{ source.code }}
        </UBadge>
        <UBadge
          v-if="source.edition"
          color="source"
          variant="soft"
          size="md"
        >
          {{ source.edition }}
        </UBadge>
      </div>

      <!-- Source Name -->
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
        {{ source.name }}
      </h3>

      <!-- Publisher & Year -->
      <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
        <div class="flex items-center gap-1">
          <UIcon
            name="i-heroicons-building-office"
            class="w-4 h-4"
          />
          <span>{{ source.publisher }}</span>
        </div>
        <div
          v-if="source.publication_year"
          class="flex items-center gap-1"
        >
          <UIcon
            name="i-heroicons-calendar"
            class="w-4 h-4"
          />
          <span>{{ source.publication_year }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>
