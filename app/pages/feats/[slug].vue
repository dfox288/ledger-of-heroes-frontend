<script setup lang="ts">
const { apiBase } = useApi()
const route = useRoute()
const slug = route.params.slug as string

const { data: entity, error, pending } = await useAsyncData(
  `feat-${slug}`,
  async () => {
    
    const response = await $fetch(`${apiBase}/feats/${slug}`)
    return response.data
  }
)

useSeoMeta({
  title: computed(() => entity.value ? `${entity.value.name} - D&D 5e Feat` : 'Feat - D&D 5e Compendium'),
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
  if (entity.value) {
    navigator.clipboard.writeText(JSON.stringify(entity.value, null, 2))
  }
}

</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div v-if="pending" class="flex justify-center items-center py-12">
      <div class="flex flex-col items-center gap-4">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500" />
        <p class="text-gray-600 dark:text-gray-400">Loading feat...</p>
      </div>
    </div>

    <div v-else-if="error" class="py-12">
      <UCard>
        <div class="text-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Feat Not Found</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-4">The feat you're looking for doesn't exist.</p>
          <UButton to="/search" color="primary">Back to Search</UButton>
        </div>
      </UCard>
    </div>

    <div v-else-if="entity" class="space-y-8">
      <!-- Breadcrumb Navigation -->
      <div>
        <NuxtLink to="/feats">
          <UButton color="gray" variant="ghost" icon="i-heroicons-arrow-left" size="sm">
            Back to Feats
          </UButton>
        </NuxtLink>
      </div>

      <!-- Header -->
      <div>
        <div class="flex items-center justify-between mb-3 flex-wrap gap-4">
          <UBadge color="orange" variant="subtle" size="lg">Feat</UBadge>

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
        <h1 class="text-5xl font-bold text-gray-900 dark:text-gray-100">{{ entity.name }}</h1>
      </div>

      <UCard v-if="entity.prerequisites && entity.prerequisites.length > 0">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Prerequisites</h2>
        </template>
        <div class="space-y-2">
          <div v-for="prereq in entity.prerequisites" :key="prereq.id" class="text-gray-700 dark:text-gray-300">
            • {{ prereq.description || prereq.prerequisite_type }}
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

      <UCard v-if="entity.modifiers && entity.modifiers.length > 0">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Modifiers</h2>
        </template>
        <div class="space-y-3">
          <div v-for="modifier in entity.modifiers" :key="modifier.id" class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ modifier.modifier_type }}: {{ modifier.value > 0 ? '+' : '' }}{{ modifier.value }}
            </div>
            <div v-if="modifier.description" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ modifier.description }}
            </div>
          </div>
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

      <!-- JSON Debug Panel -->
      <div
        v-if="showJson"
        ref="jsonPanelRef"
        class="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
      >
        <div class="bg-gray-900 text-gray-100 p-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold">Raw JSON Data</h3>
          <div class="flex gap-2">
            <UButton color="gray" variant="soft" size="xs" icon="i-heroicons-clipboard" @click="copyJson">Copy</UButton>
            <UButton color="gray" variant="soft" size="xs" icon="i-heroicons-x-mark" @click="showJson = false">Close</UButton>
          </div>
        </div>
        <pre class="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm"><code>{{ JSON.stringify(entity, null, 2) }}</code></pre>
      </div>

      <!-- Back Button -->
      <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
        <NuxtLink to="/feats">
          <UButton color="gray" variant="soft" icon="i-heroicons-arrow-left">Back to Feats</UButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
