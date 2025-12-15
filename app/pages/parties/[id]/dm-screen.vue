<!-- app/pages/parties/[id]/dm-screen.vue -->
<script setup lang="ts">
import type { DmScreenPartyStats, EncounterPreset, PresetMonster } from '~/types/dm-screen'
import { useDmScreenCombat } from '~/composables/useDmScreenCombat'
import { useEncounterMonsters } from '~/composables/useEncounterMonsters'
import { useEncounterPresets } from '~/composables/useEncounterPresets'
import { logger } from '~/utils/logger'

// Disable SSR for this page - combat state is client-side only
definePageMeta({
  ssr: false
})

const route = useRoute()
const partyId = computed(() => route.params.id as string)
const toast = useToast()

// Encounter monsters management
const encounterMonsters = useEncounterMonsters(partyId.value)

// Encounter presets (saved monster groups)
const encounterPresets = useEncounterPresets()

const { apiFetch } = useApi()

// Fetch party stats
const { data: statsResponse, pending, error, refresh } = await useAsyncData(
  `party-stats-${partyId.value}`,
  () => apiFetch<{ data: DmScreenPartyStats }>(`/parties/${partyId.value}/stats`)
)

const stats = computed(() => statsResponse.value?.data)

// Combat state management - initialized once when stats are available
const combat = ref<ReturnType<typeof useDmScreenCombat> | null>(null)

watchEffect(() => {
  if (stats.value?.characters && !combat.value) {
    combat.value = useDmScreenCombat(partyId.value, stats.value.characters, encounterMonsters.monsters)
  }
})

// Expose combat state for template binding
const combatState = computed(() => {
  if (!combat.value) return null
  // Use toValue to handle both Ref and raw value (Vue type inference quirk)
  return toValue(combat.value.state)
})

// Combat action handlers
function handleStartCombat() {
  combat.value?.startCombat()
}

function handleNextTurn() {
  combat.value?.nextTurn()
}

function handlePreviousTurn() {
  combat.value?.previousTurn()
}

function handleResetCombat() {
  combat.value?.resetCombat()
}

function handleSetInitiative(key: string, value: number) {
  combat.value?.setInitiative(key, value)
}

// Monster handlers
const showAddMonsterModal = ref(false)
const addingMonster = ref(false)

async function handleAddMonster(monsterId: number, quantity: number) {
  addingMonster.value = true
  try {
    await encounterMonsters.addMonster(monsterId, quantity)
    showAddMonsterModal.value = false
  } catch (err) {
    logger.error('Failed to add monster:', err)
    toast.add({ title: 'Failed to add monster', color: 'error' })
  } finally {
    addingMonster.value = false
  }
}

async function handleUpdateMonsterHp(instanceId: number, hp: number) {
  // Optimistic update
  const monster = encounterMonsters.monsters.value.find(m => m.id === instanceId)
  if (monster) monster.current_hp = hp
  // Sync to backend (debounced in component, but we handle immediate here)
  await encounterMonsters.updateMonsterHp(instanceId, hp)
}

async function handleRemoveMonster(instanceId: number) {
  await encounterMonsters.removeMonster(instanceId)
}

async function handleUpdateMonsterLabel(instanceId: number, label: string) {
  await encounterMonsters.updateMonsterLabel(instanceId, label)
}

async function handleClearEncounter() {
  await encounterMonsters.clearEncounter()
}

// Preset modal state
const showSavePresetModal = ref(false)
const showLoadPresetModal = ref(false)

// Convert current encounter monsters to preset format
const currentMonstersForPreset = computed<PresetMonster[]>(() => {
  // Group monsters by monster_id and count quantities
  const grouped = new Map<number, { monster_id: number, monster_name: string, quantity: number }>()

  for (const monster of encounterMonsters.monsters.value) {
    const existing = grouped.get(monster.monster_id)
    if (existing) {
      existing.quantity++
    } else {
      grouped.set(monster.monster_id, {
        monster_id: monster.monster_id,
        monster_name: monster.monster.name,
        quantity: 1
      })
    }
  }

  return Array.from(grouped.values())
})

// Preset handlers
function handleSavePreset(name: string) {
  encounterPresets.savePreset(name, currentMonstersForPreset.value)
  toast.add({ title: 'Preset saved!', color: 'success' })
}

async function handleLoadPreset(preset: EncounterPreset) {
  // Add each monster from the preset to the encounter, tracking successes/failures
  let successCount = 0
  const failedMonsters: string[] = []

  for (const monster of preset.monsters) {
    try {
      await encounterMonsters.addMonster(monster.monster_id, monster.quantity)
      successCount += monster.quantity
    } catch (err) {
      logger.error('Failed to add monster from preset:', err)
      failedMonsters.push(monster.monster_name)
    }
  }

  // Show appropriate toast based on results
  if (failedMonsters.length === 0) {
    toast.add({ title: `Loaded "${preset.name}"`, color: 'success' })
  } else if (successCount === 0) {
    toast.add({ title: `Failed to load "${preset.name}"`, description: 'Could not add any monsters', color: 'error' })
  } else {
    toast.add({
      title: `Partially loaded "${preset.name}"`,
      description: `Added ${successCount} monster${successCount !== 1 ? 's' : ''}, failed: ${failedMonsters.join(', ')}`,
      color: 'warning'
    })
  }
}

