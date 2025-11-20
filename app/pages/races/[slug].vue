<script setup lang="ts">
const { apiBase } = useApi()
const route = useRoute()
const slug = route.params.slug as string

// Fetch race data using useAsyncData for SSR support
const { data: race, error, pending } = await useAsyncData(
  `race-${slug}`,
  async () => {
    
    const response = await $fetch(`${apiBase}/races/${slug}`)
    return response.data
  }
)

// Set page meta
useSeoMeta({
  title: computed(() => race.value ? `${race.value.name} - D&D 5e Race` : 'Race - D&D 5e Compendium'),
  description: computed(() => race.value?.description?.substring(0, 160) || `Learn about the ${race.value?.name} race in D&D 5e`),
})

// JSON debug toggle
const showJson = ref(false)
const jsonPanelRef = ref<HTMLElement | null>(null)

const toggleJson = () => {
  showJson.value = !showJson.value
  if (showJson.value) {
    nextTick(() => {
      jsonPanelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
}


const copyJson = () => {
  if (race.value) {
    navigator.clipboard.writeText(JSON.stringify(race.value, null, 2))
  }
}

</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center items-center py-12">
      <div class="flex flex-col items-center gap-4">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500" />
        <p class="text-gray-600 dark:text-gray-400">Loading race...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-12">
      <UCard>
        <div class="text-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Race Not Found
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            The race you're looking for doesn't exist or has been removed.
          </p>
          <UButton to="/search" color="primary">
            Back to Search
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Race Content -->
    <div v-else-if="race" class="space-y-8">
      <!-- Breadcrumb Navigation -->
      <div>
        <NuxtLink to="/races">
          <UButton color="gray" variant="ghost" icon="i-heroicons-arrow-left" size="sm">
            Back to Races
          </UButton>
        </NuxtLink>
      </div>

      <!-- Header -->
      <div>
        <div class="flex items-center justify-between mb-3 flex-wrap gap-4">
          <div class="flex items-center gap-2">
            <UBadge color="blue" variant="subtle" size="lg">
              Race
            </UBadge>
            <UBadge v-if="race.parent_race_id" color="purple" variant="soft" size="sm">
              Subrace
            </UBadge>
          </div>

          <!-- JSON Debug Button -->
          <UButton
            color="gray"
            variant="soft"
            size="sm"
            @click="toggleJson"
          >
            <UIcon :name="showJson ? 'i-heroicons-eye-slash' : 'i-heroicons-code-bracket'" class="w-4 h-4" />
            {{ showJson ? 'Hide JSON' : 'View JSON' }}
          </UButton>
        </div>
        <h1 class="text-5xl font-bold text-gray-900 dark:text-gray-100">
          {{ race.name }}
        </h1>
      </div>

      <!-- Quick Stats -->
      <UCard>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="race.size">
            <div class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
              Size
            </div>
            <div class="text-gray-900 dark:text-gray-100">
              {{ race.size.name }}
            </div>
          </div>

          <div v-if="race.speed">
            <div class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
              Speed
            </div>
            <div class="text-gray-900 dark:text-gray-100">
              {{ race.speed }} ft.
            </div>
          </div>
        </div>
      </UCard>

      <!-- Description -->
      <UCard v-if="race.description">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Description
          </h2>
        </template>
        <div class="prose dark:prose-invert max-w-none">
          <p class="whitespace-pre-line text-gray-700 dark:text-gray-300">{{ race.description }}</p>
        </div>
      </UCard>

      <!-- Ability Score Increases -->
      <UCard v-if="race.ability_score_increases && race.ability_score_increases.length > 0">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Ability Score Increases
          </h2>
        </template>
        <div class="flex flex-wrap gap-3">
          <div
            v-for="increase in race.ability_score_increases"
            :key="increase.id"
            class="px-4 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20"
          >
            <span class="font-semibold text-gray-900 dark:text-gray-100">
              {{ increase.ability_score.code }}
            </span>
            <span class="text-primary-600 dark:text-primary-400 ml-1">
              +{{ increase.value }}
            </span>
          </div>
        </div>
      </UCard>

      <!-- Traits -->
      <UCard v-if="race.traits && race.traits.length > 0">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Racial Traits
          </h2>
        </template>
        <div class="space-y-4">
          <div
            v-for="trait in race.traits"
            :key="trait.id"
            class="border-l-4 border-primary-500 pl-4 py-2"
          >
            <div class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {{ trait.name }}
            </div>
            <div class="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {{ trait.description }}
            </div>
          </div>
        </div>
      </UCard>

      <!-- Languages -->
      <UCard v-if="race.languages && race.languages.length > 0">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Languages
          </h2>
        </template>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="language in race.languages"
            :key="language.id"
            color="gray"
            variant="soft"
          >
            {{ language.name }}
          </UBadge>
        </div>
      </UCard>

      <!-- Proficiencies -->
      <UCard v-if="race.proficiencies && race.proficiencies.length > 0">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Proficiencies
          </h2>
        </template>
        <div class="space-y-2">
          <div
            v-for="prof in race.proficiencies"
            :key="prof.id"
            class="text-gray-700 dark:text-gray-300"
          >
            • {{ prof.proficiency_name }}
          </div>
        </div>
      </UCard>

      <!-- Sources -->
      <UCard v-if="race.sources && race.sources.length > 0">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Source
          </h2>
        </template>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="source in race.sources"
            :key="source.code"
            class="flex items-center gap-2"
          >
            <UBadge color="gray" variant="soft">
              {{ source.name }}
            </UBadge>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              p. {{ source.pages }}
            </span>
          </div>
        </div>
      </UCard>

      <!-- JSON Debug Panel -->
      <div
        v-if="showJson"
        ref="jsonPanelRef"
        class="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
      >
        <div class="bg-gray-900 text-gray-100 p-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold">Raw JSON Data</h3>
          <div class="flex gap-2">
            <UButton
              color="gray"
              variant="soft"
              size="xs"
              icon="i-heroicons-clipboard"
              @click="copyJson"
            >
              Copy
            </UButton>
            <UButton
              color="gray"
              variant="soft"
              size="xs"
              icon="i-heroicons-x-mark"
              @click="showJson = false"
            >
              Close
            </UButton>
          </div>
        </div>
        <pre class="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm"><code>{{ JSON.stringify(race, null, 2) }}</code></pre>
      </div>

      <!-- Back Button -->
      <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
        <NuxtLink to="/races">
          <UButton color="gray" variant="soft" icon="i-heroicons-arrow-left">
            Back to Races
          </UButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
