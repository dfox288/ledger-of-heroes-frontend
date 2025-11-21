<script setup lang="ts">
import type { Source } from '~/types'

interface Background {
  id: number
  name: string
  slug: string
  skill_proficiencies?: any[]
  tool_proficiencies?: any[]
  languages?: any[]
  feature_name?: string
  description?: string
  sources?: Source[]
}

interface Props {
  background: Background
}

const props = defineProps<Props>()

/**
 * Get skill proficiencies summary
 */
const skillsSummary = computed(() => {
  if (!props.background.skill_proficiencies || props.background.skill_proficiencies.length === 0) {
    return null
  }
  const count = props.background.skill_proficiencies.length
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
</script>

<template>
  <NuxtLink :to="`/backgrounds/${background.slug}`" class="block h-full">
    <UCard class="hover:shadow-lg transition-shadow h-full border border-gray-200 dark:border-gray-700">
      <div class="space-y-3">
        <!-- Feature Badge -->
        <div v-if="background.feature_name" class="flex items-center gap-2 flex-wrap">
          <UBadge color="purple" variant="soft" size="sm">
            {{ background.feature_name }}
          </UBadge>
        </div>

        <!-- Background Name -->
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
          {{ background.name }}
        </h3>

        <!-- Quick Stats -->
        <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
          <div v-if="skillsSummary" class="flex items-center gap-1">
            <UIcon name="i-heroicons-academic-cap" class="w-4 h-4" />
            <span>{{ skillsSummary }}</span>
          </div>
          <div v-if="languagesCount" class="flex items-center gap-1">
            <UIcon name="i-heroicons-language" class="w-4 h-4" />
            <span>{{ languagesCount }} {{ languagesCount === 1 ? 'Language' : 'Languages' }}</span>
          </div>
        </div>

        <!-- Tool Proficiencies -->
        <div v-if="background.tool_proficiencies && background.tool_proficiencies.length > 0" class="flex items-center gap-2">
          <UBadge color="blue" variant="soft" size="xs">
            🔧 {{ background.tool_proficiencies.length }} Tools
          </UBadge>
        </div>

        <!-- Description Preview -->
        <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
          {{ truncatedDescription }}
        </p>
      </div>

      <UiCardSourceFooter :sources="background.sources" />
    </UCard>
  </NuxtLink>
</template>
