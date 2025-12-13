<!-- app/components/character/inventory/AddLootModal.vue -->
<script setup lang="ts">
/**
 * Add Loot Modal
 *
 * Modal for adding items to inventory as loot (no cost).
 * Supports both compendium items (searched from /items) and custom items.
 *
 * Features:
 * - Tabbed interface: Search compendium vs Custom item
 * - Search compendium items with debounced input
 * - Select item from search results
 * - Set quantity
 * - Custom items with name + description
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

// Tab state
const activeTab = ref('search')
const tabItems = [
  { label: 'Search', value: 'search', icon: 'i-heroicons-magnifying-glass' },
  { label: 'Custom', value: 'custom', icon: 'i-heroicons-pencil-square' }
]

// Search state
const searchQuery = ref('')
const searchResults = ref<Item[]>([])
const isSearching = ref(false)

// Selection state
const selectedItem = ref<Item | null>(null)
const quantity = ref(1)

// Custom item state
const customName = ref('')
const customDescription = ref('')

// Computed for custom mode check
const isCustomMode = computed(() => activeTab.value === 'custom')

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

// Clear state when switching tabs
watch(activeTab, (newTab) => {
  if (newTab === 'custom') {
    // Clear compendium selection when entering custom mode
    selectedItem.value = null
    searchQuery.value = ''
    searchResults.value = []
  } else {
    // Clear custom fields when entering search mode
    customName.value = ''
    customDescription.value = ''
  }
})

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
    activeTab.value = 'search'
    searchQuery.value = ''
    searchResults.value = []
    selectedItem.value = null
    quantity.value = 1
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
        <!-- Tabs -->
        <UTabs
          v-model="activeTab"
          :items="tabItems"
          :content="false"
          :ui="{ list: 'w-full grid grid-cols-2' }"
        />

        <!-- Tab Content Container - consistent min height -->
        <div class="min-h-[180px]">
          <!-- Search Tab Content -->
          <div v-if="activeTab === 'search'" class="space-y-3">
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
            <template v-else>
              <UInput
                v-model="searchQuery"
                data-testid="loot-search"
                placeholder="Search for items in the compendium..."
                icon="i-heroicons-magnifying-glass"
                :loading="isSearching"
                size="lg"
                :ui="{ root: 'w-full' }"
              />

              <!-- Search Results -->
              <div
                v-if="searchResults.length > 0"
                class="max-h-[140px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700"
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

              <!-- Empty/Prompt State -->
              <p
                v-else-if="!searchQuery.trim()"
                class="text-sm text-gray-400 dark:text-gray-500 text-center py-6"
              >
                Start typing to search for items
              </p>

              <!-- No Results State -->
              <p
                v-else-if="!isSearching"
                class="text-sm text-gray-500 dark:text-gray-400 text-center py-6"
              >
                No items found for "{{ searchQuery }}"
              </p>
            </template>
          </div>

          <!-- Custom Tab Content -->
          <div v-else-if="activeTab === 'custom'" class="space-y-4">
            <UFormField label="Item Name" required class="w-full">
              <UInput
                v-model="customName"
                data-testid="custom-name-input"
                placeholder="e.g., Mysterious Amulet"
                icon="i-heroicons-tag"
                size="lg"
                :ui="{ root: 'w-full' }"
              />
            </UFormField>
            <UFormField label="Description" class="w-full">
              <UTextarea
                v-model="customDescription"
                data-testid="custom-description-input"
                placeholder="Describe the item (optional)"
                :rows="3"
                :ui="{ root: 'w-full' }"
              />
            </UFormField>
          </div>
        </div>

        <!-- Quantity Input (always visible) - with separator -->
        <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Quantity
            </label>
            <UInput
              v-model.number="quantity"
              data-testid="quantity-input"
              type="number"
              :min="1"
              class="w-24"
              size="md"
            />
          </div>
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
