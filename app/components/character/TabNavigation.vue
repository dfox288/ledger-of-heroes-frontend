<!-- app/components/character/TabNavigation.vue -->
<script setup lang="ts">
/**
 * Tab Navigation for Character Pages
 *
 * Provides navigation between character sheet views:
 * - Overview (main character sheet)
 * - Inventory (item management)
 * - Spells (if spellcaster)
 * - Future: Battle, Notes, Features
 *
 * @see Design: docs/frontend/plans/2025-12-13-inventory-tab-design-v2.md
 */

interface Props {
  publicId: string
  isSpellcaster?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSpellcaster: false
})

const route = useRoute()

const tabs = computed(() => {
  const baseTabs = [
    { key: 'overview', label: 'Overview', to: `/characters/${props.publicId}` },
    { key: 'inventory', label: 'Inventory', to: `/characters/${props.publicId}/inventory` }
  ]

  if (props.isSpellcaster) {
    baseTabs.push({ key: 'spells', label: 'Spells', to: `/characters/${props.publicId}/spells` })
  }

  // Future tabs: battle, notes, features
  return baseTabs
})

function isActive(tab: { key: string, to: string }): boolean {
  if (tab.key === 'overview') {
    // Overview is active only on exact match (not /inventory, /spells, etc.)
    return route.path === tab.to
  }
  return route.path.startsWith(tab.to)
}
</script>

<template>
  <nav class="border-b border-gray-200 dark:border-gray-700 mb-6">
    <div class="flex gap-6">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.key"
        :to="tab.to"
        :data-testid="`tab-${tab.key}`"
        class="pb-3 text-sm font-medium border-b-2 transition-colors"
        :class="isActive(tab)
          ? 'border-primary text-primary'
          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
      >
        {{ tab.label }}
      </NuxtLink>
    </div>
  </nav>
</template>
