<script setup lang="ts">
import type { Monster } from '~/types'

interface Props {
  monster: Monster
}

const props = defineProps<Props>()

/**
 * Truncate description to specified length
 */
const truncatedDescription = computed(() => {
  const maxLength = 150
  if (!props.monster.description) return 'A creature from the D&D universe.'
  if (props.monster.description.length <= maxLength) return props.monster.description
  return props.monster.description.substring(0, maxLength).trim() + '...'
})

/**
 * Check if monster has legendary actions
 */
const isLegendary = computed(() => {
  return props.monster.legendary_actions && props.monster.legendary_actions.length > 0
})

/**
 * Format speed display
 */
const speedDisplay = computed(() => {
  const speeds: string[] = []

  // Always show walk speed first
  if (props.monster.speed_walk) {
    speeds.push(`${props.monster.speed_walk} ft`)
  }

  // Add other speed types if they exist
  if (props.monster.speed_fly) {
    speeds.push(`fly ${props.monster.speed_fly} ft`)
  }
  if (props.monster.speed_climb) {
    speeds.push(`climb ${props.monster.speed_climb} ft`)
  }
  if (props.monster.speed_swim) {
    speeds.push(`swim ${props.monster.speed_swim} ft`)
  }
  if (props.monster.speed_burrow) {
    speeds.push(`burrow ${props.monster.speed_burrow} ft`)
  }

  return speeds.join(', ')
})

/**
 * Get saving throw proficiencies
 */
const savingThrows = computed(() => {
  if (!props.monster.modifiers) return []

  return props.monster.modifiers
    .filter(mod => mod.modifier_category === 'saving-throw')
    .map(mod => ({
      code: mod.ability_score?.code || '',
      value: mod.value
    }))
    .filter(save => save.code) // Only include if we have an ability score code
})

/**
 * Get background image for card
 */
const { getImagePath } = useEntityImage()
const backgroundImage = computed(() => {
  return getImagePath('monsters', props.monster.slug, 256)
})

const cardStyle = computed(() => {
  if (!backgroundImage.value) return {}
  return {
    backgroundImage: `url(${backgroundImage.value})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
})
</script>

<template>
  <NuxtLink
    :to="`/monsters/${monster.slug}`"
    class="block h-full"
  >
    <UCard
      class="hover:shadow-lg transition-shadow h-full border-2 border-monster-300 dark:border-monster-700 hover:border-monster-500 relative overflow-hidden"
    >
      <!-- Background image layer -->
      <div
        v-if="backgroundImage"
        class="absolute inset-0 opacity-10 hover:opacity-20 transition-opacity duration-300"
        :style="cardStyle"
      />

      <!-- Content layer -->
      <div class="flex flex-col h-full relative z-10">
        <!-- Top content -->
        <div class="space-y-3 flex-1">
          <!-- CR and Type Badges -->
          <div class="flex items-center gap-2 flex-wrap justify-between">
            <UBadge
              color="monster"
              variant="subtle"
              size="md"
            >
              CR {{ monster.challenge_rating }}
            </UBadge>
            <UBadge
              color="monster"
              variant="subtle"
              size="md"
            >
              {{ monster.type }}
            </UBadge>
          </div>

          <!-- Monster Name -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {{ monster.name }}
          </h3>

          <!-- Quick Stats -->
          <div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <!-- Size and Alignment -->
            <div class="flex items-center gap-2">
              <span v-if="monster.size">{{ monster.size.name }}</span>
              <span v-if="monster.size && monster.alignment">•</span>
              <span v-if="monster.alignment">{{ monster.alignment }}</span>
            </div>

            <!-- AC and HP -->
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1">
                <UIcon name="i-heroicons-shield-check" class="w-4 h-4" />
                AC {{ monster.armor_class }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-heroicons-heart" class="w-4 h-4" />
                {{ monster.hit_points_average }} HP
              </span>
            </div>

            <!-- Speed -->
            <div v-if="speedDisplay" class="flex items-center gap-1">
              <UIcon name="i-heroicons-bolt" class="w-4 h-4" />
              {{ speedDisplay }}
            </div>

            <!-- Saving Throws -->
            <div v-if="savingThrows.length > 0" class="flex items-center gap-1">
              <UIcon name="i-heroicons-shield-exclamation" class="w-4 h-4" />
              <span>Saves: {{ savingThrows.map(s => `${s.code} ${s.value}`).join(', ') }}</span>
            </div>

            <!-- Legendary Badge -->
            <div v-if="isLegendary">
              <UBadge
                color="monster"
                variant="soft"
                size="sm"
              >
                ⭐ Legendary
              </UBadge>
            </div>
          </div>

          <!-- Description Preview -->
          <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {{ truncatedDescription }}
          </p>
        </div>

        <UiCardSourceFooter :sources="monster.sources" />
      </div>
    </UCard>
  </NuxtLink>
</template>
