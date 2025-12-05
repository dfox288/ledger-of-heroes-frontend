<!-- app/components/character/builder/PointBuyInput.vue -->
<script setup lang="ts">
import type { AbilityScores } from '~/types'

const props = defineProps<{
  modelValue: AbilityScores
}>()

const emit = defineEmits<{
  'update:modelValue': [scores: AbilityScores]
  'update:valid': [valid: boolean]
}>()

const TOTAL_POINTS = 27
const MIN_SCORE = 8
const MAX_SCORE = 15

// Point cost for each score value
const POINT_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
}

const abilities = [
  { key: 'strength', label: 'STR', name: 'Strength' },
  { key: 'dexterity', label: 'DEX', name: 'Dexterity' },
  { key: 'constitution', label: 'CON', name: 'Constitution' },
  { key: 'intelligence', label: 'INT', name: 'Intelligence' },
  { key: 'wisdom', label: 'WIS', name: 'Wisdom' },
  { key: 'charisma', label: 'CHA', name: 'Charisma' }
] as const

type AbilityKey = typeof abilities[number]['key']

const pointsSpent = computed(() => {
  return Object.values(props.modelValue).reduce(
    (sum, score) => sum + (POINT_COSTS[score] ?? 0),
    0
  )
})

const pointsRemaining = computed(() => TOTAL_POINTS - pointsSpent.value)

function getCostForNextIncrease(score: number): number {
  if (score >= MAX_SCORE) return 0
  return (POINT_COSTS[score + 1] ?? 0) - (POINT_COSTS[score] ?? 0)
}

function canIncrease(key: AbilityKey): boolean {
  const score = props.modelValue[key]
  if (score >= MAX_SCORE) return false
  const cost = getCostForNextIncrease(score)
  return pointsRemaining.value >= cost
}

function canDecrease(key: AbilityKey): boolean {
  return props.modelValue[key] > MIN_SCORE
}

function increase(key: AbilityKey) {
  if (!canIncrease(key)) return
  const newScores = { ...props.modelValue, [key]: props.modelValue[key] + 1 }
  emit('update:modelValue', newScores)
}

function decrease(key: AbilityKey) {
  if (!canDecrease(key)) return
  const newScores = { ...props.modelValue, [key]: props.modelValue[key] - 1 }
  emit('update:modelValue', newScores)
}

const isValid = computed(() => {
  // Valid if all scores in range and points not exceeded
  const scores = Object.values(props.modelValue)
  const allInRange = scores.every(s => s >= MIN_SCORE && s <= MAX_SCORE)
  return allInRange && pointsSpent.value <= TOTAL_POINTS
})

// Emit validity on mount and when it changes
watch(isValid, valid => emit('update:valid', valid), { immediate: true })
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Spend points to increase scores (8-15 range)
      </p>
      <div class="text-lg font-semibold">
        Points: <span :class="pointsRemaining < 0 ? 'text-red-500' : 'text-green-600'">{{ pointsRemaining }}</span> / {{ TOTAL_POINTS }}
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="ability in abilities"
        :key="ability.key"
        class="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ ability.name }}
        </span>
        <div class="flex items-center gap-2">
          <UButton
            :data-testid="`${ability.key}-decrease`"
            icon="i-heroicons-minus"
            size="sm"
            variant="soft"
            :disabled="!canDecrease(ability.key)"
            @click="decrease(ability.key)"
          />
          <span
            :data-testid="`score-${ability.key}`"
            class="w-8 text-center text-xl font-bold"
          >
            {{ modelValue[ability.key] }}
          </span>
          <UButton
            :data-testid="`${ability.key}-increase`"
            icon="i-heroicons-plus"
            size="sm"
            variant="soft"
            :disabled="!canIncrease(ability.key)"
            @click="increase(ability.key)"
          />
        </div>
        <span class="text-xs text-gray-500 mt-1">
          Cost: {{ POINT_COSTS[modelValue[ability.key]] }}
        </span>
      </div>
    </div>
  </div>
</template>
