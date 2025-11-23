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

/**
 * Get the first trait to display in the description box
 */
const firstTrait = computed(() => {
  if (!entity.value?.traits || entity.value.traits.length === 0) return null
  return entity.value.traits[0]
})

/**
 * Get remaining traits (excluding the first one) for the accordion
 */
const remainingTraits = computed(() => {
  if (!entity.value?.traits || entity.value.traits.length <= 1) return []
  return entity.value.traits.slice(1)
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

      <!-- Header -->
      <UiDetailPageHeader
        :title="entity.name"
        :badges="[
          { label: entity.is_base_class ? 'Base Class' : 'Subclass', color: (entity.is_base_class ? 'error' : 'warning') as BadgeColor, variant: 'subtle' as BadgeVariant, size: 'lg' as BadgeSize },
          ...(entity.spellcasting_ability ? [{ label: `✨ ${entity.spellcasting_ability.name}`, color: 'primary' as BadgeColor, variant: 'soft' as BadgeVariant, size: 'sm' as BadgeSize }] : [])
        ]"
      />

      <!-- Quick Stats (2/3) + Image (1/3) Side-by-Side -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Quick Stats - 2/3 width on large screens -->
        <div class="lg:col-span-2">
          <UiDetailQuickStatsCard
            :columns="2"
            :stats="[
              ...(entity.hit_die ? [{ icon: 'i-heroicons-heart', label: 'Hit Die', value: `1d${entity.hit_die}` }] : []),
              ...(entity.primary_ability ? [{ icon: 'i-heroicons-star', label: 'Primary Ability', value: entity.primary_ability }] : []),
              ...(entity.spellcasting_ability ? [{ icon: 'i-heroicons-sparkles', label: 'Spellcasting Ability', value: `${entity.spellcasting_ability.name} (${entity.spellcasting_ability.code})` }] : [])
            ]"
          />
        </div>

        <!-- Standalone Image - 1/3 width on large screens -->
        <div class="lg:col-span-1">
          <UiDetailStandaloneImage
            v-if="imagePath"
            :image-path="imagePath"
            :image-alt="`${entity.name} class illustration`"
          />
        </div>
      </div>

      <!-- Description (from first trait or fallback to description) -->
      <UiDetailDescriptionCard
        v-if="firstTrait?.description || entity.description"
        :description="firstTrait?.description || entity.description || ''"
      />

      <!-- Additional Details (Accordion) -->
      <UAccordion
        :items="[
          ...(entity.counters && entity.counters.length > 0 ? [{
            label: 'Class Counters',
            slot: 'counters',
            defaultOpen: false
          }] : []),
          ...(remainingTraits.length > 0 ? [{
            label: `Additional Class Traits (${remainingTraits.length})`,
            slot: 'traits',
            defaultOpen: false
          }] : []),
          ...(entity.level_progression && entity.level_progression.length > 0 ? [{
            label: 'Spell Slot Progression',
            slot: 'level-progression',
            defaultOpen: false
          }] : []),
          ...(entity.equipment && entity.equipment.length > 0 ? [{
            label: 'Starting Equipment & Proficiencies',
            slot: 'equipment',
            defaultOpen: false
          }] : []),
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
        <!-- Counters Slot -->
        <template
          v-if="entity.counters && entity.counters.length > 0"
          #counters
        >
          <UiAccordionClassCounters :counters="entity.counters" />
        </template>

        <!-- Additional Traits Slot (excluding first trait shown in description) -->
        <template
          v-if="remainingTraits.length > 0"
          #traits
        >
          <UiAccordionTraitsList
            :traits="remainingTraits"
            border-color="primary-500"
          />
        </template>

        <!-- Level Progression Slot -->
        <template
          v-if="entity.level_progression && entity.level_progression.length > 0"
          #level-progression
        >
          <UiAccordionLevelProgression :level-progression="entity.level_progression" />
        </template>

        <!-- Equipment Slot -->
        <template
          v-if="entity.equipment && entity.equipment.length > 0"
          #equipment
        >
          <UiAccordionEquipmentList :equipment="entity.equipment" type="class" />
        </template>

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
          <UiAccordionSubclassesList
            :subclasses="entity.subclasses"
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
