<script setup lang="ts">
interface Language {
  id: number
  name: string
  slug: string
  script: string | null
  typical_speakers: string | null
  description: string | null
}

interface Props {
  language: Language
}

const props = defineProps<Props>()
const { getImagePath } = useEntityImage()
const backgroundImageUrl = computed(() =>
  getImagePath('languages', props.language.slug, 256)
)

/**
 * Truncate description to specified length
 */
const truncatedDescription = useTruncateDescription(
  computed(() => props.language.description),
  120,
  'A language spoken in the D&D multiverse'
)
</script>

<template>
  <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-language-300 dark:border-language-700 hover:border-language-500 group">
    <!-- Background Image Layer -->
    <div
      v-if="backgroundImageUrl"
      class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-3"
      :style="{ backgroundImage: `url(${backgroundImageUrl})` }"
    />

    <!-- Content Layer -->
    <div class="relative z-10 space-y-3">
      <!-- Language Name -->
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ language.name }}
      </h3>

      <!-- Script & Speakers -->
      <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
        <div class="flex items-center gap-1">
          <UIcon
            name="i-heroicons-pencil-square"
            class="w-4 h-4"
          />
          <span>{{ language.script }} Script</span>
        </div>
        <div class="flex items-center gap-1">
          <UIcon
            name="i-heroicons-user-group"
            class="w-4 h-4"
          />
          <span>{{ language.typical_speakers }}</span>
        </div>
      </div>

      <!-- Description Preview -->
      <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
        {{ truncatedDescription }}
      </p>
    </div>
  </UCard>
</template>
