<!-- app/components/character/wizard/StepEquipment.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { components } from '~/types/api/generated'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { wizardErrors } from '~/utils/wizardErrors'

type EntityItemResource = components['schemas']['EntityItemResource']
type PackContentResource = components['schemas']['PackContentResource']
type PendingChoice = components['schemas']['PendingChoiceResource']

/**
 * Equipment option structure from backend
 */
interface EquipmentOption {
  option: string
  label?: string
  is_category?: boolean
  /** Number of items available in category (NOT selections needed) */
  category_item_count?: number
  /** Number of items the user should select from the category */
  select_count?: number
  items?: Array<{
    slug?: string
    is_fixed?: boolean
    quantity?: number
  }>
}

/**
 * Starting wealth metadata structure from backend equipment_mode choice
 */
interface StartingWealthData {
  dice: string
  multiplier: number
  average: number
  formula: string
}

/**
 * Metadata structure for equipment_mode choice
 * gold_amount is present when the choice has been resolved with gold mode
 */
interface EquipmentModeMetadata {
  starting_wealth?: StartingWealthData
  gold_amount?: number
}

/**
 * Type guard to validate equipment_mode choice metadata
 * Ensures the metadata has the expected structure before use
 */
function isEquipmentModeMetadata(metadata: unknown): metadata is EquipmentModeMetadata {
  if (!metadata || typeof metadata !== 'object') return false
  const meta = metadata as Record<string, unknown>
  // starting_wealth is optional but if present must have required fields
  if (meta.starting_wealth !== undefined) {
    const sw = meta.starting_wealth
    if (!sw || typeof sw !== 'object') return false
    const swObj = sw as Record<string, unknown>
    if (typeof swObj.dice !== 'string') return false
    if (typeof swObj.multiplier !== 'number') return false
    if (typeof swObj.average !== 'number') return false
    if (typeof swObj.formula !== 'string') return false
  }
  return true
}

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

// ============================================================================
// Backend Choice Integration
// ============================================================================

/**
 * Get equipment_mode choice from backend unified choices
 * This choice allows players to select between starting equipment or gold
 */
const equipmentModeChoice = computed(() => choicesByType.value.equipmentMode)

/**
 * Check if backend provides an equipment_mode choice
 */
const hasEquipmentModeChoice = computed(() => !!equipmentModeChoice.value)

/**
 * Get starting wealth data from backend choice metadata (preferred source)
 * Uses type guard to validate metadata structure before accessing
 */
const backendStartingWealth = computed((): StartingWealthData | null => {
  const metadata = equipmentModeChoice.value?.metadata
  if (!isEquipmentModeMetadata(metadata)) return null
  return metadata.starting_wealth ?? null
})

/**
 * Check if starting wealth option is available
 * True if backend provides equipment_mode choice OR class has starting_wealth data
 *
 * FALLBACK PATTERN: We check both sources because:
 * 1. Backend choice is authoritative when present (includes formatted formula)
 * 2. Class data fallback ensures UI works during initial load before choices fetch
 * 3. Maintains backward compatibility if backend doesn't return the choice
 */
const hasStartingWealth = computed(() => {
  return hasEquipmentModeChoice.value || !!selections.value.class?.starting_wealth
})

/**
 * Get the starting wealth data (prefers backend choice metadata over class data)
 *
 * FALLBACK PATTERN: Same as hasStartingWealth - backend is authoritative but
 * class data provides fallback for initial render and backward compatibility.
 * Backend metadata includes formatted formula string for better display.
 */
const startingWealth = computed((): StartingWealthData | null => {
  return backendStartingWealth.value ?? selections.value.class?.starting_wealth ?? null
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
    // Don't set rolled amount on invalid dice - keep using average method
    return
  }

  const count = Number.parseInt(match[1], 10)
  const sides = Number.parseInt(match[2], 10)

  // Roll the dice
  let total = 0
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1
  }

  // Apply multiplier and update state
  rolledGoldAmount.value = total * multiplier
  goldCalculationMethod.value = 'roll'
}

// Track if we're currently switching modes (to prevent duplicate API calls)
const isSwitchingMode = ref(false)

/**
 * Handle equipment mode changes
 * - When switching to equipment: reset gold state, update backend, refetch equipment choices
 * - When switching to gold: no immediate action (choices will be cleared on Continue)
 *
 * CRITICAL: If user previously saved gold mode, the backend removed equipment choices.
 * When they switch back to equipment mode, we must:
 * 1. Tell the backend we're switching back to equipment mode
 * 2. Refetch equipment choices (backend restores them when mode changes back)
 */
