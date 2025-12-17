<!-- app/components/character/sheet/PrepareSpellsView.vue -->
<script setup lang="ts">
/**
 * Prepare Spells View for Prepared Casters and Wizards
 *
 * For prepared casters (Cleric, Druid, Paladin): Shows available class spells to prepare.
 * For spellbook casters (Wizard): Shows all class spells - can learn new spells and prepare from spellbook.
 *
 * @see Issue #723 - Prepared caster spell selection
 * @see Issue #728 - Wizard learn spell feature
 */
import { storeToRefs } from 'pinia'
import type { Spell } from '~/types/api/entities'
import type { PreparationMethod } from '~/types/character'
import { formatSpellLevel } from '~/composables/useSpellFormatters'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

const props = defineProps<{
  characterId: number
  classSlug: string
  maxCastableLevel: number
  preparationLimit: number
  preparedCount: number
  preparationMethod: PreparationMethod
}>()

const emit = defineEmits<{
  close: []
}>()

const { apiFetch } = useApi()
const toast = useToast()
const store = useCharacterPlayStateStore()
const { preparedSpellIds, isUpdatingSpellPreparation } = storeToRefs(store)

// Spellbook mode (Wizard) vs Prepared mode (Cleric, Druid, Paladin)
const isSpellbookMode = computed(() => props.preparationMethod === 'spellbook')

// Filter state
const searchQuery = ref('')
const selectedLevel = ref<number | null>(null)
const hidePrepared = ref(false)

// Learn spell dialog state
const showLearnDialog = ref(false)
const spellToLearn = ref<Spell | null>(null)
const isLearningSpell = ref(false)

/**
 * Build filter for fetching all class spells (spellbook mode)
 * Format: classes.slug="phb:wizard" AND level<=3
 */
function buildClassSpellFilter(): string {
  const filters: string[] = []
  filters.push(`classes.slug="${props.classSlug}"`)
  filters.push(`level<=${props.maxCastableLevel}`)
  return filters.join(' AND ')
}

// Fetch available spells - different endpoints for spellbook vs prepared
const { data: availableSpellsData, pending, error } = await useAsyncData(
  `character-${props.characterId}-available-spells-${props.classSlug}-${isSpellbookMode.value ? 'all' : 'known'}`,
  () => {
    if (isSpellbookMode.value) {
      // Spellbook mode: fetch ALL wizard spells up to max level
      return apiFetch<{ data: Spell[] }>(
        `/spells?filter=${encodeURIComponent(buildClassSpellFilter())}&per_page=500`
      )
    } else {
      // Prepared mode: fetch only available spells for this character
      return apiFetch<{ data: Spell[] }>(
        `/characters/${props.characterId}/available-spells?max_level=${props.maxCastableLevel}&class=${encodeURIComponent(props.classSlug)}&include_known=true`
      )
    }
  },
  { dedupe: 'defer' }
)

const availableSpells = computed(() => availableSpellsData.value?.data ?? [])

/**
 * Map spell slug to character_spell_id for preparation toggling
 * We need to fetch the character's current spells to get the IDs
 */
const { data: characterSpellsData } = await useAsyncData(
  `character-${props.characterId}-spells-for-prepare`,
  () => apiFetch<{ data: Array<{ id: number, spell_slug: string, is_prepared: boolean, is_always_prepared: boolean }> }>(
    `/characters/${props.characterId}/spells`
  ),
  { dedupe: 'defer' }
)

// Map spell slugs to character spell data
const characterSpellMap = computed(() => {
  const map = new Map<string, { id: number, is_prepared: boolean, is_always_prepared: boolean }>()
  for (const cs of characterSpellsData.value?.data ?? []) {
    map.set(cs.spell_slug, {
      id: cs.id,
      is_prepared: cs.is_prepared,
      is_always_prepared: cs.is_always_prepared
    })
  }
  return map
})

/**
 * Reactive prepared count from store
 */
const reactivePreparedCount = computed(() => {
  return preparedSpellIds.value.size
})

/**
 * Check if at preparation limit
 */
const atPrepLimit = computed(() => reactivePreparedCount.value >= props.preparationLimit)

