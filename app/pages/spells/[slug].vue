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

/**
 * Parse and format area of effect (Issue #54)
 */
const areaOfEffectText = computed(() => {
  if (!spell.value?.area_of_effect) return null
  try {
    const aoe = JSON.parse(spell.value.area_of_effect) as { type: string, size: number }
    return `${aoe.size} ft. ${aoe.type.charAt(0).toUpperCase()}${aoe.type.slice(1)}`
  } catch {
    return null
  }
})

/**
 * Format material component info with cost and consumed status (Issue #53)
 */
const materialComponentsText = computed(() => {
  if (!spell.value?.material_components) return null

  let text = spell.value.material_components

  // Add cost if present
  if (spell.value.material_cost_gp) {
    text += ` (${spell.value.material_cost_gp} gp`
    // Add consumed status if applicable
    if (spell.value.material_consumed === 'true') {
      text += ', consumed'
    }
    text += ')'
  } else if (spell.value.material_consumed === 'true') {
    // Consumed but no cost specified
    text += ' (consumed)'
  }

  return text
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
      <UiDetailBreadcrumb
        list-path="/spells"
        list-label="Spells"
        :current-label="spell.name"
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
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Quick Stats - 2/3 width on large screens -->
        <div class="lg:col-span-2">
          <UiDetailQuickStatsCard
            :stats="[
              { icon: 'i-heroicons-clock', label: 'Casting Time', value: spell.casting_time },
              { icon: 'i-heroicons-arrow-trending-up', label: 'Range', value: spell.range },
              ...(areaOfEffectText ? [{ icon: 'i-heroicons-map', label: 'Area of Effect', value: areaOfEffectText }] : []),
              { icon: 'i-heroicons-sparkles', label: 'Components', value: spell.components, subtext: materialComponentsText },
              { icon: 'i-heroicons-clock', label: 'Duration', value: spell.duration }
            ]"
          />
        </div>

        <!-- Image - 1/3 width on large screens -->
        <div class="lg:col-span-1">
          <UiDetailEntityImage
            :image-path="imagePath"
            :image-alt="`${spell.name} spell illustration`"
          />
        </div>
      </div>

      <!-- Description (full width) -->
      <UiDetailDescriptionCard
        v-if="spell.description"
        :description="spell.description"
      />

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
          ...(spell.data_tables && spell.data_tables.length > 0 ? [{
            label: 'Data Tables',
            slot: 'data-tables',
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

        <!-- Data Tables Slot -->
        <template
          v-if="spell.data_tables && spell.data_tables.length > 0"
          #data-tables
        >
          <UiAccordionRandomTablesList :tables="spell.data_tables" />
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

      <!-- Bottom Navigation -->
      <UiDetailPageBottomNav
        to="/spells"
        label="Back to Spells"
      />

      <!-- JSON Debug Panel -->
      <JsonDebugPanel
        :data="spell"
        title="Spell Data"
      />
    </div>
  </div>
</template>
