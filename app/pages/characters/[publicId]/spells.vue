<!-- app/pages/characters/[publicId]/spells.vue -->
<script setup lang="ts">
/**
 * Spells Page
 *
 * Dedicated page for character spell management.
 * Shows spellcasting stats, spell slots, and all known spells
 * grouped by level with expandable cards.
 *
 * Supports both single-class and multiclass spellcasters.
 * Multiclass casters see a tabbed interface with per-class stats.
 *
 * Uses useCharacterSubPage for shared data fetching and play state initialization.
 *
 * @see Issue #556 - Spells Tab implementation
 * @see Issue #621 - Consolidated data fetching
 * @see Issue #631 - Multiclass spellcasting support
 */

import { storeToRefs } from 'pinia'
import type { CharacterSpell, ClassSpellcastingInfo, SpellSlotsResponse } from '~/types/character'
import { formatSpellLevel } from '~/composables/useSpellFormatters'
import { formatModifier } from '~/composables/useCharacterStats'
import { getClassColor, getClassName } from '~/utils/classColors'

const route = useRoute()
const publicId = computed(() => route.params.publicId as string)
const { apiFetch } = useApi()

// Shared character data + play state initialization
const { character, stats, isSpellcaster, loading, refreshCharacter, addPendingState, playStateStore }
  = useCharacterSubPage(publicId)

// Get canEdit from store for interactive components
const { canEdit } = storeToRefs(playStateStore)

// Fetch spells data (page-specific)
// dedupe: 'defer' prevents "incompatible handler" warning when navigating to/from overview
const { data: spellsData, pending: spellsPending } = await useAsyncData(
  `character-${publicId.value}-spells`,
  () => apiFetch<{ data: CharacterSpell[] }>(`/characters/${publicId.value}/spells`),
  { dedupe: 'defer' }
)

// Fetch spell slots for detailed tracking (page-specific)
const { data: slotsData, pending: slotsPending } = await useAsyncData(
  `character-${publicId.value}-spell-slots`,
  () => apiFetch<{ data: SpellSlotsResponse }>(`/characters/${publicId.value}/spell-slots`),
  { dedupe: 'defer' }
)

// Register pending states so they're included in loading
addPendingState(spellsPending)
addPendingState(slotsPending)

const spellSlots = computed(() => slotsData.value?.data ?? null)

// Initialize spell slots in store when data loads (enables interactive slot tracking)
watch(slotsData, (data) => {
  if (data?.data?.slots) {
    const slotData = Object.entries(data.data.slots).map(([level, slot]) => ({
      level: parseInt(level),
      total: slot.total,
      spent: slot.spent
    }))
    const pactMagicData = data.data.pact_magic
      ? { level: data.data.pact_magic.level, total: data.data.pact_magic.total, spent: data.data.pact_magic.spent }
      : null
    playStateStore.initializeSpellSlots(slotData, pactMagicData)
  }
}, { immediate: true })

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

// Determine if this is a spellbook caster (wizard)
const preparationMethod = computed(() =>
  (stats.value as { preparation_method?: string | null } | null)?.preparation_method ?? null
)
const isSpellbookCaster = computed(() => preparationMethod.value === 'spellbook')

// ══════════════════════════════════════════════════════════════
// MULTICLASS SPELLCASTING SUPPORT
// ══════════════════════════════════════════════════════════════

/**
 * Extract spellcasting classes from stats
 * Returns array of { slug, info } for each spellcasting class
 */
interface SpellcastingClass {
  slug: string
  slotName: string
  name: string
  color: string
  info: ClassSpellcastingInfo
}

const spellcastingClasses = computed<SpellcastingClass[]>(() => {
  const spellcasting = stats.value?.spellcasting
  if (!spellcasting) return []

  return Object.entries(spellcasting).map(([slug, info]) => ({
    slug,
    slotName: slug.replace(':', '-'), // Safe slot name (e.g., "phb-wizard")
    name: getClassName(slug),
    color: getClassColor(slug),
    info
  }))
})

/**
 * Is this a multiclass spellcaster? (more than one spellcasting class)
 */
