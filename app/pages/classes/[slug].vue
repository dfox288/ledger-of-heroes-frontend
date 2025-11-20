<script setup lang="ts">
const { apiBase } = useApi()
const route = useRoute()
const slug = route.params.slug as string

const { data: entity, error, pending } = await useAsyncData(
  `class-${slug}`,
  async () => {
    
    const response = await $fetch(`${apiBase}/classes/${slug}`)
    return response.data
  }
)

useSeoMeta({
  title: computed(() => entity.value ? `${entity.value.name} - D&D 5e Class` : 'Class - D&D 5e Compendium'),
  description: computed(() => entity.value?.description?.substring(0, 160)),
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
  const data = route.params.slug
  if (data) {
    const entity = 'race' // Will fix per file
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
  }
}

</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div v-if="pending" class="flex justify-center items-center py-12">
      <div class="flex flex-col items-center gap-4">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500" />
        <p class="text-gray-600 dark:text-gray-400">Loading class...</p>
      </div>
    </div>

    <div v-else-if="error" class="py-12">
      <UCard>
        <div class="text-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Class Not Found</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-4">The class you're looking for doesn't exist.</p>
          <UButton to="/search" color="primary">Back to Search</UButton>
        </div>
      </UCard>
    </div>

    <div v-else-if="entity" class="space-y-6">
      <div>
        <UBadge color="red" variant="subtle" class="mb-2">Class</UBadge>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100">{{ entity.name }}</h1>
      </div>

      <UCard>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-if="entity.hit_dice">
            <div class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Hit Dice</div>
            <div class="text-gray-900 dark:text-gray-100">1d{{ entity.hit_dice }}</div>
          </div>
          <div v-if="entity.primary_ability">
            <div class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Primary Ability</div>
            <div class="text-gray-900 dark:text-gray-100">{{ entity.primary_ability }}</div>
          </div>
          <div v-if="entity.saving_throw_proficiencies">
            <div class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Saving Throws</div>
            <div class="text-gray-900 dark:text-gray-100">{{ entity.saving_throw_proficiencies }}</div>
          </div>
        </div>
      </UCard>

      <UCard v-if="entity.description">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Description</h2>
        </template>
        <div class="prose dark:prose-invert max-w-none">
          <p class="whitespace-pre-line text-gray-700 dark:text-gray-300">{{ entity.description }}</p>
        </div>
      </UCard>

      <UCard v-if="entity.sources && entity.sources.length > 0">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Source</h2>
        </template>
        <div class="flex flex-wrap gap-2">
          <div v-for="source in entity.sources" :key="source.code" class="flex items-center gap-2">
            <UBadge color="gray" variant="soft">{{ source.name }}</UBadge>
            <span class="text-sm text-gray-600 dark:text-gray-400">p. {{ source.pages }}</span>
          </div>
        </div>
      </UCard>

      <div class="flex justify-center pt-4">
        <UButton to="/search" variant="soft" color="gray" icon="i-heroicons-arrow-left">Back to Search</UButton>
      </div>
    </div>
  </div>
</template>
