<script setup lang="ts">
interface Effect {
  id: number
  description: string
  dice_formula: string
  min_spell_slot: number
}

interface Props {
  effects: Effect[]
}

defineProps<Props>()
</script>

<template>
  <div class="p-4 space-y-3">
    <div
      v-for="effect in effects"
      :key="effect.id"
      class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
    >
      <div>
        <div class="font-medium text-gray-900 dark:text-gray-100">
          {{ effect.description }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Spell Slot Level {{ effect.min_spell_slot }}
        </div>
      </div>
      <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
        {{ effect.dice_formula }}
      </div>
    </div>
  </div>
</template>
