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

/**
 * Quick stats for display
 */
const quickStatsForDisplay = computed(() => {
  if (!entity.value) return []

  return [
    {
      icon: 'i-heroicons-bolt',
      label: 'Type',
      value: 'Feat'
    },
    {
      icon: 'i-heroicons-check-badge',
      label: 'Prerequisites',
      value: (entity.value.prerequisites?.length ?? 0) > 0 ? 'Yes' : 'None'
    }
  ]
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

      <!-- Header - UPDATED -->
      <UiDetailPageHeader
        :title="entity.name"
        :badges="[
          { label: 'Feat', color: 'warning', variant: 'subtle', size: 'lg' }
        ]"
      />

      <!-- Prerequisites (2/3) + Image (1/3) Side-by-Side -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Prerequisites - 2/3 width on large screens -->
        <div class="lg:col-span-2">
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
                <template v-if="prereq.description">
                  • {{ prereq.description }}
                </template>
                <template v-else-if="prereq.ability_score">
                  • {{ prereq.ability_score.name }} {{ prereq.minimum_value }} or higher
                </template>
                <template v-else>
                  • {{ prereq.prerequisite_type }}
                </template>
              </div>
            </div>
          </UCard>
          <!-- Empty placeholder when no prerequisites -->
          <div
            v-else
            class="h-full"
          />
        </div>

        <!-- Standalone Image - 1/3 width on large screens -->
        <div class="lg:col-span-1">
          <UiDetailEntityImage
            :image-path="imagePath"
            :image-alt="`${entity.name} feat illustration`"
          />
        </div>
      </div>

      <!-- Quick Stats Card -->
      <UiDetailQuickStatsCard
        :columns="2"
        :stats="quickStatsForDisplay"
      />

      <!-- Description Card -->
      <UiDetailDescriptionCard
        v-if="entity.description"
        :description="entity.description"
      />

      <!-- Additional Details (Accordion) -->
      <UAccordion
        :items="[
          ...(entity.proficiencies && entity.proficiencies.length > 0 ? [{
            label: 'Proficiencies',
            slot: 'proficiencies',
            defaultOpen: false
          }] : []),
          ...(entity.conditions && entity.conditions.length > 0 ? [{
            label: 'Conditions',
            slot: 'conditions',
            defaultOpen: false
          }] : []),
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
        <!-- Proficiencies Slot -->
        <template
          v-if="entity.proficiencies && entity.proficiencies.length > 0"
          #proficiencies
        >
          <UiAccordionBulletList :items="entity.proficiencies" />
        </template>

        <!-- Conditions Slot -->
        <template
          v-if="entity.conditions && entity.conditions.length > 0"
          #conditions
        >
          <UiAccordionConditions
            :conditions="entity.conditions"
            entity-type="feat"
          />
        </template>

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
