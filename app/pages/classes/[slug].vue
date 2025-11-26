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
 * Get base class features (non-optional) for the progression table
 */
const baseClassFeatures = computed(() => {
  if (!entity.value?.features) return []
  return entity.value.features.filter(f => !f.is_optional)
})

/**
 * Determine if viewing a subclass (not a base class)
 */
const isSubclass = computed(() => entity.value && !entity.value.is_base_class)

/**
 * Get parent class data (only available for subclasses)
 */
const parentClass = computed(() => entity.value?.parent_class)

/**
 * Get parent class image path for overlay
 */
const parentClassImagePath = computed(() => {
  if (!parentClass.value?.slug) return null
  return getImagePath('classes', parentClass.value.slug, 256)
})

/**
 * Get base class features for progression table (from parent for subclasses)
 */
const progressionFeatures = computed(() => {
  if (isSubclass.value && parentClass.value?.features) {
    return parentClass.value.features.filter((f: { is_optional?: boolean }) => !f.is_optional)
  }
  return baseClassFeatures.value
})

/**
 * Get counters for progression table (from parent for subclasses)
 */
const progressionCounters = computed(() => {
  if (isSubclass.value && parentClass.value?.counters) {
    return parentClass.value.counters
  }
  return entity.value?.counters || []
})

/**
 * Build accordion items with icons
 */
const accordionItems = computed(() => {
  if (!entity.value) return []

  const items = []

  if (entity.value.counters && entity.value.counters.length > 0) {
    items.push({
      label: 'Class Counters',
      slot: 'counters',
      defaultOpen: false,
      icon: 'i-heroicons-calculator'
    })
  }

  if (entity.value.traits && entity.value.traits.length > 0) {
    items.push({
      label: `Class Traits (${entity.value.traits.length})`,
      slot: 'traits',
      defaultOpen: false,
      icon: 'i-heroicons-shield-check'
    })
  }

  if (entity.value.level_progression && entity.value.level_progression.length > 0) {
    items.push({
      label: 'Spell Slot Progression',
      slot: 'level-progression',
      defaultOpen: false,
      icon: 'i-heroicons-sparkles'
    })
  }

  if (entity.value.equipment && entity.value.equipment.length > 0) {
    items.push({
      label: 'Starting Equipment & Proficiencies',
      slot: 'equipment',
      defaultOpen: false,
      icon: 'i-heroicons-shopping-bag'
    })
  }

  if (entity.value.proficiencies && entity.value.proficiencies.length > 0) {
    items.push({
      label: `Proficiencies (${entity.value.proficiencies.length})`,
      slot: 'proficiencies',
      defaultOpen: false,
      icon: 'i-heroicons-academic-cap'
    })
  }

  if (entity.value.features && entity.value.features.length > 0) {
    items.push({
      label: `Features (${entity.value.features.length})`,
      slot: 'features',
      defaultOpen: false,
      icon: 'i-heroicons-star'
    })
  }

  if (entity.value.sources && entity.value.sources.length > 0) {
    items.push({
      label: 'Source',
      slot: 'source',
      defaultOpen: false,
      icon: 'i-heroicons-book-open'
    })
  }

  return items
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
      <nav
        v-if="isSubclass && parentClass"
        class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
      >
        <NuxtLink
          to="/classes"
          class="hover:text-gray-700 dark:hover:text-gray-200"
        >
          Classes
        </NuxtLink>
        <UIcon
          name="i-heroicons-chevron-right"
          class="w-4 h-4"
        />
        <NuxtLink
          :to="`/classes/${parentClass.slug}`"
          class="hover:text-class-600 dark:hover:text-class-400"
        >
          {{ parentClass.name }}
        </NuxtLink>
        <UIcon
          name="i-heroicons-chevron-right"
          class="w-4 h-4"
        />
        <span class="text-gray-900 dark:text-gray-100 font-medium">
          {{ entity.name }}
        </span>
      </nav>
      <UiBackLink
        v-else
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
          <UiDetailEntityImage
            v-if="imagePath"
            :image-path="imagePath"
            :image-alt="`${entity.name} class illustration`"
          />
        </div>
      </div>

      <!-- Class Progression Table -->
      <UiClassProgressionTable
        v-if="entity.is_base_class && baseClassFeatures.length > 0"
        :features="baseClassFeatures"
        :counters="entity.counters || []"
      />

      <!-- Description -->
      <UiDetailDescriptionCard
        v-if="entity.description"
        :description="entity.description"
      />

      <!-- Hit Points Card -->
      <UiClassHitPointsCard
        v-if="entity.hit_die && entity.is_base_class"
        :hit-die="Number(entity.hit_die)"
        :class-name="entity.name"
      />

      <!-- Subclasses (Card Grid) -->
      <div
        v-if="entity.is_base_class && entity.subclasses && entity.subclasses.length > 0"
        class="space-y-4"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <UIcon
            name="i-heroicons-users"
            class="w-5 h-5 text-gray-400"
          />
          Subclasses ({{ entity.subclasses.length }})
        </h3>
        <UiClassSubclassCards
          :subclasses="entity.subclasses"
          base-path="/classes"
        />
      </div>

      <!-- Additional Details (Accordion) -->
      <UAccordion
        :items="accordionItems"
        type="multiple"
      >
        <!-- Counters Slot -->
        <template
          v-if="entity.counters && entity.counters.length > 0"
          #counters
        >
          <UiAccordionClassCounters :counters="entity.counters" />
        </template>

        <!-- Traits Slot -->
        <template
          v-if="entity.traits && entity.traits.length > 0"
          #traits
        >
          <UiAccordionTraitsList
            :traits="entity.traits"
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
          <UiAccordionEquipmentList
            :equipment="entity.equipment"
            type="class"
          />
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
          />
        </template>

        <!-- Source Slot -->
        <template
          v-if="entity.sources && entity.sources.length > 0"
          #source
        >
          <UiSourceDisplay :sources="entity.sources" />
        </template>
      </UAccordion>

      <!-- Bottom Navigation -->
      <UiDetailPageBottomNav
        to="/classes"
        label="Back to Classes"
      />

      <!-- JSON Debug Panel -->
      <JsonDebugPanel
        :data="entity"
        title="Class Data"
      />
    </div>
  </div>
</template>
