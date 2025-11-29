<script setup lang="ts">
/**
 * Milestone Badge
 *
 * Visual indicator for milestone levels (subclass choice, ASI, spell tiers, capstone).
 */

interface Props {
  type: 'subclass' | 'asi' | 'spell_tier' | 'capstone'
  label?: string
}

const props = defineProps<Props>()

const config = computed(() => {
  switch (props.type) {
    case 'subclass':
      return {
        icon: 'i-heroicons-star-solid',
        color: 'warning',
        defaultLabel: 'Subclass Choice'
      }
    case 'asi':
      return {
        icon: 'i-heroicons-arrow-trending-up',
        color: 'primary',
        defaultLabel: 'Ability Score Improvement'
      }
    case 'spell_tier':
      return {
        icon: 'i-heroicons-sparkles',
        color: 'primary',
        defaultLabel: 'New Spell Tier'
      }
    case 'capstone':
      return {
        icon: 'i-heroicons-trophy',
        color: 'warning',
        defaultLabel: 'Capstone'
      }
  }
})

const displayLabel = computed(() => props.label || config.value.defaultLabel)
</script>

<template>
  <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 text-xs font-semibold">
    <UIcon
      :name="config.icon"
      class="w-3.5 h-3.5"
    />
    <span>{{ displayLabel }}</span>
  </div>
</template>
