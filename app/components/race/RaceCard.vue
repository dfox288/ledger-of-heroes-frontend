<script setup lang="ts">
import type { Race } from '~/types'

interface Props {
  race: Race
}

const props = defineProps<Props>()

const { getSizeColor } = useEntityColorMap()

/**
 * Check if this is a subrace
 * A race is a subrace if it has a parent_race object
 */
const isSubrace = computed(() => {
  return !!props.race.parent_race
})

/**
 * Get ability score modifiers summary
 * Shows up to 3 modifiers, with "+X more" suffix if there are additional ones
 */
const abilityModifiers = computed(() => {
  if (!props.race.modifiers || props.race.modifiers.length === 0) return null

  const abilityScoreMods = props.race.modifiers
    .filter(m => m.modifier_category === 'ability_score' && m.ability_score)

  if (abilityScoreMods.length === 0) return null

  const displayMods = abilityScoreMods
    .slice(0, 3)
    .map(m => `${m.ability_score?.code} +${m.value}`)

  const remaining = abilityScoreMods.length - 3
  if (remaining > 0) {
    displayMods.push(`+${remaining} more`)
  }

  return displayMods.join(', ')
})

/**
 * Truncate description to specified length
 */
const truncatedDescription = useTruncateDescription(
  computed(() => props.race.description),
  150,
  'A playable race for D&D 5e characters'
)

/**
 * Format speed display including special movement types
 * Shows base speed first, then fly/swim speeds if present
 */
const speedDisplay = computed(() => {
  const speeds: string[] = []

  // Always show base walk speed first
  if (props.race.speed) {
    speeds.push(`${props.race.speed} ft`)
  }

  // Add fly speed if present
  if (props.race.fly_speed) {
    speeds.push(`fly ${props.race.fly_speed} ft`)
  }

  // Add swim speed if present
  if (props.race.swim_speed) {
    speeds.push(`swim ${props.race.swim_speed} ft`)
  }

  return speeds
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
        data-testid="card-background"
        class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-3"
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

          <!-- Parent Race Name (for subraces) -->
          <div
            v-if="race.parent_race"
            class="text-sm text-gray-600 dark:text-gray-400"
          >
            Subrace of <span class="font-medium text-gray-900 dark:text-gray-100">{{ race.parent_race.name }}</span>
          </div>

          <!-- Quick Stats (with badges) -->
          <div class="flex items-center gap-4 flex-wrap text-sm text-gray-600 dark:text-gray-400">
            <div
              v-if="speedDisplay.length > 0"
              class="flex items-center gap-1"
            >
              <UIcon
                name="i-heroicons-bolt"
                class="w-4 h-4"
              />
              <span>{{ speedDisplay.join(', ') }}</span>
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
              variant="subtle"
              size="md"
            >
              👥 {{ race.traits.length }} {{ race.traits.length === 1 ? 'Trait' : 'Traits' }}
            </UBadge>
            <UBadge
              v-if="race.subraces && race.subraces.length > 0"
              color="race"
              variant="subtle"
              size="md"
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
