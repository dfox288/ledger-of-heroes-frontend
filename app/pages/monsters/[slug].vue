<script setup lang="ts">
import type { Monster } from '~/types/api/entities'
import { getChallengeRatingColor } from '~/utils/badgeColors'

const route = useRoute()

// Fetch monster data and setup SEO
const { data: monster, loading, error } = useEntityDetail<Monster>({
  slug: route.params.slug as string,
  endpoint: '/monsters',
  cacheKey: 'monster',
  seo: {
    titleTemplate: name => `${name} - D&D 5e Monster`,
    descriptionExtractor: (monster: unknown) => {
      const m = monster as { description?: string }
      return m.description?.substring(0, 160) || ''
    },
    fallbackTitle: 'Monster - D&D 5e Compendium'
  }
})

/**
 * Format speeds into readable text
 */
const speedText = computed(() => {
  if (!monster.value) return ''
  const speeds: string[] = []

  if (monster.value.speed_walk) speeds.push(`${monster.value.speed_walk} ft.`)
  if (monster.value.speed_fly) speeds.push(`fly ${monster.value.speed_fly} ft.${monster.value.can_hover ? ' (hover)' : ''}`)
  if (monster.value.speed_swim) speeds.push(`swim ${monster.value.speed_swim} ft.`)
  if (monster.value.speed_burrow) speeds.push(`burrow ${monster.value.speed_burrow} ft.`)
  if (monster.value.speed_climb) speeds.push(`climb ${monster.value.speed_climb} ft.`)

  return speeds.join(', ')
})

/**
 * Quick stats for card display
 */
const quickStats = computed(() => {
  if (!monster.value) return []

  return [
    { icon: 'i-heroicons-arrows-pointing-out', label: 'Size', value: monster.value.size?.name || 'Unknown' },
    { icon: 'i-heroicons-cube', label: 'Type', value: monster.value.type },
    { icon: 'i-heroicons-scale', label: 'Alignment', value: monster.value.alignment || 'Unaligned' },
    { icon: 'i-heroicons-shield-check', label: 'Armor Class', value: monster.value.armor_type ? `${monster.value.armor_class} (${monster.value.armor_type})` : String(monster.value.armor_class) },
    { icon: 'i-heroicons-heart', label: 'Hit Points', value: `${monster.value.hit_points_average} (${monster.value.hit_dice})` },
    { icon: 'i-heroicons-bolt', label: 'Speed', value: speedText.value || 'None' },
    { icon: 'i-heroicons-hand-raised', label: 'STR', value: String(monster.value.strength) },
    { icon: 'i-heroicons-arrow-trending-up', label: 'DEX', value: String(monster.value.dexterity) },
    { icon: 'i-heroicons-heart', label: 'CON', value: String(monster.value.constitution) },
    { icon: 'i-heroicons-light-bulb', label: 'INT', value: String(monster.value.intelligence) },
    { icon: 'i-heroicons-eye', label: 'WIS', value: String(monster.value.wisdom) },
    { icon: 'i-heroicons-sparkles', label: 'CHA', value: String(monster.value.charisma) },
    { icon: 'i-heroicons-star', label: 'Challenge Rating', value: `${monster.value.challenge_rating} (${monster.value.experience_points.toLocaleString()} XP)` }
  ]
})

/**
 * Regular actions (not legendary)
 */
const regularActions = computed(() => {
  if (!monster.value?.actions) return []
  return monster.value.actions.filter(a => a.action_type === 'action')
})

/**
 * Senses array for display
 */
const senses = computed(() => monster.value?.senses ?? [])

/**
 * Languages string for display
 */
const languages = computed(() => monster.value?.languages ?? null)

/**
 * Lair actions for legendary creatures
 */
const lairActions = computed(() => monster.value?.lair_actions ?? [])

/**
 * Get entity image path (512px variant)
 */
