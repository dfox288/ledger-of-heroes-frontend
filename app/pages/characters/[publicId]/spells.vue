<!-- app/pages/characters/[publicId]/spells.vue -->
<script setup lang="ts">
/**
 * Spells Page
 *
 * Dedicated page for character spell management.
 * Shows spellcasting stats, spell slots, and all known spells
 * grouped by level with expandable cards.
 *
 * Uses useCharacterSubPage for shared data fetching and play state initialization.
 *
 * @see Issue #556 - Spells Tab implementation
 * @see Issue #621 - Consolidated data fetching
 */

import type { CharacterSpell } from '~/types/character'
import { formatSpellLevel } from '~/composables/useSpellFormatters'
import { formatModifier } from '~/composables/useCharacterStats'

const route = useRoute()
const publicId = computed(() => route.params.publicId as string)
const { apiFetch } = useApi()

// Shared character data + play state initialization
const { character, stats, isSpellcaster, loading, refreshCharacter, addPendingState } =
  useCharacterSubPage(publicId)

// Fetch spells data (page-specific)
const { data: spellsData, pending: spellsPending } = await useAsyncData(
  `character-${publicId.value}-spells`,
  () => apiFetch<{ data: CharacterSpell[] }>(`/characters/${publicId.value}/spells`)
)

// Fetch spell slots for detailed tracking (page-specific)
interface SpellSlotsResponse {
  slots: Record<string, { total: number, spent: number, available: number }>
  pact_magic: { level: number, count: number } | null
  preparation_limit: number | null
  prepared_count: number
}
const { data: slotsData, pending: slotsPending } = await useAsyncData(
  `character-${publicId.value}-spell-slots`,
  () => apiFetch<{ data: SpellSlotsResponse }>(`/characters/${publicId.value}/spell-slots`)
)

// Register pending states so they're included in loading
addPendingState(spellsPending)
addPendingState(slotsPending)

const spellSlots = computed(() => slotsData.value?.data ?? null)

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
              {{ formatSpellLevel(level) }} Level
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
