<script setup lang="ts">
const { apiFetch } = useApi()
const route = useRoute()
const slug = route.params.slug as string

const { data: entity, error, pending } = await useAsyncData(
  `background-${slug}`,
  async () => {
    const response = await apiFetch(`/backgrounds/${slug}`)
    return response.data
  }
)

useSeoMeta({
  title: computed(() => entity.value ? `${entity.value.name} - D&D 5e Background` : 'Background - D&D 5e Compendium'),
  description: computed(() => entity.value?.description?.substring(0, 160)),
})

</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <UiDetailPageLoading v-if="pending" entityType="background" />

    <UiDetailPageError v-else-if="error" entityType="Background" />

    <div v-else-if="entity" class="space-y-8">
      <!-- Breadcrumb Navigation -->
      <UiBackLink to="/backgrounds" label="Back to Backgrounds" />

      <!-- Header -->
      <UiDetailPageHeader
        :title="entity.name"
        :badges="[
          { label: 'Background', color: 'success', variant: 'subtle', size: 'lg' }
        ]"
      />

      <!-- Traits Section -->
      <UCard v-if="entity.traits && entity.traits.length > 0">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Background Traits</h2>
        </template>
        <UiAccordionTraitsList :traits="entity.traits" :showCategory="true" borderColor="purple-500" />
      </UCard>

      <UCard v-if="entity.description">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Description</h2>
        </template>
        <div class="prose dark:prose-invert max-w-none">
          <p class="whitespace-pre-line text-gray-700 dark:text-gray-300">{{ entity.description }}</p>
        </div>
      </UCard>

      <UCard v-if="entity.proficiencies && entity.proficiencies.length > 0">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Skill Proficiencies</h2>
        </template>
        <UiAccordionBulletList :items="entity.proficiencies" />
      </UCard>

      <UCard v-if="entity.languages && entity.languages.length > 0">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Languages</h2>
        </template>
        <UiAccordionBadgeList :items="entity.languages" color="neutral" />
      </UCard>

      <!-- Additional Details (Accordion) -->
      <UAccordion
        :items="[
          ...(entity.sources && entity.sources.length > 0 ? [{
            label: 'Source',
            slot: 'source',
            defaultOpen: false
          }] : []),
          ...(entity.tags && entity.tags.length > 0 ? [{
            label: 'Tags',
            slot: 'tags',
            defaultOpen: false
          }] : [])
        ]"
        type="multiple"
      >
        <!-- Source Slot -->
        <template v-if="entity.sources && entity.sources.length > 0" #source>
          <UiSourceDisplay :sources="entity.sources" />
        </template>

        <!-- Tags Slot -->
        <template v-if="entity.tags && entity.tags.length > 0" #tags>
          <TagsDisplay :tags="entity.tags" />
        </template>
      </UAccordion>

      <!-- JSON Debug Panel -->
      <JsonDebugPanel :data="entity" title="Background Data" />
    </div>
  </div>
</template>
