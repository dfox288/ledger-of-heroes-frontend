<script setup lang="ts">
import type { Race } from '~/types'

interface Props {
  race: Race
}

const props = defineProps<Props>()

/**
 * Check if this is a subrace
 * A race is a subrace if it has a parent_race object
 */
const isSubrace = computed(() => {
  return !!props.race.parent_race
})

/**
 * Get size color based on size code (NuxtUI v4 semantic colors)
 */
const getSizeColor = (sizeCode: string): 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' => {
  const colors: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
    T: 'neutral', // Tiny - gray
    S: 'success', // Small - green
    M: 'info', // Medium - blue
    L: 'warning', // Large - amber
    H: 'error', // Huge - red
    G: 'error' // Gargantuan - red
  }
  return colors[sizeCode] || 'info'
}

/**
 * Get ability score modifiers summary
 */
const abilityModifiers = computed(() => {
  if (!props.race.modifiers || props.race.modifiers.length === 0) return null
  const mods = props.race.modifiers
    .filter(m => m.modifier_category === 'ability_score' && m.ability_score)
    .slice(0, 3)
    .map(m => `${m.ability_score?.code} +${m.value}`)
  return mods.length > 0 ? mods.join(', ') : null
})

/**
 * Truncate description to specified length
 */
const truncatedDescription = computed(() => {
  if (!props.race.description) return 'A playable race for D&D 5e characters'
  const maxLength = 150
  if (props.race.description.length <= maxLength) return props.race.description
  return props.race.description.substring(0, maxLength).trim() + '...'
})

/**
 * Get background image path (256px variant)
 */
const { getImagePath } = useEntityImage()
const backgroundImage = computed(() => {
  return getImagePath('races', props.race.slug, 256)
})
</script>

<template>
  <NuxtLink
    :to="`/races/${race.slug}`"
    class="block h-full group"
  >
    <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-race-300 dark:border-race-700 hover:border-race-500">
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
          <!-- Size Badge -->
          <div class="flex items-center gap-2 flex-wrap">
            <UBadge
              v-if="race.size"
              :color="getSizeColor(race.size.code)"
              variant="subtle"
              size="md"
            >
              {{ race.size.name }}
            </UBadge>
            <!-- Only show race/subrace badge if we have parent_race data (from detail API) -->
            <UBadge
              v-if="race.parent_race !== undefined && isSubrace"
              color="race"
              variant="subtle"
              size="md"
            >
              Subrace
            </UBadge>
            <UBadge
              v-else-if="race.parent_race !== undefined && !isSubrace"
              color="race"
              variant="subtle"
              size="md"
            >
              Race
            </UBadge>
          </div>

          <!-- Race Name -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {{ race.name }}
          </h3>

          <!-- Quick Stats (with badges) -->
          <div class="flex items-center gap-4 flex-wrap text-sm text-gray-600 dark:text-gray-400">
            <div class="flex items-center gap-1">
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
            <UBadge
              v-if="race.traits && race.traits.length > 0"
              color="race"
              variant="soft"
              size="sm"
            >
              👥 {{ race.traits.length }} {{ race.traits.length === 1 ? 'Trait' : 'Traits' }}
            </UBadge>
            <UBadge
              v-if="race.subraces && race.subraces.length > 0"
              color="race"
              variant="soft"
              size="sm"
            >
              🌟 {{ race.subraces.length }} {{ race.subraces.length === 1 ? 'Subrace' : 'Subraces' }}
            </UBadge>
          </div>

          <!-- Description Preview -->
          <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {{ truncatedDescription }}
          </p>
        </div>

        <UiCardSourceFooter :sources="race.sources" />
      </div>
    </UCard>
  </NuxtLink>
</template>
