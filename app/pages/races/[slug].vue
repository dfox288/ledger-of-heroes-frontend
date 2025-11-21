<script setup lang="ts">
const { apiFetch } = useApi()
const route = useRoute()
const slug = route.params.slug as string

// Fetch race data using useAsyncData for SSR support (via Nitro proxy)
const { data: race, error, pending } = await useAsyncData(
  `race-${slug}`,
  async () => {
    const response = await apiFetch(`/races/${slug}`)
    return response.data
  }
)

// Set page meta
useSeoMeta({
  title: computed(() => race.value ? `${race.value.name} - D&D 5e Race` : 'Race - D&D 5e Compendium'),
  description: computed(() => race.value?.description?.substring(0, 160) || `Learn about the ${race.value?.name} race in D&D 5e`),
})

/**
 * Get size color based on size code (NuxtUI v4 semantic colors)
 */
const getSizeColor = computed(() => {
  if (!race.value?.size) return 'info'
  const colors: Record<string, string> = {
    'T': 'neutral',    // Tiny - gray
    'S': 'success',    // Small - green
    'M': 'info',       // Medium - blue
    'L': 'warning',    // Large - amber
    'H': 'error',      // Huge - red
    'G': 'error'       // Gargantuan - red
  }
  return colors[race.value.size.code] || 'info'
})

