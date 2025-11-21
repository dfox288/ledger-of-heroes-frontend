<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// API configuration
const { apiFetch } = useApi()
const route = useRoute()

// Reactive filters - initialize from URL query params
const searchQuery = ref((route.query.q as string) || '')
const selectedLevel = ref(route.query.level ? Number(route.query.level) : null)
const selectedSchool = ref(route.query.school ? Number(route.query.school) : null)
const currentPage = ref(route.query.page ? Number(route.query.page) : 1)
const perPage = 24

// Fetch spell schools for filter options (via Nitro proxy)
const { data: spellSchools } = await useAsyncData('spell-schools', async () => {
  const response = await apiFetch('/spell-schools')
  return response.data
})

// Computed query params for API
const queryParams = computed(() => {
  const params: Record<string, any> = {
    per_page: perPage,
    page: currentPage.value,
  }

  if (searchQuery.value.trim()) {
    params.q = searchQuery.value.trim()
  }

  if (selectedLevel.value !== null) {
    params.level = selectedLevel.value
  }

  if (selectedSchool.value !== null) {
    params.school = selectedSchool.value
  }

  return params
})

// Fetch spells with reactive filters (via Nitro proxy)
const { data: spellsResponse, pending: loading, error, refresh } = await useAsyncData(
  'spells-list',
  async () => {
    const response = await apiFetch('/spells', {
      query: queryParams.value
    })
    return response
  },
  {
    watch: [currentPage, searchQuery, selectedLevel, selectedSchool]
  }
)

// Computed values
const spells = computed(() => spellsResponse.value?.data || [])
const meta = computed(() => spellsResponse.value?.meta || null)
const totalResults = computed(() => meta.value?.total || 0)
const lastPage = computed(() => meta.value?.last_page || 1)

// Check if filters are active
const hasActiveFilters = computed(() =>
  searchQuery.value || selectedLevel.value !== null || selectedSchool.value !== null
)

// Get school name by ID for filter chips
const getSchoolName = (schoolId: number) => {
  return spellSchools.value?.find((s: any) => s.id === schoolId)?.name || 'Unknown'
}

// Spell level options (0 = Cantrip, 1-9 = Spell levels)
// Note: Using "label" key for NuxtUI v4 USelectMenu
const levelOptions = [
  { label: 'All Levels', value: null },
  { label: 'Cantrip', value: 0 },
  { label: '1st Level', value: 1 },
  { label: '2nd Level', value: 2 },
  { label: '3rd Level', value: 3 },
  { label: '4th Level', value: 4 },
  { label: '5th Level', value: 5 },
  { label: '6th Level', value: 6 },
  { label: '7th Level', value: 7 },
  { label: '8th Level', value: 8 },
  { label: '9th Level', value: 9 },
]

// School filter options
// Note: Using "label" key for NuxtUI v4 USelectMenu
const schoolOptions = computed(() => {
  const options = [{ label: 'All Schools', value: null }]
  if (spellSchools.value) {
    options.push(...spellSchools.value.map((school: any) => ({
      label: school.name,
      value: school.id
    })))
  }
  return options
})

// Clear all filters
const clearFilters = () => {
  searchQuery.value = ''
  selectedLevel.value = null
  selectedSchool.value = null
  currentPage.value = 1
}

// Reset to page 1 when filters change
watch([searchQuery, selectedLevel, selectedSchool], () => {
  currentPage.value = 1
})

// Sync URL query params with filter state (optional but improves UX)
watch([currentPage, searchQuery, selectedLevel, selectedSchool], () => {
  const query: Record<string, any> = {}

  if (currentPage.value > 1) query.page = currentPage.value.toString()
  if (searchQuery.value) query.q = searchQuery.value
  if (selectedLevel.value !== null) query.level = selectedLevel.value.toString()
  if (selectedSchool.value !== null) query.school = selectedSchool.value.toString()

  navigateTo({ query }, { replace: true })
})

// SEO meta tags
useSeoMeta({
  title: 'Spells - D&D 5e Compendium',
  description: 'Browse all D&D 5e spells. Filter by level, school, and search for specific spells.',
})

useHead({
  title: 'Spells - D&D 5e Compendium',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <UiListPageHeader
      title="Spells"
      :total="totalResults"
      description="Browse and search D&D 5e spells"
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
        placeholder="Search spells..."
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
        <!-- Level filter -->
        <USelectMenu
          v-model="selectedLevel"
          :items="levelOptions"
          value-key="value"
          placeholder="All Levels"
          size="md"
          class="w-48"
        />

        <!-- School filter -->
        <USelectMenu
          v-model="selectedSchool"
          :items="schoolOptions"
          value-key="value"
          placeholder="All Schools"
          size="md"
          class="w-48"
        />

        <!-- Clear filters button -->
        <UButton
          v-if="searchQuery || selectedLevel !== null || selectedSchool !== null"
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
          v-if="selectedLevel !== null"
          size="xs"
          color="purple"
          variant="soft"
          @click="selectedLevel = null"
        >
          Level {{ selectedLevel === 0 ? 'Cantrip' : selectedLevel }} ✕
        </UButton>
        <UButton
          v-if="selectedSchool !== null"
          size="xs"
          color="blue"
          variant="soft"
          @click="selectedSchool = null"
        >
          {{ getSchoolName(selectedSchool) }} ✕
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
    <UiListErrorState v-else-if="error" :error="error" entity-name="Spells" @retry="refresh" />

    <!-- Empty State -->
    <UiListEmptyState v-else-if="spells.length === 0" entity-name="spells" :has-filters="hasActiveFilters" @clear-filters="clearFilters" />

    <!-- Results -->
    <div v-else>
      <!-- Results count -->
      <UiListResultsCount
        :from="meta?.from || 0"
        :to="meta?.to || 0"
        :total="totalResults"
        entity-name="spell"
      />

      <!-- Spells Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <SpellCard
          v-for="spell in spells"
          :key="spell.id"
          :spell="spell"
        />
      </div>

      <!-- Pagination -->
      <UiListPagination v-model="currentPage" :total="totalResults" :items-per-page="perPage" />
    </div>

    <!-- Back to Home -->
    <UiBackLink />
  </div>
</template>
