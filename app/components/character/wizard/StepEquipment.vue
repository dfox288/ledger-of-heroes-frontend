<!-- app/components/character/wizard/StepEquipment.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { components } from '~/types/api/generated'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { logger } from '~/utils/logger'

type EntityItemResource = components['schemas']['EntityItemResource']
type PackContentResource = components['schemas']['PackContentResource']

const store = useCharacterWizardStore()
const { selections } = storeToRefs(store)
const { nextStep } = useCharacterWizard()

// Toast for user feedback
const toast = useToast()

// Use unified choices composable
const {
  choicesByType,
  pending,
  error: choicesError,
  fetchChoices,
  resolveChoice
} = useUnifiedChoices(computed(() => store.characterId))

// Track which fixed pack contents are expanded (by item.id)
const expandedFixedPacks = ref<Set<number>>(new Set())

// Track local selections (choiceId → selected option letter)
const localSelections = ref<Map<string, string>>(new Map())

// Track item selections for filtered options (choiceId:optionLetter → itemSlug)
const itemSelections = ref<Map<string, string>>(new Map())

// ============================================================================
// Gold Alternative Feature
// ============================================================================

// Equipment mode: 'equipment' (default) or 'gold'
const equipmentMode = ref<'equipment' | 'gold'>('equipment')

// Gold calculation method: 'average' or 'roll'
const goldCalculationMethod = ref<'average' | 'roll'>('average')

// Rolled gold amount (null until rolled)
const rolledGoldAmount = ref<number | null>(null)

/**
 * Check if the selected class has starting wealth data
 */
const hasStartingWealth = computed(() => {
  return !!selections.value.class?.starting_wealth
})

/**
 * Get the starting wealth data from the selected class
 */
const startingWealth = computed(() => {
  return selections.value.class?.starting_wealth ?? null
})

/**
 * Calculate the gold amount based on method (average or rolled)
 */
const goldAmount = computed(() => {
  if (!startingWealth.value) return 0

  if (goldCalculationMethod.value === 'average') {
    return startingWealth.value.average
  }

  return rolledGoldAmount.value ?? startingWealth.value.average
})

/**
 * Roll for starting gold using the class's dice formula
 * Parses "5d4" format and applies multiplier
 */
function rollForGold(): void {
  if (!startingWealth.value) return

  const { dice, multiplier } = startingWealth.value

  // Parse dice notation (e.g., "5d4" -> count=5, sides=4)
  const match = dice.match(/(\d+)d(\d+)/)
  if (!match || !match[1] || !match[2]) {
    logger.error('Invalid dice notation:', dice)
    rolledGoldAmount.value = startingWealth.value.average
    return
  }

  const count = Number.parseInt(match[1], 10)
  const sides = Number.parseInt(match[2], 10)

  // Roll the dice
  let total = 0
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1
  }

  // Apply multiplier
  rolledGoldAmount.value = total * multiplier
  goldCalculationMethod.value = 'roll'
}

/**
 * Determine if class equipment section should be shown
 * Hidden when in gold mode (gold replaces class equipment)
 */
const showClassEquipment = computed(() => {
  return equipmentMode.value === 'equipment'
})

/**
 * Determine if background equipment section should be shown
 * Always shown (background equipment is granted regardless of gold choice)
 */
const showBackgroundEquipment = computed(() => {
  return !!selections.value.background
})

// ============================================================================
// End Gold Alternative Feature
// ============================================================================

// Fetch equipment choices on mount
onMounted(async () => {
  if (store.characterId) {
    await fetchChoices('equipment')
  }
})

// Separate equipment by source
const classFixedEquipment = computed(() =>
  selections.value.class?.equipment?.filter(eq => !eq.is_choice) ?? []
)

const backgroundFixedEquipment = computed(() =>
  selections.value.background?.equipment?.filter(eq => !eq.is_choice) ?? []
)

// Get equipment choices by source
const classEquipmentChoices = computed(() =>
  (choicesByType.value.equipment || []).filter(c => c.source === 'class')
)

const backgroundEquipmentChoices = computed(() =>
  (choicesByType.value.equipment || []).filter(c => c.source === 'background')
)

/**
 * Handle equipment choice selection
 */
function handleChoiceSelect(choiceId: string, optionLetter: string) {
  localSelections.value.set(choiceId, optionLetter)
  // Clear any item selections for this choice when changing options
  clearItemSelectionsForChoice(choiceId)
}

/**
 * Handle item selection for filtered options (e.g., "any simple weapon")
 */
