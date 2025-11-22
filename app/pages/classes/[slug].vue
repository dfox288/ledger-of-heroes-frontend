<script setup lang="ts">
import type { CharacterClass } from '~/types/api/entities'
import type { BadgeColor, BadgeSize, BadgeVariant } from '~/utils/badgeColors'

const route = useRoute()

// Fetch class data and setup SEO
const { data: entity, loading, error } = useEntityDetail<CharacterClass>({
  slug: route.params.slug as string,
  endpoint: '/classes',
  cacheKey: 'class',
  seo: {
    titleTemplate: name => `${name} - D&D 5e Class`,
    descriptionExtractor: (charClass: unknown) => {
      const c = charClass as { description?: string }
      return c.description?.substring(0, 160) || ''
    },
    fallbackTitle: 'Class - D&D 5e Compendium'
  }
})

/**
 * Get entity image path (512px variant)
 */
const { getImagePath } = useEntityImage()
const imagePath = computed(() => {
  if (!entity.value) return null
  return getImagePath('classes', entity.value.slug, 512)
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <UiDetailPageLoading
      v-if="loading"
      entity-type="class"
    />

    <UiDetailPageError
      v-else-if="error"
      entity-type="Class"
    />

    <div
      v-else-if="entity"
      class="space-y-8"
    >
      <!-- Breadcrumb Navigation -->
      <UiBackLink
        to="/classes"
        label="Back to Classes"
      />

      <!-- Header with Image -->
      <UiEntityHeaderWithImage
        :title="entity.name"
        :badges="[
          { label: entity.is_base_class ? 'Base Class' : 'Subclass', color: (entity.is_base_class ? 'error' : 'warning') as BadgeColor, variant: 'subtle' as BadgeVariant, size: 'lg' as BadgeSize },
          ...(entity.spellcasting_ability ? [{ label: `✨ ${entity.spellcasting_ability.name}`, color: 'primary' as BadgeColor, variant: 'soft' as BadgeVariant, size: 'sm' as BadgeSize }] : [])
        ]"
        :image-path="imagePath"
        :image-alt="`${entity.name} class illustration`"
      />

      <!-- Quick Stats -->
      <UiDetailQuickStatsCard
        :columns="3"
        :stats="[
          ...(entity.hit_die ? [{ icon: 'i-heroicons-heart', label: 'Hit Die', value: `1d${entity.hit_die}` }] : []),
          ...(entity.primary_ability ? [{ icon: 'i-heroicons-star', label: 'Primary Ability', value: entity.primary_ability }] : []),
          ...(entity.spellcasting_ability ? [{ icon: 'i-heroicons-sparkles', label: 'Spellcasting Ability', value: `${entity.spellcasting_ability.name} (${entity.spellcasting_ability.code})` }] : [])
        ]"
      />

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
          ...(entity.proficiencies && entity.proficiencies.length > 0 ? [{
            label: `Proficiencies (${entity.proficiencies.length})`,
            slot: 'proficiencies',
            defaultOpen: false
          }] : []),
          ...(entity.features && entity.features.length > 0 ? [{
            label: `Features (${entity.features.length})`,
            slot: 'features',
            defaultOpen: false
          }] : []),
          ...(entity.subclasses && entity.subclasses.length > 0 ? [{
            label: `Subclasses (${entity.subclasses.length})`,
            slot: 'subclasses',
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

        <!-- Features Slot -->
        <template
          v-if="entity.features && entity.features.length > 0"
          #features
        >
          <UiAccordionTraitsList
            :traits="entity.features"
            :show-level="true"
            border-color="primary-500"
          />
        </template>

        <!-- Subclasses Slot -->
        <template
          v-if="entity.subclasses && entity.subclasses.length > 0"
          #subclasses
        >
          <UiAccordionEntityGrid
            :entities="entity.subclasses"
            base-path="/classes"
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
        title="Class Data"
      />
    </div>
  </div>
</template>
