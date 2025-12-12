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
  skills,
  skillAdvantages,
  savingThrows,
  hitDice,
  loading,
  error,
  refresh
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

// Save play mode preference when changed
watch(isPlayMode, (newValue) => {
  localStorage.setItem('character-play-mode', String(newValue))
})

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

/**
 * Handle HP changes from HpEditModal
 * Applies D&D rules: temp HP absorbs damage first, healing caps at max
 */
async function handleHpChange(delta: number) {
  if (isUpdatingHp.value || !character.value) return

  isUpdatingHp.value = true

  // Calculate new values using D&D rules
  const { applyHpDelta } = await import('~/composables/useHpCalculations')
  const { newCurrentHp, newTempHp } = applyHpDelta({
    delta,
    currentHp: localHitPoints.current,
    maxHp: localHitPoints.max,
    tempHp: localHitPoints.temporary
  })

  // Optimistic update
  const oldCurrent = localHitPoints.current
  const oldTemp = localHitPoints.temporary
  localHitPoints.current = newCurrentHp
  localHitPoints.temporary = newTempHp

  try {
    await apiFetch(`/characters/${character.value.id}`, {
      method: 'PATCH',
      body: {
        current_hit_points: newCurrentHp,
        temp_hit_points: newTempHp
      }
    })
  } catch (err) {
    // Rollback on error
    localHitPoints.current = oldCurrent
    localHitPoints.temporary = oldTemp
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
 * D&D rule: Temp HP doesn't stack - keep higher value
 */
async function handleTempHpSet(value: number) {
  if (isUpdatingHp.value || !character.value) return

  isUpdatingHp.value = true

  // D&D rule: keep higher value
  const { applyTempHp } = await import('~/composables/useHpCalculations')
  const newTempHp = applyTempHp({
    newTempHp: value,
    currentTempHp: localHitPoints.temporary
  })

  const oldTemp = localHitPoints.temporary
  localHitPoints.temporary = newTempHp

  try {
    await apiFetch(`/characters/${character.value.id}`, {
      method: 'PATCH',
      body: { temp_hit_points: newTempHp }
    })
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
 */
async function handleTempHpClear() {
  if (isUpdatingHp.value || !character.value) return

  isUpdatingHp.value = true
  const oldTemp = localHitPoints.temporary
  localHitPoints.temporary = 0

  try {
    await apiFetch(`/characters/${character.value.id}`, {
      method: 'PATCH',
      body: { temp_hit_points: 0 }
    })
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
    <!-- Top Bar: Back Link + Play Mode Toggle -->
    <div class="flex items-center justify-between mb-6">
      <UButton
        to="/characters"
        variant="ghost"
        icon="i-heroicons-arrow-left"
      >
        Back to Characters
      </UButton>

      <!-- Play Mode Toggle -->
      <div class="flex items-center gap-2">
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
      <CharacterSheetHeader :character="character" />

      <!-- Validation Warning - shows when sourcebook content was removed -->
      <CharacterSheetValidationWarning :validation-result="validationResult" />

      <!-- Active Conditions - shows when character has status effects -->
      <CharacterSheetConditions :conditions="character.conditions" />

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
</template>
