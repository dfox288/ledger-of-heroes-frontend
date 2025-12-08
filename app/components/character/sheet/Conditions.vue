<!-- app/components/character/sheet/Conditions.vue -->
<script setup lang="ts">
/**
 * Active Conditions Display
 *
 * Displays a prominent alert banner when the character has active conditions.
 * Hidden when no conditions are present.
 */

const props = defineProps<{
  conditions?: {
    id: string
    name: string
    slug: string
    level: string
    source: string
    duration: string
    is_dangling: boolean
  }[]
}>()

/**
 * Only show alert when conditions exist
 */
const showConditions = computed(() => {
  return props.conditions && props.conditions.length > 0
})

/**
 * Number of active conditions for title
 */
const conditionCount = computed(() => {
  return props.conditions?.length ?? 0
})

/**
 * Alert title with singular/plural handling
 */
const alertTitle = computed(() => {
  const count = conditionCount.value
  return count === 1 ? '1 Active Condition' : `${count} Active Conditions`
})

/**
 * Format condition display text
 * Includes level for Exhaustion, shows duration
 */
function formatCondition(condition: {
  id: string
  name: string
  slug: string
  level: string
  source: string
  duration: string
  is_dangling: boolean
}) {
  const levelText = condition.level ? ` ${condition.level}` : ''
  const name = `${condition.name}${levelText}`
  return `${name} - ${condition.duration}`
}
</script>

<template>
  <UAlert
    v-if="showConditions"
    data-testid="conditions-alert"
    color="warning"
    icon="i-heroicons-exclamation-triangle"
    :title="alertTitle"
  >
    <template #description>
      <ul class="list-disc list-inside space-y-1">
        <li
          v-for="condition in conditions"
          :key="condition.id"
        >
          {{ formatCondition(condition) }}
        </li>
      </ul>
    </template>
  </UAlert>
</template>
