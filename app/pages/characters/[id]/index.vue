<!-- app/pages/characters/[id].vue -->
<script setup lang="ts">
import type { Character } from '~/types'

/**
 * Character Detail Page
 *
 * Displays a single character's information.
 * This is a placeholder that will evolve into a full character sheet.
 */

const route = useRoute()
const characterId = computed(() => route.params.id as string)

const { apiFetch } = useApi()

const { data, pending, error } = await useAsyncData(
  `character-${characterId.value}`,
  () => apiFetch<{ data: Character }>(`/characters/${characterId.value}`)
)

const character = computed(() => data.value?.data)

useSeoMeta({
  title: () => character.value?.name ?? 'Character',
  description: () => `View ${character.value?.name ?? 'character'} details`
})

/**
 * Format ability score with modifier
 */
function formatAbilityScore(score: number | null): string {
  if (score === null) return '—'
  const modifier = Math.floor((score - 10) / 2)
  const sign = modifier >= 0 ? '+' : ''
  return `${score} (${sign}${modifier})`
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Back Link -->
    <UButton
      to="/characters"
      variant="ghost"
      icon="i-heroicons-arrow-left"
      class="mb-6"
    >
      Back to Characters
    </UButton>

    <!-- Loading State -->
    <div
      v-if="pending"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-gray-400"
      />
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      color="error"
      icon="i-heroicons-exclamation-triangle"
      title="Failed to load character"
      :description="error.message"
    />

    <!-- Character Info -->
    <div
      v-else-if="character"
      class="space-y-6"
    >
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ character.name }}
          </h1>
          <p class="mt-1 text-gray-600 dark:text-gray-400">
            Level {{ character.level }}
            <span v-if="character.race">{{ character.race.name }}</span>
            <span v-if="character.class">{{ character.class.name }}</span>
          </p>
        </div>
        <UBadge
          :color="character.is_complete ? 'success' : 'warning'"
          variant="subtle"
          size="lg"
        >
          {{ character.is_complete ? 'Complete' : 'Draft' }}
        </UBadge>
      </div>

      <!-- Validation Status (for drafts) -->
      <UAlert
        v-if="!character.is_complete && character.validation_status?.missing?.length"
        color="warning"
        icon="i-heroicons-exclamation-triangle"
        title="Character Incomplete"
      >
        <template #description>
          <p>Missing: {{ character.validation_status.missing.join(', ') }}</p>
          <UButton
            to="/characters/create"
            size="sm"
            class="mt-2"
          >
            Continue Building
          </UButton>
        </template>
      </UAlert>

      <!-- Core Info Cards -->
      <div class="grid md:grid-cols-3 gap-4">
        <!-- Race -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">
              Race
            </h3>
          </template>
          <p v-if="character.race">
            {{ character.race.name }}
          </p>
          <p
            v-else
            class="text-gray-400 italic"
          >
            Not selected
          </p>
        </UCard>

        <!-- Class -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">
              Class
            </h3>
          </template>
          <p v-if="character.class">
            {{ character.class.name }}
          </p>
          <p
            v-else
            class="text-gray-400 italic"
          >
            Not selected
          </p>
        </UCard>

        <!-- Background -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">
              Background
            </h3>
          </template>
          <p v-if="character.background">
            {{ character.background.name }}
          </p>
          <p
            v-else
            class="text-gray-400 italic"
          >
            Not selected
          </p>
        </UCard>
      </div>

      <!-- Ability Scores -->
      <UCard>
        <template #header>
          <h3 class="font-semibold">
            Ability Scores
          </h3>
        </template>
        <div class="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
          <div
            v-for="(score, ability) in character.ability_scores"
            :key="ability"
            class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div class="text-xs font-medium text-gray-500 uppercase">
              {{ ability }}
            </div>
            <div class="text-lg font-bold mt-1">
              {{ formatAbilityScore(score) }}
            </div>
          </div>
        </div>
      </UCard>

      <!-- Combat Stats (if available) -->
      <div
        v-if="character.max_hit_points || character.armor_class"
        class="grid md:grid-cols-3 gap-4"
      >
        <UCard v-if="character.max_hit_points">
          <template #header>
            <h3 class="font-semibold">
              Hit Points
            </h3>
          </template>
          <div class="text-2xl font-bold">
            {{ character.current_hit_points ?? character.max_hit_points }} / {{ character.max_hit_points }}
          </div>
        </UCard>

        <UCard v-if="character.armor_class">
          <template #header>
            <h3 class="font-semibold">
              Armor Class
            </h3>
          </template>
          <div class="text-2xl font-bold">
            {{ character.armor_class }}
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="font-semibold">
              Proficiency Bonus
            </h3>
          </template>
          <div class="text-2xl font-bold">
            +{{ character.proficiency_bonus }}
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
