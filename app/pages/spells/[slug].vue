<script setup lang="ts">
import type { Spell } from '~/types/api/entities'
import { getSpellLevelColor, getSpellSchoolColor } from '~/utils/badgeColors'

const route = useRoute()

// Fetch spell data and setup SEO
const { data: spell, loading, error } = useEntityDetail<Spell>({
  slug: route.params.slug as string,
  endpoint: '/spells',
  cacheKey: 'spell',
  seo: {
    titleTemplate: name => `${name} - D&D 5e Spell`,
    descriptionExtractor: (spell: unknown) => {
      const s = spell as { description?: string }
      return s.description?.substring(0, 160) || ''
    },
    fallbackTitle: 'Spell - D&D 5e Compendium'
  }
})

/**
 * Format spell level for display
 */
const spellLevelText = computed(() => {
  if (!spell.value) return ''
  if (spell.value.level === 0) return 'Cantrip'
  const suffix = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']
  return `${spell.value.level}${suffix[spell.value.level]} Level`
})

/**
 * Get all effects (damage and other) grouped by spell slot level
 */
const spellEffects = computed(() => {
  if (!spell.value?.effects) return []
  return [...spell.value.effects]
    .sort((a, b) => (a.min_spell_slot || 0) - (b.min_spell_slot || 0))
})

/**
 * Get entity image path (512px variant)
 */
const { getImagePath } = useEntityImage()
const imagePath = computed(() => {
  if (!spell.value) return null
  return getImagePath('spells', spell.value.slug, 512)
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Loading State -->
    <UiDetailPageLoading
      v-if="loading"
      entity-type="spell"
    />

    <!-- Error State -->
    <UiDetailPageError
      v-else-if="error"
      entity-type="Spell"
    />

    <!-- Spell Content -->
    <div
      v-else-if="spell"
      class="space-y-8"
    >
      <!-- Breadcrumb -->
      <UiBackLink
        to="/spells"
        label="Back to Spells"
      />

      <!-- Header (title + badges) -->
      <UiDetailPageHeader
        :title="spell.name"
        :badges="[
          { label: spellLevelText, color: getSpellLevelColor(spell.level), variant: 'subtle' as const, size: 'lg' as const },
          { label: spell.school?.name || 'Unknown', color: getSpellSchoolColor(spell.school?.code || ''), variant: 'subtle' as const, size: 'lg' as const },
          ...(spell.is_ritual ? [{ label: '🔮 Ritual', color: 'info' as const, variant: 'soft' as const, size: 'sm' as const }] : []),
          ...(spell.needs_concentration ? [{ label: '⭐ Concentration', color: 'warning' as const, variant: 'soft' as const, size: 'sm' as const }] : [])
        ]"
      />

      <!-- Quick Stats + Image (side-by-side) -->
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Quick Stats (2/3 width) -->
        <div class="lg:w-2/3">
          <UiDetailQuickStatsCard
            :stats="[
              { icon: 'i-heroicons-clock', label: 'Casting Time', value: spell.casting_time },
              { icon: 'i-heroicons-arrow-trending-up', label: 'Range', value: spell.range },
              { icon: 'i-heroicons-sparkles', label: 'Components', value: spell.components, subtext: spell.material_components },
              { icon: 'i-heroicons-clock', label: 'Duration', value: spell.duration }
            ]"
          />
        </div>

        <!-- Image (1/3 width) -->
        <div class="lg:w-1/3">
          <UiDetailEntityImage
            :image-path="imagePath"
            :image-alt="`${spell.name} spell illustration`"
          />
        </div>
      </div>

      <!-- Description (full width) -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">
            Description
          </h2>
        </template>
        <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {{ spell.description }}
        </p>
      </UCard>

      <!-- Additional Details (Accordion) -->
      <UAccordion
        :items="[
          ...(spell.higher_levels ? [{
            label: 'At Higher Levels',
            slot: 'higher-levels',
            defaultOpen: false
          }] : []),
          ...(spellEffects.length > 0 ? [{
            label: 'Effects',
            slot: 'effects',
            defaultOpen: false
          }] : []),
          ...(spell.saving_throws && spell.saving_throws.length > 0 ? [{
            label: 'Saving Throws',
            slot: 'saving-throws',
            defaultOpen: false
          }] : []),
          ...(spell.classes && spell.classes.length > 0 ? [{
            label: 'Available to Classes',
            slot: 'classes',
            defaultOpen: false
          }] : []),
          ...(spell.sources && spell.sources.length > 0 ? [{
            label: 'Source',
            slot: 'source',
            defaultOpen: false
          }] : []),
          ...(spell.random_tables && spell.random_tables.length > 0 ? [{
            label: 'Random Tables',
            slot: 'random-tables',
            defaultOpen: false
          }] : []),
          ...(spell.tags && spell.tags.length > 0 ? [{
            label: 'Tags',
            slot: 'tags',
            defaultOpen: false
          }] : [])
        ]"
        type="multiple"
      >
        <!-- Higher Levels Slot -->
        <template
          v-if="spell.higher_levels"
          #higher-levels
        >
          <div class="p-4">
            <p class="text-gray-700 dark:text-gray-300">
              {{ spell.higher_levels }}
            </p>
          </div>
        </template>

        <!-- Effects Slot -->
        <template
          v-if="spellEffects.length > 0"
          #effects
        >
          <UiAccordionDamageEffects :effects="spellEffects" />
        </template>

        <!-- Saving Throws Slot -->
        <template
          v-if="spell.saving_throws && spell.saving_throws.length > 0"
          #saving-throws
        >
          <UiAccordionSavingThrows :saving-throws="spell.saving_throws" />
        </template>

        <!-- Classes Slot -->
        <template
          v-if="spell.classes && spell.classes.length > 0"
          #classes
        >
          <UiAccordionBadgeList
            :items="spell.classes"
            color="primary"
          />
        </template>

        <!-- Random Tables Slot -->
        <template
          v-if="spell.random_tables && spell.random_tables.length > 0"
          #random-tables
        >
          <UiAccordionRandomTablesList :tables="spell.random_tables" />
        </template>

        <!-- Source Slot -->
        <template
          v-if="spell.sources && spell.sources.length > 0"
          #source
        >
          <UiSourceDisplay :sources="spell.sources" />
        </template>

        <!-- Tags Slot -->
        <template
          v-if="spell.tags && spell.tags.length > 0"
          #tags
        >
          <UiTagsDisplay :tags="spell.tags" />
        </template>
      </UAccordion>

      <!-- JSON Debug Panel -->
      <JsonDebugPanel
        :data="spell"
        title="Spell Data"
      />
    </div>
  </div>
</template>
