<!-- app/pages/characters/[publicId]/index.vue -->
<script setup lang="ts">
/**
 * Character View Page - Full Character Sheet
 *
 * Displays comprehensive D&D 5e character sheet with all data sections.
 * Uses useCharacterSheet composable for parallel data fetching.
 * Uses characterPlayState store for interactive play mode state (HP, currency, death saves).
 *
 * URL: /characters/:publicId (e.g., /characters/shadow-warden-q3x9)
 *
 * Play Mode: Toggle to enable interactive features (death saves, HP, etc.)
 *
 * @see Issue #584 - Character sheet component refactor
 */
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

const route = useRoute()
const publicId = computed(() => route.params.publicId as string)

const {
  character,
  stats,
  proficiencies,
  features,
  equipment,
  spells,
  languages,
  notes,
  conditions,
  skills,
  skillAdvantages,
  savingThrows,
  hitDice,
  loading,
  error,
  refresh,
  refreshHitDice,
  refreshForShortRest,
  refreshForLongRest
} = useCharacterSheet(publicId)

// ============================================================================
// Play State Store
// ============================================================================

const playStateStore = useCharacterPlayStateStore()
const { apiFetch } = useApi()
const toast = useToast()

/**
 * Initialize play state store when character and stats load
 * Store manages HP, death saves, and currency state for play mode
 */
