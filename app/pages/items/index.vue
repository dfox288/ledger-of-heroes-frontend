<script setup lang="ts">
import { ref, computed } from 'vue'

const route = useRoute()
const { apiFetch } = useApi()

// Custom filter state (entity-specific)
const selectedType = ref(route.query.type ? Number(route.query.type) : null)
const selectedRarity = ref((route.query.rarity as string) || null)
const selectedMagic = ref((route.query.is_magic as string) || null)

// Fetch item types for filter options
const { data: itemTypes } = await useAsyncData('item-types', async () => {
  const response = await apiFetch('/item-types')
  return response.data
})

// Rarity options from D&D rules
const rarityOptions = [
  { label: 'All Rarities', value: null },
  { label: 'Common', value: 'common' },
  { label: 'Uncommon', value: 'uncommon' },
  { label: 'Rare', value: 'rare' },
  { label: 'Very Rare', value: 'very rare' },
  { label: 'Legendary', value: 'legendary' },
  { label: 'Artifact', value: 'artifact' },
]

// Magic filter options
const magicOptions = [
  { label: 'All Items', value: null },
  { label: 'Magic Items', value: 'true' },
  { label: 'Non-Magic Items', value: 'false' },
]

// Item type filter options
const typeOptions = computed(() => {
  const options = [{ label: 'All Types', value: null }]
  if (itemTypes.value) {
    options.push(...itemTypes.value.map((type: any) => ({
      label: type.name,
      value: type.id
    })))
  }
  return options
})

// Query builder for custom filters
const queryBuilder = computed(() => {
  const params: Record<string, any> = {}
  if (selectedType.value !== null) params.type = selectedType.value
  if (selectedRarity.value !== null) params.rarity = selectedRarity.value
  if (selectedMagic.value !== null) params.is_magic = selectedMagic.value
  return params
})

// Use entity list composable for all shared logic
const {
  searchQuery,
  currentPage,
  data: items,
  meta,
  totalResults,
  loading,
  error,
  refresh,
  clearFilters: clearBaseFilters,
  hasActiveFilters
} = useEntityList({
  endpoint: '/items',
  cacheKey: 'items-list',
  queryBuilder,
  seo: {
    title: 'Items & Equipment - D&D 5e Compendium',
    description: 'Browse all D&D 5e items and equipment. Filter by type, rarity, and magic properties.'
  }
})

// Clear all filters (base + custom)
const clearFilters = () => {
  clearBaseFilters()
  selectedType.value = null
  selectedRarity.value = null
  selectedMagic.value = null
}

// Get type name by ID for filter chips
const getTypeName = (typeId: number) => {
  return itemTypes.value?.find((t: any) => t.id === typeId)?.name || 'Unknown'
}

// Pagination settings
const perPage = 24
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <UiListPageHeader
      title="Items & Equipment"
      :total="totalResults"
      description="Browse D&D 5e items and equipment"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
    />

    <!-- Filters -->
    <div class="mb-6 space-y-4">
      <!-- Search input -->
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        size="lg"
        placeholder="Search items..."
        :ui="{ icon: { trailing: { pointer: '' } } }"
      >
        <template v-if="searchQuery" #trailing>
          <UButton
            color="gray"
            variant="link"
            icon="i-heroicons-x-mark-20-solid"
            :padded="false"
            @click="searchQuery = ''"
          />
        </template>
      </UInput>

      <!-- Filter chips -->
      <div class="flex flex-wrap gap-2">
        <!-- Type filter -->
        <USelectMenu
          v-model="selectedType"
          :items="typeOptions"
          value-key="value"
          placeholder="Select type"
          class="w-48"
        >
          <template #label>
            <span v-if="selectedType === null">All Types</span>
            <span v-else>{{ itemTypes?.find((t: any) => t.id === selectedType)?.name }}</span>
          </template>
        </USelectMenu>

        <!-- Rarity filter -->
        <USelectMenu
          v-model="selectedRarity"
          :items="rarityOptions"
          value-key="value"
          placeholder="Select rarity"
          class="w-44"
        >
          <template #label>
            <span v-if="selectedRarity === null">All Rarities</span>
            <span v-else class="capitalize">{{ selectedRarity }}</span>
          </template>
        </USelectMenu>

        <!-- Magic filter -->
        <USelectMenu
          v-model="selectedMagic"
          :items="magicOptions"
          value-key="value"
          placeholder="Filter by magic"
          class="w-44"
        >
          <template #label>
            <span v-if="selectedMagic === null">All Items</span>
            <span v-else-if="selectedMagic === 'true'">Magic Items</span>
            <span v-else>Non-Magic Items</span>
          </template>
        </USelectMenu>

        <!-- Clear filters button -->
        <UButton
          v-if="searchQuery || selectedType !== null || selectedRarity !== null || selectedMagic !== null"
          color="gray"
          variant="soft"
          @click="clearFilters"
        >
          Clear Filters
        </UButton>
      </div>

      <!-- Active Filter Chips -->
      <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2 pt-2">
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Active:</span>
        <UButton
          v-if="selectedType !== null"
          size="xs"
          color="amber"
          variant="soft"
          @click="selectedType = null"
        >
          {{ getTypeName(selectedType) }} ✕
        </UButton>
        <UButton
          v-if="selectedRarity !== null"
          size="xs"
          color="purple"
          variant="soft"
          @click="selectedRarity = null"
        >
          {{ selectedRarity }} ✕
        </UButton>
        <UButton
          v-if="selectedMagic !== null"
          size="xs"
          color="blue"
          variant="soft"
          @click="selectedMagic = null"
        >
          {{ selectedMagic === 'true' ? 'Magic' : 'Non-Magic' }} ✕
        </UButton>
        <UButton
          v-if="searchQuery"
          size="xs"
          color="gray"
          variant="soft"
          @click="searchQuery = ''"
        >
          "{{ searchQuery }}" ✕
        </UButton>
      </div>
    </div>

    <!-- Loading State (Skeleton Cards) -->
    <UiListSkeletonCards v-if="loading" />

    <!-- Error State -->
    <UiListErrorState v-else-if="error" :error="error" entity-name="Items" @retry="refresh" />

    <!-- Empty State -->
    <UiListEmptyState v-else-if="items.length === 0" entity-name="items" :has-filters="hasActiveFilters" @clear-filters="clearFilters" />

    <!-- Results -->
    <div v-else>
      <!-- Results count -->
      <UiListResultsCount
        :from="meta?.from || 0"
        :to="meta?.to || 0"
        :total="totalResults"
        entity-name="item"
      />

      <!-- Items Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <ItemCard
          v-for="item in items"
          :key="item.id"
          :item="item"
        />
      </div>

      <!-- Pagination -->
      <UiListPagination v-model="currentPage" :total="totalResults" :items-per-page="perPage" />
    </div>

    <!-- Back to Home -->
    <UiBackLink />
  </div>
</template>
