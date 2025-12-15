<!-- app/components/character/sheet/SpellbookCard.vue -->
<script setup lang="ts">
/**
 * Compact spell card for spellbook two-column view
 *
 * Displays spell name, school, badges. Click to toggle preparation.
 * Simpler than SpellCard - no expand/collapse.
 *
 * @see Issue #680 - Wizard Spellbook Phase 2
 */
import type { CharacterSpell } from '~/types/character'

const props = defineProps<{
  spell: CharacterSpell
  column: 'spellbook' | 'prepared'
  atPrepLimit?: boolean
}>()

const emit = defineEmits<{
  toggle: [spell: CharacterSpell]
}>()

const spellData = computed(() => props.spell.spell)
const isPrepared = computed(() => props.spell.is_prepared || props.spell.is_always_prepared)
const isAlwaysPrepared = computed(() => props.spell.is_always_prepared)

const isDisabled = computed(() => {
  if (isAlwaysPrepared.value) return true
  if (!isPrepared.value && props.atPrepLimit) return true
  return false
})

const isGreyedOut = computed(() => {
  return !isPrepared.value && props.atPrepLimit
})

function handleClick() {
  if (isDisabled.value) return
  emit('toggle', props.spell)
}
</script>

<template>
  <div
    v-if="spellData"
    data-testid="spellbook-card"
    :class="[
      'px-3 py-2 rounded-lg border transition-all flex items-center justify-between gap-2',
      'bg-white dark:bg-gray-800',
      isPrepared
        ? 'border-spell-300 dark:border-spell-700'
        : 'border-gray-200 dark:border-gray-700',
      isGreyedOut
        ? 'opacity-40 cursor-not-allowed'
        : isDisabled
          ? 'cursor-default'
          : 'cursor-pointer hover:shadow-md hover:border-spell-400 dark:hover:border-spell-600'
    ]"
    @click="handleClick"
  >
    <!-- Left: Name and badges -->
    <div class="flex items-center gap-2 min-w-0">
      <span class="font-medium truncate">{{ spellData.name }}</span>
      <UBadge
        v-if="isAlwaysPrepared"
        color="warning"
        variant="subtle"
        size="xs"
      >
        Always
      </UBadge>
      <UBadge
        v-if="spellData.concentration"
        color="spell"
        variant="subtle"
        size="xs"
      >
        Conc
      </UBadge>
      <UBadge
        v-if="spellData.ritual"
        color="neutral"
        variant="subtle"
        size="xs"
      >
        Ritual
      </UBadge>
    </div>

    <!-- Right: School and arrow -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {{ spellData.school }}
      </span>
      <!-- Arrow indicator -->
      <UIcon
        v-if="column === 'spellbook' && !isDisabled"
        data-testid="prepare-indicator"
        name="i-heroicons-arrow-right"
        class="w-4 h-4 text-gray-400"
      />
      <UIcon
        v-else-if="column === 'prepared' && !isAlwaysPrepared"
        data-testid="unprepare-indicator"
        name="i-heroicons-arrow-left"
        class="w-4 h-4 text-gray-400"
      />
    </div>
  </div>
</template>