watch([character, stats], ([char, s]) => {
  if (char && s) {
    playStateStore.initialize({
      characterId: char.id,
      isDead: char.is_dead ?? false,
      hitPoints: {
        current: s.hit_points?.current ?? null,
        max: s.hit_points?.max ?? null,
        temporary: s.hit_points?.temporary ?? null
      },
      deathSaves: {
        successes: char.death_save_successes ?? 0,
        failures: char.death_save_failures ?? 0
      },
      currency: char.currency ?? { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
    })
  }
}, { immediate: true })

// Reset store when leaving the page
onUnmounted(() => {
  playStateStore.$reset()
})

// ============================================================================
// Play Mode (from PageHeader)
// ============================================================================

// Reference to PageHeader to access isPlayMode (PageHeader owns play mode state)
const pageHeaderRef = ref<{ isPlayMode: boolean } | null>(null)
const isPlayMode = computed(() => pageHeaderRef.value?.isPlayMode ?? false)

/**
 * Effective edit mode - play mode is enabled AND character is alive
 * Dead characters can't interact with anything (must revive first)
 * Uses store.isDead for reactivity when death state changes mid-session
 */
const canEdit = computed(() => isPlayMode.value && !playStateStore.isDead)

// ============================================================================
// Rest Actions (Play Mode)
// ============================================================================

/** Long rest confirmation modal state */
const showLongRestModal = ref(false)

/** Prevents race conditions from rapid rest actions */
const isResting = ref(false)

/**
 * Handle spending a hit die
 * Just marks the die as spent - player rolls physical dice
 * Uses dedicated refreshHitDice() instead of full refresh() for efficiency
 * @see #541 - Use /hit-dice endpoint for HitDice component
 */
async function handleHitDiceSpend({ dieType }: { dieType: string }) {
  if (isResting.value || !character.value) return

  isResting.value = true

  try {
    await apiFetch(`/characters/${character.value.id}/hit-dice/spend`, {
      method: 'POST',
      body: { die_type: dieType, quantity: 1 }
    })
    // Only refresh hit dice, not all data
    await refreshHitDice()
  } catch (err) {
    logger.error('Failed to spend hit die:', err)
    toast.add({
      title: 'Failed to spend hit die',
      color: 'error'
    })
  } finally {
    isResting.value = false
  }
}

/**
 * Handle short rest
 * Resets short-rest features (Action Surge, pact slots, etc.)
 */
async function handleShortRest() {
  if (isResting.value || !character.value) return

  isResting.value = true

  try {
    interface ShortRestResponse {
      data: {
        pact_magic_reset: boolean
        features_reset: string[]
      }
    }
    const response = await apiFetch<ShortRestResponse>(`/characters/${character.value.id}/short-rest`, {
      method: 'POST'
    })
    await refreshForShortRest()

    // Build toast message
    const resetCount = response.data.features_reset.length
    const message = resetCount > 0
      ? `${resetCount} feature${resetCount > 1 ? 's' : ''} reset`
      : 'Short rest complete'
    toast.add({
      title: message,
      color: 'success'
    })
  } catch (err) {
    logger.error('Failed to take short rest:', err)
    toast.add({
      title: 'Failed to take short rest',
      color: 'error'
    })
  } finally {
    isResting.value = false
  }
}

/**
 * Handle long rest (after confirmation)
 * Restores HP, spell slots, hit dice, clears death saves
 */
async function handleLongRest() {
  if (isResting.value || !character.value) return

  isResting.value = true

  try {
    interface LongRestResponse {
      data: {
        hp_restored: number
        hit_dice_recovered: number
        spell_slots_reset: boolean
        death_saves_cleared: boolean
        features_reset: string[]
      }
    }
    const response = await apiFetch<LongRestResponse>(`/characters/${character.value.id}/long-rest`, {
      method: 'POST'
    })
    await refreshForLongRest()

    // Re-initialize store from refreshed server data
    // The watch on [character, stats] will handle this automatically

    // Build toast message
    const parts: string[] = []
    if (response.data.hp_restored > 0) parts.push(`${response.data.hp_restored} HP restored`)
    if (response.data.hit_dice_recovered > 0) parts.push(`${response.data.hit_dice_recovered} hit dice recovered`)
    if (response.data.spell_slots_reset) parts.push('spell slots reset')

    toast.add({
      title: 'Long rest complete',
      description: parts.join(', ') || undefined,
      color: 'success'
    })
  } catch (err) {
    logger.error('Failed to take long rest:', err)
    toast.add({
      title: 'Failed to take long rest',
      color: 'error'
    })
  } finally {
    isResting.value = false
  }
}

// ============================================================================
// Conditions Management (Play Mode)
// Note: Add Condition is handled by PageHeader. This section handles
// remove, update level, and deadly exhaustion confirmation.
// ============================================================================

/** Deadly exhaustion confirmation modal state */
const showDeadlyExhaustionModal = ref(false)

/** Pending deadly exhaustion data for confirmation */
const pendingDeadlyExhaustion = ref<{ slug: string, currentLevel: number, targetLevel: number, source: string | null, duration: string | null } | null>(null)

/** Prevents race conditions from rapid condition updates */
const isUpdatingConditions = ref(false)

/**
 * Handle remove condition from Conditions panel
 * DELETEs condition from backend
 */
async function handleRemoveCondition(conditionSlug: string) {
  if (isUpdatingConditions.value || !character.value) return

  isUpdatingConditions.value = true

  try {
    await apiFetch(`/characters/${character.value.id}/conditions/${conditionSlug}`, {
      method: 'DELETE'
    })
    await refresh()
    toast.add({
      title: 'Condition removed',
      color: 'success'
    })
  } catch (err) {
    logger.error('Failed to remove condition:', err)
    toast.add({
      title: 'Failed to remove condition',
      color: 'error'
    })
  } finally {
    isUpdatingConditions.value = false
  }
}

/**
 * Handle exhaustion level update from Conditions panel
 * POSTs updated level to backend (upsert behavior)
 * Preserves source and duration from the original condition
 */
async function handleUpdateConditionLevel(payload: { slug: string, level: number, source: string | null, duration: string | null }) {
  if (isUpdatingConditions.value || !character.value) return

  isUpdatingConditions.value = true

  try {
    await apiFetch(`/characters/${character.value.id}/conditions`, {
      method: 'POST',
      body: {
        condition: payload.slug,
        level: payload.level,
        source: payload.source ?? '',
        duration: payload.duration ?? ''
      }
    })
    await refresh()
  } catch (err) {
    logger.error('Failed to update exhaustion level:', err)
    toast.add({
      title: 'Failed to update exhaustion',
      color: 'error'
    })
  } finally {
    isUpdatingConditions.value = false
  }
}

/**
 * Handle deadly exhaustion confirmation request
 * Shows confirmation modal before allowing level 6
 * Preserves source and duration for when confirmation is accepted
 */
function handleDeadlyExhaustionConfirm(payload: { slug: string, currentLevel: number, targetLevel: number, source: string | null, duration: string | null }) {
  pendingDeadlyExhaustion.value = payload
  showDeadlyExhaustionModal.value = true
}

/**
 * Handle confirmed deadly exhaustion
 * Called when user confirms level 6 in the modal
 * Passes through source and duration from pending data
 */
async function handleDeadlyExhaustionConfirmed() {
  if (!pendingDeadlyExhaustion.value) return

  await handleUpdateConditionLevel({
    slug: pendingDeadlyExhaustion.value.slug,
    level: pendingDeadlyExhaustion.value.targetLevel,
    source: pendingDeadlyExhaustion.value.source,
    duration: pendingDeadlyExhaustion.value.duration
  })

  pendingDeadlyExhaustion.value = null
}

// Validation - check for dangling references when sourcebooks are removed
const characterId = computed(() => character.value?.id ?? null)
const { validationResult, validateReferences } = useCharacterValidation(characterId)

// Trigger validation once character is loaded
watch(characterId, async (newId) => {
  if (newId) {
    await validateReferences()
  }
}, { immediate: true })

useSeoMeta({
  title: () => character.value?.name ?? 'Character Sheet',
  description: () => `View ${character.value?.name ?? 'character'} - D&D 5e Character Sheet`
})

// Tab items for bottom section (Equipment moved to dedicated /inventory page)
const tabItems = computed(() => {
  const items = [
    { label: 'Features', slot: 'features', icon: 'i-heroicons-star' },
    { label: 'Proficiencies', slot: 'proficiencies', icon: 'i-heroicons-academic-cap' },
    { label: 'Languages', slot: 'languages', icon: 'i-heroicons-language' },
    { label: 'Notes', slot: 'notes', icon: 'i-heroicons-document-text' }
  ]
  // Only show Spells tab for casters
  if (stats.value?.spellcasting) {
    items.splice(2, 0, { label: 'Spells', slot: 'spells', icon: 'i-heroicons-sparkles' })
  }
  return items
})

// Is this character a spellcaster? (for TabNavigation)
const isSpellcaster = computed(() => !!stats.value?.spellcasting)
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <!-- Loading State -->
    <div
      v-if="loading"
      class="space-y-6"
    >
      <USkeleton class="h-32 w-full" />
      <div class="grid lg:grid-cols-[200px_1fr] gap-6">
        <USkeleton class="h-80" />
        <div class="space-y-4">
          <USkeleton class="h-32" />
          <USkeleton class="h-48" />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      color="error"
      icon="i-heroicons-exclamation-triangle"
      title="Failed to load character"
      :description="error.message"
    />

    <!-- Character Sheet -->
    <div
      v-else-if="character && stats"
      class="space-y-6"
    >
      <!-- Unified Page Header (back button, play mode, portrait, actions, tabs) -->
      <CharacterPageHeader
        ref="pageHeaderRef"
        :character="character"
        :is-spellcaster="isSpellcaster"
        @updated="refresh"
      />

      <!-- Validation Warning - shows when sourcebook content was removed -->
      <CharacterSheetValidationWarning :validation-result="validationResult" />

      <!-- Active Conditions - only shows when character has conditions -->
      <CharacterSheetConditions
        v-if="conditions.length > 0"
        :conditions="conditions"
        :editable="canEdit"
        :is-dead="playStateStore.isDead"
        @remove="handleRemoveCondition"
        @update-level="handleUpdateConditionLevel"
        @confirm-deadly-exhaustion="handleDeadlyExhaustionConfirm"
      />

      <!-- Main Grid: Abilities sidebar + Stats/Skills -->
      <div class="grid lg:grid-cols-[200px_1fr] gap-6">
        <!-- Left Sidebar: Ability Scores + Passive + Hit Dice -->
        <div class="space-y-4">
          <CharacterSheetAbilityScoreBlock :stats="stats" />
          <CharacterSheetPassiveScores
            :perception="stats.passive_perception"
            :investigation="stats.passive_investigation"
            :insight="stats.passive_insight"
          />
          <CharacterSheetHitDice
            v-if="hitDice.length"
            :hit-dice="hitDice"
            :editable="canEdit"
            :disabled="isResting"
            :is-dead="playStateStore.isDead"
            @spend="handleHitDiceSpend"
            @short-rest="handleShortRest"
            @long-rest="showLongRestModal = true"
          />
        </div>

        <!-- Right: Combat Stats + Saves/Skills -->
        <div class="space-y-6">
          <!-- Combat Stats Grid (uses store via managers) -->
          <CharacterSheetCombatStatsGrid
            :character="character"
            :stats="stats"
            :editable="canEdit"
          />

          <!-- Defensive Traits -->
          <CharacterSheetDefensesPanel
            :damage-resistances="stats.damage_resistances ?? []"
            :damage-immunities="stats.damage_immunities ?? []"
            :damage-vulnerabilities="stats.damage_vulnerabilities ?? []"
            :condition-advantages="stats.condition_advantages ?? []"
            :condition-immunities="stats.condition_immunities ?? []"
          />

          <!-- Saving Throws and Skills -->
          <div class="grid lg:grid-cols-3 gap-6">
            <!-- Saving Throws + Death Saves stacked -->
            <div class="space-y-4">
              <CharacterSheetSavingThrowsList :saving-throws="savingThrows" />
              <CharacterSheetDeathSavesManager :editable="canEdit" />
            </div>
            <CharacterSheetSkillsList
              :skills="skills"
              :skill-advantages="skillAdvantages"
              class="lg:col-span-2"
            />
          </div>
        </div>
      </div>

      <!-- Bottom Tabs -->
      <UTabs
        :items="tabItems"
        class="mt-8"
      >
        <template #features>
          <CharacterSheetFeaturesPanel :features="features" />
        </template>

        <template #proficiencies>
          <CharacterSheetProficienciesPanel :proficiencies="proficiencies" />
        </template>

        <template #spells>
          <CharacterSheetSpellsPanel
            v-if="stats.spellcasting"
            :spells="spells"
            :stats="stats"
          />
        </template>

        <template #languages>
          <CharacterSheetLanguagesPanel :languages="languages" />
        </template>

        <template #notes>
          <CharacterSheetNotesPanel :notes="notes" />
        </template>
      </UTabs>
    </div>
  </div>

  <!-- Long Rest Confirmation Modal -->
  <CharacterSheetLongRestConfirmModal
    v-model:open="showLongRestModal"
    @confirm="handleLongRest"
  />

  <!-- Deadly Exhaustion Confirmation Modal -->
  <CharacterSheetDeadlyExhaustionConfirmModal
    v-model:open="showDeadlyExhaustionModal"
    @confirm="handleDeadlyExhaustionConfirmed"
  />
</template>
