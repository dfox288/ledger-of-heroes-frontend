<!-- app/components/character/builder/StandardArrayInput.vue -->
<script setup lang="ts">
type NullableScores = {
  strength: number | null
  dexterity: number | null
  constitution: number | null
  intelligence: number | null
  wisdom: number | null
  charisma: number | null
}

const props = defineProps<{
  modelValue: NullableScores
}>()

const emit = defineEmits<{
  'update:modelValue': [scores: NullableScores]
  'update:valid': [valid: boolean]
}>()

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const

const abilities = [
  { key: 'strength', label: 'STR', name: 'Strength' },
  { key: 'dexterity', label: 'DEX', name: 'Dexterity' },
  { key: 'constitution', label: 'CON', name: 'Constitution' },
  { key: 'intelligence', label: 'INT', name: 'Intelligence' },
  { key: 'wisdom', label: 'WIS', name: 'Wisdom' },
  { key: 'charisma', label: 'CHA', name: 'Charisma' }
] as const

type AbilityKey = typeof abilities[number]['key']

/**
 * Get available values for a specific ability
 * Excludes values already assigned to other abilities
 */
function getAvailableValues(currentKey: AbilityKey): number[] {
  const usedValues = new Set<number>()

  for (const ability of abilities) {
    if (ability.key !== currentKey) {
      const value = props.modelValue[ability.key]
      if (value !== null) {
        usedValues.add(value)
      }
    }
  }

  return STANDARD_ARRAY.filter(v => !usedValues.has(v))
}

function updateScore(key: AbilityKey, value: number | null) {
  const newScores = { ...props.modelValue, [key]: value }
  emit('update:modelValue', newScores)
}

const isValid = computed(() => {
  const values = Object.values(props.modelValue)
  // All must be assigned
  if (values.some(v => v === null)) return false
  // All must be from standard array
  const validValues = new Set<number>(STANDARD_ARRAY)
  return values.every(v => v !== null && validValues.has(v))
})

// Emit validity on mount and when it changes
watch(isValid, (valid) => emit('update:valid', valid), { immediate: true })
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-gray-600 dark:text-gray-400">
      Assign each value once: 15, 14, 13, 12, 10, 8
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
        <USelectMenu
          :id="`ability-${ability.key}`"
          :model-value="modelValue[ability.key] ?? undefined"
          :items="getAvailableValues(ability.key).map(v => ({ label: String(v), value: v }))"
          value-key="value"
          placeholder="Select"
          size="md"
          :data-testid="`select-${ability.key}`"
          @update:model-value="updateScore(ability.key, $event ?? null)"
        />
      </div>
    </div>
  </div>
</template>
