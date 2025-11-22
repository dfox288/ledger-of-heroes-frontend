<script setup lang="ts">
import type { Race } from '~/types/api/entities'
import type { BadgeColor, BadgeSize, BadgeVariant } from '~/utils/badgeColors'
import { getSizeColor } from '~/utils/badgeColors'

const route = useRoute()

// Fetch race data and setup SEO
const { data: race, loading, error } = useEntityDetail<Race>({
  slug: route.params.slug as string,
  endpoint: '/races',
  cacheKey: 'race',
  seo: {
    titleTemplate: name => `${name} - D&D 5e Race`,
    descriptionExtractor: (race: unknown) => {
      const r = race as { description?: string, name?: string }
      return r.description?.substring(0, 160) || `Learn about the ${r.name} race in D&D 5e`
    },
    fallbackTitle: 'Race - D&D 5e Compendium'
  }
})

/**
 * Get size color for badge
 */
const sizeColor = computed(() => {
  if (!race.value?.size) return 'info'
  return getSizeColor(race.value.size.code)
})

/**
 * Get entity image path (512px variant)
 */
const { getImagePath } = useEntityImage()
const imagePath = computed(() => {
  if (!race.value) return null
  return getImagePath('races', race.value.slug, 512)
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Loading State -->
    <UiDetailPageLoading
      v-if="loading"
      entity-type="race"
    />

    <!-- Error State -->
    <UiDetailPageError
      v-else-if="error"
      entity-type="Race"
    />

    <!-- Race Content -->
    <div
      v-else-if="race"
      class="space-y-8"
    >
      <!-- Breadcrumb Navigation -->
      <UiBackLink
        to="/races"
        label="Back to Races"
      />

      <!-- Header - UPDATED -->
      <UiDetailPageHeader
        :title="race.name"
        :badges="[
          ...(race.size ? [{ label: race.size.name, color: sizeColor as unknown as BadgeColor, variant: 'subtle' as BadgeVariant, size: 'lg' as BadgeSize }] : []),
          { label: race.parent_race ? 'Subrace' : 'Race', color: (race.parent_race ? 'primary' : 'info') as BadgeColor, variant: 'subtle' as BadgeVariant, size: 'lg' as BadgeSize }
        ]"
      />

      <!-- Quick Stats -->
      <UiDetailQuickStatsCard
        :stats="[
          ...(race.size ? [{ icon: 'i-heroicons-user', label: 'Size', value: race.size.name }] : []),
          ...(race.speed ? [{ icon: 'i-heroicons-bolt', label: 'Speed', value: `${race.speed} ft.` }] : [])
        ]"
      />

      <!-- Description + Image - NEW -->
      <UiDetailDescriptionWithImage
        v-if="race.description"
        :description="race.description"
        :image-path="imagePath"
        :image-alt="`${race.name} character portrait`"
      />

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
        <template
          v-if="race.parent_race"
          #parent
        >
          <div class="p-4">
            <NuxtLink :to="`/races/${race.parent_race.slug}`">
              <UButton
                color="primary"
                variant="soft"
              >
                View {{ race.parent_race.name }}
              </UButton>
            </NuxtLink>
          </div>
        </template>

        <!-- Subraces Slot -->
        <template
          v-if="race.subraces && race.subraces.length > 0"
          #subraces
        >
          <UiAccordionEntityGrid
            :entities="race.subraces"
            base-path="/races"
          />
        </template>

        <!-- Traits Slot -->
        <template
          v-if="race.traits && race.traits.length > 0"
          #traits
        >
          <UiAccordionTraitsList
            :traits="race.traits"
            border-color="primary-500"
          />
        </template>

        <!-- Languages Slot -->
        <template
          v-if="race.languages && race.languages.length > 0"
          #languages
        >
          <UiAccordionBadgeList
            :items="race.languages.map(l => l.language)"
            color="neutral"
          />
        </template>

        <!-- Modifiers Slot -->
        <template
          v-if="race.modifiers && race.modifiers.length > 0"
          #modifiers
        >
          <UiModifiersDisplay :modifiers="race.modifiers" />
        </template>

        <!-- Proficiencies Slot -->
        <template
          v-if="race.proficiencies && race.proficiencies.length > 0"
          #proficiencies
        >
          <UiAccordionBulletList :items="race.proficiencies" />
        </template>

        <!-- Spells Slot -->
        <template
          v-if="race.spells && race.spells.length > 0"
          #spells
        >
          <UiAccordionBadgeList
            :items="race.spells"
            color="primary"
          />
        </template>

        <!-- Conditions Slot -->
        <template
          v-if="race.conditions && race.conditions.length > 0"
          #conditions
        >
          <div class="p-4 space-y-3">
            <div
              v-for="conditionRelation in race.conditions"
              :key="conditionRelation.id"
              class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div class="flex items-start gap-3">
                <UBadge
                  color="warning"
                  variant="soft"
                >
                  {{ conditionRelation.condition?.name }}
                </UBadge>
                <div class="flex-1">
                  <div
                    v-if="conditionRelation.effect_type"
                    class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1"
                  >
                    Effect: {{ conditionRelation.effect_type.charAt(0).toUpperCase() + conditionRelation.effect_type.slice(1) }}
                  </div>
                  <div class="text-sm text-gray-700 dark:text-gray-300">
                    {{ conditionRelation.condition?.description }}
                  </div>
                  <div
                    v-if="conditionRelation.description"
                    class="text-sm text-gray-600 dark:text-gray-400 mt-2 italic"
                  >
                    {{ conditionRelation.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Source Slot -->
        <template
          v-if="race.sources && race.sources.length > 0"
          #source
        >
          <UiSourceDisplay :sources="race.sources" />
        </template>

        <!-- Tags Slot -->
        <template
          v-if="race.tags && race.tags.length > 0"
          #tags
        >
          <UiTagsDisplay :tags="race.tags" />
        </template>
      </UAccordion>

      <!-- JSON Debug Panel -->
      <JsonDebugPanel
        :data="race"
        title="Race Data"
      />
    </div>
  </div>
</template>
