<script setup lang="ts">
import type { Feat } from '~/types/api/entities'

const route = useRoute()

// Fetch feat data and setup SEO
const { data: entity, loading, error } = useEntityDetail<Feat>({
  slug: route.params.slug as string,
  endpoint: '/feats',
  cacheKey: 'feat',
  seo: {
    titleTemplate: name => `${name} - D&D 5e Feat`,
    descriptionExtractor: (feat: unknown) => {
      const f = feat as { description?: string }
      return f.description?.substring(0, 160) || ''
    },
    fallbackTitle: 'Feat - D&D 5e Compendium'
  }
})

/**
 * Get entity image path (512px variant)
 */
const { getImagePath } = useEntityImage()
const imagePath = computed(() => {
  if (!entity.value) return null
  return getImagePath('feats', entity.value.slug, 512)
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <UiDetailPageLoading
      v-if="loading"
      entity-type="feat"
    />

    <UiDetailPageError
      v-else-if="error"
      entity-type="Feat"
    />

    <div
      v-else-if="entity"
      class="space-y-8"
    >
      <!-- Breadcrumb Navigation -->
      <UiBackLink
        to="/feats"
        label="Back to Feats"
      />

      <!-- Header with Image -->
      <UiEntityHeaderWithImage
        :title="entity.name"
        :badges="[
          { label: 'Feat', color: 'warning', variant: 'subtle', size: 'lg' }
        ]"
        :image-path="imagePath"
        :image-alt="`${entity.name} feat illustration`"
      />

      <UCard v-if="entity.prerequisites && entity.prerequisites.length > 0">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Prerequisites
          </h2>
        </template>
        <div class="space-y-2">
          <div
            v-for="prereq in entity.prerequisites"
            :key="prereq.id"
            class="text-gray-700 dark:text-gray-300"
          >
            • {{ prereq.description || prereq.prerequisite_type }}
          </div>
        </div>
      </UCard>

      <!-- Description (Always Visible) -->
      <UCard v-if="entity.description">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Description
          </h2>
        </template>
        <div class="prose dark:prose-invert max-w-none">
          <p class="whitespace-pre-line text-gray-700 dark:text-gray-300">
            {{ entity.description }}
          </p>
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
        <template
          v-if="entity.modifiers && entity.modifiers.length > 0"
          #modifiers
        >
          <UiModifiersDisplay :modifiers="entity.modifiers" />
        </template>

        <!-- Source Slot -->
        <template
          v-if="entity.sources && entity.sources.length > 0"
          #source
        >
          <UiSourceDisplay :sources="entity.sources" />
        </template>

        <!-- Tags Slot -->
        <template
          v-if="entity.tags && entity.tags.length > 0"
          #tags
        >
          <UiTagsDisplay :tags="entity.tags" />
        </template>
      </UAccordion>

      <!-- JSON Debug Panel -->
      <JsonDebugPanel
        :data="entity"
        title="Feat Data"
      />
    </div>
  </div>
</template>
