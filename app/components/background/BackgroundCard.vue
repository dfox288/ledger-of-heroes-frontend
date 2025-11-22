<script setup lang="ts">
import type { Background } from '~/types'

interface Props {
  background: Background
}

const props = defineProps<Props>()

/**
 * Get skill proficiencies summary
 */
const skillsSummary = computed(() => {
  if (!props.background.proficiencies || props.background.proficiencies.length === 0) {
    return null
  }
  const skillProficiencies = props.background.proficiencies.filter(p => p.proficiency_type === 'skill')
  if (skillProficiencies.length === 0) return null
  const count = skillProficiencies.length
  return `${count} ${count === 1 ? 'Skill' : 'Skills'}`
})

/**
 * Get languages count
 */
const languagesCount = computed(() => {
  if (!props.background.languages || props.background.languages.length === 0) {
    return null
  }
  return props.background.languages.length
})

/**
 * Truncate description to specified length
 */
const truncatedDescription = computed(() => {
  if (!props.background.description) return 'A character background for D&D 5e'
  const maxLength = 150
  if (props.background.description.length <= maxLength) return props.background.description
  return props.background.description.substring(0, maxLength).trim() + '...'
})

/**
 * Get background image path (256px variant)
 */
const { getImagePath } = useEntityImage()
const backgroundImage = computed(() => {
  return getImagePath('backgrounds', props.background.slug, 256)
})
</script>

<template>
  <NuxtLink
    :to="`/backgrounds/${background.slug}`"
    class="block h-full group"
  >
    <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-background-300 dark:border-background-700 hover:border-background-500">
      <!-- Background Image Layer -->
      <div
        v-if="backgroundImage"
        data-test="card-background"
        class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300 group-hover:opacity-30 group-hover:scale-110"
        :style="{ backgroundImage: `url(${backgroundImage})` }"
      />

      <!-- Content Layer -->
      <div class="relative z-10 flex flex-col h-full">
        <!-- Top content -->
        <div class="space-y-3 flex-1">
          <!-- Feature Badge -->
          <div
            v-if="background.feature_name"
            class="flex items-center gap-2 flex-wrap"
          >
            <UBadge
              color="background"
              variant="soft"
              size="sm"
            >
              {{ background.feature_name }}
            </UBadge>
          </div>

          <!-- Background Name -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {{ background.name }}
          </h3>

          <!-- Quick Stats -->
          <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
            <div
              v-if="skillsSummary"
              class="flex items-center gap-1"
            >
              <UIcon
                name="i-heroicons-academic-cap"
                class="w-4 h-4"
              />
              <span>{{ skillsSummary }}</span>
            </div>
            <div
              v-if="languagesCount"
              class="flex items-center gap-1"
            >
              <UIcon
                name="i-heroicons-language"
                class="w-4 h-4"
              />
              <span>{{ languagesCount }} {{ languagesCount === 1 ? 'Language' : 'Languages' }}</span>
            </div>
          </div>

          <!-- Tool Proficiencies -->
          <div
            v-if="background.proficiencies && background.proficiencies.filter(p => p.proficiency_type === 'tool').length > 0"
            class="flex items-center gap-2"
          >
            <UBadge
              color="background"
              variant="soft"
              size="xs"
            >
              🔧 {{ background.proficiencies.filter(p => p.proficiency_type === 'tool').length }} Tools
            </UBadge>
          </div>

          <!-- Description Preview -->
          <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {{ truncatedDescription }}
          </p>
        </div>

        <UiCardSourceFooter :sources="background.sources" />
      </div>
    </UCard>
  </NuxtLink>
</template>
