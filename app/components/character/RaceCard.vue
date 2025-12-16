<!-- app/components/character/RaceCard.vue -->
<script setup lang="ts">
import type { Race } from '~/types'

interface Props {
  race: Race
  selected: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'select': [race: Race]
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
 * Handle select event from EntityPickerCard
 */
function handleSelect() {
  emit('select', props.race)
}

/**
 * Handle view-details event from EntityPickerCard
 */
function handleViewDetails() {
  emit('view-details')
}
</script>

<template>
  <CharacterEntityPickerCard
    :entity="race"
    :selected="selected"
    color="race"
    image-type="races"
    @select="handleSelect"
    @view-details="handleViewDetails"
  >
    <template #badges>
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
    </template>

    <template #stats>
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
    </template>
  </CharacterEntityPickerCard>
</template>
