<!-- app/components/character/wizard/EquipmentChoiceList.vue -->
<script setup lang="ts">
import type { components } from '~/types/api/generated'

type PendingChoice = components['schemas']['PendingChoiceResource']

interface PackContent {
  quantity: number | string
  item: { id: number, name: string, slug: string }
}

interface EquipmentItem {
  id: number
  name: string
  slug?: string
  quantity: number
  contents?: PackContent[]
}

interface ItemFilter {
  category: string
  subcategory?: string
}

interface EquipmentOption {
  option: string
  label?: string
  items: EquipmentItem[]
  item_filter?: ItemFilter
}

interface Props {
  choices: PendingChoice[]
  localSelections: Map<string, string>
  /** Item selections for options with item_filter (choiceId:optionLetter → itemSlug) */
  itemSelections?: Map<string, string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'select': [choiceId: string, optionLetter: string]
  /** Emitted when user selects a specific item for a filtered option */
  'item-select': [choiceId: string, optionLetter: string, itemSlug: string]
}>()

/**
 * Get typed options for an equipment choice
 */
function getEquipmentOptions(choice: PendingChoice): EquipmentOption[] {
  return (choice.options as EquipmentOption[] | null) ?? []
}

/**
 * Generate display label for an option
 * Uses explicit label if available, otherwise generates from items
 */
function getOptionLabel(option: EquipmentOption): string {
  if (option.label) {
    return option.label
  }

  // Generate label from items
  if (option.items.length === 0) {
    return `Option ${option.option.toUpperCase()}`
  }

  return `Option ${option.option.toUpperCase()}`
}

/**
 * Get display text for items in an option
 * Only shows items for fixed selections (1-2 items), not for "choose one" options
 */
function getItemsDisplay(option: EquipmentOption): string {
  // Don't show item list for options requiring a choice
  if (requiresItemChoice(option)) {
    return ''
  }

  if (option.items.length === 0) {
    return ''
  }

  return option.items
    .map(item => item.quantity > 1 ? `${item.name} (×${item.quantity})` : item.name)
    .join(', ')
}

/**
 * Check if an option requires the player to choose item(s) from many
 * This is different from fixed items where all items are included
 *
 * Patterns detected:
 * 1. 3+ items each with quantity 1 = "pick one from this list" (e.g., "any simple weapon")
 * 2. 3+ items ALL with same quantity > 1 = "pick N from this list" (e.g., "two martial weapons")
 */
function requiresItemChoice(option: EquipmentOption): boolean {
  if (option.items.length < 3) {
    return false
  }

  // Check if all items have the same quantity
  const firstQuantity = option.items[0]?.quantity ?? 1
  const allSameQuantity = option.items.every(item => item.quantity === firstQuantity)

  // If all have same quantity (1, 2, etc.), it's a "pick from list" scenario
  return allSameQuantity
}

/**
 * Get the number of selections required for an option
 * For "two martial weapons" where all items have quantity=2, returns 2
 * For "any simple weapon" where all items have quantity=1, returns 1
 */
function getRequiredSelectionCount(option: EquipmentOption): number {
  if (option.items.length === 0) return 1

  const firstQuantity = option.items[0]?.quantity ?? 1
  const allSameQuantity = option.items.every(item => item.quantity === firstQuantity)

  return allSameQuantity ? firstQuantity : 1
}

/**
 * Check if an item is a pack with contents
 */
function hasPackContents(item: EquipmentItem): boolean {
  return Boolean(item.contents && item.contents.length > 0)
}

/**
 * Check if any item in the option has pack contents
 */
function optionHasPackContents(option: EquipmentOption): boolean {
  return option.items.some(item => hasPackContents(item))
}

/**
 * Get all pack contents from an option's items
 */
function getPackContents(option: EquipmentOption): PackContent[] {
  for (const item of option.items) {
    if (item.contents && item.contents.length > 0) {
      return item.contents
    }
  }
  return []
}

/**
 * Format pack content quantity (handles string quantities from API)
 */
function formatPackContentItem(content: PackContent): string {
  const qty = typeof content.quantity === 'string'
    ? parseInt(content.quantity, 10)
    : content.quantity
  const quantity = isNaN(qty) ? 1 : qty

  if (quantity > 1) {
    return `${quantity}× ${content.item.name}`
  }
  return content.item.name
}

// Track which pack contents are expanded (by option key: choiceId:optionLetter)
const expandedPacks = ref<Set<string>>(new Set())

function togglePackContents(choiceId: string, optionLetter: string) {
  const key = `${choiceId}:${optionLetter}`
  if (expandedPacks.value.has(key)) {
    expandedPacks.value.delete(key)
  } else {
    expandedPacks.value.add(key)
  }
}

function isPackExpanded(choiceId: string, optionLetter: string): boolean {
  return expandedPacks.value.has(`${choiceId}:${optionLetter}`)
}

// ══════════════════════════════════════════════════════════════════════════════
// Item Filter Support (for "any simple weapon", "any musical instrument", etc.)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Get selected item for an option with item_filter
 * For multi-select scenarios, index specifies which selection (0, 1, etc.)
 */
