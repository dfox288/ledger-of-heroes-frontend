<script setup lang="ts">
/**
 * Milestone Badge
 *
 * Visual indicator for milestone levels (subclass choice, ASI, spell tiers, capstone).
 * Uses UBadge for consistent styling across the app.
 */

interface Props {
  type: 'subclass' | 'asi' | 'spell_tier' | 'capstone'
  label?: string
}

const props = defineProps<Props>()

type BadgeColor = 'warning' | 'primary' | 'info' | 'success'

const config = computed<{ icon: string, color: BadgeColor, defaultLabel: string }>(() => {
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
        color: 'info',
        defaultLabel: 'Ability Score Improvement'
      }
    case 'spell_tier':
      return {
        icon: 'i-heroicons-sparkles',
        color: 'primary',
        defaultLabel: 'New Spell Tier'
      }
    case 'capstone':
    default:
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
  <UBadge
    :color="config.color"
    variant="soft"
    size="md"
    :icon="config.icon"
  >
    {{ displayLabel }}
  </UBadge>
</template>
