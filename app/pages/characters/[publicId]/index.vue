<!-- app/pages/characters/[publicId]/index.vue -->
<script setup lang="ts">
/**
 * Character View Page - Full Character Sheet
 *
 * Displays comprehensive D&D 5e character sheet with all data sections.
 * Uses useCharacterSheet composable for parallel data fetching.
 *
 * URL: /characters/:publicId (e.g., /characters/shadow-warden-q3x9)
 *
 * Play Mode: Toggle to enable interactive features (death saves, HP, etc.)
 */
import type { Condition } from '~/types'

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
// Play Mode
// ============================================================================

const { apiFetch } = useApi()
const toast = useToast()

/**
 * Play mode toggle - enables interactive features
 * Persisted to localStorage for convenience
 */
const isPlayMode = ref(false)

// Load play mode preference from localStorage on mount
onMounted(() => {
  const saved = localStorage.getItem('character-play-mode')
  if (saved === 'true') {
    isPlayMode.value = true
  }
})

// Save play mode preference when changed (only for complete characters)
watch(isPlayMode, (newValue) => {
  localStorage.setItem('character-play-mode', String(newValue))
})

// Ensure play mode is disabled for draft characters
watch(() => character.value?.is_complete, (isComplete) => {
  if (!isComplete && isPlayMode.value) {
    isPlayMode.value = false
  }
}, { immediate: true })

/**
 * Local reactive state for death saves
 * Needed because character from useAsyncData is a computed ref that doesn't propagate mutations
 */
const localDeathSaves = reactive({
  successes: 0,
  failures: 0
})

/** Prevents race conditions from rapid clicks */
const isUpdatingDeathSaves = ref(false)

// Sync local state when character data loads
watch(() => character.value, (char) => {
  if (char) {
    localDeathSaves.successes = char.death_save_successes ?? 0
    localDeathSaves.failures = char.death_save_failures ?? 0
  }
}, { immediate: true })

/**
 * Handle death save updates
 * Uses optimistic UI - update locally first, then sync to API
 * Prevents race conditions by blocking during API call
 */
async function handleDeathSaveUpdate(field: 'successes' | 'failures', value: number) {
  if (isUpdatingDeathSaves.value || !character.value) return

  isUpdatingDeathSaves.value = true
  const oldValue = localDeathSaves[field]
  localDeathSaves[field] = value

  try {
    await apiFetch(`/characters/${character.value.id}`, {
      method: 'PATCH',
      body: {
        [`death_save_${field}`]: value
      }
    })
  } catch (err) {
    // Rollback on error
    localDeathSaves[field] = oldValue
    logger.error('Failed to update death saves:', err)
    toast.add({
      title: 'Failed to save',
      description: 'Could not update death saves',
      color: 'error'
    })
  } finally {
    isUpdatingDeathSaves.value = false
  }
}

// ============================================================================
// HP Management (Play Mode)
// ============================================================================

/**
 * Local reactive state for HP
 * Needed because stats from useAsyncData doesn't propagate mutations
 */
const localHitPoints = reactive({
  current: 0,
  max: 0,
  temporary: 0
})

/** Prevents race conditions from rapid clicks */
const isUpdatingHp = ref(false)

// Sync local HP state when stats data loads
watch(() => stats.value, (newStats) => {
  if (newStats?.hit_points) {
    localHitPoints.current = newStats.hit_points.current ?? 0
    localHitPoints.max = newStats.hit_points.max ?? 0
    localHitPoints.temporary = newStats.hit_points.temporary ?? 0
  }
}, { immediate: true })

/** Response shape from PATCH /api/characters/:id/hp */
interface HpUpdateResponse {
  data: {
    current_hit_points: number
    max_hit_points: number
    temp_hit_points: number
    death_save_successes: number
    death_save_failures: number
  }
}

/**
 * Sync local state from HP endpoint response
 * Updates HP and death saves from backend's authoritative response
 */
function syncFromHpResponse(response: HpUpdateResponse) {
  localHitPoints.current = response.data.current_hit_points
  localHitPoints.max = response.data.max_hit_points
  localHitPoints.temporary = response.data.temp_hit_points
  localDeathSaves.successes = response.data.death_save_successes
  localDeathSaves.failures = response.data.death_save_failures
}

/**
 * Handle HP changes from HpEditModal
 * Sends delta to backend which handles all D&D rules:
 * - Temp HP absorbs damage first
 * - Healing caps at max HP
 * - Death saves reset when healing from 0
 */