function getSelectedItem(choiceId: string, optionLetter: string, index: number = 0): string | undefined {
  // For backward compatibility, index 0 uses original key format
  const key = index === 0
    ? `${choiceId}:${optionLetter}`
    : `${choiceId}:${optionLetter}:${index}`
  return props.itemSelections?.get(key)
}

/**
 * Handle item selection for filtered options
 * For multi-select scenarios, index specifies which selection (0, 1, etc.)
 */
function handleItemSelect(choiceId: string, optionLetter: string, itemSlug: string, index: number = 0) {
  // For backward compatibility, index 0 uses original key format
  const key = index === 0 ? optionLetter : `${optionLetter}:${index}`
  emit('item-select', choiceId, key, itemSlug)
}

/**
 * Generate array of selection indices for multi-select options
 * Returns [0] for single select, [0, 1] for "two martial weapons", etc.
 */
function getSelectionIndices(option: EquipmentOption): number[] {
  const count = getRequiredSelectionCount(option)
  return Array.from({ length: count }, (_, i) => i)
}

/**
 * Handle option selection
 */
function handleSelect(choiceId: string, optionLetter: string) {
  emit('select', choiceId, optionLetter)
}

/**
 * Check if an option is selected
 */
function isSelected(choiceId: string, optionLetter: string): boolean {
  return props.localSelections.get(choiceId) === optionLetter
}
</script>

<template>
  <div
    v-for="choice in choices"
    :key="choice.id"
    class="space-y-2"
  >
    <h4 class="font-medium text-gray-700 dark:text-gray-300">
      {{ choice.source_name }} Equipment Choice
    </h4>

    <div class="space-y-2">
      <button
        v-for="option in getEquipmentOptions(choice)"
        :key="option.option"
        :data-testid="`option-${option.option}`"
        type="button"
        class="w-full p-3 rounded-lg border-2 transition-all text-left flex items-center gap-3"
        :class="[
          isSelected(choice.id, option.option)
            ? 'ring-2 ring-primary-500 border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
        ]"
        @click="handleSelect(choice.id, option.option)"
      >
        <!-- Radio indicator -->
        <div
          class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
          :class="[
            isSelected(choice.id, option.option)
              ? 'border-primary-500 bg-primary-500'
              : 'border-gray-400'
          ]"
        >
          <div
            v-if="isSelected(choice.id, option.option)"
            class="w-2 h-2 rounded-full bg-white"
          />
        </div>

        <!-- Option label and items -->
        <div class="flex-1">
          <div class="flex items-center justify-between gap-2">
            <span class="font-medium text-gray-900 dark:text-white">
              {{ getOptionLabel(option) }}
            </span>
            <!-- Pack contents toggle button -->
            <button
              v-if="optionHasPackContents(option)"
              type="button"
              class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 ml-auto"
              @click.stop="togglePackContents(choice.id, option.option)"
            >
              <UIcon
                :name="isPackExpanded(choice.id, option.option) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="w-3 h-3"
              />
              {{ isPackExpanded(choice.id, option.option) ? 'Hide' : 'Show' }} contents
            </button>
          </div>
          <div
            v-if="getItemsDisplay(option)"
            class="text-sm text-gray-600 dark:text-gray-400 mt-1"
          >
            {{ getItemsDisplay(option) }}
          </div>

          <!-- Pack contents (expandable) -->
          <div
            v-if="optionHasPackContents(option) && isPackExpanded(choice.id, option.option)"
            class="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
            @click.stop
          >
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Pack Contents
            </p>
            <ul class="grid grid-cols-2 gap-1 text-sm text-gray-700 dark:text-gray-300">
              <li
                v-for="(content, idx) in getPackContents(option)"
                :key="idx"
                class="flex items-center gap-1"
              >
                <UIcon
                  name="i-heroicons-cube"
                  class="w-3 h-3 text-gray-400 flex-shrink-0"
                />
                {{ formatPackContentItem(content) }}
              </li>
            </ul>
          </div>

          <!-- Item selection for "choose from list" options -->
          <div
            v-if="requiresItemChoice(option) && isSelected(choice.id, option.option)"
            class="mt-2 space-y-2"
            @click.stop
          >
            <p class="text-xs text-gray-500">
              {{ getRequiredSelectionCount(option) > 1
                ? `Select ${getRequiredSelectionCount(option)} items from ${option.items.length} options:`
                : `Select from ${option.items.length} items:` }}
            </p>
            <div
              v-for="selectionIndex in getSelectionIndices(option)"
              :key="selectionIndex"
              class="flex items-center gap-2"
            >
              <span
                v-if="getRequiredSelectionCount(option) > 1"
                class="text-xs text-gray-400 w-4"
              >
                {{ selectionIndex + 1 }}.
              </span>
              <USelectMenu
                :model-value="getSelectedItem(choice.id, option.option, selectionIndex)"
                :items="option.items.map(item => ({ label: item.name, value: item.slug || String(item.id) }))"
                :placeholder="`Select item ${selectionIndex + 1}...`"
                value-key="value"
                class="flex-1"
                @update:model-value="(val) => val && handleItemSelect(choice.id, option.option, String(val), selectionIndex)"
              />
            </div>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
