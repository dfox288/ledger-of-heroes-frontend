<!-- app/components/character/wizard/StepSubclass.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Subclass } from '~/stores/characterWizard'
import { useCharacterWizardStore } from '~/stores/characterWizard'

const store = useCharacterWizardStore()
const { selections, isLoading, error, sourceFilterString } = storeToRefs(store)

// API client
const { apiFetch } = useApi()

// Fetch subclasses for the selected class, filtered by selected sourcebooks
const { data: subclasses, pending: loadingSubclasses } = await useAsyncData(
  `wizard-subclasses-${selections.value.class?.slug}-${sourceFilterString.value}`,
  async () => {
    if (!selections.value.class?.slug) {
      return []
    }

    const response = await apiFetch<{ data: Subclass[] }>(
      `/classes/${selections.value.class.slug}/subclasses`
    )

    // Filter by selected sources if any are selected
    if (sourceFilterString.value && store.selectedSources.length > 0) {
      return response.data.filter(subclass =>
        subclass.source && store.selectedSources.includes(subclass.source.code)
      )
    }

    return response.data
  },
  {
    watch: [sourceFilterString]
  }
)

// Local state
const localSelectedSubclass = ref<Subclass | null>(null)
const searchQuery = ref('')

// Search functionality
const filteredSubclasses = computed(() => {
  if (!subclasses.value) return []
  if (!searchQuery.value) return subclasses.value

  const query = searchQuery.value.toLowerCase()
  return subclasses.value.filter(subclass =>
    subclass.name.toLowerCase().includes(query) ||
    subclass.description?.toLowerCase().includes(query)
  )
})

// Validation: can proceed if subclass selected
const canProceed = computed(() => localSelectedSubclass.value !== null)

/**
 * Handle subclass card selection
 */
function handleSubclassSelect(subclass: Subclass) {
  localSelectedSubclass.value = subclass
}

/**
 * Confirm selection and call store action
 */
async function confirmSelection() {
  if (!localSelectedSubclass.value) return

  try {
    await store.selectSubclass(localSelectedSubclass.value)
    // Navigation is handled by the wizard layout
  } catch (err) {
    console.error('Failed to save subclass:', err)
  }
}

// Initialize from store if already selected
onMounted(() => {
  if (selections.value.subclass) {
    localSelectedSubclass.value = selections.value.subclass
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Choose Your Subclass
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        <template v-if="selections.class?.name === 'Cleric'">
          Choose your divine domain - the aspect of your deity you embody
        </template>
        <template v-else-if="selections.class?.name === 'Sorcerer'">
          Choose your sorcerous origin - the source of your innate magic
        </template>
        <template v-else-if="selections.class?.name === 'Warlock'">
          Choose your otherworldly patron - the entity that grants you power
        </template>
        <template v-else>
          Choose your {{ selections.class?.name }} subclass
        </template>
      </p>
    </div>

    <!-- Search -->
    <div class="max-w-md mx-auto">
      <UInput
        v-model="searchQuery"
        placeholder="Search subclasses..."
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
      v-if="loadingSubclasses"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-class-500"
      />
    </div>

    <!-- Subclass Grid -->
    <div
      v-else-if="filteredSubclasses.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <CharacterPickerSubclassPickerCard
        v-for="subclass in filteredSubclasses"
        :key="subclass.id"
        :subclass="subclass"
        :selected="localSelectedSubclass?.id === subclass.id"
        @select="handleSubclassSelect"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="text-center py-12"
    >
      <UIcon
        name="i-heroicons-magnifying-glass"
        class="w-12 h-12 text-gray-400 mx-auto mb-4"
      />
      <p class="text-gray-600 dark:text-gray-400">
        <template v-if="searchQuery">
          No subclasses found matching "{{ searchQuery }}"
        </template>
        <template v-else>
          No subclasses available for {{ selections.class?.name }}
        </template>
      </p>
    </div>

    <!-- Confirm Button -->
    <div class="flex justify-center pt-4">
      <UButton
        size="lg"
        :disabled="!canProceed || isLoading"
        :loading="isLoading"
        @click="confirmSelection"
      >
        {{ isLoading ? 'Saving...' : 'Continue with ' + (localSelectedSubclass?.name || 'Selection') }}
      </UButton>
    </div>
  </div>
</template>