/**
 * Filter available spells based on search, level, and hide-prepared
 */
const filteredSpells = computed(() => {
  let result = availableSpells.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(s => s.name.toLowerCase().includes(query))
  }

  // Level filter
  if (selectedLevel.value !== null) {
    result = result.filter(s => s.level === selectedLevel.value)
  }

  // Hide prepared filter
  if (hidePrepared.value) {
    result = result.filter((s) => {
      const charSpell = characterSpellMap.value.get(s.slug)
      if (!charSpell) return true // Not in character spells, show it
      // Hide if prepared in store
      return !preparedSpellIds.value.has(charSpell.id)
    })
  }

  return result
})

/**
 * Group filtered spells by level
 */
const spellsByLevel = computed(() => {
  const grouped: Record<number, Spell[]> = {}
  for (const spell of filteredSpells.value) {
    const level = spell.level
    if (!grouped[level]) grouped[level] = []
    grouped[level].push(spell)
  }
  // Sort by name within each level
  for (const level in grouped) {
    grouped[level]!.sort((a, b) => a.name.localeCompare(b.name))
  }
  return grouped
})

const sortedLevels = computed(() =>
  Object.keys(spellsByLevel.value).map(Number).sort((a, b) => a - b)
)

/**
 * Check if a spell is prepared
 */
function isSpellPrepared(spell: Spell): boolean {
  const charSpell = characterSpellMap.value.get(spell.slug)
  if (!charSpell) return false
  // Always-prepared spells are always considered prepared
  if (charSpell.is_always_prepared) return true
  // Check store for current state
  return preparedSpellIds.value.has(charSpell.id)
}

/**
 * Check if spell is always prepared (domain spells, etc.)
 */
function isAlwaysPrepared(spell: Spell): boolean {
  const charSpell = characterSpellMap.value.get(spell.slug)
  return charSpell?.is_always_prepared ?? false
}

/**
 * Check if spell is in character's spell list (spellbook for wizards)
 */
function isInSpellbook(spell: Spell): boolean {
  return characterSpellMap.value.has(spell.slug)
}

// Alias for backwards compatibility with prepared caster logic
const isInCharacterSpells = isInSpellbook

/**
 * Check if spell can be toggled
 */
function canToggle(spell: Spell): boolean {
  // Cantrips are always ready
  if (spell.level === 0) return false

  const charSpell = characterSpellMap.value.get(spell.slug)
  if (!charSpell) return false // Can't toggle if not in character spells (backend limitation)

  // Can't toggle always-prepared
  if (charSpell.is_always_prepared) return false

  // Can't prepare when at limit (but can unprepare)
  const currentlyPrepared = preparedSpellIds.value.has(charSpell.id)
  if (!currentlyPrepared && atPrepLimit.value) return false

  // Disable during API call
  if (isUpdatingSpellPreparation.value) return false

  return true
}

/**
 * Toggle spell preparation
 */
async function handleToggle(spell: Spell) {
  const charSpell = characterSpellMap.value.get(spell.slug)
  if (!charSpell) {
    toast.add({
      title: 'Cannot prepare spell',
      description: 'This spell is not in your spell list yet.',
      color: 'warning'
    })
    return
  }

  const currentlyPrepared = preparedSpellIds.value.has(charSpell.id)

  try {
    await store.toggleSpellPreparation(charSpell.id, currentlyPrepared)
  } catch (error) {
    // Show error feedback to user
    const message = error instanceof Error ? error.message : 'Failed to update spell'
    toast.add({
      title: 'Could not update spell',
      description: message === 'Preparation limit reached'
        ? 'You have reached your preparation limit. Unprepare a spell first.'
        : message,
      color: 'error'
    })
  }
}

// ══════════════════════════════════════════════════════════════
// SPELLBOOK MODE: LEARN SPELL
// ══════════════════════════════════════════════════════════════

/**
 * Calculate gold cost to learn a spell (50gp per spell level)
 */
function getLearnCost(spell: Spell): number {
  return spell.level * 50
}

/**
 * Calculate time to copy a spell (2 hours per spell level)
 */
function getLearnTime(spell: Spell): string {
  const hours = spell.level * 2
  return `${hours} hour${hours !== 1 ? 's' : ''}`
}

