<script setup lang="ts">
const { apiFetch } = useApi()
const route = useRoute()
const slug = route.params.slug as string

const { data: entity, error, pending } = await useAsyncData(
  `feat-${slug}`,
  async () => {
    const response = await apiFetch(`/feats/${slug}`)
    return response.data
  }
)

useSeoMeta({
  title: computed(() => entity.value ? `${entity.value.name} - D&D 5e Feat` : 'Feat - D&D 5e Compendium'),
  description: computed(() => entity.value?.description?.substring(0, 160)),
})

</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <UiDetailPageLoading v-if="pending" entityType="feat" />

    <UiDetailPageError v-else-if="error" entityType="Feat" />

    <div v-else-if="entity" class="space-y-8">
      <!-- Breadcrumb Navigation -->
      <UiBackLink to="/feats" label="Back to Feats" />

      <!-- Header -->
      <UiDetailPageHeader
        :title="entity.name"
        :badges="[
          { label: 'Feat', color: 'warning', variant: 'subtle', size: 'lg' }
        ]"
      />

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

      <!-- Description (Always Visible) -->
      <UCard v-if="entity.description">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Description</h2>
        </template>
        <div class="prose dark:prose-invert max-w-none">
          <p class="whitespace-pre-line text-gray-700 dark:text-gray-300">{{ entity.description }}</p>
        </div>
      </UCard>

      <!-- Additional Details (Accordion) -->
      <UAccordion
        :items="[
          ...(entity.modifiers && entity.modifiers.length > 0 ? [{
            label: 'Modifiers',
            slot: 'modifiers',
            defaultOpen: false
          }] : []),
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
        <!-- Modifiers Slot -->
        <template v-if="entity.modifiers && entity.modifiers.length > 0" #modifiers>
          <UiModifiersDisplay :modifiers="entity.modifiers" />
        </template>

        <!-- Source Slot -->
        <template v-if="entity.sources && entity.sources.length > 0" #source>
          <UiSourceDisplay :sources="entity.sources" />
        </template>

        <!-- Tags Slot -->
        <template v-if="entity.tags && entity.tags.length > 0" #tags>
          <UiTagsDisplay :tags="entity.tags" />
        </template>
      </UAccordion>

      <!-- JSON Debug Panel -->
      <JsonDebugPanel :data="entity" title="Feat Data" />
    </div>
  </div>
</template>
