<!-- app/components/character/SubraceCard.vue -->
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
 * Create entity object for EntityPickerCard
 * Uses first trait description as the description since subraces
 * typically don't have a dedicated description field
 */
const entityForCard = computed(() => ({
  name: props.subrace.name,
  slug: props.subrace.slug,
  description: props.subrace.traits?.[0]?.description
}))

/**
 * Handle select event from EntityPickerCard
 */
function handleSelect() {
  emit('select', props.subrace)
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
    :entity="entityForCard"
    :selected="selected"
    color="race"
    image-type="races"
    test-id="subrace-picker-card"
    @select="handleSelect"
    @view-details="handleViewDetails"
  >
    <template #badges>
      <UBadge
        v-if="subrace.sources && subrace.sources.length > 0"
        color="info"
        variant="subtle"
        size="md"
      >
        {{ subrace.sources[0]?.code }}
      </UBadge>
    </template>

    <template #stats>
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
    </template>
  </CharacterEntityPickerCard>
</template>