function handleItemSelect(choiceId: string, optionLetter: string, itemSlug: string) {
  itemSelections.value.set(`${choiceId}:${optionLetter}`, itemSlug)
}

/**
 * Clear item selections for a specific choice
 */
function clearItemSelectionsForChoice(choiceId: string) {
  const keysToDelete: string[] = []
  for (const key of itemSelections.value.keys()) {
    if (key.startsWith(`${choiceId}:`)) {
      keysToDelete.push(key)
    }
  }
  for (const key of keysToDelete) {
    itemSelections.value.delete(key)
  }
}

/**
 * Get display name for equipment item
 * Uses custom_name if set, otherwise item name, then description
 */
function getItemDisplayName(item: { custom_name?: string | null, item?: { name?: string } | null, description?: string | null }): string {
  if (item.custom_name) {
    return item.custom_name
  }
  if (item.item?.name) {
    return item.item.name
  }
  if (item.description) {
    return item.description
  }
  return 'Unknown item'
}

/**
 * Check if all equipment choices are made
 * When in gold mode, class equipment choices are skipped
 */
const allEquipmentChoicesMade = computed(() => {
  // In gold mode, class equipment choices are skipped (replaced by gold)
  // Only background equipment choices need to be made
  if (equipmentMode.value === 'gold') {
    const backgroundChoices = backgroundEquipmentChoices.value
    return backgroundChoices.every((choice) => {
      return localSelections.value.has(choice.id) || choice.remaining === 0
    })
  }

  // In equipment mode, all choices must be made
  const equipmentChoices = choicesByType.value.equipment || []
  return equipmentChoices.every((choice) => {
    // Check if there's a local selection
    return localSelections.value.has(choice.id) || choice.remaining === 0
  })
})

// Saving state
const isSaving = ref(false)

/**
 * Gather all item selections for a choice option, including multi-select
 * Keys can be: "choiceId:optionLetter" or "choiceId:optionLetter:index"
 */
function gatherItemSelectionsForOption(choiceId: string, optionLetter: string): string[] {
  const selections: string[] = []

  // Check for primary selection (index 0)
  const primaryKey = `${choiceId}:${optionLetter}`
  const primarySelection = itemSelections.value.get(primaryKey)
  if (primarySelection) {
    selections.push(primarySelection)
  }

  // Check for indexed selections (index 1, 2, etc.)
  for (const [key, value] of itemSelections.value.entries()) {
    // Match pattern: "choiceId:optionLetter:N" where N is a number
    const indexedPattern = `${choiceId}:${optionLetter}:`
    if (key.startsWith(indexedPattern) && key !== primaryKey) {
      selections.push(value)
    }
  }

  return selections
}

/**
 * Continue to next step - resolve all choices
 */