async function handleHpChange(delta: number) {
  if (isUpdatingHp.value || !character.value) return
  if (delta === 0) return // No-op

  isUpdatingHp.value = true

  // Store old values for rollback
  const oldCurrent = localHitPoints.current
  const oldTemp = localHitPoints.temporary
  const oldDeathSuccesses = localDeathSaves.successes
  const oldDeathFailures = localDeathSaves.failures

  try {
    // Send delta as signed string (e.g., "-12" or "+8")
    const hpDelta = delta > 0 ? `+${delta}` : `${delta}`
    const response = await apiFetch<HpUpdateResponse>(`/characters/${character.value.id}/hp`, {
      method: 'PATCH',
      body: { hp: hpDelta }
    })

    // Update local state from authoritative backend response
    syncFromHpResponse(response)
  } catch (err) {
    // Rollback on error
    localHitPoints.current = oldCurrent
    localHitPoints.temporary = oldTemp
    localDeathSaves.successes = oldDeathSuccesses
    localDeathSaves.failures = oldDeathFailures
    logger.error('Failed to update HP:', err)
    toast.add({
      title: 'Failed to save',
      description: 'Could not update hit points',
      color: 'error'
    })
  } finally {
    isUpdatingHp.value = false
  }
}

/**
 * Handle temp HP set from TempHpModal
 * Backend enforces D&D rule: Temp HP uses higher-wins (doesn't stack)
 */
async function handleTempHpSet(value: number) {
  if (isUpdatingHp.value || !character.value) return

  isUpdatingHp.value = true
  const oldTemp = localHitPoints.temporary

  try {
    const response = await apiFetch<HpUpdateResponse>(`/characters/${character.value.id}/hp`, {
      method: 'PATCH',
      body: { temp_hp: value }
    })

    // Update local state from authoritative backend response
    syncFromHpResponse(response)
  } catch (err) {
    localHitPoints.temporary = oldTemp
    logger.error('Failed to set temp HP:', err)
    toast.add({
      title: 'Failed to save',
      description: 'Could not set temporary hit points',
      color: 'error'
    })
  } finally {
    isUpdatingHp.value = false
  }
}

/**
 * Handle temp HP clear from TempHpModal
 * Sends temp_hp: 0 to clear (overrides higher-wins rule)
 */
async function handleTempHpClear() {
  if (isUpdatingHp.value || !character.value) return

  isUpdatingHp.value = true
  const oldTemp = localHitPoints.temporary

  try {
    const response = await apiFetch<HpUpdateResponse>(`/characters/${character.value.id}/hp`, {
      method: 'PATCH',
      body: { temp_hp: 0 }
    })

    // Update local state from authoritative backend response
    syncFromHpResponse(response)
  } catch (err) {
    localHitPoints.temporary = oldTemp
    logger.error('Failed to clear temp HP:', err)
    toast.add({
      title: 'Failed to save',
      description: 'Could not clear temporary hit points',
      color: 'error'
    })
  } finally {
    isUpdatingHp.value = false
  }
}

/**
 * Computed stats that uses local HP values when in play mode
 * Falls back to server data when not in play mode
 */
const displayStats = computed(() => {
  if (!stats.value) return null

  return {
    ...stats.value,
    hit_points: isPlayMode.value
      ? { current: localHitPoints.current, max: localHitPoints.max, temporary: localHitPoints.temporary }
      : stats.value.hit_points
  }
})

// ============================================================================
// Rest Actions (Play Mode)
// ============================================================================

/** Long rest confirmation modal state */
const showLongRestModal = ref(false)

/** Level up confirmation modal state */
const showLevelUpModal = ref(false)

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

    // Sync local HP state from server after long rest
    if (stats.value?.hit_points) {
      localHitPoints.current = stats.value.hit_points.current ?? 0
      localHitPoints.max = stats.value.hit_points.max ?? 0
      localHitPoints.temporary = stats.value.hit_points.temporary ?? 0
    }

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
// ============================================================================

/** Fetch available conditions for the add modal */
const { data: availableConditions } = useReferenceData<Condition>('/conditions')

/** Add condition modal state */
const showAddConditionModal = ref(false)

/** Deadly exhaustion confirmation modal state */
const showDeadlyExhaustionModal = ref(false)

/** Pending deadly exhaustion data for confirmation */
const pendingDeadlyExhaustion = ref<{ slug: string, currentLevel: number, targetLevel: number, source: string | null, duration: string | null } | null>(null)

/** Prevents race conditions from rapid condition updates */
const isUpdatingConditions = ref(false)

/**
 * Handle add condition button click from Conditions panel
 */
function handleAddConditionClick() {
  showAddConditionModal.value = true
}

/**
 * Handle add condition from modal
 * POSTs new condition to backend
 */
