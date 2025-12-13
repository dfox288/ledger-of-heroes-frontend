<!-- app/components/character/sheet/Conditions.vue -->
<script setup lang="ts">
/**
 * Active Conditions Display
 *
 * Displays a prominent red-tinted panel when the character has active conditions.
 * When editable=true (play mode), shows controls for adding/removing conditions.
 * Hidden when no conditions are present (unless editable=true).
 */
import type { CharacterCondition } from '~/types/character'

const props = defineProps<{
  conditions?: CharacterCondition[]
  editable?: boolean
  /** When true, all interactions are disabled because the character is dead (#544) */
  isDead?: boolean
}>()

const emit = defineEmits<{
  'remove': [conditionSlug: string]
  'update-level': [payload: { slug: string, level: number, source: string | null, duration: string | null }]
  'confirm-deadly-exhaustion': [payload: { slug: string, currentLevel: number, targetLevel: number, source: string | null, duration: string | null }]
}>()

/**
 * Whether there are conditions to display
 */
const hasConditions = computed(() => {
  return props.conditions && props.conditions.length > 0
})

/**
 * Check if interactions are allowed
 * Must be editable and character must not be dead
 */
const isInteractive = computed(() => props.editable && !props.isDead)

/**
 * Format condition display text
 * Shows: Name [level] (source) - duration
 * Examples:
 * - "Poisoned (Giant Spider)"
 * - "Exhaustion 2 (Forced march) - Until long rest"
 * - "Frightened - 1 minute"
 */
function formatCondition(condition: CharacterCondition) {
  const levelText = condition.level ? ` ${condition.level}` : ''
  const sourceText = condition.source ? ` (${condition.source})` : ''
  const name = `${condition.condition.name}${levelText}${sourceText}`
  return condition.duration ? `${name} - ${condition.duration}` : name
}

/**
 * Check if a condition is exhaustion
 */
function isExhaustion(condition: CharacterCondition): boolean {
  return condition.is_exhaustion
}

/**
 * Get numeric level from condition (for exhaustion)
 */
function getLevel(condition: CharacterCondition): number {
  return condition.level ?? 1
}

/**
 * Handle remove button click
 */
function handleRemove(conditionSlug: string) {
  emit('remove', conditionSlug)
}

/**
 * Handle exhaustion level increment
 * Emits confirmation request when incrementing to level 6 (death)
 * Preserves source and duration in the payload
 */
function handleIncrement(condition: CharacterCondition) {
  const currentLevel = getLevel(condition)
  if (currentLevel >= 6) return

  const targetLevel = currentLevel + 1

  // Level 6 = death, require confirmation
  if (targetLevel === 6) {
    emit('confirm-deadly-exhaustion', {
      slug: condition.condition_slug,
      currentLevel,
      targetLevel,
      source: condition.source,
      duration: condition.duration
    })
    return
  }

  emit('update-level', {
    slug: condition.condition_slug,
    level: targetLevel,
    source: condition.source,
    duration: condition.duration
  })
}

/**
 * Handle exhaustion level decrement
 * Preserves source and duration in the payload
 */
function handleDecrement(condition: CharacterCondition) {
  const currentLevel = getLevel(condition)
  if (currentLevel > 1) {
    emit('update-level', {
      slug: condition.condition_slug,
      level: currentLevel - 1,
      source: condition.source,
      duration: condition.duration
    })
  }
}

/**
 * Check if increment is disabled (at max level 6)
 */
function isIncrementDisabled(condition: CharacterCondition): boolean {
  return getLevel(condition) >= 6
}

/**
 * Check if decrement is disabled (at min level 1)
 */
function isDecrementDisabled(condition: CharacterCondition): boolean {
  return getLevel(condition) <= 1
}

/**
 * Check if exhaustion is at deadly level
 */
function isDeadlyExhaustion(condition: CharacterCondition): boolean {
  return isExhaustion(condition) && getLevel(condition) === 6
}
</script>

<template>
  <div
    v-if="hasConditions"
    class="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30"
  >
    <!-- Header -->
    <div class="flex items-center gap-2 px-4 py-2 border-b border-red-200 dark:border-red-800">
      <UIcon
        name="i-heroicons-exclamation-triangle"
        class="w-5 h-5 text-red-600 dark:text-red-400"
      />
      <span class="font-medium text-red-900 dark:text-red-100">
        Active Conditions
      </span>
      <UBadge
        color="error"
        variant="soft"
        size="sm"
      >
        {{ conditions!.length }}
      </UBadge>
    </div>

    <!-- Conditions list -->
    <div
      data-testid="conditions-alert"
      class="divide-y divide-red-200 dark:divide-red-800/50"
    >
      <div
        v-for="condition in conditions"
        :key="condition.id"
        class="flex items-center justify-between gap-3 px-4 py-3"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-red-900 dark:text-red-100 font-medium">
            {{ formatCondition(condition) }}
          </span>
          <!-- Death warning for level 6 exhaustion -->
          <UBadge
            v-if="isDeadlyExhaustion(condition)"
            color="error"
            variant="solid"
            size="md"
          >
            Death!
          </UBadge>
        </div>

        <!-- Editable controls -->
        <div
          v-if="isInteractive"
          class="flex items-center gap-2 flex-shrink-0"
        >
          <!-- Exhaustion controls -->
          <template v-if="isExhaustion(condition)">
            <UButton
              data-testid="exhaustion-decrement"
              color="success"
              variant="soft"
              size="xs"
              icon="i-heroicons-arrow-down"
              :disabled="isDecrementDisabled(condition)"
              @click.stop="handleDecrement(condition)"
            >
              Recover
            </UButton>
            <UButton
              data-testid="exhaustion-increment"
              color="error"
              variant="soft"
              size="xs"
              icon="i-heroicons-arrow-up"
              :disabled="isIncrementDisabled(condition)"
              @click.stop="handleIncrement(condition)"
            >
              Worsen
            </UButton>
          </template>

          <!-- Remove button -->
          <UButton
            :data-testid="`remove-condition-${condition.condition_slug}`"
            color="error"
            variant="ghost"
            size="xs"
            icon="i-heroicons-x-mark"
            @click.stop="handleRemove(condition.condition_slug)"
          >
            Remove
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
