<!-- app/components/character/sheet/SpellCard.vue -->
<script setup lang="ts">
/**
 * Expandable Spell Card with Preparation Toggle
 *
 * Displays a character's spell with collapsed/expanded states.
 * Collapsed: name, level, school, badges (concentration, ritual), prepared status
 * Expanded: adds casting time, range, components, duration
 *
 * Click card body to toggle preparation (when editable).
 * Click chevron to expand/collapse details.
 *
 * @see Issue #556 - Spells Tab
 * @see Issue #616 - Spell preparation toggle
 */

import type { CharacterSpell } from '~/types/character'
import { formatSpellLevel } from '~/composables/useSpellFormatters'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'
import { storeToRefs } from 'pinia'

// Opacity constants for visual states
const OPACITY_GREYED_OUT = 'opacity-40' // At prep limit and unprepared
const OPACITY_UNPREPARED = 'opacity-60' // Unprepared but can be prepared

const props = defineProps<{
  spell: CharacterSpell
  characterId?: number
  editable?: boolean
  atPrepLimit?: boolean
}>()

const store = useCharacterPlayStateStore()
const { isUpdatingSpellPreparation } = storeToRefs(store)
const isExpanded = ref(false)

/**
 * Check if spell is prepared (includes always prepared)
 */
const isPrepared = computed(() => props.spell.is_prepared || props.spell.is_always_prepared)

/**
 * Check if spell is always prepared (domain spells, etc.)
 */
const isAlwaysPrepared = computed(() => props.spell.is_always_prepared)

/**
 * Get spell data (handles null spell for dangling references)
 */
const spellData = computed(() => props.spell.spell)

/**
 * Check if this card can toggle preparation
 */
const canToggle = computed(() => {
  if (!props.editable) return false
  if (props.spell.is_always_prepared) return false
  // Can't prepare new spells when at limit
  if (!props.spell.is_prepared && props.atPrepLimit) return false
  // Disable during API call to prevent spam-clicks
  if (isUpdatingSpellPreparation.value) return false
  return true
})

/**
 * Check if card should appear greyed out
 */
const isGreyedOut = computed(() => {
  if (!props.spell.is_prepared && props.atPrepLimit) return true
  return false
})

/**
 * Handle card body click (toggle preparation)
 */
async function handleCardClick() {
  if (!canToggle.value) return

  try {
    await store.toggleSpellPreparation(props.spell.id, props.spell.is_prepared)
  } catch {
    // Error handling done by store
  }
}

/**
 * Handle chevron click (expand/collapse only)
 */
function handleExpandClick(event: MouseEvent) {
  event.stopPropagation()
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div
    v-if="spellData"
    data-testid="spell-card"
    :class="[
      'p-3 rounded-lg border transition-all',
      'bg-white dark:bg-gray-800',
      isPrepared
        ? 'border-spell-300 dark:border-spell-700'
        : 'border-gray-200 dark:border-gray-700',
      isGreyedOut
        ? `${OPACITY_GREYED_OUT} cursor-not-allowed`
        : canToggle
          ? 'cursor-pointer hover:shadow-md'
          : 'cursor-default',
      !isPrepared && !isGreyedOut && OPACITY_UNPREPARED
    ]"
  >
    <!-- Clickable body area for preparation toggle -->
    <div
      data-testid="spell-card-body"
      @click="handleCardClick"
    >
      <!-- Collapsed Header -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <!-- Prepared indicator -->
          <UIcon
            v-if="isPrepared"
            data-testid="prepared-icon"
            name="i-heroicons-check-circle-solid"
            :class="[
              'w-5 h-5 flex-shrink-0',
              isAlwaysPrepared
                ? 'text-amber-500 dark:text-amber-400'
                : 'text-spell-500 dark:text-spell-400'
            ]"
          />
          <UIcon
            v-else
            name="i-heroicons-circle"
            class="w-5 h-5 flex-shrink-0 text-gray-300 dark:text-gray-600"
          />

          <!-- Spell name -->
          <span class="font-medium truncate">{{ spellData.name }}</span>
        </div>

        <!-- Right side: badges and expand icon -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <!-- Always prepared badge -->
          <UBadge
            v-if="isAlwaysPrepared"
            color="warning"
            variant="subtle"
            size="xs"
          >
            Always
          </UBadge>

          <!-- Concentration badge -->
          <UBadge
            v-if="spellData.concentration"
            color="spell"
            variant="subtle"
            size="xs"
          >
            Concentration
          </UBadge>

          <!-- Ritual badge -->
          <UBadge
            v-if="spellData.ritual"
            color="neutral"
            variant="subtle"
            size="xs"
          >
            Ritual
          </UBadge>

          <!-- Level/School -->
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ formatSpellLevel(spellData.level) }} {{ spellData.school }}
          </span>

          <!-- Expand/collapse button (separate from card click) -->
          <button
            data-testid="expand-toggle"
            class="p-1 -m-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            @click="handleExpandClick"
          >
            <UIcon
              :name="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
              class="w-5 h-5 text-gray-400"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Expanded Details -->
    <div
      v-if="isExpanded"
      data-testid="spell-details"
      class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm"
    >
      <div class="grid grid-cols-2 gap-2">
        <div>
          <span class="text-gray-500 dark:text-gray-400">Casting Time</span>
          <p class="font-medium">
            {{ spellData.casting_time }}
          </p>
        </div>
        <div>
          <span class="text-gray-500 dark:text-gray-400">Range</span>
          <p class="font-medium">
            {{ spellData.range }}
          </p>
        </div>
        <div>
          <span class="text-gray-500 dark:text-gray-400">Components</span>
          <p class="font-medium">
            {{ spellData.components }}
          </p>
        </div>
        <div>
          <span class="text-gray-500 dark:text-gray-400">Duration</span>
          <p class="font-medium">
            {{ spellData.duration }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
