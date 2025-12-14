<!-- app/pages/characters/[publicId]/spells.vue -->
<script setup lang="ts">
/**
 * Spells Page
 *
 * Dedicated page for character spell management.
 * Shows spellcasting stats, spell slots, and all known spells
 * grouped by level with expandable cards.
 *
 * Uses CharacterPageHeader for unified header with play mode, inspiration, etc.
 *
 * @see Issue #556 - Spells Tab implementation
 */

import type { Character, CharacterSpell } from '~/types/character'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

const route = useRoute()
const publicId = computed(() => route.params.publicId as string)
const { apiFetch } = useApi()

// Play State Store
const playStateStore = useCharacterPlayStateStore()

// Fetch character data (needed for PageHeader)
const { data: characterData, pending: characterPending, refresh: refreshCharacter } = await useAsyncData(
  `spells-character-${publicId.value}`,
  () => apiFetch<{ data: Character }>(`/characters/${publicId.value}`)
)

// Fetch spells data
const { data: spellsData, pending: spellsPending } = await useAsyncData(
  `spells-data-${publicId.value}`,
  () => apiFetch<{ data: CharacterSpell[] }>(`/characters/${publicId.value}/spells`)
)

// Fetch stats for spellcasting info
interface StatsResponse {
  spellcasting?: {
    ability: string
    ability_modifier: number
    spell_save_dc: number
    spell_attack_bonus: number
  } | null
  spell_slots?: Record<string, number>
  prepared_spell_count?: number
  preparation_limit?: number | null
  hit_points?: { current: number | null, max: number | null, temporary?: number | null }
}
const { data: statsData, pending: statsPending } = await useAsyncData(
  `spells-stats-${publicId.value}`,
  () => apiFetch<{ data: StatsResponse }>(`/characters/${publicId.value}/stats`)
)

// Fetch spell slots for detailed tracking
interface SpellSlotsResponse {
  slots: Record<string, { total: number, spent: number, available: number }>
  pact_magic: { level: number, count: number } | null
  preparation_limit: number | null
  prepared_count: number
}
const { data: slotsData, pending: slotsPending } = await useAsyncData(
  `spells-slots-${publicId.value}`,
  () => apiFetch<{ data: SpellSlotsResponse }>(`/characters/${publicId.value}/spell-slots`)
)

// Track initial load vs refresh
const hasLoadedOnce = ref(false)
const loading = computed(() => {
  if (hasLoadedOnce.value) return false
  return characterPending.value || spellsPending.value || statsPending.value || slotsPending.value
})

watch(
  () => !characterPending.value && !spellsPending.value && !statsPending.value && !slotsPending.value,
  (allLoaded) => {
    if (allLoaded && !hasLoadedOnce.value) {
      hasLoadedOnce.value = true
    }
  },
  { immediate: true }
)

const character = computed(() => characterData.value?.data ?? null)
const stats = computed(() => statsData.value?.data ?? null)
const spellSlots = computed(() => slotsData.value?.data ?? null)
const isSpellcaster = computed(() => !!stats.value?.spellcasting)

// Filter and group spells
const validSpells = computed(() =>
  (spellsData.value?.data ?? []).filter(s => s.spell !== null)
)
const cantrips = computed(() =>
  validSpells.value.filter(s => s.spell!.level === 0)
)
const leveledSpells = computed(() =>
  validSpells.value.filter(s => s.spell!.level > 0)
)

// Group leveled spells by level
const spellsByLevel = computed(() => {
  const grouped: Record<number, CharacterSpell[]> = {}
  for (const spell of leveledSpells.value) {
    const level = spell.spell!.level
    if (!grouped[level]) grouped[level] = []
    grouped[level].push(spell)
  }
  // Sort by spell name within each level
  for (const level in grouped) {
    grouped[level]!.sort((a, b) => a.spell!.name.localeCompare(b.spell!.name))
  }
  return grouped
})

// Get sorted level keys
const sortedLevels = computed(() =>
  Object.keys(spellsByLevel.value).map(Number).sort((a, b) => a - b)
)

/**
 * Format spell level as ordinal
 */
function formatLevelOrdinal(level: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = level % 100
  const suffix = (v - 20 >= 0 && v - 20 < 10 && suffixes[v - 20]) || suffixes[v] || 'th'
  return `${level}${suffix}`
}