const { getImagePath } = useEntityImage()
const imagePath = computed(() => {
  if (!monster.value) return null
  return getImagePath('monsters', monster.value.slug, 512)
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Loading State -->
    <UiDetailPageLoading
      v-if="loading"
      entity-type="monster"
    />

    <!-- Error State -->
    <UiDetailPageError
      v-else-if="error"
      entity-type="Monster"
    />

    <!-- Monster Content -->
    <div
      v-else-if="monster"
      class="space-y-8"
    >
      <!-- Breadcrumb -->
      <UiDetailBreadcrumb
        list-path="/monsters"
        list-label="Monsters"
        :current-label="monster.name"
      />

      <!-- Header -->
      <UiDetailPageHeader
        :title="monster.name"
        :badges="[
          { label: `CR ${monster.challenge_rating}`, color: getChallengeRatingColor(monster.challenge_rating), variant: 'subtle' as const, size: 'lg' as const },
          { label: monster.type, color: 'neutral' as const, variant: 'subtle' as const, size: 'lg' as const },
          ...(monster.legendary_actions && monster.legendary_actions.length > 0 ? [{ label: '⭐ Legendary', color: 'warning' as const, variant: 'soft' as const, size: 'sm' as const }] : [])
        ]"
      />

      <!-- Quick Stats + Image Side-by-Side -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Quick Stats - 2/3 width on large screens -->
        <div class="lg:col-span-2">
          <UiDetailQuickStatsCard :stats="quickStats" />
        </div>

        <!-- Image - 1/3 width on large screens -->
        <div class="lg:col-span-1">
          <UiDetailEntityImage
            :image-path="imagePath"
            :image-alt="`${monster.name} monster illustration`"
          />
        </div>
      </div>

      <!-- Senses & Languages Row -->
      <div
        v-if="senses.length > 0 || languages"
        class="flex flex-wrap items-center gap-4"
      >
        <!-- Senses -->
        <div
          v-if="senses.length > 0"
          class="flex items-center gap-2"
        >
          <UIcon
            name="i-heroicons-eye"
            class="size-5 text-gray-500 dark:text-gray-400 shrink-0"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">
            <span
              v-for="(sense, index) in senses"
              :key="sense.type"
            >{{ sense.name }} {{ sense.range }} ft.<span v-if="sense.is_limited"> (limited)</span><span v-if="index < senses.length - 1">, </span></span>
          </span>
        </div>

        <!-- Languages -->
        <div
          v-if="languages"
          class="flex items-center gap-2"
        >
          <UIcon
            name="i-heroicons-language"
            class="size-5 text-gray-500 dark:text-gray-400 shrink-0"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">
            {{ languages }}
          </span>
        </div>
      </div>

      <!-- Description (full width) -->
      <UiDetailDescriptionCard
        v-if="monster.description"
        :description="monster.description"
      />

      <!-- Additional Details (Accordion) -->
      <UAccordion
        :items="[
          ...(monster.traits && monster.traits.length > 0 ? [{
            label: 'Traits',
            slot: 'traits',
            defaultOpen: false
          }] : []),
          ...(regularActions.length > 0 ? [{
            label: 'Actions',
            slot: 'actions',
            defaultOpen: false
          }] : []),
          ...(monster.legendary_actions && monster.legendary_actions.length > 0 ? [{
            label: 'Legendary Actions',
            slot: 'legendary',
            defaultOpen: false
          }] : []),
          ...(lairActions.length > 0 ? [{
            label: 'Lair Actions',
            slot: 'lair',
            defaultOpen: false
          }] : []),
          ...(monster.spellcasting ? [{
            label: 'Spellcasting',
            slot: 'spellcasting',
            defaultOpen: false
          }] : []),
          ...(monster.modifiers && monster.modifiers.length > 0 ? [{
            label: 'Modifiers',
            slot: 'modifiers',
            defaultOpen: false
          }] : []),
          ...(monster.conditions && monster.conditions.length > 0 ? [{
            label: 'Conditions',
            slot: 'conditions',
            defaultOpen: false
          }] : []),
          ...(monster.sources && monster.sources.length > 0 ? [{
            label: 'Source',
            slot: 'source',
            defaultOpen: false
          }] : [])
        ]"
        type="multiple"
      >
        <!-- Traits Slot -->
        <template
          v-if="monster.traits && monster.traits.length > 0"
          #traits
        >
          <div class="p-4 space-y-4">
            <div
              v-for="trait in monster.traits"
              :key="trait.id || trait.name"
              class="space-y-1"
            >
              <h4 class="font-semibold text-primary-600 dark:text-primary-400">
                {{ trait.name }}
              </h4>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                {{ trait.description }}
              </p>
            </div>
          </div>
        </template>

        <!-- Actions Slot -->
        <template
          v-if="regularActions.length > 0"
          #actions
        >
          <div class="p-4 space-y-4">
            <div
              v-for="action in regularActions"
              :key="action.id || action.name"
              class="space-y-2"
            >
              <!-- Action name -->
              <h4 class="font-semibold text-primary-600 dark:text-primary-400">
                {{ action.name }}
              </h4>
              <!-- Action description -->
              <p class="text-sm text-gray-700 dark:text-gray-300">
                {{ action.description }}
              </p>
            </div>
          </div>
        </template>

        <!-- Legendary Actions Slot -->
        <template
          v-if="monster.legendary_actions && monster.legendary_actions.length > 0"
          #legendary
        >
          <div class="p-4 space-y-4">
            <div
              v-for="action in monster.legendary_actions"
              :key="action.id || action.name"
              class="space-y-2"
            >
              <!-- Action name with cost badge -->
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="font-semibold text-primary-600 dark:text-primary-400">
                  {{ action.name }}
                </h4>
                <UBadge
                  v-if="action.action_cost"
                  color="info"
                  variant="soft"
                  size="md"
                >
                  {{ action.action_cost === 1 ? 'Costs 1 Action' : `Costs ${action.action_cost} Actions` }}
                </UBadge>
              </div>
              <!-- Action description -->
              <p class="text-sm text-gray-700 dark:text-gray-300">
                {{ action.description }}
              </p>
            </div>
          </div>
        </template>

        <!-- Lair Actions Slot -->
        <template
          v-if="lairActions.length > 0"
          #lair
        >
          <div class="p-4 space-y-4">
            <div
              v-for="action in lairActions"
              :key="action.id || action.name"
              class="space-y-2"
            >
              <!-- Action name with cost badge -->
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="font-semibold text-primary-600 dark:text-primary-400">
                  {{ action.name }}
                </h4>
                <UBadge
                  v-if="action.action_cost"
                  color="warning"
                  variant="soft"
                  size="md"
                >
                  {{ action.action_cost === 1 ? 'Costs 1 Action' : `Costs ${action.action_cost} Actions` }}
                </UBadge>
              </div>
              <!-- Action description -->
              <p class="text-sm text-gray-700 dark:text-gray-300">
                {{ action.description }}
              </p>
            </div>
          </div>
        </template>

        <!-- Spellcasting Slot -->
        <template
          v-if="monster.spellcasting"
          #spellcasting
        >
          <div class="p-4 space-y-4">
            <!-- Description -->
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {{ monster.spellcasting.description }}
            </p>

            <!-- Spellcasting Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div
                v-if="monster.spellcasting.spellcasting_ability"
                class="text-center"
              >
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  Ability
                </div>
                <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ monster.spellcasting.spellcasting_ability }}
                </div>
              </div>
              <div
                v-if="monster.spellcasting.spell_save_dc"
                class="text-center"
              >
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  Spell Save DC
                </div>
                <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ monster.spellcasting.spell_save_dc }}
                </div>
              </div>
              <div
                v-if="monster.spellcasting.spell_attack_bonus"
                class="text-center"
              >
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  Spell Attack
                </div>
                <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  +{{ monster.spellcasting.spell_attack_bonus }}
                </div>
              </div>
              <div
                v-if="monster.spellcasting.spell_slots"
                class="text-center"
              >
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  Spell Slots
                </div>
                <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {{ monster.spellcasting.spell_slots }}
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Modifiers Slot -->
        <template
          v-if="monster.modifiers && monster.modifiers.length > 0"
          #modifiers
        >
          <UiModifiersDisplay :modifiers="monster.modifiers" />
        </template>

        <!-- Conditions Slot -->
        <template
          v-if="monster.conditions && monster.conditions.length > 0"
          #conditions
        >
          <UiAccordionConditions
            :conditions="monster.conditions"
            entity-type="monster"
          />
        </template>

        <!-- Source Slot -->
        <template
          v-if="monster.sources && monster.sources.length > 0"
          #source
        >
          <UiSourceDisplay :sources="monster.sources" />
        </template>
      </UAccordion>

      <!-- Bottom Navigation -->
      <UiDetailPageBottomNav
        to="/monsters"
        label="Back to Monsters"
      />

      <!-- Debug Panel -->
      <JsonDebugPanel :data="monster" />
    </div>
  </div>
</template>
