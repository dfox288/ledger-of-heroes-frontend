<!-- app/components/character/builder/RacePickerCard.vue -->
<script setup lang="ts">
import type { Race } from '~/types'

interface Props {
  race: Race
  selected: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [race: Race]
  'view-details': []
}>()

/**
 * Get ability score modifiers summary
 */
const abilityModifiers = computed(() => {
  if (!props.race.modifiers || props.race.modifiers.length === 0) return null

  const abilityScoreMods = props.race.modifiers
    .filter(m => m.modifier_category === 'ability_score' && m.ability_score)

  if (abilityScoreMods.length === 0) return null

  return abilityScoreMods
    .slice(0, 3)
    .map(m => `${m.ability_score?.code} +${m.value}`)
    .join(', ')
})

/**
 * Check if race has subraces
 */
const hasSubraces = computed(() => {
  return props.race.subraces && props.race.subraces.length > 0
})

const subraceCount = computed(() => {
  return props.race.subraces?.length ?? 0
})

/**
 * Handle card click - emit select
 */
function handleCardClick() {
  emit('select', props.race)
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
 */
const { getImagePath } = useEntityImage()
const backgroundImage = computed(() => {
  return getImagePath('races', props.race.slug, 256)
})
</script>

<template>
  <div
    data-testid="picker-card"
    class="relative cursor-pointer transition-all"
    :class="[
      selected ? 'ring-2 ring-race-500 ring-offset-2' : '',
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
          <!-- Size Badge -->
          <div class="flex items-center gap-2 flex-wrap">
            <UBadge
              v-if="race.size"
              color="info"
              variant="subtle"
              size="md"
            >
              {{ race.size.name }}
            </UBadge>
            <UBadge
              v-if="hasSubraces"
              color="race"
              variant="subtle"
              size="md"
            >
              {{ subraceCount }} {{ subraceCount === 1 ? 'Subrace' : 'Subraces' }}
            </UBadge>
          </div>

          <!-- Race Name -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {{ race.name }}
          </h3>

          <!-- Quick Stats -->
          <div class="flex items-center gap-4 flex-wrap text-sm text-gray-600 dark:text-gray-400">
            <div
              v-if="race.speed"
              class="flex items-center gap-1"
            >
              <UIcon
                name="i-heroicons-bolt"
                class="w-4 h-4"
              />
              <span>{{ race.speed }} ft</span>
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

          <!-- Description Preview -->
          <p
            v-if="race.description"
            class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2"
          >
            {{ race.description }}
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
