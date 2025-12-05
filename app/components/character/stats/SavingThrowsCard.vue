<!-- app/components/character/stats/SavingThrowsCard.vue -->
<script setup lang="ts">
/**
 * Saving throws display card for the character builder.
 *
 * Displays all 6 saving throws with proficiency indicators.
 */
import type { SavingThrowDisplay } from '~/composables/useCharacterStats'

interface Props {
  savingThrows: SavingThrowDisplay[]
}

defineProps<Props>()
</script>

<template>
  <UCard
    data-test="saving-throws-card"
    :ui="{ body: 'p-4' }"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-shield-exclamation" class="w-5 h-5 text-primary" />
        <span class="font-semibold text-gray-900 dark:text-white">Saving Throws</span>
      </div>
    </template>

    <div class="grid grid-cols-2 gap-3">
      <div
        v-for="save in savingThrows"
        :key="save.code"
        :data-test="`save-${save.code}`"
        class="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
      >
        <!-- Ability code and proficiency dot -->
        <div class="flex items-center gap-2">
          <span
            v-if="save.isProficient"
            data-test="proficiency-dot"
            class="w-2 h-2 rounded-full bg-primary"
          />
          <span
            v-else
            class="w-2 h-2 rounded-full border border-gray-300 dark:border-gray-600"
          />
          <span class="font-medium text-gray-900 dark:text-white">
            {{ save.code }}
          </span>
        </div>

        <!-- Bonus value -->
        <span
          class="font-mono text-lg font-semibold"
          :class="{
            'text-green-600 dark:text-green-400': save.bonus > 0,
            'text-gray-600 dark:text-gray-400': save.bonus === 0,
            'text-red-600 dark:text-red-400': save.bonus < 0,
          }"
        >
          {{ save.formattedBonus }}
        </span>
      </div>
    </div>
  </UCard>
</template>
