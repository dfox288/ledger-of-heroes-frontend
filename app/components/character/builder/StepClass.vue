<!-- app/components/character/builder/StepClass.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { CharacterClass } from '~/types'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

const store = useCharacterBuilderStore()
const { selectedClass, isLoading, error } = storeToRefs(store)

// Get API client
const { apiFetch } = useApi()

// Fetch base classes only
const { data: classes, pending: loadingClasses } = await useAsyncData(
  'builder-classes',
  () => apiFetch<{ data: CharacterClass[] }>('/classes?filter=is_base_class=true&per_page=50'),
  { transform: (response: { data: CharacterClass[] }) => response.data }
)

// Local state
const searchQuery = ref('')
const localSelectedClass = ref<CharacterClass | null>(null)
const detailModalOpen = ref(false)
const detailClass = ref<CharacterClass | null>(null)

// Apply search filter
const filteredClasses = computed(() => {
  if (!classes.value) return []
  if (!searchQuery.value) return classes.value
  const query = searchQuery.value.toLowerCase()
  return classes.value.filter(cls =>
    cls.name.toLowerCase().includes(query)
  )
})

// Validation: can proceed if class selected
const canProceed = computed(() => {
  return localSelectedClass.value !== null
})

/**
 * Handle class card selection
 */
function handleClassSelect(cls: CharacterClass) {
  localSelectedClass.value = cls
}

/**
 * Open detail modal
 */
function handleViewDetails(cls: CharacterClass) {
  detailClass.value = cls
  detailModalOpen.value = true
}

/**
 * Close detail modal
 */
function handleCloseModal() {
  detailModalOpen.value = false
  detailClass.value = null
}

/**
 * Confirm selection and call store action
 */
async function confirmSelection() {
  if (!localSelectedClass.value) return

  try {
    await store.selectClass(localSelectedClass.value)
    store.nextStep()
  } catch (err) {
    // Error is already set in store
    console.error('Failed to save class:', err)
  }
}

// Initialize from store if already selected
onMounted(() => {
  if (selectedClass.value) {
    localSelectedClass.value = selectedClass.value
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Choose Your Class
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Your class determines your character's abilities, skills, and combat style
      </p>
    </div>

    <!-- Search -->
    <div class="max-w-md mx-auto">
      <UInput
        v-model="searchQuery"
        placeholder="Search classes..."
        icon="i-heroicons-magnifying-glass"
        size="lg"
      />
    </div>

    <!-- Error State -->
    <UAlert
      v-if="error"
      color="error"
      icon="i-heroicons-exclamation-circle"
      :title="error"
    />

    <!-- Loading State -->
    <div
      v-if="loadingClasses"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-class-500"
      />
    </div>

    <!-- Class Grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <CharacterBuilderClassPickerCard
        v-for="cls in filteredClasses"
        :key="cls.id"
        :character-class="cls"
        :selected="localSelectedClass?.id === cls.id"
        @select="handleClassSelect"
        @view-details="handleViewDetails(cls)"
      />
    </div>

    <!-- Empty State -->
    <div
      v-if="!loadingClasses && filteredClasses.length === 0"
      class="text-center py-12"
    >
      <UIcon
        name="i-heroicons-magnifying-glass"
        class="w-12 h-12 text-gray-400 mx-auto mb-4"
      />
      <p class="text-gray-600 dark:text-gray-400">
        No classes found matching "{{ searchQuery }}"
      </p>
    </div>

    <!-- Spellcaster Info -->
    <div
      v-if="localSelectedClass?.spellcasting_ability"
      class="bg-spell-50 dark:bg-spell-900/20 rounded-lg p-4"
    >
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-sparkles"
          class="w-5 h-5 text-spell-500"
        />
        <span class="text-gray-700 dark:text-gray-300">
          <strong>{{ localSelectedClass.name }}</strong> is a spellcasting class.
          You'll select spells in a later step.
        </span>
      </div>
    </div>

    <!-- Confirm Button -->
    <div class="flex justify-center pt-4">
      <UButton
        size="lg"
        :disabled="!canProceed || isLoading"
        :loading="isLoading"
        @click="confirmSelection"
      >
        {{ isLoading ? 'Saving...' : 'Continue with ' + (localSelectedClass?.name || 'Selection') }}
      </UButton>
    </div>

    <!-- Detail Modal -->
    <CharacterBuilderClassDetailModal
      :character-class="detailClass"
      :open="detailModalOpen"
      @close="handleCloseModal"
    />
  </div>
</template>