/**
 * Open learn spell confirmation dialog
 */
function openLearnDialog(spell: Spell) {
  spellToLearn.value = spell
  showLearnDialog.value = true
}

/**
 * Close learn spell dialog
 */
function closeLearnDialog() {
  showLearnDialog.value = false
  spellToLearn.value = null
}

/**
 * Confirm and learn the spell
 */
async function confirmLearnSpell() {
  if (!spellToLearn.value) return

  isLearningSpell.value = true
  try {
    await apiFetch(`/characters/${props.characterId}/spells`, {
      method: 'POST',
      body: {
        spell_slug: spellToLearn.value.slug,
        class_slug: props.classSlug
      }
    })

    toast.add({
      title: `Added ${spellToLearn.value.name} to spellbook`,
      color: 'success'
    })

    // Refresh character spells to update the map
    await refreshNuxtData(`character-${props.characterId}-spells-for-prepare`)

    closeLearnDialog()
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to learn spell'
    toast.add({
      title: 'Could not learn spell',
      description: message,
      color: 'error'
    })
  } finally {
    isLearningSpell.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header with back button and counter -->
    <div class="flex items-center justify-between">
      <UButton
        data-testid="back-button"
        variant="ghost"
        icon="i-heroicons-arrow-left"
        @click="emit('close')"
      >
        Back to My Spells
      </UButton>

      <div
        data-testid="prep-counter"
        class="text-sm font-medium"
      >
        <span class="text-spell-600 dark:text-spell-400">{{ reactivePreparedCount }}</span>
        <span class="text-gray-500"> / {{ preparationLimit }}</span>
        <span class="text-gray-400 ml-1">prepared</span>
      </div>
    </div>

    <!-- Filters -->
    <div data-testid="prepare-spells-filters">
      <CharacterSheetPrepareSpellsFilters
        v-model:search-query="searchQuery"
        v-model:selected-level="selectedLevel"
        v-model:hide-prepared="hidePrepared"
        :max-castable-level="maxCastableLevel"
      />
    </div>

    <!-- Spellbook cost info banner (Wizard only) -->
    <div
      v-if="isSpellbookMode"
      data-testid="spellbook-cost-banner"
      class="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm"
    >
      <UIcon
        name="i-heroicons-information-circle"
        class="w-5 h-5 flex-shrink-0"
      />
      <span>Copying a spell costs <strong>50gp per spell level</strong> (2 hours per level to transcribe)</span>
    </div>

    <!-- Loading State -->
    <div
      v-if="pending"
      data-testid="loading-skeleton"
      class="space-y-3"
    >
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-12 w-full" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="text-center py-8 text-red-500"
    >
      <UIcon
        name="i-heroicons-exclamation-triangle"
        class="w-8 h-8 mx-auto mb-2"
      />
      <p>Failed to load available spells</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredSpells.length === 0"
      data-testid="empty-state"
      class="text-center py-8 text-gray-500 dark:text-gray-400"
    >
      <UIcon
        name="i-heroicons-magnifying-glass"
        class="w-8 h-8 mx-auto mb-2"
      />
      <p v-if="searchQuery || selectedLevel !== null || hidePrepared">
        No spells match your filters
      </p>
      <p v-else>
        No spells available
      </p>
    </div>

    <!-- Spell List by Level -->
    <template v-else>
      <div
        v-for="level in sortedLevels"
        :key="level"
        class="space-y-2"
      >
        <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
          {{ level === 0 ? 'Cantrips' : `${formatSpellLevel(level)} Level` }}
        </h3>

        <div class="space-y-1">
          <div
            v-for="spell in spellsByLevel[level]"
            :key="spell.id"
            :data-testid="`spell-card-${spell.id}`"
            :class="[
              'p-3 rounded-lg border transition-all',
              'bg-white dark:bg-gray-800',
              isSpellPrepared(spell)
                ? 'border-spell-300 dark:border-spell-700'
                : 'border-gray-200 dark:border-gray-700',
              // Spellbook mode: dim unlearned spells (but clickable to learn)
              isSpellbookMode && !isInSpellbook(spell) && level !== 0 && 'opacity-60',
              // Prepared mode: grey out spells not in character's spell list (can't toggle)
              !isSpellbookMode && !isInCharacterSpells(spell) && level !== 0 && 'opacity-30',
              // Dim unprepared at limit
              isInCharacterSpells(spell) && !isSpellPrepared(spell) && atPrepLimit && level !== 0 && 'opacity-40',
              // Slightly dim unprepared (but not at limit)
              isInCharacterSpells(spell) && !isSpellPrepared(spell) && !atPrepLimit && level !== 0 && 'opacity-70'
            ]"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <!-- Preparation toggle -->
                <button
                  v-if="level !== 0 && isInCharacterSpells(spell)"
                  :data-testid="`prepare-toggle`"
                  type="button"
                  :disabled="!canToggle(spell)"
                  :class="[
                    'flex-shrink-0 p-0.5 -m-0.5 rounded',
                    canToggle(spell) ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : 'cursor-not-allowed'
                  ]"
                  @click="handleToggle(spell)"
                >
                  <!-- Prepared indicator -->
                  <UIcon
                    v-if="isSpellPrepared(spell)"
                    data-testid="prepared-indicator"
                    name="i-heroicons-check-circle-solid"
                    :class="[
                      'w-5 h-5',
                      isAlwaysPrepared(spell)
                        ? 'text-amber-500 dark:text-amber-400'
                        : 'text-spell-500 dark:text-spell-400'
                    ]"
                  />
                  <!-- Empty circle for unprepared -->
                  <span
                    v-else
                    class="w-5 h-5 block rounded-full border-2 border-gray-300 dark:border-gray-600"
                  />
                </button>

                <!-- Spellbook mode: Learn spell button -->
                <button
                  v-else-if="level !== 0 && isSpellbookMode"
                  data-testid="learn-spell-button"
                  type="button"
                  class="flex-shrink-0 p-0.5 -m-0.5 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  @click="openLearnDialog(spell)"
                >
                  <UIcon
                    name="i-heroicons-plus-circle"
                    class="w-5 h-5 text-spell-500 dark:text-spell-400"
                  />
                </button>

                <!-- Prepared mode: Not in spell list indicator (coming soon) -->
                <UTooltip
                  v-else-if="level !== 0"
                  text="Not yet available - coming soon"
                >
                  <UIcon
                    name="i-heroicons-lock-closed"
                    class="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0"
                  />
                </UTooltip>

                <!-- Cantrip indicator (always ready) -->
                <UIcon
                  v-else
                  name="i-heroicons-check-circle-solid"
                  class="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0"
                />

                <!-- Spell name -->
                <span class="font-medium truncate">{{ spell.name }}</span>
              </div>

              <!-- Right side: badges -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <UBadge
                  v-if="isAlwaysPrepared(spell) || level === 0"
                  color="warning"
                  variant="subtle"
                  size="md"
                >
                  Always
                </UBadge>

                <UBadge
                  v-if="spell.needs_concentration"
                  color="spell"
                  variant="subtle"
                  size="md"
                >
                  C
                </UBadge>

                <UBadge
                  v-if="spell.is_ritual"
                  color="neutral"
                  variant="subtle"
                  size="md"
                >
                  R
                </UBadge>

                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ spell.school?.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Learn Spell Confirmation Dialog -->
    <UModal v-model:open="showLearnDialog">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Learn {{ spellToLearn?.name }}?
          </h3>

          <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <p>
              <strong class="text-gray-900 dark:text-white">Cost:</strong>
              {{ spellToLearn ? getLearnCost(spellToLearn) : 0 }}gp
              <span class="text-gray-400">(50gp × {{ spellToLearn?.level }} level)</span>
            </p>
            <p>
              <strong class="text-gray-900 dark:text-white">Time:</strong>
              {{ spellToLearn ? getLearnTime(spellToLearn) : '0 hours' }} to copy
            </p>
          </div>

          <div class="flex justify-end gap-3">
            <UButton
              variant="ghost"
              :disabled="isLearningSpell"
              @click="closeLearnDialog"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              :loading="isLearningSpell"
              @click="confirmLearnSpell"
            >
              Learn
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
