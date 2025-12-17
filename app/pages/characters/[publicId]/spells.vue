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
import type { CharacterSpell, ClassSpellcastingInfo, SpellSlotsResponse, PreparationMethod } from '~/types/character'
import { formatSpellLevel } from '~/composables/useSpellFormatters'
import { formatModifier } from '~/composables/useCharacterStats'
import { getClassColor, getClassName } from '~/utils/classColors'
import { logger } from '~/utils/logger'

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

// Initialize spell preparation state when data loads
// This enables preparation limit enforcement and optimistic UI updates
watch([spellsData, slotsData], ([spells, slots]) => {
  if (spells?.data && slots?.data) {
    try {
      playStateStore.initializeSpellPreparation({
        spells: spells.data.map(s => ({
          id: s.id,
          is_prepared: s.is_prepared,
          is_always_prepared: s.is_always_prepared
        })),
        preparationLimit: slots.data.preparation_limit ?? null
      })
    } catch (error) {
      logger.error('Failed to initialize spell preparation state', error)
    }
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

// ══════════════════════════════════════════════════════════════
// PER-CLASS SPELL FILTERING
// ══════════════════════════════════════════════════════════════

/**
 * Get spells filtered by class slug
 */
function getSpellsForClass(classSlug: string): CharacterSpell[] {
  return validSpells.value.filter(s => s.class_slug === classSlug)
}

/**
 * Get cantrips for a specific class
 */
function getCantripsForClass(classSlug: string): CharacterSpell[] {
  return getSpellsForClass(classSlug).filter(s => s.spell!.level === 0)
}

/**
 * Get leveled spells grouped by level for a specific class
 */
function getSpellsByLevelForClass(classSlug: string): Record<number, CharacterSpell[]> {
  const classSpells = getSpellsForClass(classSlug).filter(s => s.spell!.level > 0)
  const grouped: Record<number, CharacterSpell[]> = {}
  for (const spell of classSpells) {
    const level = spell.spell!.level
    if (!grouped[level]) grouped[level] = []
    grouped[level].push(spell)
  }
  // Sort by spell name within each level
  for (const level in grouped) {
    grouped[level]!.sort((a, b) => a.spell!.name.localeCompare(b.spell!.name))
  }
  return grouped
}

/**
 * Get sorted level keys for a specific class
 */
function getSortedLevelsForClass(classSlug: string): number[] {
  return Object.keys(getSpellsByLevelForClass(classSlug)).map(Number).sort((a, b) => a - b)
}

// ══════════════════════════════════════════════════════════════
// PREPARATION METHOD UI DIFFERENTIATION (#676)
// ══════════════════════════════════════════════════════════════

/**
 * Top-level preparation method from character stats
 * Used for single-class display decisions
 */
const preparationMethod = computed<PreparationMethod>(() =>
  (stats.value as { preparation_method?: PreparationMethod } | null)?.preparation_method ?? null
)

/**
 * Whether this is a spellbook caster (wizard) - for spellbook view
 */
const isSpellbookCaster = computed(() => preparationMethod.value === 'spellbook')

/**
 * Find the spellbook caster class (wizard) for multiclass support
 * Returns the class info for the wizard class, or null if none
 * @see Issue #719 - Wizard preparation limit fix
 */
const spellbookClass = computed(() =>
  spellcastingClasses.value.find(sc => sc.info.preparation_method === 'spellbook') ?? null
)

/**
 * Get spells filtered to spellbook class only (for wizard view)
 * Excludes cleric/other class spells from the spellbook
 */
const spellbookSpells = computed(() => {
  if (!spellbookClass.value) return validSpells.value
  return validSpells.value.filter(s => s.class_slug === spellbookClass.value!.slug)
})

/**
 * Get preparation limit for the spellbook class
 * Falls back to combined limit if per-class not available
 */
const spellbookPreparationLimit = computed(() => {
  if (!spellbookClass.value) return spellSlots.value?.preparation_limit ?? 0
  const perClassLimit = getClassPreparationLimit(spellbookClass.value.slug)
  return perClassLimit?.limit ?? spellSlots.value?.preparation_limit ?? 0
})

/**
 * Get prepared count for the spellbook class
 * Falls back to combined count if per-class not available
 */
const spellbookPreparedCount = computed(() => {
  if (!spellbookClass.value) return spellSlots.value?.prepared_count ?? 0
  const perClassLimit = getClassPreparationLimit(spellbookClass.value.slug)
  return perClassLimit?.prepared ?? spellSlots.value?.prepared_count ?? 0
})

/**
 * Whether to show preparation UI (counter, toggle) for single-class
 * Known casters don't need preparation - hide these UI elements
 * @see Issue #676
 */
const showPreparationUI = computed(() => preparationMethod.value !== 'known')

/**
 * Can this caster prepare spells? (prepared or spellbook casters)
 * Known casters (Sorcerer, Warlock, Bard) don't prepare spells.
 * @see Issue #723, #728
 */
const isPreparedCaster = computed(() =>
  preparationMethod.value === 'prepared' || preparationMethod.value === 'spellbook'
)

/**
 * Mode toggle for prepared casters
 * Stores the class slug when in prepare mode, null otherwise
 * Supports both single-class and multiclass prepared casters
 * @see Issue #723
 */
const prepareSpellsMode = ref<string | null>(null)

/**
 * Check if prepare spells mode is active for a specific class
 */
function isPrepareSpellsModeFor(classSlug: string): boolean {
  return prepareSpellsMode.value === classSlug
}

/**
 * Enter prepare spells mode for a specific class
 */
function enterPrepareSpellsMode(classSlug: string): void {
  prepareSpellsMode.value = classSlug
}

/**
 * Exit prepare spells mode
 */
function exitPrepareSpellsMode(): void {
  prepareSpellsMode.value = null
}

/**
 * Get max castable spell level for this character
 * Based on available spell slots
 */
const maxCastableLevel = computed(() => {
  if (!spellSlots.value?.slots) return 1
  const levels = Object.keys(spellSlots.value.slots).map(Number)
  return Math.max(...levels, 1)
})

/**
 * Get preparation method for a specific class (multiclass support)
 * Falls back to top-level preparation method if not available per-class
 */
function getClassPreparationMethod(classSlug: string): PreparationMethod {
  const classInfo = stats.value?.spellcasting?.[classSlug]
  return classInfo?.preparation_method ?? preparationMethod.value
}

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
 * Build tab items for multiclass view
 * Each item has a `value` for UTabs to track selection
 *
 * @see Issue #719 - Default to All Spells tab
 */
const tabItems = computed(() => {
  const items = spellcastingClasses.value.map(sc => ({
    label: sc.name,
    slot: sc.slotName,
    value: sc.slotName // Use slot name as value for UTabs
  }))
  // Add "All Spells" tab at the end
  items.push({ label: 'All Spells', slot: 'all-spells', value: 'all-spells' })
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

/**
 * Get REACTIVE prepared count for a specific class
 * Computes from store's preparedSpellIds instead of API data for real-time updates
 * @see Issue #719 - Preparation counter reactivity fix
 */
function getReactivePreparedCount(classSlug: string): number {
  // Filter spells by class and check if they're in the store's prepared set
  const classSpells = validSpells.value.filter(s => s.class_slug === classSlug)
  return classSpells.filter(s =>
    playStateStore.preparedSpellIds.has(s.id) && !s.is_always_prepared
  ).length
}

/**
 * Check if a specific class is at its preparation limit
 * Uses REACTIVE prepared count from store for real-time limit checking
 * @see Issue #718, #719
 */
function isAtClassPreparationLimit(classSlug: string): boolean {
  const limit = getClassPreparationLimit(classSlug)
  if (!limit) return false
  // Use reactive count instead of API data
  return getReactivePreparedCount(classSlug) >= limit.limit
}

/**
 * Get preparation method for a spell based on its class_slug
 * Falls back to top-level preparation method if spell has no class_slug
 * @see Issue #718
 */
function getSpellPreparationMethod(spell: CharacterSpell): PreparationMethod {
  return spell.class_slug
    ? getClassPreparationMethod(spell.class_slug)
    : preparationMethod.value
}

/**
 * REACTIVE total prepared count across all classes
 * Computes from store's preparedSpellIds for real-time updates
 * @see Issue #719
 */
const reactiveTotalPreparedCount = computed(() => {
  return validSpells.value.filter(s =>
    playStateStore.preparedSpellIds.has(s.id) && !s.is_always_prepared
  ).length
})

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
              :items="tabItems"
              default-value="all-spells"
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
                    <!-- Per-Class Preparation Counter (hidden for known casters #676) -->
                    <!-- Uses reactive count from store for real-time updates #719 -->
                    <div
                      v-if="getClassPreparationMethod(sc.slug) !== 'known' && hasPerClassLimits && getClassPreparationLimit(sc.slug)"
                      class="text-center"
                      data-testid="class-preparation-limit"
                    >
                      <div class="text-xs text-gray-500 uppercase">
                        {{ sc.name }} Prepared
                      </div>
                      <div class="text-lg font-medium">
                        {{ getReactivePreparedCount(sc.slug) }} / {{ getClassPreparationLimit(sc.slug)?.limit ?? 0 }}
                      </div>
                    </div>
                    <!-- Fallback: Combined Preparation Counter (hidden for known casters #676) -->
                    <!-- Uses reactive count for real-time updates #719 -->
                    <div
                      v-else-if="getClassPreparationMethod(sc.slug) !== 'known' && spellSlots?.preparation_limit !== null"
                      class="text-center"
                    >
                      <div class="text-xs text-gray-500 uppercase">
                        Prepared (Combined)
                      </div>
                      <div class="text-lg font-medium">
                        {{ reactiveTotalPreparedCount }} / {{ spellSlots?.preparation_limit }}
                      </div>
                    </div>
                    <!-- Prepare Spells button for prepared/spellbook casters in multiclass (#723, #728) -->
                    <UButton
                      v-if="getClassPreparationMethod(sc.slug) !== 'known' && !isPrepareSpellsModeFor(sc.slug)"
                      :data-testid="`prepare-spells-button-${sc.slotName}`"
                      variant="soft"
                      color="spell"
                      icon="i-heroicons-book-open"
                      @click="enterPrepareSpellsMode(sc.slug)"
                    >
                      Prepare Spells
                    </UButton>
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

                <!-- Prepare Spells View for this class (#723) -->
                <div
                  v-if="isPrepareSpellsModeFor(sc.slug) && character && hasPerClassLimits"
                  :data-testid="`prepare-spells-view-${sc.slotName}`"
                  class="mt-4"
                >
                  <CharacterSheetPrepareSpellsView
                    :character-id="character.id"
                    :class-slug="sc.slug"
                    :max-castable-level="maxCastableLevel"
                    :preparation-limit="getClassPreparationLimit(sc.slug)?.limit ?? 0"
                    :prepared-count="getReactivePreparedCount(sc.slug)"
                    :preparation-method="getClassPreparationMethod(sc.slug)"
                    @close="exitPrepareSpellsMode"
                  />
                </div>

                <!-- Spells List (filtered by class) - hidden when in prepare mode -->
                <template v-else>
                  <div
                    v-if="getCantripsForClass(sc.slug).length > 0"
                    class="mt-4"
                  >
                  <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Cantrips
                  </h3>
                  <div class="space-y-2">
                    <CharacterSheetSpellCard
                      v-for="spell in getCantripsForClass(sc.slug)"
                      :key="spell.id"
                      :spell="spell"
                      :preparation-method="getClassPreparationMethod(sc.slug)"
                      :at-prep-limit="isAtClassPreparationLimit(sc.slug)"
                      :character-id="character.id"
                      :editable="canEdit"
                    />
                  </div>
                </div>

                <div
                  v-for="level in getSortedLevelsForClass(sc.slug)"
                  :key="level"
                  class="mt-4"
                >
                  <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {{ formatSpellLevel(level) }} Level
                  </h3>
                  <div class="space-y-2">
                    <CharacterSheetSpellCard
                      v-for="spell in getSpellsByLevelForClass(sc.slug)[level]"
                      :key="spell.id"
                      :spell="spell"
                      :preparation-method="getClassPreparationMethod(sc.slug)"
                      :at-prep-limit="isAtClassPreparationLimit(sc.slug)"
                      :character-id="character.id"
                      :editable="canEdit"
                    />
                  </div>
                </div>

                  <!-- Empty state for class with no spells -->
                  <div
                    v-if="getSpellsForClass(sc.slug).length === 0"
                    class="mt-8 text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    <UIcon
                      name="i-heroicons-sparkles"
                      class="w-10 h-10 mx-auto mb-3"
                    />
                    <p>No {{ sc.name }} spells known yet.</p>
                  </div>
                </template>
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
                        <!-- Per-class prepared count (reactive #719) -->
                        <div
                          v-if="hasPerClassLimits && getClassPreparationLimit(sc.slug)"
                          class="text-sm text-gray-600 dark:text-gray-400"
                          data-testid="summary-class-preparation"
                        >
                          Prepared: {{ getReactivePreparedCount(sc.slug) }} / {{ getClassPreparationLimit(sc.slug)?.limit ?? 0 }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Combined Preparation Counter (reactive #719) -->
                  <div
                    v-if="spellSlots?.preparation_limit !== null"
                    class="mt-4 text-center border-t border-gray-200 dark:border-gray-700 pt-3"
                  >
                    <span class="text-sm text-gray-500">Total Prepared:</span>
                    <span class="ml-2 font-medium">
                      {{ reactiveTotalPreparedCount }} / {{ spellSlots?.preparation_limit }}
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

                <!-- All Spells List (read-only - preparation happens in class tabs) -->
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
                      :preparation-method="getSpellPreparationMethod(spell)"
                      :at-prep-limit="!!spell.class_slug && isAtClassPreparationLimit(spell.class_slug)"
                      :character-id="character.id"
                      :editable="false"
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
                      :preparation-method="getSpellPreparationMethod(spell)"
                      :at-prep-limit="!!spell.class_slug && isAtClassPreparationLimit(spell.class_slug)"
                      :character-id="character.id"
                      :editable="false"
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

                <!-- Preparation Counter + Prepare Button (hidden for known casters #676) -->
                <!-- Uses reactive count for real-time updates #719 -->
                <div
                  v-if="showPreparationUI && spellSlots?.preparation_limit !== null"
                  class="flex items-center gap-4"
                >
                  <div
                    class="text-center"
                    data-testid="preparation-limit"
                  >
                    <div class="text-xs text-gray-500 uppercase">
                      Prepared
                    </div>
                    <div class="text-lg font-medium">
                      {{ reactiveTotalPreparedCount }} / {{ spellSlots?.preparation_limit }}
                    </div>
                  </div>
                  <!-- Prepare Spells button for prepared/spellbook casters (#723, #728) -->
                  <UButton
                    v-if="isPreparedCaster && !prepareSpellsMode && primarySpellcasting"
                    data-testid="prepare-spells-button"
                    variant="soft"
                    color="spell"
                    icon="i-heroicons-book-open"
                    @click="enterPrepareSpellsMode(primarySpellcasting.slug)"
                  >
                    Prepare Spells
                  </UButton>
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

            <!-- Prepare Spells View for prepared/spellbook casters (#723, #728) -->
            <div
              v-if="prepareSpellsMode && isPreparedCaster && character && primarySpellcasting"
              data-testid="prepare-spells-view"
              class="mt-8"
            >
              <CharacterSheetPrepareSpellsView
                :character-id="character.id"
                :class-slug="primarySpellcasting.slug"
                :max-castable-level="maxCastableLevel"
                :preparation-limit="spellSlots?.preparation_limit ?? 0"
                :prepared-count="reactiveTotalPreparedCount"
                :preparation-method="preparationMethod"
                @close="exitPrepareSpellsMode"
              />
            </div>

            <!-- Wizard Spellbook View (two-column) -->
            <div
              v-else-if="isSpellbookCaster"
              data-testid="spellbook-view"
              class="mt-8"
            >
              <CharacterSheetSpellbookView
                :spells="spellbookSpells"
                :prepared-count="spellbookPreparedCount"
                :preparation-limit="spellbookPreparationLimit"
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
                    :preparation-method="preparationMethod"
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
                    :preparation-method="preparationMethod"
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
