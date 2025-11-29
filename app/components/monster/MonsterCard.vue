<script setup lang="ts">
import type { Monster } from '~/types'

interface Props {
  monster: Monster
}

const props = defineProps<Props>()

/**
 * Get description or fallback
 */
const description = computed(() => {
  return props.monster.description || 'A creature from the D&D universe.'
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
</script>

<template>
  <UiCardUiEntityCard
    :to="`/monsters/${monster.slug}`"
    entity-type="monsters"
    :slug="monster.slug"
    color="monster"
    :description="description"
    :sources="monster.sources"
  >
    <template #badges>
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
    </template>

    <template #title>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
        {{ monster.name }}
      </h3>
    </template>

    <template #extra>
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
            <UIcon
              name="i-heroicons-shield-check"
              class="w-4 h-4"
            />
            AC {{ monster.armor_class }}
          </span>
          <span class="flex items-center gap-1">
            <UIcon
              name="i-heroicons-heart"
              class="w-4 h-4"
            />
            {{ monster.hit_points_average }} HP
          </span>
        </div>

        <!-- Speed -->
        <div
          v-if="speedDisplay"
          class="flex items-center gap-1"
        >
          <UIcon
            name="i-heroicons-bolt"
            class="w-4 h-4"
          />
          {{ speedDisplay }}
        </div>

        <!-- Saving Throws -->
        <div
          v-if="savingThrows.length > 0"
          class="flex items-center gap-1"
        >
          <UIcon
            name="i-heroicons-shield-exclamation"
            class="w-4 h-4"
          />
          <span>Saves: {{ savingThrows.map(s => `${s.code} ${s.value}`).join(', ') }}</span>
        </div>

        <!-- Legendary Badge -->
        <div v-if="isLegendary">
          <UBadge
            color="monster"
            variant="subtle"
            size="md"
          >
            ⭐ Legendary
          </UBadge>
        </div>
      </div>
    </template>
  </UiCardUiEntityCard>
</template>
