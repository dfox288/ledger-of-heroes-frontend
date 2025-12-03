<!-- app/components/character/builder/ManualInput.vue -->
<script setup lang="ts">
import type { AbilityScores } from '~/types'

const props = defineProps<{
  modelValue: AbilityScores
}>()

const emit = defineEmits<{
  'update:modelValue': [scores: AbilityScores]
  'update:valid': [valid: boolean]
}>()

const abilities = [
  { key: 'strength', label: 'STR', name: 'Strength' },
  { key: 'dexterity', label: 'DEX', name: 'Dexterity' },
  { key: 'constitution', label: 'CON', name: 'Constitution' },
  { key: 'intelligence', label: 'INT', name: 'Intelligence' },
  { key: 'wisdom', label: 'WIS', name: 'Wisdom' },
  { key: 'charisma', label: 'CHA', name: 'Charisma' }
] as const

function updateScore(key: keyof AbilityScores, value: number) {
  const newScores = { ...props.modelValue, [key]: value }
  emit('update:modelValue', newScores)
}

const isValid = computed(() => {
  return Object.values(props.modelValue).every(
    score => score >= 3 && score <= 20
  )
})

// Emit validity on mount and when it changes
watch(isValid, (valid) => emit('update:valid', valid), { immediate: true })
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-gray-600 dark:text-gray-400">
      Enter your ability scores (3-20 range)
    </p>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="ability in abilities"
        :key="ability.key"
        class="flex flex-col"
      >
        <label
          :for="`ability-${ability.key}`"
          class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {{ ability.name }}
        </label>
        <UInput
          :id="`ability-${ability.key}`"
          type="number"
          :model-value="modelValue[ability.key]"
          :min="3"
          :max="20"
          :data-testid="`input-${ability.key}`"
          @update:model-value="updateScore(ability.key, Number($event))"
        />
      </div>
    </div>
  </div>
</template>