/**
 * Format modifier with sign
 */
function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`
}

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
  title: () => character.value ? `${character.value.name} - Spells` : 'Spells'
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
      <USkeleton class="h-24 w-full" />
      <USkeleton class="h-64 w-full" />
    </div>

    <!-- Main Content -->
    <template v-else-if="character">
      <div data-testid="spells-layout">
        <!-- Unified Page Header -->
        <CharacterPageHeader
          :character="character"
          :is-spellcaster="isSpellcaster"
          :back-to="`/characters/${publicId}`"
          back-label="Back to Character"
          @updated="refreshCharacter"
        />

        <!-- Non-spellcaster message -->
        <div
          v-if="!isSpellcaster"
          class="mt-6 text-center py-12 text-gray-500 dark:text-gray-400"
        >
          <UIcon
            name="i-heroicons-x-circle"
            class="w-12 h-12 mx-auto mb-4"
          />
          <p class="text-lg">
            This character cannot cast spells.
          </p>
          <NuxtLink
            :to="`/characters/${publicId}`"
            class="text-primary-500 hover:underline mt-2 inline-block"
          >
            Return to character sheet
          </NuxtLink>
        </div>

        <!-- Spellcaster Content -->
        <template v-else>
          <!-- Spellcasting Stats Bar -->
          <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="flex flex-wrap gap-6 items-center justify-between">
              <!-- Stats -->
              <div class="flex gap-4 flex-wrap">
                <div class="text-center">
                  <div class="text-xs text-gray-500 uppercase">
                    Spell DC
                  </div>
                  <div class="text-2xl font-bold">
                    {{ stats?.spellcasting?.spell_save_dc }}
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-xs text-gray-500 uppercase">
                    Attack
                  </div>
                  <div class="text-2xl font-bold">
                    {{ formatModifier(stats?.spellcasting?.spell_attack_bonus ?? 0) }}
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-xs text-gray-500 uppercase">
                    Ability
                  </div>
                  <div class="text-2xl font-bold">
                    {{ stats?.spellcasting?.ability }}
                  </div>
                </div>
              </div>

              <!-- Preparation Counter -->
              <div
                v-if="spellSlots?.preparation_limit !== null"
                class="text-center"
              >
                <div class="text-xs text-gray-500 uppercase">
                  Prepared
                </div>
                <div class="text-lg font-medium">
                  {{ spellSlots?.prepared_count ?? 0 }} / {{ spellSlots?.preparation_limit }}
                </div>
              </div>
            </div>
          </div>

          <!-- Spell Slots -->
          <div
            v-if="spellSlots?.slots && Object.keys(spellSlots.slots).length > 0"
            class="mt-6"
          >
            <CharacterSheetSpellSlots
              :spell-slots="Object.fromEntries(
                Object.entries(spellSlots.slots).map(([k, v]) => [k, v.total])
              )"
              :pact-slots="spellSlots.pact_magic ? { count: spellSlots.pact_magic.count, level: spellSlots.pact_magic.level } : null"
            />
          </div>

          <!-- Cantrips Section -->
          <div
            v-if="cantrips.length > 0"
            class="mt-8"
          >
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Cantrips
            </h3>
            <div class="space-y-2">
              <CharacterSheetSpellCard
                v-for="spell in cantrips"
                :key="spell.id"
                :spell="spell"
              />
            </div>
          </div>

          <!-- Leveled Spells by Level -->
          <div
            v-for="level in sortedLevels"
            :key="level"
            class="mt-8"
          >
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {{ formatLevelOrdinal(level) }} Level
            </h3>
            <div class="space-y-2">
              <CharacterSheetSpellCard
                v-for="spell in spellsByLevel[level]"
                :key="spell.id"
                :spell="spell"
              />
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="validSpells.length === 0"
            class="mt-8 text-center py-12 text-gray-500 dark:text-gray-400"
          >
            <UIcon
              name="i-heroicons-sparkles"
              class="w-12 h-12 mx-auto mb-4"
            />
            <p class="text-lg">
              No spells known yet.
            </p>
            <p class="text-sm mt-2">
              Learn spells through the character builder.
            </p>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