async function handleAddCondition(payload: { condition: string, source: string, duration: string, level?: number }) {
  if (isUpdatingConditions.value || !character.value) return

  isUpdatingConditions.value = true

  try {
    await apiFetch(`/characters/${character.value.id}/conditions`, {
      method: 'POST',
      body: payload
    })
    await refresh()
    toast.add({
      title: 'Condition added',
      color: 'success'
    })
  } catch (err) {
    logger.error('Failed to add condition:', err)
    toast.add({
      title: 'Failed to add condition',
      color: 'error'
    })
  } finally {
    isUpdatingConditions.value = false
  }
}

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

// Tab items for bottom section
const tabItems = computed(() => {
  const items = [
    { label: 'Features', slot: 'features', icon: 'i-heroicons-star' },
    { label: 'Proficiencies', slot: 'proficiencies', icon: 'i-heroicons-academic-cap' },
    { label: 'Equipment', slot: 'equipment', icon: 'i-heroicons-briefcase' },
    { label: 'Languages', slot: 'languages', icon: 'i-heroicons-language' },
    { label: 'Notes', slot: 'notes', icon: 'i-heroicons-document-text' }
  ]
  // Only show Spells tab for casters
  if (stats.value?.spellcasting) {
    items.splice(3, 0, { label: 'Spells', slot: 'spells', icon: 'i-heroicons-sparkles' })
  }
  return items
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <!-- Top Bar: Back Link + Play Mode Toggle (only for complete characters) -->
    <div class="flex items-center justify-between mb-6">
      <UButton
        to="/characters"
        variant="ghost"
        icon="i-heroicons-arrow-left"
      >
        Back to Characters
      </UButton>

      <!-- Play Mode Toggle (only for complete characters) -->
      <div
        v-if="character?.is_complete"
        class="flex items-center gap-2"
      >
        <span class="text-sm text-gray-500 dark:text-gray-400">Play Mode</span>
        <USwitch
          v-model="isPlayMode"
          data-testid="play-mode-toggle"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="space-y-6"
    >
      <USkeleton class="h-20 w-full" />
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
      <!-- Header -->
      <CharacterSheetHeader
        :character="character"
        :is-play-mode="isPlayMode"
        @add-condition="handleAddConditionClick"
        @level-up="showLevelUpModal = true"
      />

      <!-- Validation Warning - shows when sourcebook content was removed -->
      <CharacterSheetValidationWarning :validation-result="validationResult" />

      <!-- Active Conditions - only shows when character has conditions -->
      <CharacterSheetConditions
        v-if="conditions.length > 0"
        :conditions="conditions"
        :editable="isPlayMode"
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
            :editable="isPlayMode"
            :disabled="isResting"
            @spend="handleHitDiceSpend"
            @short-rest="handleShortRest"
            @long-rest="showLongRestModal = true"
          />
        </div>

        <!-- Right: Combat Stats + Saves/Skills -->
        <div class="space-y-6">
          <!-- Combat Stats Grid -->
          <CharacterSheetCombatStatsGrid
            v-if="displayStats"
            :character="character"
            :stats="displayStats"
            :currency="character.currency"
            :editable="isPlayMode"
            :death-save-failures="localDeathSaves.failures"
            :death-save-successes="localDeathSaves.successes"
            @hp-change="handleHpChange"
            @temp-hp-set="handleTempHpSet"
            @temp-hp-clear="handleTempHpClear"
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
              <CharacterSheetDeathSaves
                :successes="localDeathSaves.successes"
                :failures="localDeathSaves.failures"
                :editable="isPlayMode"
                @update:successes="handleDeathSaveUpdate('successes', $event)"
                @update:failures="handleDeathSaveUpdate('failures', $event)"
              />
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

        <template #equipment>
          <CharacterSheetEquipmentPanel
            :equipment="equipment"
            :carrying-capacity="stats?.carrying_capacity"
            :push-drag-lift="stats?.push_drag_lift"
          />
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

  <!-- Level Up Confirmation Modal -->
  <CharacterSheetLevelUpConfirmModal
    v-if="character"
    v-model:open="showLevelUpModal"
    :character-public-id="character.public_id"
    :current-level="character.level"
  />

  <!-- Add Condition Modal -->
  <CharacterSheetAddConditionModal
    v-model:open="showAddConditionModal"
    :available-conditions="availableConditions ?? []"
    @add="handleAddCondition"
  />

  <!-- Deadly Exhaustion Confirmation Modal -->
  <CharacterSheetDeadlyExhaustionConfirmModal
    v-model:open="showDeadlyExhaustionModal"
    @confirm="handleDeadlyExhaustionConfirmed"
  />
</template>
