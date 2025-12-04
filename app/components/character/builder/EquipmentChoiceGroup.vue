<script setup lang="ts">
import type { components } from '~/types/api/generated'

type EntityItemResource = components['schemas']['EntityItemResource']
type EquipmentChoiceItemResource = components['schemas']['EquipmentChoiceItemResource']
type PackContentResource = components['schemas']['PackContentResource']

interface Props {
  groupName: string
  items: EntityItemResource[]
  selectedId: number | null
  itemSelections?: Map<string, number> // key: "choiceOption:index", value: itemId
}

const props = withDefaults(defineProps<Props>(), {
  itemSelections: () => new Map()
})

const emit = defineEmits<{
  select: [id: number]
  itemSelect: [choiceOption: number, choiceItemIndex: number, itemId: number]
}>()

// Track which pack contents are expanded (by item.id)
const expandedPacks = ref<Set<number>>(new Set())

function handleSelect(id: number) {
  emit('select', id)
}

function handleItemSelect(choiceOption: number, choiceItemIndex: number, itemIds: number[]) {
  // For single selection, emit the first (and only) item
  const firstItem = itemIds[0]
  if (firstItem !== undefined) {
    emit('itemSelect', choiceOption, choiceItemIndex, firstItem)
  }
}

/**
 * Get display name for equipment item
 * Checks choice_items for fixed items (packs), then item, then description
 */
function getItemDisplayName(item: EntityItemResource): string {
  // For choice options with a single fixed item (like packs), use its name
  const firstChoiceItem = item.choice_items?.[0]
  if (item.choice_items?.length === 1 && firstChoiceItem?.item?.name) {
    return firstChoiceItem.item.name
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
 * Check if a choice_item needs a picker (has proficiency_type, no fixed item)
 */
function needsPicker(choiceItem: EquipmentChoiceItemResource): boolean {
  return !!choiceItem.proficiency_type && !choiceItem.item
}

/**
 * Get current selection for a choice item
 */
function getItemSelection(choiceOption: number, index: number): number[] {
  const key = `${choiceOption}:${index}`
  const selected = props.itemSelections?.get(key)
  return selected ? [selected] : []
}

/**
 * Check if an item has pack contents
 * For choice items, contents are in choice_items[0].item.contents
 * For fixed items, contents are in item.contents
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
 * For choice items, contents are in choice_items[0].item.contents
 * For fixed items, contents are in item.contents
 */
function getPackContents(item: EntityItemResource): PackContentResource[] {
  // Check direct item contents first
  if (item.item?.contents && item.item.contents.length > 0) {
    return item.item.contents
  }
  // Check choice_items - if there's exactly one fixed item, get its contents
  const firstChoiceItem = item.choice_items?.[0]
  if (item.choice_items?.length === 1 && firstChoiceItem?.item?.contents) {
    return firstChoiceItem.item.contents
  }
  return []
}

/**
 * Toggle pack contents visibility
 */
function togglePackContents(itemId: number) {
  if (expandedPacks.value.has(itemId)) {
    expandedPacks.value.delete(itemId)
  } else {
    expandedPacks.value.add(itemId)
  }
}

/**
 * Check if pack contents are expanded
 */
function isPackExpanded(itemId: number): boolean {
  return expandedPacks.value.has(itemId)
}

/**
 * Format pack content item display with quantity
 * Handles string quantities from API, with NaN fallback to 1
 */
function formatPackContentItem(content: PackContentResource): string {
  const parsed = Number.parseInt(content.quantity, 10)
  const quantity = Number.isNaN(parsed) ? 1 : parsed
  const name = content.item?.name ?? 'Unknown'
  if (quantity > 1) {
    return `${quantity} ${name}`
  }
  return name
}
</script>

<template>
  <div class="space-y-2">
    <h4 class="font-medium text-gray-700 dark:text-gray-300">
      {{ groupName }}
    </h4>

    <div class="space-y-2">
      <div
        v-for="item in items"
        :key="item.id"
      >
        <!-- Main option button -->
        <button
          :data-test="`option-${item.id}`"
          type="button"
          class="w-full p-3 rounded-lg border-2 transition-all text-left flex items-center gap-3"
          :class="[
            selectedId === item.id
              ? 'ring-2 ring-primary-500 border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
          ]"
          @click="handleSelect(item.id)"
        >
          <!-- Radio indicator -->
          <div
            class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
            :class="[
              selectedId === item.id
                ? 'border-primary-500 bg-primary-500'
                : 'border-gray-400'
            ]"
          >
            <div
              v-if="selectedId === item.id"
              class="w-2 h-2 rounded-full bg-white"
            />
          </div>

          <!-- Item info -->
          <div class="flex-1">
            <span class="font-medium text-gray-900 dark:text-white">
              {{ getItemDisplayName(item) }}
            </span>
            <span
              v-if="item.quantity > 1 && !item.choice_items?.length"
              class="text-gray-500 ml-1"
            >
              (×{{ item.quantity }})
            </span>
          </div>

          <!-- Pack contents toggle (only if item has contents) -->
          <button
            v-if="hasPackContents(item)"
            :data-test="`pack-contents-toggle-${item.id}`"
            type="button"
            :aria-expanded="isPackExpanded(item.id)"
            :aria-label="`${isPackExpanded(item.id) ? 'Hide' : 'Show'} contents of ${getItemDisplayName(item)}`"
            class="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 px-2 py-1 rounded transition-colors"
            @click.stop="togglePackContents(item.id)"
          >
            <UIcon
              :name="isPackExpanded(item.id) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
              class="w-4 h-4"
            />
            <span>{{ isPackExpanded(item.id) ? 'Hide' : 'Show' }} contents</span>
          </button>
        </button>

        <!-- Pack contents list (when expanded) -->
        <div
          v-if="hasPackContents(item) && isPackExpanded(item.id)"
          :data-test="`pack-contents-list-${item.id}`"
          class="ml-8 mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
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

        <!-- Inline choice_items pickers (only for selected option) -->
        <div
          v-if="selectedId === item.id && item.choice_items?.length"
          class="ml-8 mt-2 space-y-3 border-l-2 border-primary-200 pl-4"
        >
          <div
            v-for="(choiceItem, index) in item.choice_items"
            :key="index"
            class="flex items-center gap-2"
          >
            <!-- Category item - needs picker -->
            <template v-if="needsPicker(choiceItem)">
              <div class="flex-1">
                <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                  Select {{ choiceItem.proficiency_type?.name?.toLowerCase() }}
                  <span v-if="choiceItem.quantity > 1">({{ choiceItem.quantity }})</span>
                </label>
                <CharacterBuilderEquipmentItemPicker
                  :data-test="`choice-item-picker-${index}`"
                  :proficiency-type="choiceItem.proficiency_type!"
                  :quantity="choiceItem.quantity"
                  :model-value="getItemSelection(item.choice_option!, index)"
                  @update:model-value="(ids) => handleItemSelect(item.choice_option!, index, ids)"
                />
              </div>
            </template>

            <!-- Fixed item - auto-included -->
            <template v-else-if="choiceItem.item">
              <div
                :data-test="`fixed-item-${index}`"
                class="flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <UIcon
                  name="i-heroicons-check-circle"
                  class="w-5 h-5 text-green-500 flex-shrink-0"
                />
                <span>{{ choiceItem.item.name }}</span>
                <span
                  v-if="choiceItem.quantity > 1"
                  class="text-gray-500"
                >
                  (×{{ choiceItem.quantity }})
                </span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
