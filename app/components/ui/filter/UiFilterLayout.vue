<script setup lang="ts">
/**
 * UiFilterLayout - 3-Tier Filter Layout Component
 *
 * Provides a consistent, responsive layout structure for entity list filters.
 * Based on the spell filter refactor (2025-11-25).
 *
 * @example
 * ```vue
 * <UiFilterLayout>
 *   <template #primary>
 *     <USelectMenu v-model="level" :items="levelOptions" class="w-full sm:w-48" />
 *     <USelectMenu v-model="school" :items="schoolOptions" class="w-full sm:w-48" />
 *   </template>
 *
 *   <template #quick>
 *     <UiFilterToggle v-model="concentration" label="Concentration" />
 *     <UiFilterToggle v-model="ritual" label="Ritual" />
 *   </template>
 *
 *   <template #advanced>
 *     <UiFilterMultiSelect v-model="damageTypes" label="Damage Types" class="w-full sm:w-48" />
 *   </template>
 *
 *   <template #actions>
 *     <UButton @click="clearFilters">Clear Filters</UButton>
 *   </template>
 * </UiFilterLayout>
 * ```
 *
 * **Tier Structure:**
 * - **Primary:** Most frequently used filters (dropdowns, select menus)
 * - **Quick:** Toggle filters (binary yes/no/all choices)
 * - **Advanced:** Less frequently used filters (multi-select, range sliders)
 * - **Actions:** Action buttons (clear filters, apply, etc.)
 *
 * **Layout Behavior:**
 * - Primary: flex row with wrapping, gap-3 (12px)
 * - Quick: flex row with wrapping, gap-3 (aligns with primary)
 * - Advanced: flex row with wrapping, gap-3
 * - Actions: flex row, right-aligned
 *
 * **Responsive:**
 * - Mobile: All filters stack vertically
 * - Tablet/Desktop: Toggles flow horizontally, wrapping as needed
 *
 * **Spacing:**
 * - space-y-4 (16px) between tiers
 * - gap-3 (12px) between filters within a tier
 */

// Slots are defined implicitly by the template
defineSlots<{
  primary?: () => any
  quick?: () => any
  advanced?: () => any
  actions?: () => any
}>()
</script>

<template>
  <div class="space-y-4">
    <!-- TIER 1: Primary Filters (Most Used) -->
    <div
      v-if="$slots.primary"
      data-section="primary"
      class="flex flex-wrap gap-3"
    >
      <slot name="primary" />
    </div>

    <!-- TIER 2: Quick Toggles -->
    <div
      v-if="$slots.quick"
      data-section="quick"
      class="flex flex-wrap gap-3"
    >
      <slot name="quick" />
    </div>

    <!-- TIER 3: Advanced Filters -->
    <div
      v-if="$slots.advanced"
      data-section="advanced"
      class="flex flex-wrap gap-3"
    >
      <slot name="advanced" />
    </div>

    <!-- Actions (Clear Filters, etc.) -->
    <div
      v-if="$slots.actions"
      data-section="actions"
      class="flex justify-end"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
