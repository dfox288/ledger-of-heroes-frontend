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
  spellsChanged: []
}>()

const { apiFetch } = useApi()
const toast = useToast()
const store = useCharacterPlayStateStore()
const { preparedSpellIds, isUpdatingSpellPreparation, canEdit } = storeToRefs(store)

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

// Track expanded spell IDs
const expandedSpellIds = ref<Set<number>>(new Set())

/**
 * Toggle spell expansion state
 */
function toggleExpanded(spellId: number) {
  if (expandedSpellIds.value.has(spellId)) {
    expandedSpellIds.value.delete(spellId)
  } else {
    expandedSpellIds.value.add(spellId)
  }
}

/**
 * Check if a spell is expanded
 */
function isExpanded(spellId: number): boolean {
  return expandedSpellIds.value.has(spellId)
}

/**
 * Handle header click (expand/collapse)
 * Clicking anywhere on the header row expands/collapses the card
 * Skip if clicking on interactive elements (buttons, toggles)
 */
function handleHeaderClick(event: MouseEvent, spellId: number) {
  // Don't expand if clicking on buttons (prepare toggle, learn button)
  const target = event.target as HTMLElement
  if (target.closest('button')) {
    return
  }
  toggleExpanded(spellId)
}

// Spellbook vs Prepared mode determines what spells are shown and how they can be toggled
// - Spellbook (Wizard): Shows all class spells, can LEARN new spells (copy to spellbook)
// - Prepared (Cleric, Druid, Paladin): Shows all class spells, can PREPARE any of them
const isPreparedMode = computed(() => props.preparationMethod === 'prepared')

