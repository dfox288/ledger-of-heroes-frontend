<!-- app/pages/characters/[publicId]/features.vue -->
<script setup lang="ts">
/**
 * Features Page
 *
 * Dedicated page for character features with accordion layout,
 * search/filter, and expand/collapse all functionality.
 *
 * Uses useCharacterSubPage for shared data fetching and play state initialization.
 *
 * @see Issue #558 - Features tab implementation
 * @see Issue #621 - Consolidated data fetching
 */

import type { CharacterFeature } from '~/types/character'

const route = useRoute()
const publicId = computed(() => route.params.publicId as string)
const { apiFetch } = useApi()

// Shared character data + play state initialization
const { character, isSpellcaster, loading, refreshCharacter, addPendingState }
  = useCharacterSubPage(publicId)

// Fetch features data (page-specific)
const { data: featuresData, pending: featuresPending } = await useAsyncData(
  `character-${publicId.value}-features`,
  () => apiFetch<{ data: CharacterFeature[] }>(`/characters/${publicId.value}/features`)
)

// Register pending state so it's included in loading
addPendingState(featuresPending)

const features = computed(() => featuresData.value?.data ?? [])

// Get feature selections from character data (infusions, invocations, etc.)
const featureSelections = computed(() => character.value?.feature_selections ?? [])

useSeoMeta({
  title: () => character.value ? `${character.value.name} - Features` : 'Features'
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <!-- Loading State -->
    <div
      v-if="loading"
      data-testid="loading-skeleton"
      class="space-y-4"
    >
      <USkeleton class="h-32 w-full" />
      <USkeleton class="h-64 w-full" />
    </div>

    <!-- Main Content -->
    <template v-else-if="character">
      <!-- Unified Page Header -->
      <CharacterPageHeader
        :character="character"
        :is-spellcaster="isSpellcaster"
        :back-to="`/characters/${publicId}`"
        back-label="Back to Character"
        @updated="refreshCharacter"
      />

      <!-- Features Content -->
      <div class="mt-6 space-y-8">
        <CharacterSheetFeaturesPanel :features="features" />

        <!-- Optional Features (Infusions, Invocations, etc.) -->
        <CharacterSheetOptionalFeaturesPanel :feature-selections="featureSelections" />
      </div>
    </template>
  </div>
</template>
