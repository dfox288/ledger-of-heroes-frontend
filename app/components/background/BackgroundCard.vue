<script setup lang="ts">
import type { Background } from '~/types'

interface Props {
  background: Background
}

const props = defineProps<Props>()

// Use composable for proficiency/language/equipment parsing
// Convert props.background to a computed ref for the composable
const backgroundRef = computed(() => props.background)
const {
  skillProficiencies,
  toolProficiencies,
  languages,
  equipmentCount,
  startingGold
} = useBackgroundStats(backgroundRef)

/**
 * Get skill proficiencies summary - shows actual skill names
 */
const skillsSummary = computed(() => {
  if (skillProficiencies.value.length === 0) return null

  // Show first 2 skill names
  if (skillProficiencies.value.length <= 2) {
    return skillProficiencies.value.join(', ')
  }

  // Show first 2 + overflow count
  const remaining = skillProficiencies.value.length - 2
  return `${skillProficiencies.value.slice(0, 2).join(', ')} +${remaining} more`
})

/**
 * Get languages count
 */
const languagesCount = computed(() => {
  return languages.value.length > 0 ? languages.value.length : null
})

/**
 * Truncate description to specified length
 */
const truncatedDescription = useTruncateDescription(
  computed(() => props.background.description),
  150,
  'A character background for D&D 5e'
)

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
        data-testid="card-background"
        class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-3"
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
              variant="subtle"
              size="md"
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
            v-if="toolProficiencies && toolProficiencies.length > 0"
            class="flex items-center gap-2"
          >
            <UBadge
              color="background"
              variant="subtle"
              size="md"
            >
              🔧 {{ toolProficiencies.length }} Tools
            </UBadge>
          </div>

          <!-- Equipment and Gold -->
          <div
            v-if="equipmentCount || startingGold"
            class="flex items-center gap-2 flex-wrap"
          >
            <UBadge
              v-if="equipmentCount"
              color="background"
              variant="subtle"
              size="md"
            >
              🎒 {{ equipmentCount }} Items
            </UBadge>
            <UBadge
              v-if="startingGold"
              color="background"
              variant="subtle"
              size="md"
            >
              💰 {{ startingGold }} gp
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