// Fetch available spells - both modes now fetch ALL class spells
const { data: availableSpellsData, pending, error } = await useAsyncData(
  `character-${props.characterId}-available-spells-${props.classSlug}-lvl${props.maxCastableLevel}`,
  () => {
    // Both spellbook and prepared casters can access all class spells up to their max level
    // Exclude cantrips (level 0) since they can't be copied/prepared from this view
    const filter = `class_slugs="${props.classSlug}" AND level>0 AND level<=${props.maxCastableLevel}`
    return apiFetch<{ data: Spell[] }>(
      `/spells?filter=${encodeURIComponent(filter)}&per_page=200`
    )
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
  () => apiFetch<{ data: Array<{ id: number, spell_slug: string, class_slug: string, is_prepared: boolean, is_always_prepared: boolean }> }>(
    `/characters/${props.characterId}/spells`
  ),
  { dedupe: 'defer' }
)

// Map spell slugs to character spell data
// IMPORTANT: Only include spells for the CURRENT class to avoid multiclass confusion
// e.g., a Wizard/Cleric's Wizard spells shouldn't appear as "known" in the Cleric prepare view
const characterSpellMap = computed(() => {
  const map = new Map<string, { id: number, is_prepared: boolean, is_always_prepared: boolean }>()
  for (const cs of characterSpellsData.value?.data ?? []) {
    // Filter by current class - only include spells from this class
    if (cs.class_slug !== props.classSlug) continue
    map.set(cs.spell_slug, {
      id: cs.id,
      is_prepared: cs.is_prepared,
      is_always_prepared: cs.is_always_prepared
    })
  }
  return map
})

/**
 * Track spells prepared by OTHER classes (for multiclass cross-check)
 * Used to show "Already prepared as [Class]" indicator and prevent duplicate preparation
 */
const otherClassPreparedMap = computed(() => {
  const map = new Map<string, string>() // spell_slug -> class_slug
  for (const cs of characterSpellsData.value?.data ?? []) {
    // Only include spells from OTHER classes that are prepared
    if (cs.class_slug === props.classSlug) continue
    if (cs.is_prepared) {
      map.set(cs.spell_slug, cs.class_slug)
    }
  }
  return map
})

/**
 * Check if a spell is prepared by another class
 */
function isPreparedByOtherClass(spell: Spell): boolean {
  return otherClassPreparedMap.value.has(spell.slug)
}

/**
 * Get the class that has this spell prepared (for display)
 */
function getOtherPreparedClass(spell: Spell): string | null {
  const classSlug = otherClassPreparedMap.value.get(spell.slug)
  if (!classSlug) return null
  // Extract class name from slug (e.g., "phb:wizard" -> "Wizard")
  const name = classSlug.split(':')[1] ?? classSlug
  return name.charAt(0).toUpperCase() + name.slice(1)
}

/**
 * Reactive prepared count from store - FILTERED BY CURRENT CLASS
 *
 * Critical for multiclass support: counts only spells for THIS class,
 * not all prepared spells across all classes.
 *
 * @see Issue #728 - Wizard preparation limit fix for multiclass
 */
const reactivePreparedCount = computed(() => {
  // Count prepared spells that belong to THIS class only
  let count = 0
  for (const charSpell of characterSpellMap.value.values()) {
    // Only count if it's in the prepared set and not always-prepared
    if (preparedSpellIds.value.has(charSpell.id) && !charSpell.is_always_prepared) {
      count++
    }
  }
  return count
})

/**
 * Check if at preparation limit
 */
const atPrepLimit = computed(() => reactivePreparedCount.value >= props.preparationLimit)

/**
 * Filter available spells based on search, level, and hide-prepared
 * Both spellbook (Wizard) and prepared (Cleric, etc.) casters see all class spells.
 * - Spells already in spellbook/list: show preparation toggle
 * - Spells not yet learned (Wizard only): show "Learn" button
 */
const filteredSpells = computed(() => {
  let result = availableSpells.value

  // NOTE: We intentionally do NOT filter out learned spells for wizards anymore.
  // Wizards need to see their spellbook spells here to toggle preparation,
  // just like Clerics see their class spells. The template shows:
  // - Preparation toggle for spells in spellbook
  // - "Learn" button for spells not yet in spellbook

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

// Track spell being added/prepared (for prepared casters adding new spells)
const isAddingSpell = ref(false)

/**
 * Check if spell can be toggled
 */
function canToggle(spell: Spell): boolean {
  // Require play mode to be ON (consistent with SpellCard behavior)
  if (!canEdit.value) return false

  // Can't prepare a spell that's already prepared by another class
  if (isPreparedByOtherClass(spell)) return false

  // Cantrips are always ready
  if (spell.level === 0) return false

  // Disable during API call
  if (isUpdatingSpellPreparation.value || isAddingSpell.value) return false

  const charSpell = characterSpellMap.value.get(spell.slug)

  // For prepared casters, can toggle any class spell (will add it if not in list)
  if (isPreparedMode.value) {
    if (charSpell) {
      // Can't toggle always-prepared
      if (charSpell.is_always_prepared) return false
      // Can always unprepare
      if (preparedSpellIds.value.has(charSpell.id)) return true
    }
    // Can prepare if not at limit
    return !atPrepLimit.value
  }

  // For spellbook casters, must be in character spells
  if (!charSpell) return false

  // Can't toggle always-prepared
  if (charSpell.is_always_prepared) return false

  // Can't prepare when at limit (but can unprepare)
  const currentlyPrepared = preparedSpellIds.value.has(charSpell.id)
  if (!currentlyPrepared && atPrepLimit.value) return false

  return true
}

/**
 * Toggle spell preparation
 *
 * For prepared casters (Cleric, Druid, Paladin): calls /prepare or /unprepare directly.
 * Backend handles adding spell to character's spell list if needed.
 *
 * For spellbook casters (Wizard): spell must already be in spellbook.
 */
async function handleToggle(spell: Spell) {
  const charSpell = characterSpellMap.value.get(spell.slug)

  // Determine current state and target action
  const currentlyPrepared = charSpell ? preparedSpellIds.value.has(charSpell.id) : false
  const action = currentlyPrepared ? 'unprepare' : 'prepare'

  // CRITICAL: Save the ID BEFORE API call for unprepare case
  // After unprepare, the spell might be deleted from characterSpellMap,
  // so we won't be able to look it up to delete from preparedSpellIds
  const existingCharSpellId = charSpell?.id

  // Check prep limit before preparing (not needed for unpreparing)
  if (action === 'prepare' && atPrepLimit.value) {
    toast.add({
      title: 'Preparation limit reached',
      description: 'Unprepare a spell first.',
      color: 'warning'
    })
    return
  }

  // For spellbook casters, spell must be in spellbook to toggle
  if (isSpellbookMode.value && !charSpell) {
    toast.add({
      title: 'Cannot prepare spell',
      description: 'This spell is not in your spellbook yet.',
      color: 'warning'
    })
    return
  }

  isAddingSpell.value = true

  try {
    // Call prepare/unprepare endpoint directly - backend handles adding spell if needed
    await apiFetch(`/characters/${props.characterId}/spells/${spell.slug}/${action}`, {
      method: 'PATCH',
      body: { class_slug: props.classSlug }
    })

    // Refresh character spells to update the map
    await refreshNuxtData(`character-${props.characterId}-spells-for-prepare`)

    // Update store's prepared IDs
    if (action === 'prepare') {
      // For prepare: get the new ID from refreshed data (spell may have been created)
      const updatedCharSpell = characterSpellMap.value.get(spell.slug)
      if (updatedCharSpell) {
        preparedSpellIds.value.add(updatedCharSpell.id)
      }
    } else {
      // For unprepare: use the ID we saved BEFORE the API call
      // because the spell might be deleted from characterSpellMap after unprepare
      if (existingCharSpellId !== undefined) {
        preparedSpellIds.value.delete(existingCharSpellId)
      }
    }

    // Notify parent that spells changed so it can refresh its data
    emit('spellsChanged')
  } catch (error) {
    const message = error instanceof Error ? error.message : `Failed to ${action} spell`
    toast.add({
      title: `Could not ${action} spell`,
      description: message,
      color: 'error'
    })
  } finally {
    isAddingSpell.value = false
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
 * Only leveled spells can be learned (cantrips are automatic)
 */
function openLearnDialog(spell: Spell) {
  if (spell.level === 0) return // Cantrips can't be learned
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
    // Use source: 'spellbook' to distinguish copied spells from level-granted spells
    // This prevents copied spells from counting against level-up spell grants
    await apiFetch(`/characters/${props.characterId}/spells`, {
      method: 'POST',
      body: {
        spell_slug: spellToLearn.value.slug,
        class_slug: props.classSlug,
        source: 'spellbook'
      }
    })

    toast.add({
      title: `Copied ${spellToLearn.value.name} to spellbook`,
      color: 'success'
    })

    // Refresh character spells to update the map (makes learned spell toggleable)
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
              // Cross-class prepared: dim and show as unavailable
              isPreparedByOtherClass(spell) && level !== 0 && 'opacity-50',
              // Spellbook mode: dim unlearned spells (but clickable to learn)
              !isPreparedByOtherClass(spell) && isSpellbookMode && !isInSpellbook(spell) && level !== 0 && 'opacity-60',
              // Prepared mode: grey out spells not in character's spell list (can't toggle)
              !isPreparedByOtherClass(spell) && !isSpellbookMode && !isInCharacterSpells(spell) && level !== 0 && 'opacity-30',
              // Dim unprepared at limit
              !isPreparedByOtherClass(spell) && isInCharacterSpells(spell) && !isSpellPrepared(spell) && atPrepLimit && level !== 0 && 'opacity-40',
              // Slightly dim unprepared (but not at limit)
              !isPreparedByOtherClass(spell) && isInCharacterSpells(spell) && !isSpellPrepared(spell) && !atPrepLimit && level !== 0 && 'opacity-70'
            ]"
          >
            <!-- Clickable header for expand/collapse -->
            <div
              class="flex items-center justify-between gap-2 cursor-pointer"
              @click="handleHeaderClick($event, spell.id)"
            >
              <div class="flex items-center gap-2 min-w-0">
                <!-- Cross-class prepared: show check with tooltip -->
                <UTooltip
                  v-if="level !== 0 && isPreparedByOtherClass(spell)"
                  :text="`Prepared as ${getOtherPreparedClass(spell)}`"
                >
                  <UIcon
                    data-testid="cross-class-prepared-indicator"
                    name="i-heroicons-check-circle-solid"
                    class="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0"
                  />
                </UTooltip>

                <!-- Preparation toggle for spells in character's list OR prepared casters -->
                <button
                  v-else-if="level !== 0 && (isInCharacterSpells(spell) || isPreparedMode)"
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

                <!-- Spellbook mode: Learn spell button (for spells not yet in spellbook) -->
                <button
                  v-else-if="level !== 0 && isSpellbookMode"
                  data-testid="copy-spell-button"
                  type="button"
                  class="flex-shrink-0 p-0.5 -m-0.5 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  @click="openLearnDialog(spell)"
                >
                  <UIcon
                    name="i-heroicons-plus-circle"
                    class="w-5 h-5 text-spell-500 dark:text-spell-400"
                  />
                </button>

                <!-- Cantrip indicator (always ready) -->
                <UIcon
                  v-else
                  name="i-heroicons-check-circle-solid"
                  class="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0"
                />

                <!-- Spell name -->
                <span class="font-medium truncate">{{ spell.name }}</span>
              </div>

              <!-- Right side: badges + expand -->
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

                <!-- Expand/collapse button -->
                <button
                  data-testid="expand-toggle"
                  type="button"
                  class="p-1 -m-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  @click.stop="toggleExpanded(spell.id)"
                >
                  <UIcon
                    :name="isExpanded(spell.id) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                    class="w-5 h-5 text-gray-400"
                  />
                </button>
              </div>
            </div>

            <!-- Expanded Details -->
            <div
              v-if="isExpanded(spell.id)"
              data-testid="spell-details"
              class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm"
            >
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Casting Time</span>
                  <p class="font-medium">
                    {{ spell.casting_time }}
                  </p>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Range</span>
                  <p class="font-medium">
                    {{ spell.range }}
                  </p>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Components</span>
                  <p class="font-medium">
                    {{ spell.components }}
                  </p>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Duration</span>
                  <p class="font-medium">
                    {{ spell.duration }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Copy Spell Confirmation Dialog -->
    <UModal v-model:open="showLearnDialog">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Copy {{ spellToLearn?.name }} to Spellbook?
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
              Copy
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
