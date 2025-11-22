<script setup lang="ts">
import { computed } from 'vue'
import type { SpellSchool } from '~/types'

// Use entity list composable with noPagination
const {
  searchQuery,
  data,
  totalResults,
  loading,
  error,
  refresh,
  clearFilters,
  hasActiveFilters
} = useEntityList({
  endpoint: '/spell-schools',
  cacheKey: 'spell-schools-list',
  queryBuilder: computed(() => ({})), // No custom filters
  noPagination: true, // Small dataset, no pagination needed
  seo: {
    title: 'Spell Schools - D&D 5e Compendium',
    description: 'Browse all D&D 5e schools of magic: Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy, and Transmutation.'
  }
})

const spellSchools = computed(() => data.value as SpellSchool[])
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <UiListPageHeader
      title="Spell Schools"
      :total="totalResults"
      description="Browse D&D 5e schools of magic"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
    />

    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        placeholder="Search spell schools..."
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
    </div>

    <UiListSkeletonCards v-if="loading" />

    <UiListErrorState
      v-else-if="error"
      :error="error"
      entity-name="Spell Schools"
      @retry="refresh"
    />

    <UiListEmptyState
      v-else-if="spellSchools.length === 0"
      entity-name="spell schools"
      :has-filters="hasActiveFilters"
      @clear-filters="clearFilters"
    />

    <div v-else>
      <UiListResultsCount
        :from="1"
        :to="totalResults"
        :total="totalResults"
        entity-name="spell school"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <SpellSchoolCard
          v-for="spellSchool in spellSchools"
          :key="spellSchool.id"
          :spell-school="spellSchool"
        />
      </div>
    </div>

    <UiBackLink />
    <JsonDebugPanel
      :data="{ spellSchools, total: totalResults }"
      title="Spell Schools Data"
    />
  </div>
</template>
