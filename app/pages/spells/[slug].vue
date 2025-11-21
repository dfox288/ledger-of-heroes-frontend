<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

// API configuration
const { apiFetch } = useApi()

// Fetch spell data using useAsyncData for SSR support (via Nitro proxy)
const { data: spell, error, pending } = await useAsyncData(
  `spell-${slug}`,
  async () => {
    const response = await apiFetch(`/spells/${slug}`)
    return response.data
  }
)

// Set page meta
useSeoMeta({
  title: computed(() => spell.value ? `${spell.value.name} - D&D 5e Spell` : 'Spell - D&D 5e Compendium'),
  description: computed(() => spell.value?.description?.substring(0, 160)),
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
 * Get badge color for spell level
 */
const getLevelColor = (level: number): string => {
  if (level === 0) return 'primary'
  if (level <= 3) return 'info'
  if (level <= 6) return 'warning'
  return 'error'
}

/**
 * Get badge color for spell school
 */
const getSchoolColor = (schoolCode: string): string => {
  const colorMap: Record<string, string> = {
    'A': 'info',
    'C': 'primary',
    'D': 'info',
    'EN': 'warning',
    'EV': 'error',
    'I': 'primary',
    'N': 'neutral',
    'T': 'success',
  }
  return colorMap[schoolCode] || 'info'
}

/**
 * Format components for display
 */
const componentsText = computed(() => {
  if (!spell.value) return ''
  const parts = []
  if (spell.value.components.includes('V')) parts.push('Verbal')
  if (spell.value.components.includes('S')) parts.push('Somatic')
  if (spell.value.components.includes('M')) parts.push(`Material (${spell.value.material_components})`)
  return parts.join(', ')
})

/**
 * Get all effects (damage and other) grouped by spell slot level
 */
const spellEffects = computed(() => {
  if (!spell.value?.effects) return []
  return spell.value.effects
    .sort((a: any, b: any) => a.min_spell_slot - b.min_spell_slot)
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Loading State -->
    <UiDetailPageLoading v-if="pending" entityType="spell" />

    <!-- Error State -->
    <UiDetailPageError v-else-if="error" entityType="Spell" />

    <!-- Spell Content -->
    <div v-else-if="spell" class="space-y-8">
      <!-- Breadcrumb -->
      <UiBackLink to="/spells" label="Back to Spells" />

      <!-- Header -->
      <UiDetailPageHeader
        :title="spell.name"
        :badges="[
          { label: spellLevelText, color: getLevelColor(spell.level), variant: 'subtle', size: 'lg' },
          { label: spell.school.name, color: getSchoolColor(spell.school.code), variant: 'subtle', size: 'lg' },
          ...(spell.is_ritual ? [{ label: '🔮 Ritual', color: 'info', variant: 'soft', size: 'sm' }] : []),
          ...(spell.needs_concentration ? [{ label: '⭐ Concentration', color: 'warning', variant: 'soft', size: 'sm' }] : [])
        ]"
      />

      <!-- Quick Stats -->
      <UiDetailQuickStatsCard
        :stats="[
          { icon: 'i-heroicons-clock', label: 'Casting Time', value: spell.casting_time },
          { icon: 'i-heroicons-arrow-trending-up', label: 'Range', value: spell.range },
          { icon: 'i-heroicons-sparkles', label: 'Components', value: spell.components, subtext: spell.material_components },
          { icon: 'i-heroicons-clock', label: 'Duration', value: spell.duration }
        ]"
      />

      <!-- Description (Always Visible) -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Description
          </h2>
        </template>
        <div class="prose dark:prose-invert max-w-none">
          <p class="whitespace-pre-line text-base text-gray-700 dark:text-gray-300 leading-relaxed">{{ spell.description }}</p>
        </div>
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
          ...(spell.tags && spell.tags.length > 0 ? [{
            label: 'Tags',
            slot: 'tags',
            defaultOpen: false
          }] : [])
        ]"
        type="multiple"
      >
        <!-- Higher Levels Slot -->
        <template v-if="spell.higher_levels" #higher-levels>
          <div class="p-4">
            <p class="text-gray-700 dark:text-gray-300">{{ spell.higher_levels }}</p>
          </div>
        </template>

        <!-- Effects Slot -->
        <template v-if="spellEffects.length > 0" #effects>
          <UiAccordionDamageEffects :effects="spellEffects" />
        </template>

        <!-- Classes Slot -->
        <template v-if="spell.classes && spell.classes.length > 0" #classes>
          <UiAccordionBadgeList :items="spell.classes" color="primary" />
        </template>

        <!-- Source Slot -->
        <template v-if="spell.sources && spell.sources.length > 0" #source>
          <UiSourceDisplay :sources="spell.sources" />
        </template>

        <!-- Tags Slot -->
        <template v-if="spell.tags && spell.tags.length > 0" #tags>
          <UiTagsDisplay :tags="spell.tags" />
        </template>
      </UAccordion>

      <!-- JSON Debug Panel -->
      <JsonDebugPanel :data="spell" title="Spell Data" />
    </div>
  </div>
</template>
