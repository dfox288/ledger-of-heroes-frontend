<!-- app/pages/parties/[id]/dm-screen.vue -->
<script setup lang="ts">
import type { DmScreenPartyStats } from '~/types/dm-screen'
import { useDmScreenCombat } from '~/composables/useDmScreenCombat'
import { logger } from '~/utils/logger'

const route = useRoute()
const partyId = computed(() => route.params.id as string)

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
    combat.value = useDmScreenCombat(partyId.value, stats.value.characters)
  }
})

// Expose combat state for template binding
const combatState = computed(() => {
  if (!combat.value) return null
  // Use toValue to handle both Ref and raw value (Vue type inference quirk)
  return toValue(combat.value.state)
})

// Combat action handlers
function handleRollAll() {
  combat.value?.rollAll()
}

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

function handleSetInitiative(characterId: number, value: number) {
  combat.value?.setInitiative(characterId, value)
}

// SEO
useSeoMeta({
  title: () => stats.value ? `DM Screen - ${stats.value.party.name}` : 'DM Screen',
  description: () => 'Combat reference and party overview for dungeon masters'
})

// Summary collapse state (persisted)
const STORAGE_KEY = 'dm-screen-summary-collapsed'

const summaryCollapsed = ref(false)

onMounted(() => {
  if (import.meta.client) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) {
        summaryCollapsed.value = stored === 'true'
      }
    } catch {
      // localStorage unavailable (private browsing, storage full)
    }
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
        />
      </div>

      <!-- Combat Table -->
      <div
        v-if="combatState"
        class="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700"
      >
        <DmScreenCombatTable
          :characters="stats.characters"
          :combat-state="combatState"
          @roll-all="handleRollAll"
          @start-combat="handleStartCombat"
          @next-turn="handleNextTurn"
          @previous-turn="handlePreviousTurn"
          @reset-combat="handleResetCombat"
          @set-initiative="handleSetInitiative"
        />
      </div>
    </template>
  </div>
</template>