const isMulticlassSpellcaster = computed(() => spellcastingClasses.value.length > 1)

/**
 * Primary spellcasting class (first entry, for single-class display)
 */
const primarySpellcasting = computed(() => spellcastingClasses.value[0] ?? null)

/**
 * Active tab for multiclass view
 */
const activeTab = ref(0)

/**
 * Build tab items for multiclass view
 */
const tabItems = computed(() => {
  const items = spellcastingClasses.value.map(sc => ({
    label: sc.name,
    slot: sc.slotName
  }))
  // Add "All Spells" tab at the end
  items.push({ label: 'All Spells', slot: 'all-spells' })
  return items
})

/**
 * Get per-class preparation limit for a given class slug
 */
function getClassPreparationLimit(classSlug: string) {
  return spellSlots.value?.preparation_limits?.[classSlug] ?? null
}

/**
 * Check if we have per-class preparation limits available
 */
const hasPerClassLimits = computed(() =>
  spellSlots.value?.preparation_limits && Object.keys(spellSlots.value.preparation_limits).length > 0
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
          <!-- ══════════════════════════════════════════════════════════════ -->
          <!-- MULTICLASS SPELLCASTER: Tabbed Interface                        -->
          <!-- ══════════════════════════════════════════════════════════════ -->
          <template v-if="isMulticlassSpellcaster">
            <UTabs
              v-model="activeTab"
              :items="tabItems"
              class="mt-6"
            >
              <!-- Per-class tabs -->
              <template
                v-for="sc in spellcastingClasses"
                :key="sc.slug"
                #[sc.slotName]
              >
                <!-- Class Stats Bar -->
                <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                  <div class="flex items-center gap-2 mb-3">
                    <span
                      class="w-3 h-3 rounded-full"
                      :class="`bg-${sc.color}-500`"
                    />
                    <span class="font-semibold text-lg">{{ sc.name }} Spellcasting</span>
                  </div>
                  <div class="flex flex-wrap gap-6 items-center justify-between">
                    <div class="flex gap-4 flex-wrap">
                      <div class="text-center">
                        <div class="text-xs text-gray-500 uppercase">
                          Spell DC
                        </div>
                        <div class="text-2xl font-bold">
                          {{ sc.info.spell_save_dc }}
                        </div>
                      </div>
                      <div class="text-center">
                        <div class="text-xs text-gray-500 uppercase">
                          Attack
                        </div>
                        <div class="text-2xl font-bold">
                          {{ formatModifier(sc.info.spell_attack_bonus) }}
                        </div>
                      </div>
                      <div class="text-center">
                        <div class="text-xs text-gray-500 uppercase">
                          Ability
                        </div>
                        <div class="text-2xl font-bold">
                          {{ sc.info.ability }}
                        </div>
                      </div>
                    </div>
                    <!-- Per-Class Preparation Counter -->
                    <div
                      v-if="hasPerClassLimits && getClassPreparationLimit(sc.slug)"
                      class="text-center"
                      data-testid="class-preparation-limit"
                    >
                      <div class="text-xs text-gray-500 uppercase">
                        {{ sc.name }} Prepared
                      </div>
                      <div class="text-lg font-medium">
                        {{ getClassPreparationLimit(sc.slug)?.prepared ?? 0 }} / {{ getClassPreparationLimit(sc.slug)?.limit ?? 0 }}
                      </div>
                    </div>
                    <!-- Fallback: Combined Preparation Counter -->
                    <div
                      v-else-if="spellSlots?.preparation_limit !== null"
                      class="text-center"
                    >
                      <div class="text-xs text-gray-500 uppercase">
                        Prepared (Combined)
                      </div>
                      <div class="text-lg font-medium">
                        {{ spellSlots?.prepared_count ?? 0 }} / {{ spellSlots?.preparation_limit }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Spell Slots (shared) -->
                <div
                  v-if="spellSlots?.slots && Object.keys(spellSlots.slots).length > 0 && character"
                  class="mb-4"
                >
                  <CharacterSheetSpellSlotsManager
                    :character-id="character.id"
                    :editable="canEdit"
                  />
                </div>

                <!-- Spells List (all spells for now - can't filter by class until #715 is done) -->
                <div
                  v-if="cantrips.length > 0"
                  class="mt-4"
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

                <div
                  v-for="level in sortedLevels"
                  :key="level"
                  class="mt-4"
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
              </template>

              <!-- All Spells Tab -->
              <template #all-spells>
                <!-- Combined Stats Summary -->
                <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                  <h3 class="font-semibold text-lg mb-3">
                    Spellcasting Summary
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      v-for="sc in spellcastingClasses"
                      :key="sc.slug"
                      class="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg"
                    >
                      <span
                        class="w-3 h-3 rounded-full flex-shrink-0"
                        :class="`bg-${sc.color}-500`"
                      />
                      <div class="flex-1 min-w-0">
                        <div class="font-medium">
                          {{ sc.name }}
                        </div>
                        <div class="text-sm text-gray-500">
                          DC {{ sc.info.spell_save_dc }} | {{ formatModifier(sc.info.spell_attack_bonus) }} | {{ sc.info.ability }}
                        </div>
                        <!-- Per-class prepared count -->
                        <div
                          v-if="hasPerClassLimits && getClassPreparationLimit(sc.slug)"
                          class="text-sm text-gray-600 dark:text-gray-400"
                          data-testid="summary-class-preparation"
                        >
                          Prepared: {{ getClassPreparationLimit(sc.slug)?.prepared ?? 0 }} / {{ getClassPreparationLimit(sc.slug)?.limit ?? 0 }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Combined Preparation Counter -->
                  <div
                    v-if="spellSlots?.preparation_limit !== null"
                    class="mt-4 text-center border-t border-gray-200 dark:border-gray-700 pt-3"
                  >
                    <span class="text-sm text-gray-500">Total Prepared:</span>
                    <span class="ml-2 font-medium">
                      {{ spellSlots?.prepared_count ?? 0 }} / {{ spellSlots?.preparation_limit }}
                    </span>
                  </div>
                </div>

                <!-- Spell Slots (shared) -->
                <div
                  v-if="spellSlots?.slots && Object.keys(spellSlots.slots).length > 0 && character"
                  class="mb-4"
                >
                  <CharacterSheetSpellSlotsManager
                    :character-id="character.id"
                    :editable="canEdit"
                  />
                </div>

                <!-- All Spells List -->
                <div
                  v-if="cantrips.length > 0"
                  class="mt-4"
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

                <div
                  v-for="level in sortedLevels"
                  :key="level"
                  class="mt-4"
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
                </div>
              </template>
            </UTabs>
          </template>

          <!-- ══════════════════════════════════════════════════════════════ -->
          <!-- SINGLE-CLASS SPELLCASTER: Original Simple Layout                -->
          <!-- ══════════════════════════════════════════════════════════════ -->
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
                      {{ primarySpellcasting?.info.spell_save_dc }}
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-xs text-gray-500 uppercase">
                      Attack
                    </div>
                    <div class="text-2xl font-bold">
                      {{ formatModifier(primarySpellcasting?.info.spell_attack_bonus ?? 0) }}
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-xs text-gray-500 uppercase">
                      Ability
                    </div>
                    <div class="text-2xl font-bold">
                      {{ primarySpellcasting?.info.ability }}
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

            <!-- Interactive Spell Slots -->
            <div
              v-if="spellSlots?.slots && Object.keys(spellSlots.slots).length > 0 && character"
              class="mt-6"
            >
              <CharacterSheetSpellSlotsManager
                :character-id="character.id"
                :editable="canEdit"
              />
            </div>

            <!-- Wizard Spellbook View (two-column) -->
            <div
              v-if="isSpellbookCaster"
              data-testid="spellbook-view"
              class="mt-8"
            >
              <CharacterSheetSpellbookView
                :spells="validSpells"
                :prepared-count="spellSlots?.prepared_count ?? 0"
                :preparation-limit="spellSlots?.preparation_limit ?? 0"
                :character-id="character.id"
              />
            </div>

            <!-- Standard Spell List (for non-wizard casters) -->
            <template v-else>
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
            </template>

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
        </template>
      </div>
    </template>
  </div>
</template>
