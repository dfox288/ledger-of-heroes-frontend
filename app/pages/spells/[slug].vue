<script setup lang="ts">
const route = useRoute()
const slug = computed(() => route.params.slug as string)

// Use the new composable for all derived data
const {
  entity,
  pending: loading,
  error,
  hasScalingEffects,
  scalingType,
  combatMechanicsVisible,
  parsedAreaOfEffect
} = useSpellDetail(slug)

// Alias entity as spell for template clarity
const spell = entity

// Get entity image path
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
      <!-- Breadcrumb Navigation -->
      <UiDetailBreadcrumb
        list-path="/spells"
        list-label="Spells"
        :current-label="spell.name"
      />

      <!-- Hero Section (Name, Badges, Image) -->
      <SpellHero
        :spell="spell"
        :image-path="imagePath"
      />

      <!-- Casting Mechanics (Casting Time, Range, Duration, Components) -->
      <SpellCastingStats
        :casting-time="spell.casting_time ?? 'Unknown'"
        :casting-time-type="spell.casting_time_type ?? 'action'"
        :range="spell.range ?? 'Unknown'"
        :duration="spell.duration ?? 'Unknown'"
        :area-of-effect="parsedAreaOfEffect"
        :components="spell.components ?? 'Unknown'"
        :requires-verbal="spell.components?.includes('V') ?? false"
        :requires-somatic="spell.components?.includes('S') ?? false"
        :requires-material="spell.components?.includes('M') ?? false"
        :material-components="spell.material_components"
        :material-cost-gp="spell.material_cost_gp ? Number(spell.material_cost_gp) : null"
        :material-consumed="spell.material_consumed === true"
      />

      <!-- Description (Always) -->
      <UiDetailDescriptionCard
        v-if="spell.description"
        :description="spell.description"
      />

      <!-- Combat Mechanics (Conditional - Only for combat spells) -->
      <SpellCombatMechanics
        v-if="combatMechanicsVisible"
        :effects="spell.effects || []"
        :saving-throws="spell.saving_throws || []"
        :area-of-effect="parsedAreaOfEffect"
      />

      <!-- Scaling Table (Conditional - Only for spells with scaling effects) -->
      <SpellScalingTable
        v-if="hasScalingEffects"
        :effects="spell.effects || []"
        :base-level="spell.level ?? 0"
        :scaling-type="scalingType ?? 'spell_slot_level'"
      />

      <!-- Higher Levels (Conditional - Only when no scaling table) -->
      <SpellHigherLevels
        v-if="spell.higher_levels && !hasScalingEffects"
        :higher-levels="spell.higher_levels"
      />

      <!-- Class List (Classes that can learn this spell) -->
      <SpellClassList
        v-if="spell.classes && spell.classes.length > 0"
        :classes="spell.classes"
      />

      <!-- Additional Details (Accordion - Minimal) -->
      <UAccordion
        v-if="(spell.data_tables && spell.data_tables.length > 0) || (spell.tags && spell.tags.length > 0)"
        :items="[
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
        <!-- Data Tables Slot -->
        <template
          v-if="spell.data_tables && spell.data_tables.length > 0"
          #data-tables
        >
          <UiAccordionRandomTablesList :tables="spell.data_tables" />
        </template>

        <!-- Tags Slot -->
        <template
          v-if="spell.tags && spell.tags.length > 0"
          #tags
        >
          <UiTagsDisplay :tags="spell.tags" />
        </template>
      </UAccordion>

      <!-- Source Footer -->
      <SpellSourceFooter
        v-if="spell.sources && spell.sources.length > 0"
        :sources="spell.sources"
      />

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
