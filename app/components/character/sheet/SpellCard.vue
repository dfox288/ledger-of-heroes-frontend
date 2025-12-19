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

import type { CharacterSpell, PreparationMethod } from '~/types/character'
import type { ConcentrationState } from '~/stores/characterPlayState'
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
  /**
   * Preparation method for the character's spellcasting class.
   * - 'known': Hide preparation UI (Bard, Sorcerer, Warlock, Ranger)
   * - 'spellbook'/'prepared': Show preparation UI (Wizard, Cleric, etc.)
   * - null/undefined: Fallback to current behavior (show UI)
   * @see Issue #676
   */
  preparationMethod?: PreparationMethod
  /**
   * Class name if this spell is prepared by another class (multiclass cross-check)
   * e.g., "Wizard" if the same spell is prepared as a Wizard spell
   */
  otherClassPrepared?: string | null
  /**
   * Current active concentration state (if concentrating on any spell)
   * @see Issue #783, #792
   */
  activeConcentration?: ConcentrationState | null
}>()

const emit = defineEmits<{
  concentrate: [spell: ConcentrationState]
}>()

const store = useCharacterPlayStateStore()
const { isUpdatingSpellPreparation } = storeToRefs(store)
const isExpanded = ref(false)

/**
 * Whether to show preparation UI (toggle, indicator, dimming)
 *
 * Known casters (Bard, Sorcerer, Warlock, Ranger) have spells that are
 * permanently known and always castable - no preparation needed.
 * Hide preparation UI for these casters.
 *
 * @see Issue #676
 */
const showPreparationUI = computed(() => props.preparationMethod !== 'known')

/**
 * Get spell data (handles null spell for dangling references)
 */
const spellData = computed(() => props.spell.spell)

/**
 * Check if this is a cantrip (always ready, no preparation needed)
 */
const isCantrip = computed(() => spellData.value?.level === 0)

/**
 * Check if spell is prepared
 * - Cantrips are always ready (show filled icon)
 * - Always prepared spells (domain, etc.) are always prepared
 * - Other spells use store's reactive state for optimistic updates
 * - Falls back to prop if store isn't initialized for this character
 *
 * BUG FIX #719: Previously checked preparedSpellIds.size > 0, but this
 * caused spells to revert to original state when ALL spells were unprepared.
 * Now checks characterId to determine if store is initialized.
 */
const isPrepared = computed(() => {
  // Cantrips are always ready
  if (isCantrip.value) return true
  // Always prepared spells
  if (props.spell.is_always_prepared) return true
  // Use store's reactive state for real-time updates if store is initialized
  // (characterId is set when initializeSpellPreparation is called)
  // Fall back to prop only for initial render / tests where store isn't initialized
  if (store.characterId !== null) {
    return store.isSpellPrepared(props.spell.id)
  }
  return props.spell.is_prepared
})

/**
 * Check if spell is always prepared (domain spells, cantrips, etc.)
 */
const isAlwaysPrepared = computed(() => props.spell.is_always_prepared || isCantrip.value)

/**
 * Check if spell is prepared by another class (multiclass cross-check)
 */
const isPreparedByOtherClass = computed(() => !!props.otherClassPrepared)

// =========================================================================
// CONCENTRATION STATE
// @see Issue #783, #792
// =========================================================================

/**
 * Whether this spell requires concentration
 */
const isConcentrationSpell = computed(() => spellData.value?.concentration === true)

/**
 * Whether we're currently concentrating on THIS spell
 */
const isConcentratingOnThis = computed(() =>
  props.activeConcentration?.spellId === props.spell.id
)

/**
 * Whether we're concentrating on a DIFFERENT spell (for warning display)
 */
const isConcentratingOnOther = computed(() =>
  props.activeConcentration != null
  && props.activeConcentration.spellId !== props.spell.id
)

/**
 * Show concentrate button when:
 * - Spell requires concentration
 * - Card is expanded
 * - Character is in play mode (editable)
 */
const showConcentrateButton = computed(() =>
  isConcentrationSpell.value && isExpanded.value && props.editable
)

/**
 * Handle concentrate button click
 */
function handleConcentrate() {
  if (!spellData.value) return
  emit('concentrate', {
    spellId: props.spell.id,
    spellName: spellData.value.name,
    spellSlug: spellData.value.slug
  })
}

/**
 * Check if this card can toggle preparation
 */
const canToggle = computed(() => {
  // Known casters don't have preparation toggle
  if (!showPreparationUI.value) return false
  if (!props.editable) return false
  // Can't toggle a spell prepared by another class
  if (isPreparedByOtherClass.value) return false
  // Cantrips are always ready - no toggle needed
  if (isCantrip.value) return false
  // Always prepared spells can't be toggled
  if (props.spell.is_always_prepared) return false
  // Can't prepare new spells when at limit (but can unprepare)
  if (!isPrepared.value && props.atPrepLimit) return false
  // Disable during API call to prevent spam-clicks
  if (isUpdatingSpellPreparation.value) return false
  return true
})

/**
 * Check if card should appear greyed out
 */
const isGreyedOut = computed(() => {
  // Known casters don't use grey out (spells always available)
  if (!showPreparationUI.value) return false
  // Cantrips are always ready - never grey out
  if (isCantrip.value) return false
  // Grey out unprepared spells at prep limit
  if (!isPrepared.value && props.atPrepLimit) return true
  return false
})

