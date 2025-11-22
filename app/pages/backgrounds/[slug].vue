<script setup lang="ts">
import type { Background } from '~/types/api/entities'

const route = useRoute()

// Fetch background data and setup SEO
const { data: entity, loading, error } = useEntityDetail<Background>({
  slug: route.params.slug as string,
  endpoint: '/backgrounds',
  cacheKey: 'background',
  seo: {
    titleTemplate: name => `${name} - D&D 5e Background`,
    descriptionExtractor: (background: unknown) => {
      const b = background as { description?: string }
      return b.description?.substring(0, 160) || ''
    },
    fallbackTitle: 'Background - D&D 5e Compendium'
  }
})

/**
 * Get entity image path (512px variant)
 */
const { getImagePath } = useEntityImage()
const imagePath = computed(() => {
  if (!entity.value) return null
  return getImagePath('backgrounds', entity.value.slug, 512)
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <UiDetailPageLoading
      v-if="loading"
      entity-type="background"
    />

    <UiDetailPageError
      v-else-if="error"
      entity-type="Background"
    />

    <div
      v-else-if="entity"
      class="space-y-8"
    >
      <!-- Breadcrumb Navigation -->
      <UiBackLink
        to="/backgrounds"
        label="Back to Backgrounds"
      />

      <!-- Header - UPDATED -->
      <UiDetailPageHeader
        :title="entity.name"
        :badges="[
          { label: 'Background', color: 'success', variant: 'subtle', size: 'lg' }
        ]"
      />

      <!-- Traits Section - KEEP AS-IS (always visible) -->
      <UCard v-if="entity.traits && entity.traits.length > 0">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Background Traits
          </h2>
        </template>
        <UiAccordionTraitsList
          :traits="entity.traits"
          :show-category="true"
          border-color="purple-500"
        />
      </UCard>

      <!-- Description + Image - NEW COMPONENT -->
      <UiDetailDescriptionWithImage
        v-if="entity.description"
        :description="entity.description"
        :image-path="imagePath"
        :image-alt="`${entity.name} background illustration`"
      />

      <!-- Proficiencies - KEEP AS-IS (always visible) -->
      <UCard v-if="entity.proficiencies && entity.proficiencies.length > 0">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Skill Proficiencies
          </h2>
        </template>
        <UiAccordionBulletList :items="entity.proficiencies" />
      </UCard>

      <!-- Languages - KEEP AS-IS (always visible) -->
      <UCard v-if="entity.languages && entity.languages.length > 0">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Languages
          </h2>
        </template>
        <UiAccordionBadgeList
          :items="entity.languages"
          color="neutral"
        />
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
        title="Background Data"
      />
    </div>
  </div>
</template>
