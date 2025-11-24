<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CharacterClass } from '~/types/api/entities'

const route = useRoute()

// Custom filter state (entity-specific)
const isBaseClass = ref<string | null>((route.query.is_base_class as string) || null)
const isSpellcaster = ref<string | null>((route.query.is_spellcaster as string) || null)

// Query builder for custom filters
const queryBuilder = computed(() => {
  const params: Record<string, unknown> = {}
  if (isBaseClass.value !== null) params.is_base_class = isBaseClass.value
  if (isSpellcaster.value !== null) params.is_spellcaster = isSpellcaster.value
  return params
})

// Use entity list composable for all shared logic
const {
  searchQuery,
  currentPage,
  data,
  meta,
  totalResults,
  loading,
  error,
  refresh,
  clearFilters: clearBaseFilters,
  hasActiveFilters
} = useEntityList({
  endpoint: '/classes',
  cacheKey: 'classes-list',
  queryBuilder,
  seo: {
    title: 'Classes - D&D 5e Compendium',
    description: 'Browse all D&D 5e player classes and subclasses.'
  }
})

// Type the data array
const classes = computed(() => data.value as CharacterClass[])

// Clear all filters (base + custom)
const clearFilters = () => {
  clearBaseFilters()
  isBaseClass.value = null
  isSpellcaster.value = null
}

// Pagination settings
const perPage = 24
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <UiListPageHeader
      title="Classes"
      :total="totalResults"
      description="Browse D&D 5e classes and subclasses"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
    />

    <!-- Search and Filters -->
    <div class="mb-6 space-y-4">
      <!-- Search input -->
      <UInput
        v-model="searchQuery"
        placeholder="Search classes..."
      >
        <template
          v-if="searchQuery"
          #trailing
        >
          <UButton
            color="neutral"
            variant="link"
            :padded="false"
            @click="searchQuery = ''"
          />
        </template>
      </UInput>

      <!-- Quick Toggles -->
      <div class="flex flex-wrap gap-4">
        <!-- Base Class filter -->
        <UiFilterToggle
          v-model="isBaseClass"
          label="Base Class Only"
          color="error"
          :options="[
            { value: null, label: 'All' },
            { value: '1', label: 'Yes' },
            { value: '0', label: 'No' }
          ]"
        />

        <!-- Spellcaster filter -->
        <UiFilterToggle
          v-model="isSpellcaster"
          label="Spellcaster"
          color="error"
          :options="[
            { value: null, label: 'All' },
            { value: '1', label: 'Yes' },
            { value: '0', label: 'No' }
          ]"
        />
      </div>

      <!-- Clear filters button -->
      <div class="flex flex-wrap gap-2">
        <UButton
          v-if="searchQuery || isBaseClass !== null || isSpellcaster !== null"
          color="neutral"
          variant="soft"
          @click="clearFilters"
        >
          Clear Filters
        </UButton>
      </div>

      <!-- Active Filter Chips -->
      <div
        v-if="hasActiveFilters"
        class="flex flex-wrap items-center gap-2 pt-2"
      >
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Active:</span>
        <UButton
          v-if="isBaseClass !== null"
          size="xs"
          color="error"
          variant="soft"
          @click="isBaseClass = null"
        >
          Base Class Only: {{ isBaseClass === '1' ? 'Yes' : 'No' }} ✕
        </UButton>
        <UButton
          v-if="isSpellcaster !== null"
          size="xs"
          color="error"
          variant="soft"
          @click="isSpellcaster = null"
        >
          Spellcaster: {{ isSpellcaster === '1' ? 'Yes' : 'No' }} ✕
        </UButton>
        <UButton
          v-if="searchQuery"
          size="xs"
          color="neutral"
          variant="soft"
          @click="searchQuery = ''"
        >
          "{{ searchQuery }}" ✕
        </UButton>
      </div>
    </div>

    <!-- Loading State -->
    <UiListSkeletonCards v-if="loading" />

    <!-- Error State -->
    <UiListErrorState
      v-else-if="error"
      :error="error"
      entity-name="Classes"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="classes.length === 0"
      entity-name="classes"
      :has-filters="hasActiveFilters"
      @clear-filters="clearFilters"
    />

    <!-- Results -->
    <div v-else>
      <!-- Results count -->
      <UiListResultsCount
        :from="meta?.from || 0"
        :to="meta?.to || 0"
        :total="totalResults"
        entity-name="class"
      />

      <!-- Classes Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <ClassCard
          v-for="charClass in classes"
          :key="charClass.id"
          :character-class="charClass"
        />
      </div>

      <!-- Pagination -->
      <UiListPagination
        v-model="currentPage"
        :total="totalResults"
        :items-per-page="perPage"
      />
    </div>

    <!-- Back to Home -->
    <UiBackLink />
  </div>
</template>
