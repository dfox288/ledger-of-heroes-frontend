<script setup lang="ts">
interface Feat {
  id: number
  name: string
  slug: string
  prerequisites?: any[]
  modifiers?: any[]
  description?: string
  sources?: Array<{
    code: string
    name: string
    pages: string
  }>
}

interface Props {
  feat: Feat
}

const props = defineProps<Props>()

/**
 * Check if feat has prerequisites
 */
const hasPrerequisites = computed(() => {
  return props.feat.prerequisites && props.feat.prerequisites.length > 0
})

/**
 * Get prerequisites summary
 */
const prerequisitesSummary = computed(() => {
  if (!hasPrerequisites.value) return null

  const prereqs = props.feat.prerequisites!
  if (prereqs.length === 1) {
    const p = prereqs[0]
    if (p.ability_score) {
      return `${p.ability_score.code} ${p.minimum_value}+`
    }
    return p.description || 'Prerequisites required'
  }
  return `${prereqs.length} prerequisites`
})

/**
 * Get ability modifiers count
 */
const modifiersCount = computed(() => {
  if (!props.feat.modifiers || props.feat.modifiers.length === 0) return null
  return props.feat.modifiers.length
})

/**
 * Truncate description to specified length
 */
const truncatedDescription = computed(() => {
  if (!props.feat.description) return 'A feat that provides special abilities or bonuses'
  const maxLength = 150
  if (props.feat.description.length <= maxLength) return props.feat.description
  return props.feat.description.substring(0, maxLength).trim() + '...'
})
</script>

<template>
  <NuxtLink :to="`/feats/${feat.slug}`" class="block h-full">
    <UCard class="hover:shadow-lg transition-shadow h-full border border-gray-200 dark:border-gray-700">
      <div class="space-y-3">
        <!-- Feat Type Badge -->
        <div class="flex items-center gap-2 flex-wrap">
          <UBadge v-if="hasPrerequisites" color="red" variant="soft" size="md">
            Prerequisites
          </UBadge>
        </div>

        <!-- Feat Name -->
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
          {{ feat.name }}
        </h3>

        <!-- Quick Stats -->
        <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
          <div v-if="prerequisitesSummary" class="flex items-center gap-1">
            <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4" />
            <span>{{ prerequisitesSummary }}</span>
          </div>
          <div v-if="modifiersCount" class="flex items-center gap-1">
            <UIcon name="i-heroicons-arrow-trending-up" class="w-4 h-4" />
            <span>{{ modifiersCount }} {{ modifiersCount === 1 ? 'Bonus' : 'Bonuses' }}</span>
          </div>
        </div>

        <!-- No Prerequisites Badge -->
        <div v-if="!hasPrerequisites" class="flex items-center gap-2">
          <UBadge color="green" variant="soft" size="xs">
            ✅ No Prerequisites
          </UBadge>
        </div>

        <!-- Description Preview -->
        <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
          {{ truncatedDescription }}
        </p>
      </div>

      <UiCardSourceFooter :sources="feat.sources" />
    </UCard>
  </NuxtLink>
</template>
