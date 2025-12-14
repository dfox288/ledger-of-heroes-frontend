<!-- app/pages/characters/[publicId]/features.vue -->
<script setup lang="ts">
/**
 * Features Page
 *
 * Dedicated page for character features with accordion layout,
 * search/filter, and expand/collapse all functionality.
 *
 * Uses CharacterPageHeader for unified header with play mode, inspiration, etc.
 * Uses characterPlayState store for play mode state persistence.
 *
 * @see Issue #558 - Features tab implementation
 */

import type { Character, CharacterFeature } from '~/types/character'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

const route = useRoute()
const publicId = computed(() => route.params.publicId as string)
const { apiFetch } = useApi()

// Play State Store
const playStateStore = useCharacterPlayStateStore()

// Fetch character data (needed for PageHeader)
const { data: characterData, pending: characterPending, refresh: refreshCharacter } = await useAsyncData(
  `features-character-${publicId.value}`,
  () => apiFetch<{ data: Character }>(`/characters/${publicId.value}`)
)

// Fetch features data
const { data: featuresData, pending: featuresPending } = await useAsyncData(
  `features-data-${publicId.value}`,
  () => apiFetch<{ data: CharacterFeature[] }>(`/characters/${publicId.value}/features`)
)

// Fetch stats for spellcaster check and HP (for store init)
interface StatsResponse {
  spellcasting?: unknown
  hit_points?: { current: number | null, max: number | null, temporary?: number | null }
}
const { data: statsData, pending: statsPending } = await useAsyncData(
  `features-stats-${publicId.value}`,
  () => apiFetch<{ data: StatsResponse }>(
    `/characters/${publicId.value}/stats`
  )
)

// Track initial load vs refresh - only show skeleton on initial load
const hasLoadedOnce = ref(false)
const loading = computed(() => {
  if (hasLoadedOnce.value) return false
  return characterPending.value || featuresPending.value || statsPending.value
})

// Mark as loaded once all data is available
watch(
  () => !characterPending.value && !featuresPending.value && !statsPending.value,
  (allLoaded) => {
    if (allLoaded && !hasLoadedOnce.value) {
      hasLoadedOnce.value = true
    }
  },
  { immediate: true }
)

const character = computed(() => characterData.value?.data ?? null)
const features = computed(() => featuresData.value?.data ?? [])
const isSpellcaster = computed(() => !!statsData.value?.data?.spellcasting)

// Initialize play state store when character and stats load
watch([character, statsData], ([char, s]) => {
  if (char && s?.data) {
    playStateStore.initialize({
      characterId: char.id,
      isDead: char.is_dead ?? false,
      hitPoints: {
        current: s.data.hit_points?.current ?? null,
        max: s.data.hit_points?.max ?? null,
        temporary: s.data.hit_points?.temporary ?? null
      },
      deathSaves: {
        successes: char.death_save_successes ?? 0,
        failures: char.death_save_failures ?? 0
      },
      currency: char.currency ?? { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
    })
  }
}, { immediate: true })

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
      <div class="mt-6">
        <CharacterSheetFeaturesPanel :features="features" />
      </div>
    </template>
  </div>
</template>