/**
 * Handle header click (expand/collapse)
 * Clicking anywhere on the header row expands/collapses the card
 * @see Issue #719
 */
function handleHeaderClick(event: MouseEvent) {
  // Don't expand if clicking on the preparation toggle area
  const target = event.target as HTMLElement
  if (target.closest('[data-testid="preparation-toggle"]')) {
    return
  }
  isExpanded.value = !isExpanded.value
}

/**
 * Handle preparation toggle click
 * Note: @click.stop on the button prevents header expand
 */
async function handlePreparationClick() {
  if (!canToggle.value) return

  try {
    // Use store's reactive state for current prepared status
    const currentlyPrepared = store.isSpellPrepared(props.spell.id)
    await store.toggleSpellPreparation(
      props.spell.id,
      currentlyPrepared,
      props.spell.spell_slug,
      props.spell.class_slug ?? undefined
    )
  } catch {
    // Error handling done by store
  }
}

/**
 * Handle chevron click (expand/collapse only)
 * Kept for accessibility - explicit expand button
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
      // Greyed out state for unprepared spells at prep limit
      isGreyedOut && OPACITY_GREYED_OUT,
      // Dim unprepared spells for prepared/spellbook casters (not known casters)
      showPreparationUI && !isPrepared && !isGreyedOut && OPACITY_UNPREPARED
    ]"
  >
    <!-- Clickable header for expand/collapse (#719) -->
    <div
      data-testid="spell-card-header"
      class="cursor-pointer"
      @click="handleHeaderClick"
    >
      <!-- Collapsed Header -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <!-- Cross-class prepared: show gray check with tooltip -->
          <UTooltip
            v-if="showPreparationUI && isPreparedByOtherClass"
            :text="`Prepared as ${props.otherClassPrepared}`"
          >
            <UIcon
              data-testid="cross-class-prepared-indicator"
              name="i-heroicons-check-circle-solid"
              class="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0"
            />
          </UTooltip>

          <!-- Preparation toggle area (click to toggle preparation) -->
          <button
            v-else-if="showPreparationUI"
            data-testid="preparation-toggle"
            type="button"
            :class="[
              'flex-shrink-0 p-0.5 -m-0.5 rounded',
              canToggle ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : 'cursor-not-allowed'
            ]"
            @click.stop="handlePreparationClick"
          >
            <!-- Prepared indicator -->
            <UIcon
              v-if="isPrepared"
              data-testid="prepared-icon"
              name="i-heroicons-check-circle-solid"
              :class="[
                'w-5 h-5',
                isAlwaysPrepared
                  ? 'text-amber-500 dark:text-amber-400'
                  : 'text-spell-500 dark:text-spell-400'
              ]"
            />
            <!-- Empty circle for unprepared state -->
            <span
              v-else
              data-testid="unprepared-indicator"
              class="w-5 h-5 block rounded-full border-2 border-gray-300 dark:border-gray-600"
            />
          </button>

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
            size="md"
          >
            Always
          </UBadge>

          <!-- Concentration badge -->
          <UBadge
            v-if="spellData.concentration"
            color="spell"
            variant="subtle"
            size="md"
          >
            Concentration
          </UBadge>

          <!-- Ritual badge -->
          <UBadge
            v-if="spellData.ritual"
            color="neutral"
            variant="subtle"
            size="md"
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
      class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3 text-sm"
    >
      <!-- Casting Stats Grid -->
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

      <!-- Spell Description (Issue #782) -->
      <div
        v-if="spellData.description"
        data-testid="spell-description"
        class="pt-2 border-t border-gray-100 dark:border-gray-700/50"
      >
        <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line max-h-48 overflow-y-auto">
          {{ spellData.description }}
        </p>

        <!-- At Higher Levels -->
        <div
          v-if="spellData.higher_levels"
          class="mt-2"
        >
          <span class="font-semibold text-gray-900 dark:text-gray-100">At Higher Levels.</span>
          <span class="text-gray-700 dark:text-gray-300"> {{ spellData.higher_levels }}</span>
        </div>
      </div>

      <!-- Concentration Button (Issue #783, #792) -->
      <div
        v-if="showConcentrateButton"
        class="pt-2 border-t border-gray-100 dark:border-gray-700/50 flex items-center gap-3"
      >
        <UButton
          data-testid="concentrate-btn"
          :color="isConcentratingOnThis ? 'primary' : 'neutral'"
          :variant="isConcentratingOnThis ? 'solid' : 'outline'"
          size="sm"
          @click.stop="handleConcentrate"
        >
          {{ isConcentratingOnThis ? 'End Concentration' : 'Concentrate' }}
        </UButton>
        <span
          v-if="isConcentratingOnOther && activeConcentration"
          data-testid="concentration-warning"
          class="text-sm text-amber-600 dark:text-amber-400"
        >
          Will end {{ activeConcentration.spellName }}
        </span>
      </div>

      <!-- View Full Details Link -->
      <div class="pt-2 border-t border-gray-100 dark:border-gray-700/50">
        <NuxtLink
          :to="`/spells/${spellData.slug}`"
          data-testid="spell-compendium-link"
          class="inline-flex items-center gap-1 text-spell-600 dark:text-spell-400 hover:text-spell-700 dark:hover:text-spell-300 transition-colors"
        >
          <span>View Full Details</span>
          <UIcon
            name="i-heroicons-arrow-top-right-on-square"
            class="w-4 h-4"
            aria-hidden="true"
          />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