watch(equipmentMode, async (newMode, oldMode) => {
  if (newMode === 'equipment' && oldMode === 'gold') {
    // Reset gold state
    rolledGoldAmount.value = null
    goldCalculationMethod.value = 'average'

    // Only update backend if equipment_mode choice was previously resolved
    // (i.e., user had saved gold mode before)
    const modeChoice = equipmentModeChoice.value
    if (modeChoice && modeChoice.selected.includes('gold') && !isSwitchingMode.value) {
      isSwitchingMode.value = true
      try {
        // Update backend: switch from gold back to equipment mode
        // This tells the backend to restore equipment choices
        await saveEquipmentModeChoice()

        // Clear local selections since we're getting fresh choices
        localSelections.value.clear()
        itemSelections.value.clear()

        // Refetch equipment choices - backend should now provide them
        await fetchChoices('equipment')
      } finally {
        isSwitchingMode.value = false
      }
    }
  }
})

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

/**
 * Initialize local state from backend choice (handles edit/re-entry flow)
 * When a character already has an equipment_mode selection, restore that state
 */
function initializeFromBackendChoice() {
  const choice = equipmentModeChoice.value
  if (!choice || choice.selected.length === 0) return

  const selected = choice.selected[0]
  if (selected === 'equipment' || selected === 'gold') {
    equipmentMode.value = selected
  }

  // Restore rolled gold amount if previously saved (gold mode only)
  // The backend stores gold_amount in metadata when the choice was resolved
  if (selected === 'gold' && isEquipmentModeMetadata(choice.metadata)) {
    const goldAmountFromBackend = choice.metadata.gold_amount
    if (goldAmountFromBackend !== undefined) {
      rolledGoldAmount.value = goldAmountFromBackend
      goldCalculationMethod.value = 'roll'
    }
  }
}

/**
 * Save equipment_mode choice to backend
 * Must be called BEFORE resolving equipment choices (affects what choices exist)
 */
async function saveEquipmentModeChoice(): Promise<void> {
  const choice = equipmentModeChoice.value
  if (!choice) return

  const payload: Record<string, unknown> = {
    selected: [equipmentMode.value]
  }

  // Include gold amount if gold mode selected
  if (equipmentMode.value === 'gold') {
    payload.gold_amount = goldAmount.value
  }

  await resolveChoice(choice.id, payload)
}

// ============================================================================
// End Gold Alternative Feature
// ============================================================================

