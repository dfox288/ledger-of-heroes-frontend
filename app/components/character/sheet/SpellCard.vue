<!-- app/components/character/sheet/SpellCard.vue -->
<script setup lang="ts">
/**
 * Expandable Spell Card
 *
 * Displays a character's spell with collapsed/expanded states.
 * Collapsed: name, level, school, badges (concentration, ritual), prepared status
 * Expanded: adds casting time, range, components, duration
 *
 * @see Issue #556 - Spells Tab
 */

import type { CharacterSpell } from '~/types/character'
import { formatSpellLevel } from '~/composables/useSpellFormatters'

const props = defineProps<{
  spell: CharacterSpell
}>()

const isExpanded = ref(false)

/**
 * Toggle expanded state
 */
function toggle() {
  isExpanded.value = !isExpanded.value
}

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
</script>

<template>
  <div
    v-if="spellData"
    data-testid="spell-card"
    :class="[
      'p-3 rounded-lg border cursor-pointer transition-all',
      'bg-white dark:bg-gray-800',
      isPrepared
        ? 'border-spell-300 dark:border-spell-700'
        : 'border-gray-200 dark:border-gray-700 opacity-60',
      'hover:shadow-md'
    ]"
    @click="toggle"
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

        <!-- Expand/collapse icon -->
        <UIcon
          :name="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
          class="w-5 h-5 text-gray-400"
        />
      </div>
    </div>

    <!-- Expanded Details -->
    <div
      v-if="isExpanded"
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
