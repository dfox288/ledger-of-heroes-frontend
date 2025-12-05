<!-- app/components/character/builder/SubracePickerCard.vue -->
<script setup lang="ts">
import type { Race } from '~/types'

/**
 * Subrace item type - partial Race data from the parent race's subraces array
 * Contains basic info but may lack full details like traits/description
 */
type SubraceItem = NonNullable<Race['subraces']>[number]

interface Props {
  subrace: SubraceItem
  selected: boolean
  /** Parent race slug for image path fallback */
  parentRaceSlug?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'select': [subrace: SubraceItem]
  'view-details': []
}>()

/**
 * Get ability score modifiers summary
 */
const abilityModifiers = computed(() => {
  if (!props.subrace.modifiers || props.subrace.modifiers.length === 0) return null

  const abilityScoreMods = props.subrace.modifiers
    .filter(m => m.modifier_category === 'ability_score' && m.ability_score)

  if (abilityScoreMods.length === 0) return null

  return abilityScoreMods
    .slice(0, 3)
    .map(m => `${m.ability_score?.code} +${m.value}`)
    .join(', ')
})

/**
 * Handle card click - emit select
 */
function handleCardClick() {
  emit('select', props.subrace)
}

/**
 * Handle View Details click - emit event, stop propagation
 */
function handleViewDetails(event: Event) {
  event.stopPropagation()
  emit('view-details')
}

/**
 * Get background image path (256px variant)
 * Try subrace-specific image first, fall back to parent race image
 */
const { getImagePath } = useEntityImage()
const backgroundImage = computed(() => {
  // First try the subrace's own image
  const subraceImage = getImagePath('races', props.subrace.slug, 256)
  // TODO: Could add fallback to parent race image if subrace image doesn't exist
  // For now, just return the subrace image path
  return subraceImage
})
</script>

<template>
  <div
    data-testid="subrace-picker-card"
    class="relative cursor-pointer transition-all"
    :class="[
      selected ? 'ring-2 ring-race-500 ring-offset-2' : ''
    ]"
    @click="handleCardClick"
  >
    <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-race-300 dark:border-race-700 hover:border-race-500">
      <!-- Background Image Layer -->
      <div
        v-if="backgroundImage"
        class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300"
        :style="{ backgroundImage: `url(${backgroundImage})` }"
      />

      <!-- Selected Checkmark -->
      <div
        v-if="selected"
        class="absolute top-2 right-2 z-20"
      >
        <UBadge
          color="success"
          variant="solid"
          size="md"
        >
          <UIcon
            name="i-heroicons-check"
            class="w-4 h-4"
          />
        </UBadge>
      </div>

      <!-- Content Layer -->
      <div class="relative z-10 flex flex-col h-full">
        <div class="space-y-3 flex-1">
          <!-- Source Badge -->
          <div class="flex items-center gap-2 flex-wrap">
            <UBadge
              v-if="subrace.sources && subrace.sources.length > 0"
              color="info"
              variant="subtle"
              size="md"
            >
              {{ subrace.sources[0]?.code }}
            </UBadge>
          </div>

          <!-- Subrace Name -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {{ subrace.name }}
          </h3>

          <!-- Quick Stats -->
          <div class="flex items-center gap-4 flex-wrap text-sm text-gray-600 dark:text-gray-400">
            <div
              v-if="subrace.speed"
              class="flex items-center gap-1"
            >
              <UIcon
                name="i-heroicons-bolt"
                class="w-4 h-4"
              />
              <span>{{ subrace.speed }} ft</span>
            </div>
            <div
              v-if="abilityModifiers"
              class="flex items-center gap-1"
            >
              <UIcon
                name="i-heroicons-arrow-trending-up"
                class="w-4 h-4"
              />
              <span>{{ abilityModifiers }}</span>
            </div>
          </div>

          <!-- Trait Preview (first trait as description) -->
          <p
            v-if="subrace.traits && subrace.traits.length > 0"
            class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2"
          >
            {{ subrace.traits[0]?.description }}
          </p>
        </div>

        <!-- View Details Button -->
        <div class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <UButton
            data-testid="view-details-btn"
            variant="ghost"
            color="race"
            size="sm"
            block
            @click="handleViewDetails"
          >
            <UIcon
              name="i-heroicons-eye"
              class="w-4 h-4 mr-1"
            />
            View Details
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>