</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Loading State -->
    <UiDetailPageLoading v-if="pending" entityType="race" />

    <!-- Error State -->
    <UiDetailPageError v-else-if="error" entityType="Race" />

    <!-- Race Content -->
    <div v-else-if="race" class="space-y-8">
      <!-- Breadcrumb Navigation -->
      <UiBackLink to="/races" label="Back to Races" />

      <!-- Header -->
      <UiDetailPageHeader
        :title="race.name"
        :badges="[
          ...(race.size ? [{ label: race.size.name, color: getSizeColor, variant: 'subtle', size: 'lg' }] : []),
          { label: race.parent_race ? 'Subrace' : 'Race', color: race.parent_race ? 'primary' : 'info', variant: 'subtle', size: 'lg' }
        ]"
      />

      <!-- Quick Stats -->
      <UiDetailQuickStatsCard
        :stats="[
          ...(race.size ? [{ icon: 'i-heroicons-user', label: 'Size', value: race.size.name }] : []),
          ...(race.speed ? [{ icon: 'i-heroicons-bolt', label: 'Speed', value: `${race.speed} ft.` }] : [])
        ]"
      />

      <!-- Description (Always Visible) -->
      <UCard v-if="race.description">
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Description
          </h2>
        </template>
        <div class="prose dark:prose-invert max-w-none">
          <p class="whitespace-pre-line text-base text-gray-700 dark:text-gray-300 leading-relaxed">{{ race.description }}</p>
        </div>
      </UCard>

      <!-- Ability Score Increases (Always Visible) -->
      <UCard v-if="race.ability_score_increases && race.ability_score_increases.length > 0">
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Ability Score Increases
          </h2>
        </template>
        <div class="flex flex-wrap gap-3">
          <div
            v-for="increase in race.ability_score_increases"
            :key="increase.id"
            class="px-4 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20"
          >
            <span class="font-semibold text-gray-900 dark:text-gray-100">
              {{ increase.ability_score.code }}
            </span>
            <span class="text-primary-600 dark:text-primary-400 ml-1">
              +{{ increase.value }}
            </span>
          </div>
        </div>
      </UCard>

      <!-- Additional Details (Accordion) -->
      <UAccordion
        :items="[
          ...(race.parent_race ? [{
            label: 'Parent Race',
            slot: 'parent',
            defaultOpen: false
          }] : []),
          ...(race.subraces && race.subraces.length > 0 ? [{
            label: 'Subraces',
            slot: 'subraces',
            defaultOpen: false
          }] : []),
          ...(race.traits && race.traits.length > 0 ? [{
            label: 'Racial Traits',
            slot: 'traits',
            defaultOpen: false
          }] : []),
          ...(race.modifiers && race.modifiers.length > 0 ? [{
            label: 'Modifiers',
            slot: 'modifiers',
            defaultOpen: false
          }] : []),
          ...(race.languages && race.languages.length > 0 ? [{
            label: 'Languages',
            slot: 'languages',
            defaultOpen: false
          }] : []),
          ...(race.proficiencies && race.proficiencies.length > 0 ? [{
            label: 'Proficiencies',
            slot: 'proficiencies',
            defaultOpen: false
          }] : []),
          ...(race.spells && race.spells.length > 0 ? [{
            label: 'Spells',
            slot: 'spells',
            defaultOpen: false
          }] : []),
          ...(race.conditions && race.conditions.length > 0 ? [{
            label: 'Conditions',
            slot: 'conditions',
            defaultOpen: false
          }] : []),
          ...(race.sources && race.sources.length > 0 ? [{
            label: 'Source',
            slot: 'source',
            defaultOpen: false
          }] : []),
          ...(race.tags && race.tags.length > 0 ? [{
            label: 'Tags',
            slot: 'tags',
            defaultOpen: false
          }] : [])
        ]"
        type="multiple"
      >
        <!-- Parent Race Slot -->
        <template v-if="race.parent_race" #parent>
          <div class="p-4">
            <NuxtLink :to="`/races/${race.parent_race.slug}`">
              <UButton color="primary" variant="soft">
                View {{ race.parent_race.name }}
              </UButton>
            </NuxtLink>
          </div>
        </template>

        <!-- Subraces Slot -->
        <template v-if="race.subraces && race.subraces.length > 0" #subraces>
          <UiAccordionEntityGrid :entities="race.subraces" basePath="/races" />
        </template>

        <!-- Traits Slot -->
        <template v-if="race.traits && race.traits.length > 0" #traits>
          <UiAccordionTraitsList :traits="race.traits" borderColor="primary-500" />
        </template>

        <!-- Languages Slot -->
        <template v-if="race.languages && race.languages.length > 0" #languages>
          <UiAccordionBadgeList :items="race.languages.map(l => l.language)" color="neutral" />
        </template>

        <!-- Modifiers Slot -->
        <template v-if="race.modifiers && race.modifiers.length > 0" #modifiers>
          <UiModifiersDisplay :modifiers="race.modifiers" />
        </template>

        <!-- Proficiencies Slot -->
        <template v-if="race.proficiencies && race.proficiencies.length > 0" #proficiencies>
          <UiAccordionBulletList :items="race.proficiencies" />
        </template>

        <!-- Spells Slot -->
        <template v-if="race.spells && race.spells.length > 0" #spells>
          <UiAccordionBadgeList :items="race.spells" color="primary" />
        </template>

        <!-- Conditions Slot -->
        <template v-if="race.conditions && race.conditions.length > 0" #conditions>
          <div class="p-4 space-y-3">
            <div
              v-for="conditionRelation in race.conditions"
              :key="conditionRelation.id"
              class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div class="flex items-start gap-3">
                <UBadge color="warning" variant="soft">
                  {{ conditionRelation.condition.name }}
                </UBadge>
                <div class="flex-1">
                  <div v-if="conditionRelation.effect_type" class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Effect: {{ conditionRelation.effect_type.charAt(0).toUpperCase() + conditionRelation.effect_type.slice(1) }}
                  </div>
                  <div class="text-sm text-gray-700 dark:text-gray-300">
                    {{ conditionRelation.condition.description }}
                  </div>
                  <div v-if="conditionRelation.description" class="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                    {{ conditionRelation.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Source Slot -->
        <template v-if="race.sources && race.sources.length > 0" #source>
          <UiSourceDisplay :sources="race.sources" />
        </template>

        <!-- Tags Slot -->
        <template v-if="race.tags && race.tags.length > 0" #tags>
          <UiTagsDisplay :tags="race.tags" />
        </template>
      </UAccordion>

      <!-- JSON Debug Panel -->
      <JsonDebugPanel :data="race" title="Race Data" />
    </div>
  </div>
</template>
