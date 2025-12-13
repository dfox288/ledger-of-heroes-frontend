<!-- app/pages/characters/[publicId]/inventory.vue -->
<script setup lang="ts">
/**
 * Inventory Management Page
 *
 * Full inventory UI with item actions, equipment status sidebar,
 * add loot/shop modals, and optional encumbrance tracking.
 *
 * @see Design: docs/frontend/plans/2025-12-13-inventory-tab-design-v2.md
 */

const route = useRoute()
const publicId = computed(() => route.params.publicId as string)

// Fetch character data for page context
const { apiFetch } = useApi()
const { data: characterData, pending: characterPending } = await useAsyncData(
  `inventory-character-${publicId.value}`,
  () => apiFetch<{ data: { id: number, name: string, public_id: string } }>(`/characters/${publicId.value}`)
)

// Fetch equipment data
const { data: equipmentData, pending: equipmentPending, refresh: refreshEquipment } = await useAsyncData(
  `inventory-equipment-${publicId.value}`,
  () => apiFetch<{ data: unknown[] }>(`/characters/${publicId.value}/equipment`)
)

// Fetch stats for carrying capacity
const { data: statsData, pending: statsPending } = await useAsyncData(
  `inventory-stats-${publicId.value}`,
  () => apiFetch<{ data: { carrying_capacity?: number, push_drag_lift?: number, spellcasting?: unknown } }>(
    `/characters/${publicId.value}/stats`
  )
)

const loading = computed(() => characterPending.value || equipmentPending.value || statsPending.value)
const character = computed(() => characterData.value?.data ?? null)
const equipment = computed(() => equipmentData.value?.data ?? [])
const stats = computed(() => statsData.value?.data ?? null)
const isSpellcaster = computed(() => !!stats.value?.spellcasting)

useSeoMeta({
  title: () => character.value ? `${character.value.name} - Inventory` : 'Inventory'
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- Back Link -->
    <div class="mb-4">
      <UButton
        :to="`/characters/${publicId}`"
        variant="ghost"
        icon="i-heroicons-arrow-left"
      >
        Back to Character
      </UButton>
    </div>

    <!-- Tab Navigation -->
    <CharacterTabNavigation
      data-testid="tab-navigation"
      :public-id="publicId"
      :is-spellcaster="isSpellcaster"
    />

    <!-- Loading State -->
    <div
      v-if="loading"
      data-testid="loading-skeleton"
      class="space-y-4"
    >
      <USkeleton class="h-12 w-full" />
      <div class="grid lg:grid-cols-[1fr_280px] gap-6">
        <USkeleton class="h-96" />
        <USkeleton class="h-96" />
      </div>
    </div>

    <!-- Main Content -->
    <div
      v-else
      data-testid="inventory-layout"
      class="grid lg:grid-cols-[1fr_280px] gap-6"
    >
      <!-- Left Column: Item List -->
      <div class="space-y-4">
        <!-- Character Name (for SEO and context) -->
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ character?.name }}'s Inventory
        </h1>

        <!-- Search -->
        <UInput
          placeholder="Search items..."
          icon="i-heroicons-magnifying-glass"
          data-testid="item-search"
        />

        <!-- Item List Placeholder -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center text-gray-500">
          Item list will go here
          <br>
          {{ equipment.length }} items loaded
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <UButton
            data-testid="add-loot-btn"
            icon="i-heroicons-plus"
          >
            Add Loot
          </UButton>
          <UButton
            data-testid="shop-btn"
            variant="outline"
            icon="i-heroicons-shopping-cart"
          >
            Shop
          </UButton>
        </div>
      </div>

      <!-- Right Column: Sidebar -->
      <div class="space-y-4">
        <!-- Sidebar Placeholder -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">Equipment status sidebar</p>
          <p class="text-xs text-gray-400 mt-2">
            Carrying Capacity: {{ stats?.carrying_capacity ?? 'N/A' }} lbs
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
