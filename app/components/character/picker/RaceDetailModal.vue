<!-- app/components/character/picker/RaceDetailModal.vue -->
<script setup lang="ts">
import type { Race } from '~/types'

interface Props {
  race: Race | null
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { default: false })

/**
 * Get ability score modifiers
 */
const abilityModifiers = computed(() => {
  if (!props.race?.modifiers) return []
  return props.race.modifiers.filter(m =>
    m.modifier_category === 'ability_score' && m.ability_score
  )
})

/**
 * Format speed display
 */
const speedDisplay = computed(() => {
  if (!props.race) return []
  const speeds: string[] = []
  if (props.race.speed) speeds.push(`${props.race.speed} ft walk`)
  if (props.race.fly_speed) speeds.push(`${props.race.fly_speed} ft fly`)
  if (props.race.swim_speed) speeds.push(`${props.race.swim_speed} ft swim`)
  return speeds
})
</script>

<template>
  <CharacterPickerEntityDetailModal
    v-model:open="open"
    :entity="race"
    fallback-title="Race Details"
  >
    <div class="space-y-6">
      <!-- Description -->
      <p
        v-if="race?.description"
        class="text-gray-700 dark:text-gray-300"
      >
        {{ race.description }}
      </p>

      <!-- Basic Info -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Size
          </h4>
          <p class="text-gray-600 dark:text-gray-400">
            {{ race?.size?.name || 'Unknown' }}
          </p>
        </div>
        <div>
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Speed
          </h4>
          <p class="text-gray-600 dark:text-gray-400">
            {{ speedDisplay.join(', ') || 'Unknown' }}
          </p>
        </div>
      </div>

      <!-- Ability Score Modifiers -->
      <div v-if="abilityModifiers.length > 0">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Ability Score Increases
        </h4>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="mod in abilityModifiers"
            :key="mod.id"
            color="race"
            variant="subtle"
            size="md"
          >
            {{ mod.ability_score?.name }} +{{ mod.value }}
          </UBadge>
        </div>
      </div>

      <!-- Racial Traits -->
      <div v-if="race?.traits && race.traits.length > 0">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Racial Traits
        </h4>
        <div class="space-y-3">
          <div
            v-for="trait in race.traits"
            :key="trait.id"
            class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
          >
            <h5 class="font-medium text-gray-900 dark:text-gray-100">
              {{ trait.name }}
            </h5>
            <p
              v-if="trait.description"
              class="text-sm text-gray-600 dark:text-gray-400 mt-1"
            >
              {{ trait.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </CharacterPickerEntityDetailModal>
</template>
