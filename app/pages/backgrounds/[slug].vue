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

      <!-- Header -->
      <UiDetailPageHeader
        :title="entity.name"
        :badges="[
          { label: 'Background', color: 'success', variant: 'subtle', size: 'lg' }
        ]"
      />

      <!-- Entity Image (dedicated section, before description) -->
      <div
        v-if="imagePath"
        class="rounded-lg overflow-hidden"
      >
        <UiDetailEntityImage
          :image-path="imagePath"
          :image-alt="`${entity.name} background illustration`"
        />
      </div>

      <!-- Description (always visible, outside accordion) -->
      <UCard
        v-if="entity.description"
        data-testid="description-card"
      >
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Description
          </h2>
        </template>
        <div class="prose dark:prose-invert max-w-none">
          <p class="whitespace-pre-line text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            {{ entity.description }}
          </p>
        </div>
      </UCard>

      <!-- Single Unified Accordion - ALL expandable sections -->
      <UAccordion
        :items="[
          ...(entity.traits && entity.traits.length > 0 ? [{
            label: 'Background Traits',
            slot: 'traits',
            defaultOpen: false
          }] : []),
          ...(entity.proficiencies && entity.proficiencies.length > 0 ? [{
            label: 'Skill Proficiencies',
            slot: 'proficiencies',
            defaultOpen: false
          }] : []),
          ...(entity.languages && entity.languages.length > 0 ? [{
            label: 'Languages',
            slot: 'languages',
            defaultOpen: false
          }] : []),
          ...(entity.equipment && entity.equipment.length > 0 ? [{
            label: 'Starting Equipment',
            slot: 'equipment',
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
        <!-- Traits Slot -->
        <template
          v-if="entity.traits && entity.traits.length > 0"
          #traits
        >
          <UiAccordionTraitsList
            :traits="entity.traits"
            :show-category="true"
            border-color="purple-500"
          />
        </template>

        <!-- Proficiencies Slot -->
        <template
          v-if="entity.proficiencies && entity.proficiencies.length > 0"
          #proficiencies
        >
          <UiAccordionBulletList :items="entity.proficiencies" />
        </template>

        <!-- Languages Slot -->
        <template
          v-if="entity.languages && entity.languages.length > 0"
          #languages
        >
          <UiAccordionBadgeList
            :items="entity.languages"
            color="neutral"
          />
        </template>

        <!-- Equipment Slot -->
        <template
          v-if="entity.equipment && entity.equipment.length > 0"
          #equipment
        >
          <UiAccordionEquipmentList
            :equipment="entity.equipment"
            type="background"
          />
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
        title="Background Data"
      />
    </div>
  </div>
</template>