function handleDeletePreset(presetId: string) {
  encounterPresets.deletePreset(presetId)
  toast.add({ title: 'Preset deleted', color: 'neutral' })
}

// SEO
useSeoMeta({
  title: () => stats.value ? `DM Screen - ${stats.value.party.name}` : 'DM Screen',
  description: () => 'Combat reference and party overview for dungeon masters'
})

// Summary collapse state (persisted)
const STORAGE_KEY = 'dm-screen-summary-collapsed'

const summaryCollapsed = ref(true) // Default collapsed - less clutter

// Keyboard shortcuts
function handleKeydown(event: KeyboardEvent) {
  // Don't trigger if user is typing in an input
  const target = event.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return
  }

  // Only handle shortcuts when in combat
  if (!combatState.value?.inCombat) return

  if (event.key === 'n' || event.key === 'N' || event.key === ' ') {
    event.preventDefault()
    handleNextTurn()
  } else if (event.key === 'p' || event.key === 'P') {
    event.preventDefault()
    handlePreviousTurn()
  }
}

onMounted(async () => {
  if (import.meta.client) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) {
        summaryCollapsed.value = stored === 'true'
      }
    } catch {
      // localStorage unavailable (private browsing, storage full)
    }
    // Add keyboard shortcut listener
    window.addEventListener('keydown', handleKeydown)
  }
  // Fetch encounter monsters
  await encounterMonsters.fetchMonsters()
  // Load saved presets
  encounterPresets.loadPresets()
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', handleKeydown)
  }
})

watch(summaryCollapsed, (val) => {
  if (import.meta.client) {
    try {
      localStorage.setItem(STORAGE_KEY, String(val))
    } catch {
      // localStorage unavailable
    }
  }
})

// Refresh handler
const isRefreshing = ref(false)

async function handleRefresh() {
  isRefreshing.value = true
  try {
    await refresh()
  } catch (err) {
    logger.error('Refresh failed:', err)
  } finally {
    isRefreshing.value = false
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 max-w-7xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <NuxtLink
          data-testid="back-link"
          :to="`/parties/${partyId}`"
          class="inline-flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-500"
        >
          <UIcon
            name="i-heroicons-arrow-left"
            class="w-4 h-4"
          />
          Back to Party
        </NuxtLink>

        <h1
          v-if="stats"
          class="text-2xl font-bold text-neutral-900 dark:text-white"
        >
          {{ stats.party.name }}
        </h1>
      </div>

      <UButton
        data-testid="refresh-button"
        icon="i-heroicons-arrow-path"
        variant="soft"
        :loading="isRefreshing"
        @click="handleRefresh"
      >
        Refresh
      </UButton>
    </div>

    <!-- Loading State -->
    <div
      v-if="pending"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-neutral-400"
      />
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      color="error"
      icon="i-heroicons-exclamation-triangle"
      title="Failed to load party stats"
      class="mb-6"
    >
      <template #description>
        Could not load the DM Screen data. Please try refreshing.
      </template>
      <template #actions>
        <UButton
          variant="soft"
          color="error"
          @click="handleRefresh"
        >
          Retry
        </UButton>
      </template>
    </UAlert>

    <!-- Content -->
    <template v-else-if="stats">
      <!-- Party Summary -->
      <div class="mb-6">
        <DmScreenPartySummary
          v-model:collapsed="summaryCollapsed"
          :summary="stats.party_summary"
          :characters="stats.characters"
        />
      </div>

      <!-- Combat Table -->
      <div
        v-if="combatState"
        class="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700"
      >
        <DmScreenCombatTable
          :characters="stats.characters"
          :monsters="encounterMonsters.monsters.value"
          :combat-state="combatState"
          @start-combat="handleStartCombat"
          @next-turn="handleNextTurn"
          @previous-turn="handlePreviousTurn"
          @reset-combat="handleResetCombat"
          @set-initiative="handleSetInitiative"
          @add-monster="showAddMonsterModal = true"
          @update-monster-hp="handleUpdateMonsterHp"
          @update-monster-label="handleUpdateMonsterLabel"
          @remove-monster="handleRemoveMonster"
          @clear-encounter="handleClearEncounter"
          @save-preset="showSavePresetModal = true"
          @load-preset="showLoadPresetModal = true"
        />
      </div>
    </template>

    <!-- Add Monster Modal -->
    <DmScreenAddMonsterModal
      v-model:open="showAddMonsterModal"
      :loading="addingMonster"
      @add="handleAddMonster"
    />

    <!-- Save Preset Modal -->
    <DmScreenSavePresetModal
      v-model:open="showSavePresetModal"
      :monsters="currentMonstersForPreset"
      @save="handleSavePreset"
    />

    <!-- Load Preset Modal -->
    <DmScreenLoadPresetModal
      v-model:open="showLoadPresetModal"
      :presets="encounterPresets.presets.value"
      @load="handleLoadPreset"
      @delete="handleDeletePreset"
    />
  </div>
</template>