// Fetch equipment and equipment_mode choices on mount
onMounted(async () => {
  if (store.characterId) {
    // Fetch both equipment and equipment_mode choices in parallel
    await Promise.all([
      fetchChoices('equipment'),
      fetchChoices('equipment_mode')
    ])
    // Initialize local state from backend choice (handles edit/re-entry flow)
    initializeFromBackendChoice()
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

// Subclass feature equipment choices (rare but supported for future-proofing)
const subclassFeatureEquipmentChoices = computed(() =>
  (choicesByType.value.equipment || []).filter(c => c.source === 'subclass_feature')
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
 * Get the selected option for a choice
 */
function getSelectedOption(choice: PendingChoice): EquipmentOption | null {
  const selectedLetter = localSelections.value.get(choice.id)
  if (!selectedLetter) return null

  const options = (choice.options as EquipmentOption[] | null) ?? []
  return options.find(opt => opt.option === selectedLetter) ?? null
}

/**
 * Check if an option requires item selection (is a category choice)
 * Uses backend's is_category flag if available, falls back to heuristic
 */
function optionRequiresItemSelection(option: EquipmentOption): boolean {
  // Use backend's is_category flag if available (authoritative)
  if (option.is_category !== undefined) {
    return option.is_category
  }

  // Fallback heuristic: 3+ items with same quantity = category
  const items = option.items ?? []
  if (items.length < 3) return false

  const firstQuantity = items[0]?.quantity ?? 1
  return items.every(item => (item.quantity ?? 1) === firstQuantity)
}

/**
 * Get number of item selections required for a category option
 *
 * NOTE: category_item_count is the number of items IN the category,
 * NOT the number of selections needed. Use select_count instead.
 */
function getRequiredItemCount(option: EquipmentOption): number {
  // Use backend's explicit select_count if available
  if (option.select_count !== undefined && option.select_count > 0) {
    return option.select_count
  }

  // Default: most category choices are "pick one from this list"
  return 1
}

/**
 * Count how many items have been selected for a choice option
 * Checks both primary key (choiceId:optionLetter) and indexed keys (choiceId:optionLetter:N)
 */
function countItemSelections(choiceId: string, optionLetter: string): number {
  let count = 0

  // Check primary key
  const primaryKey = `${choiceId}:${optionLetter}`
  if (itemSelections.value.has(primaryKey)) {
    count++
  }

  // Check indexed keys (choiceId:optionLetter:N)
  for (const key of itemSelections.value.keys()) {
    if (key.startsWith(`${choiceId}:${optionLetter}:`) && key !== primaryKey) {
      count++
    }
  }

  return count
}

/**
 * Check if a choice is fully satisfied (option selected + item selections if needed)
 */
function isChoiceFullySatisfied(choice: PendingChoice): boolean {
  // If backend says remaining is 0, choice is already resolved
  if (choice.remaining === 0) return true

  // Must have an option selected
  const selectedLetter = localSelections.value.get(choice.id)
  if (!selectedLetter) return false

  // Get the selected option
  const selectedOption = getSelectedOption(choice)
  if (!selectedOption) return false

  // If option requires item selection (is_category), verify items are selected
  if (optionRequiresItemSelection(selectedOption)) {
    const requiredCount = getRequiredItemCount(selectedOption)
    const selectedCount = countItemSelections(choice.id, selectedLetter)
    return selectedCount >= requiredCount
  }

  // Non-category option: just having the option selected is enough
  return true
}

/**
 * Check if all equipment choices are made
 * When in gold mode, class equipment choices are skipped
 * For category choices, also validates that item selections are complete
 */
const allEquipmentChoicesMade = computed(() => {
  // In gold mode, class equipment choices are skipped (replaced by gold)
  // Background and subclass feature equipment choices still need to be made
  if (equipmentMode.value === 'gold') {
    const backgroundChoices = backgroundEquipmentChoices.value
    const subclassChoices = subclassFeatureEquipmentChoices.value
    return backgroundChoices.every(isChoiceFullySatisfied)
      && subclassChoices.every(isChoiceFullySatisfied)
  }

  // In equipment mode, all choices must be made (including item selections for categories)
  const equipmentChoices = choicesByType.value.equipment || []
  return equipmentChoices.every(isChoiceFullySatisfied)
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
 * Order matters: equipment_mode must be saved FIRST (affects what equipment choices exist)
 */
async function handleContinue() {
  isSaving.value = true

  try {
    // 1. Save equipment_mode choice FIRST (this affects what equipment choices exist)
    if (hasEquipmentModeChoice.value) {
      try {
        await saveEquipmentModeChoice()
      } catch (err) {
        logger.error('Failed to save equipment mode choice:', err)
        wizardErrors.choiceResolveFailed(err, toast, 'equipment mode')
        return
      }

      // If gold mode selected, skip equipment choices entirely
      // Backend handles clearing class equipment and granting gold
      if (equipmentMode.value === 'gold') {
        // Explicitly refetch to verify backend cleared equipment choices
        // This ensures consistent state before proceeding
        await fetchChoices('equipment')
        nextStep()
        return
      }
    }

    // 2. Resolve each equipment choice (only in equipment mode)
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
    wizardErrors.choiceResolveFailed(e, toast, 'equipment')
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

        <div
          class="flex gap-2"
          role="group"
          aria-label="Starting equipment choice"
        >
          <UButton
            :color="equipmentMode === 'equipment' ? 'primary' : 'neutral'"
            :variant="equipmentMode === 'equipment' ? 'solid' : 'outline'"
            :aria-pressed="equipmentMode === 'equipment'"
            size="sm"
            @click="equipmentMode = 'equipment'"
          >
            <UIcon
              name="i-heroicons-briefcase"
              class="w-4 h-4 mr-1"
            />
            Equipment
          </UButton>
          <UButton
            :color="equipmentMode === 'gold' ? 'primary' : 'neutral'"
            :variant="equipmentMode === 'gold' ? 'solid' : 'outline'"
            :aria-pressed="equipmentMode === 'gold'"
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

    <!-- Subclass Feature Equipment (rare but supported) -->
    <div
      v-if="subclassFeatureEquipmentChoices.length > 0"
      class="space-y-4"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
        From Your Subclass
      </h3>

      <CharacterWizardEquipmentChoiceList
        :choices="subclassFeatureEquipmentChoices"
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
