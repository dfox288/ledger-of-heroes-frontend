<!-- app/components/character/builder/SpellPickerCard.vue -->
<script setup lang="ts">
import type { Spell } from '~/types'

interface Props {
  spell: Spell
  selected: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  'toggle': [spell: Spell]
  'view-details': []
}>()

/**
 * Format spell level for display
 */
const levelText = computed(() => {
  if (props.spell.level === 0) return 'Cantrip'
  const suffix = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']
  return `${props.spell.level}${suffix[props.spell.level]}`
})

/**
 * Get color based on spell school
 */
const schoolColor = computed((): 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' => {
  const colorMap: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
    A: 'info', // Abjuration
    C: 'primary', // Conjuration
    D: 'info', // Divination
    EN: 'warning', // Enchantment
    EV: 'error', // Evocation
    I: 'primary', // Illusion
    N: 'neutral', // Necromancy
    T: 'success' // Transmutation
  }
  return colorMap[props.spell.school?.code ?? ''] || 'info'
})

function handleClick() {
  if (!props.disabled) {
    emit('toggle', props.spell)
  }
}

function handleViewDetails(event: Event) {
  event.stopPropagation()
  emit('view-details')
}
</script>

<template>
  <div
    data-testid="spell-card"
    class="relative p-3 rounded-lg border-2 transition-all cursor-pointer"
    :class="[
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      selected
        ? 'ring-2 ring-spell-500 border-spell-500 bg-spell-50 dark:bg-spell-900/30'
        : 'border-gray-200 dark:border-gray-700 hover:border-spell-300'
    ]"
    @click="handleClick"
  >
    <!-- Selected Checkmark -->
    <div
      v-if="selected"
      data-testid="selected-check"
      class="absolute top-2 right-2 w-5 h-5 bg-spell-500 rounded-full flex items-center justify-center"
    >
      <UIcon
        name="i-heroicons-check"
        class="w-3 h-3 text-white"
      />
    </div>

    <div class="flex flex-col gap-2">
      <!-- Top row: badges -->
      <div class="flex items-center gap-2 flex-wrap">
        <UBadge
          color="spell"
          variant="subtle"
          size="md"
        >
          {{ levelText }}
        </UBadge>
        <UBadge
          v-if="spell.school"
          :color="schoolColor"
          variant="subtle"
          size="md"
        >
          {{ spell.school.name }}
        </UBadge>
        <UBadge
          v-if="spell.needs_concentration"
          color="warning"
          variant="subtle"
          size="md"
        >
          Concentration
        </UBadge>
        <UBadge
          v-if="spell.is_ritual"
          color="info"
          variant="subtle"
          size="md"
        >
          Ritual
        </UBadge>
      </div>

      <!-- Spell name -->
      <h4 class="font-semibold text-gray-900 dark:text-white pr-6">
        {{ spell.name }}
      </h4>

      <!-- View Details link -->
      <button
        data-testid="view-details-btn"
        type="button"
        class="text-xs text-spell-600 dark:text-spell-400 hover:underline self-start"
        @click="handleViewDetails"
      >
        View Details
      </button>
    </div>
  </div>
</template>
