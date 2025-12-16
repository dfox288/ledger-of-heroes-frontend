<!-- app/components/character/sheet/PrepareSpellsView.vue -->
<script setup lang="ts">
/**
 * Prepare Spells View for Prepared Casters
 *
 * Shows available class spells for clerics, druids, and paladins to prepare.
 * Fetches from /available-spells endpoint and allows toggling preparation.
 *
 * @see Issue #723 - Prepared caster spell selection
 */
import { storeToRefs } from 'pinia'
import type { Spell } from '~/types/api/entities'
import { formatSpellLevel } from '~/composables/useSpellFormatters'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

const props = defineProps<{
  characterId: number
  classSlug: string
  maxCastableLevel: number
  preparationLimit: number
  preparedCount: number
}>()

const emit = defineEmits<{
  close: []
}>()

const { apiFetch } = useApi()
const toast = useToast()
const store = useCharacterPlayStateStore()
const { preparedSpellIds, isUpdatingSpellPreparation } = storeToRefs(store)

// Filter state
const searchQuery = ref('')
const selectedLevel = ref<number | null>(null)
const hidePrepared = ref(false)

// Fetch available spells
const { data: availableSpellsData, pending, error } = await useAsyncData(
  `character-${props.characterId}-available-spells-${props.classSlug}`,
  () => apiFetch<{ data: Spell[] }>(
    `/characters/${props.characterId}/available-spells?max_level=${props.maxCastableLevel}&class=${encodeURIComponent(props.classSlug)}&include_known=true`
  ),
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
 * Check if spell is in character's spell list
 * For prepared casters, only spells granted by domain/subclass are in the list
 * TODO: Backend should support preparing any class spell (#726)
 */
function isInCharacterSpells(spell: Spell): boolean {
  return characterSpellMap.value.has(spell.slug)
}

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
              // Grey out spells not in character's spell list (can't toggle)
              !isInCharacterSpells(spell) && level !== 0 && 'opacity-30',
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

                <!-- Not in spell list indicator (coming soon) -->
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
  </div>
</template>
