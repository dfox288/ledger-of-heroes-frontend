<!-- app/components/character/inventory/AddLootModal.vue -->
<script setup lang="ts">
/**
 * Add Loot Modal
 *
 * Modal for adding items to inventory as loot (no cost).
 * Supports both compendium items (searched from /items) and custom items.
 *
 * Features:
 * - Search compendium items with debounced input
 * - Select item from search results
 * - Set quantity
 * - Toggle for custom items (name + description)
 *
 * @see Design: docs/frontend/plans/2025-12-13-inventory-tab-design-v2.md
 */

import type { Item } from '~/types'

interface Props {
  open: boolean
  loading?: boolean
}

interface AddItemPayload {
  item_slug: string | null
  quantity: number
  custom_name: string | null
  custom_description: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'add': [payload: AddItemPayload]
}>()

const { apiFetch } = useApi()

// Search state
const searchQuery = ref('')
const searchResults = ref<Item[]>([])
const isSearching = ref(false)

// Selection state
const selectedItem = ref<Item | null>(null)
const quantity = ref(1)

// Custom item state
const isCustomMode = ref(false)
const customName = ref('')
const customDescription = ref('')

// Debounced search
let searchTimeout: NodeJS.Timeout | null = null

async function searchItems(query: string) {
  if (!query.trim()) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  try {
    const response = await apiFetch<{ data: Item[] }>('/items', {
      params: { q: query, per_page: 10 }
    })
    searchResults.value = response.data || []
  } catch (error) {
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

function handleSearchInput(value: string) {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchItems(value)
  }, 300)
}

// Watch search query for debounced search
watch(searchQuery, handleSearchInput)

// Select an item from search results
function selectItem(item: Item) {
  selectedItem.value = item
  searchQuery.value = ''
  searchResults.value = []
}

// Clear selection
function clearSelection() {
  selectedItem.value = null
}

// Toggle custom item mode
function toggleCustomMode() {
  isCustomMode.value = !isCustomMode.value
  if (isCustomMode.value) {
    // Clear compendium selection when entering custom mode
    selectedItem.value = null
    searchQuery.value = ''
    searchResults.value = []
  } else {
    // Clear custom fields when exiting custom mode
    customName.value = ''
    customDescription.value = ''
  }
}

// Validation
const canAdd = computed(() => {
  if (props.loading) return false
  if (quantity.value < 1) return false

  if (isCustomMode.value) {
    return customName.value.trim().length > 0
  }

  return selectedItem.value !== null
})

// Handle add button
function handleAdd() {
  if (!canAdd.value) return

  const payload: AddItemPayload = {
    item_slug: isCustomMode.value ? null : selectedItem.value?.slug || null,
    quantity: quantity.value,
    custom_name: isCustomMode.value ? customName.value.trim() : null,
    custom_description: isCustomMode.value && customDescription.value.trim()
      ? customDescription.value.trim()
      : null
  }

  emit('add', payload)
}

// Handle cancel
function handleCancel() {
  emit('update:open', false)
}

// Reset state when modal opens/closes
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    // Reset all state
    searchQuery.value = ''
    searchResults.value = []
    selectedItem.value = null
    quantity.value = 1
    isCustomMode.value = false
    customName.value = ''
    customDescription.value = ''
    isSearching.value = false
  }
})

// Get item type icon
function getItemIcon(item: Item): string {
  const typeCode = item.item_type?.code
  switch (typeCode) {
    case 'W': return 'i-heroicons-bolt'
    case 'A': return 'i-heroicons-shield-check'
    case 'P': return 'i-heroicons-beaker'
    default: return 'i-heroicons-cube'
  }
}
</script>

<template>
  <UModal
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Add Loot
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Mode Toggle -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-300">
            {{ isCustomMode ? 'Custom Item' : 'Search Compendium' }}
          </span>
          <UButton
            data-testid="custom-item-toggle"
            variant="ghost"
            size="xs"
            @click="toggleCustomMode"
          >
            {{ isCustomMode ? 'Search Items' : 'Create Custom' }}
          </UButton>
        </div>

        <!-- Compendium Search Mode -->
        <template v-if="!isCustomMode">
          <!-- Selected Item Display -->
          <div
            v-if="selectedItem"
            data-testid="selected-item"
            class="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
          >
            <div class="flex items-center gap-3">
              <UIcon
                :name="getItemIcon(selectedItem)"
                class="w-5 h-5 text-primary-600 dark:text-primary-400"
              />
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ selectedItem.name }}
                </p>
                <p
                  v-if="selectedItem.item_type"
                  class="text-xs text-gray-500 dark:text-gray-400"
                >
                  {{ selectedItem.item_type.name }}
                </p>
              </div>
            </div>
            <UButton
              variant="ghost"
              size="xs"
              icon="i-heroicons-x-mark"
              @click="clearSelection"
            />
          </div>

          <!-- Search Input (hidden when item is selected) -->
          <div v-else>
            <UInput
              v-model="searchQuery"
              data-testid="loot-search"
              placeholder="Search items..."
              icon="i-heroicons-magnifying-glass"
              :loading="isSearching"
            />

            <!-- Search Results -->
            <div
              v-if="searchResults.length > 0"
              class="mt-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700"
            >
              <button
                v-for="item in searchResults"
                :key="item.id"
                :data-testid="`item-result-${item.id}`"
                class="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                @click="selectItem(item)"
              >
                <UIcon
                  :name="getItemIcon(item)"
                  class="w-5 h-5 text-gray-400 flex-shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 dark:text-white truncate">
                    {{ item.name }}
                  </p>
                  <p
                    v-if="item.item_type"
                    class="text-xs text-gray-500 dark:text-gray-400"
                  >
                    {{ item.item_type.name }}
                  </p>
                </div>
              </button>
            </div>

            <!-- Empty Search State -->
            <p
              v-else-if="searchQuery.trim() && !isSearching"
              class="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center py-4"
            >
              No items found
            </p>
          </div>
        </template>

        <!-- Custom Item Mode -->
        <template v-else>
          <UInput
            v-model="customName"
            data-testid="custom-name-input"
            placeholder="Item name"
            icon="i-heroicons-tag"
          />
          <UTextarea
            v-model="customDescription"
            data-testid="custom-description-input"
            placeholder="Description (optional)"
            :rows="3"
          />
        </template>

        <!-- Quantity Input (always visible) -->
        <div class="flex items-center gap-3">
          <label class="text-sm text-gray-600 dark:text-gray-300">
            Quantity
          </label>
          <UInput
            v-model.number="quantity"
            data-testid="quantity-input"
            type="number"
            :min="1"
            class="w-24"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          data-testid="cancel-btn"
          color="neutral"
          variant="ghost"
          :disabled="loading"
          @click="handleCancel"
        >
          Cancel
        </UButton>
        <UButton
          data-testid="add-btn"
          color="primary"
          :disabled="!canAdd"
          :loading="loading"
          @click="handleAdd"
        >
          Add Item
        </UButton>
      </div>
    </template>
  </UModal>
</template>
