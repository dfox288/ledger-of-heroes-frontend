<script setup lang="ts">
import { computed } from 'vue'

// Use entity list composable for all shared logic
const {
  searchQuery,
  currentPage,
  data: classes,
  meta,
  totalResults,
  loading,
  error,
  refresh,
  clearFilters,
  hasActiveFilters
} = useEntityList({
  endpoint: '/classes',
  cacheKey: 'classes-list',
  queryBuilder: computed(() => ({})), // No custom filters for classes
  seo: {
    title: 'Classes - D&D 5e Compendium',
    description: 'Browse all D&D 5e player classes and subclasses.'
  }
})

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
    />

    <!-- Search -->
    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        size="lg"
        placeholder="Search classes..."
        :ui="{ icon: { trailing: { pointer: '' } } }"
      >
        <template
          v-if="searchQuery"
          #trailing
        >
          <UButton
            color="neutral"
            variant="link"
            icon="i-heroicons-x-mark-20-solid"
            :padded="false"
            @click="searchQuery = ''"
          />
        </template>
      </UInput>
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
        v-if="totalResults > perPage"
        v-model="currentPage"
        :total="totalResults"
        :items-per-page="perPage"
      />
    </div>

    <!-- Back to Home -->
    <UiBackLink />
  </div>
</template>
