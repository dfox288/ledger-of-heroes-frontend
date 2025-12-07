<script setup lang="ts">
import type { Feat } from '~/types'

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
 * For single prerequisite: Show full text (e.g., "STR 13+")
 * For multiple: Show first + count (e.g., "STR 13+ +1 more")
 */
const prerequisitesSummary = computed(() => {
  if (!hasPrerequisites.value) return null

  const prereqs = props.feat.prerequisites!

  // Single prerequisite: show full text
  if (prereqs.length === 1) {
    const p = prereqs[0]
    if (p?.ability_score) {
      return `${p.ability_score.code} ${p.minimum_value}+`
    }
    return p?.description || 'Prerequisites required'
  }

  // Multiple prerequisites: show first + count
  const first = prereqs[0]
  const remaining = prereqs.length - 1
  let firstText = ''

  if (first?.ability_score) {
    firstText = `${first.ability_score.code} ${first.minimum_value}+`
  } else if (first?.description) {
    firstText = first.description
  } else {
    firstText = 'Prerequisites required'
  }

  return `${firstText} +${remaining} more`
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
const truncatedDescription = useTruncateDescription(
  computed(() => props.feat.description),
  150,
  'A feat that provides special abilities or bonuses'
)

/**
 * Get background image path (256px variant)
 */
const { getImagePath } = useEntityImage()
const backgroundImage = computed(() => {
  return getImagePath('feats', props.feat.slug, 256)
})
</script>

<template>
  <NuxtLink
    :to="`/feats/${feat.slug}`"
    class="block h-full group"
  >
    <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-feat-300 dark:border-feat-700 hover:border-feat-500">
      <!-- Background Image Layer -->
      <div
        v-if="backgroundImage"
        data-testid="card-background"
        class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-3"
        :style="{ backgroundImage: `url(${backgroundImage})` }"
      />

      <!-- Content Layer -->
      <div class="relative z-10 flex flex-col h-full">
        <!-- Top content -->
        <div class="space-y-3 flex-1">
          <!-- Feat Type Badge -->
          <div class="flex items-center gap-2 flex-wrap">
            <UBadge
              v-if="hasPrerequisites"
              color="feat"
              variant="subtle"
              size="md"
            >
              Prerequisites
            </UBadge>
          </div>

          <!-- Feat Name -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {{ feat.name }}
          </h3>

          <!-- Quick Stats -->
          <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
            <div
              v-if="prerequisitesSummary"
              class="flex items-center gap-1"
            >
              <UIcon
                name="i-heroicons-exclamation-circle"
                class="w-4 h-4"
              />
              <span>{{ prerequisitesSummary }}</span>
            </div>
            <div
              v-if="modifiersCount"
              class="flex items-center gap-1"
            >
              <UIcon
                name="i-heroicons-arrow-trending-up"
                class="w-4 h-4"
              />
              <span>{{ modifiersCount }} {{ modifiersCount === 1 ? 'Bonus' : 'Bonuses' }}</span>
            </div>
          </div>

          <!-- No Prerequisites Badge -->
          <div
            v-if="!hasPrerequisites"
            class="flex items-center gap-2"
          >
            <UBadge
              color="feat"
              variant="subtle"
              size="md"
            >
              ✅ No Prerequisites
            </UBadge>
          </div>

          <!-- Description Preview -->
          <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {{ truncatedDescription }}
          </p>
        </div>

        <UiCardSourceFooter :sources="feat.sources" />
      </div>
    </UCard>
  </NuxtLink>
</template>