async function handleContinue() {
  isSaving.value = true

  try {
    // Resolve each equipment choice
    for (const [choiceId, optionLetter] of localSelections.value) {
      // Gather all item selections for this option (handles multi-select like "two martial weapons")
      const itemSlugs = gatherItemSelectionsForOption(choiceId, optionLetter)

      const payload: Record<string, unknown> = {
        selected: [optionLetter]
      }

      // If user selected specific items, include them in the payload
      if (itemSlugs.length > 0) {
        payload.item_selections = { [optionLetter]: itemSlugs }
      }

      await resolveChoice(choiceId, payload)
    }

    nextStep()
  } catch (e) {
    logger.error('Failed to save equipment choices:', e)
    toast.add({
      title: 'Failed to save equipment',
      description: 'Please try again',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
  } finally {
    isSaving.value = false
  }
}

/**
 * Check if a fixed equipment item has pack contents
 * Checks both direct item contents and choice_items path (for single-item fixed equipment)
 */
function hasPackContents(item: EntityItemResource): boolean {
  // Check direct item contents first
  if (item.item?.contents && item.item.contents.length > 0) {
    return true
  }
  // Check choice_items - if there's exactly one fixed item, check its contents
  const firstChoiceItem = item.choice_items?.[0]
  if (item.choice_items?.length === 1 && firstChoiceItem?.item?.contents) {
    return firstChoiceItem.item.contents.length > 0
  }
  return false
}

/**
 * Get pack contents for an item
 * For choice_items structure, contents are in choice_items[0].item.contents
 */
function getPackContents(item: EntityItemResource): PackContentResource[] {
  // Check direct item contents first
  if (item.item?.contents && item.item.contents.length > 0) {
    return item.item.contents
  }
  // Check choice_items path
  const firstChoiceItem = item.choice_items?.[0]
  if (firstChoiceItem?.item?.contents) {
    return firstChoiceItem.item.contents
  }
  return []
}

/**
 * Toggle fixed pack contents visibility
 */
function toggleFixedPackContents(itemId: number) {
  if (expandedFixedPacks.value.has(itemId)) {
    expandedFixedPacks.value.delete(itemId)
  } else {
    expandedFixedPacks.value.add(itemId)
  }
}

/**
 * Check if fixed pack contents are expanded
 */
function isFixedPackExpanded(itemId: number): boolean {
  return expandedFixedPacks.value.has(itemId)
}

/**
 * Format pack content item display with quantity
 * Handles string quantities from API, with NaN fallback to 1
 */
function formatPackContentItem(content: PackContentResource): string {
  const parsed = Number.parseInt(content.quantity, 10)
  const quantity = Number.isNaN(parsed) ? 1 : parsed
  // item is typed as { [key: string]: unknown } from OpenAPI, cast to access name
  const name = (content.item as { name?: string } | null)?.name ?? 'Unknown'
  if (quantity > 1) {
    return `${quantity} ${name}`
  }
  return name
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Choose Your Starting Equipment
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Select your starting gear from your class and background
      </p>
    </div>

    <!-- Error State -->
    <UAlert
      v-if="choicesError"
      color="error"
      icon="i-heroicons-exclamation-circle"
      title="Failed to load equipment choices"
      :description="choicesError"
    />

    <!-- Loading State -->
    <div
      v-if="pending && !choicesError"
      class="flex justify-center py-8"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-primary"
      />
    </div>

    <!-- Equipment Mode Toggle (Gold Alternative) -->
    <div
      v-if="hasStartingWealth && !pending"
      data-testid="equipment-mode-toggle"
      class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">
            Starting Equipment Choice
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Take your class's starting equipment, or roll for starting gold
          </p>
        </div>

        <div class="flex gap-2">
          <UButton
            :color="equipmentMode === 'equipment' ? 'primary' : 'neutral'"
            :variant="equipmentMode === 'equipment' ? 'solid' : 'outline'"
            size="sm"
            @click="equipmentMode = 'equipment'"
          >
            <UIcon
              name="i-heroicons-backpack"
              class="w-4 h-4 mr-1"
            />
            Equipment
          </UButton>
          <UButton
            :color="equipmentMode === 'gold' ? 'primary' : 'neutral'"
            :variant="equipmentMode === 'gold' ? 'solid' : 'outline'"
            size="sm"
            @click="equipmentMode = 'gold'"
          >
            <UIcon
              name="i-heroicons-currency-dollar"
              class="w-4 h-4 mr-1"
            />
            Gold
          </UButton>
        </div>
      </div>

      <!-- Gold Option Details (when gold mode selected) -->
      <div
        v-if="equipmentMode === 'gold' && startingWealth"
        class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p class="text-lg font-semibold text-amber-600 dark:text-amber-400">
              {{ startingWealth.formula }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Average: {{ startingWealth.average }} gp
            </p>
          </div>

          <div class="flex items-center gap-3">
            <div class="text-right">
              <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Your Gold
              </p>
              <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {{ goldAmount }} gp
              </p>
            </div>
            <UButton
              data-testid="roll-gold-btn"
              color="warning"
              variant="soft"
              size="sm"
              @click="rollForGold"
            >
              <UIcon
                name="i-heroicons-cube"
                class="w-4 h-4 mr-1"
              />
              {{ rolledGoldAmount !== null ? 'Re-roll' : 'Roll' }}
            </UButton>
          </div>
        </div>

        <UAlert
          class="mt-3"
          color="info"
          variant="subtle"
          icon="i-heroicons-information-circle"
        >
          <template #description>
            Taking gold replaces your class starting equipment. You'll keep your background equipment and can purchase gear from the shop.
          </template>
        </UAlert>
      </div>
    </div>

    <!-- Class Equipment (hidden when gold mode selected) -->
    <div
      v-if="selections.class && showClassEquipment"
      class="space-y-4"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
        From Your Class ({{ selections.class.name }})
      </h3>

      <!-- Fixed Items -->
      <div
        v-if="classFixedEquipment.length > 0"
        class="space-y-2"
      >
        <div
          v-for="item in classFixedEquipment"
          :key="item.id"
        >
          <div class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <UIcon
              name="i-heroicons-check-circle"
              class="w-5 h-5 text-green-500 flex-shrink-0"
            />
            <span>{{ getItemDisplayName(item) }}</span>
            <span
              v-if="item.quantity > 1"
              class="text-gray-500"
            >(×{{ item.quantity }})</span>

            <!-- Pack contents toggle for fixed items -->
            <button
              v-if="hasPackContents(item)"
              :data-testid="`fixed-pack-contents-toggle-${item.id}`"
              type="button"
              :aria-expanded="isFixedPackExpanded(item.id)"
              :aria-label="`${isFixedPackExpanded(item.id) ? 'Hide' : 'Show'} contents of ${getItemDisplayName(item)}`"
              class="ml-auto flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 px-2 py-1 rounded transition-colors"
              @click="toggleFixedPackContents(item.id)"
            >
              <UIcon
                :name="isFixedPackExpanded(item.id) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="w-4 h-4"
              />
              <span>{{ isFixedPackExpanded(item.id) ? 'Hide' : 'Show' }} contents</span>
            </button>
          </div>

          <!-- Pack contents list (when expanded) -->
          <div
            v-if="hasPackContents(item) && isFixedPackExpanded(item.id)"
            :data-testid="`fixed-pack-contents-list-${item.id}`"
            class="ml-7 mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Pack Contents
            </p>
            <ul class="space-y-1">
              <li
                v-for="(content, idx) in getPackContents(item)"
                :key="idx"
                class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <UIcon
                  name="i-heroicons-cube"
                  class="w-4 h-4 text-gray-400 flex-shrink-0"
                />
                <span>{{ formatPackContentItem(content) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Choice Groups -->
      <CharacterWizardEquipmentChoiceList
        :choices="classEquipmentChoices"
        :local-selections="localSelections"
        :item-selections="itemSelections"
        @select="handleChoiceSelect"
        @item-select="handleItemSelect"
      />
    </div>

    <!-- Background Equipment (always shown, even in gold mode) -->
    <div
      v-if="showBackgroundEquipment"
      class="space-y-4"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
        From Your Background ({{ selections.background?.name }})
      </h3>

      <!-- Fixed Items -->
      <div
        v-if="backgroundFixedEquipment.length > 0"
        class="space-y-2"
      >
        <div
          v-for="item in backgroundFixedEquipment"
          :key="item.id"
        >
          <div class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <UIcon
              name="i-heroicons-check-circle"
              class="w-5 h-5 text-green-500 flex-shrink-0"
            />
            <span>{{ getItemDisplayName(item) }}</span>
            <span
              v-if="item.quantity > 1"
              class="text-gray-500"
            >(×{{ item.quantity }})</span>

            <!-- Pack contents toggle for fixed items -->
            <button
              v-if="hasPackContents(item)"
              :data-testid="`fixed-pack-contents-toggle-${item.id}`"
              type="button"
              :aria-expanded="isFixedPackExpanded(item.id)"
              :aria-label="`${isFixedPackExpanded(item.id) ? 'Hide' : 'Show'} contents of ${getItemDisplayName(item)}`"
              class="ml-auto flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 px-2 py-1 rounded transition-colors"
              @click="toggleFixedPackContents(item.id)"
            >
              <UIcon
                :name="isFixedPackExpanded(item.id) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="w-4 h-4"
              />
              <span>{{ isFixedPackExpanded(item.id) ? 'Hide' : 'Show' }} contents</span>
            </button>
          </div>

          <!-- Pack contents list (when expanded) -->
          <div
            v-if="hasPackContents(item) && isFixedPackExpanded(item.id)"
            :data-testid="`fixed-pack-contents-list-${item.id}`"
            class="ml-7 mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Pack Contents
            </p>
            <ul class="space-y-1">
              <li
                v-for="(content, idx) in getPackContents(item)"
                :key="idx"
                class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <UIcon
                  name="i-heroicons-cube"
                  class="w-4 h-4 text-gray-400 flex-shrink-0"
                />
                <span>{{ formatPackContentItem(content) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Choice Groups -->
      <CharacterWizardEquipmentChoiceList
        :choices="backgroundEquipmentChoices"
        :local-selections="localSelections"
        :item-selections="itemSelections"
        @select="handleChoiceSelect"
        @item-select="handleItemSelect"
      />
    </div>

    <!-- Continue Button -->
    <div class="flex justify-center pt-4">
      <UButton
        data-testid="continue-btn"
        size="lg"
        :disabled="!allEquipmentChoicesMade || pending || isSaving"
        :loading="pending || isSaving"
        @click="handleContinue"
      >
        {{ equipmentMode === 'gold' ? `Continue with ${goldAmount} gp` : 'Continue with Equipment' }}
      </UButton>
    </div>
  </div>
</template>
