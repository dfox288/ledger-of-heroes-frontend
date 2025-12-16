<!-- app/components/character/wizard/choice/GrantedItemsSection.vue -->
<script setup lang="ts">
/**
 * GrantedItemsSection - Displays items already granted to the character
 *
 * Used to show languages, proficiencies, or other items the character
 * already has before presenting choices.
 */

export interface GrantedItem {
  id: number | string
  name: string
}

/** Valid badge colors from NuxtUI */
type BadgeColor = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'neutral'
  | 'spell' | 'item' | 'race' | 'class' | 'background' | 'feat' | 'monster' | 'ability' | 'condition' | 'creature'

export interface GrantedGroup {
  /** Group label (e.g., "From Race (Human)") */
  label: string
  /** Color for badges (e.g., "race", "class", "background") */
  color: BadgeColor
  /** Optional icon for the group */
  icon?: string
  /** Items in this group */
  items: GrantedItem[]
}

interface Props {
  /** Grouped items to display */
  groups: GrantedGroup[]
  /** Section title (default: "Already Granted") */
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Already Granted'
})

const hasAnyItems = computed(() => {
  return props.groups.length > 0 && props.groups.some(g => g.items.length > 0)
})
</script>

<template>
  <div
    v-if="hasAnyItems"
    data-testid="granted-items-section"
    class="mb-8"
  >
    <h3
      data-testid="granted-items-title"
      class="text-lg font-semibold mb-4 flex items-center gap-2"
    >
      <UIcon
        name="i-heroicons-check-circle"
        class="w-5 h-5 text-success"
      />
      {{ title }}
    </h3>

    <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
      <div
        v-for="(group, groupIndex) in groups"
        :key="groupIndex"
        data-testid="granted-group"
      >
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
          <UIcon
            v-if="group.icon"
            data-testid="group-icon"
            :name="group.icon"
            class="w-4 h-4"
          />
          {{ group.label }}:
        </p>
        <div class="flex flex-wrap gap-2">
          <!-- Default item rendering with badge -->
          <template v-if="!$slots.item">
            <UBadge
              v-for="item in group.items"
              :key="item.id"
              :color="group.color"
              variant="subtle"
              size="md"
              data-testid="granted-item-badge"
            >
              {{ item.name }}
            </UBadge>
          </template>
          <!-- Custom item rendering via slot -->
          <template v-else>
            <slot
              v-for="item in group.items"
              :key="item.id"
              name="item"
              :item="item"
              :group="group"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
