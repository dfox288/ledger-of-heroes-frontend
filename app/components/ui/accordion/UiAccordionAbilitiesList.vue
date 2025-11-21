<script setup lang="ts">
interface Ability {
  id: number
  name: string
  description: string
}

interface Props {
  abilities: Ability[]
  backgroundColor?: string
}

withDefaults(defineProps<Props>(), {
  backgroundColor: 'bg-primary-50 dark:bg-primary-900/20'
})
</script>

<template>
  <div class="p-4 space-y-4">
    <div
      v-for="ability in abilities"
      :key="ability.id"
      class="p-4 rounded-lg"
      :class="backgroundColor"
    >
      <div class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {{ ability.name }}
      </div>
      <div class="text-gray-700 dark:text-gray-300 whitespace-pre-line">
        {{ ability.description }}
      </div>
    </div>
  </div>
</template>
