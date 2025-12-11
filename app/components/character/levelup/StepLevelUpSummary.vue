<!-- app/components/character/levelup/StepLevelUpSummary.vue -->
<script setup lang="ts">
/**
 * Level-Up Summary Step - Celebration with confetti animation
 *
 * Shows the results of the level-up:
 * - Level transition (e.g., Fighter 3 → Fighter 4)
 * - HP gained
 * - Features gained
 * - ASI/Feat if applicable
 *
 * Uses CSS-based confetti animation that auto-plays for ~3 seconds
 */

import type { LevelUpResult } from '~/types/character'
import { useCharacterLevelUpStore } from '~/stores/characterLevelUp'

defineProps<{
  levelUpResult: LevelUpResult
  className: string
  hpGained: number
  asiChoice?: string
  featName?: string
}>()

const emit = defineEmits<{
  complete: []
}>()

const store = useCharacterLevelUpStore()

// Trigger celebration animation on mount
const showConfetti = ref(false)
const showContent = ref(false)

onMounted(() => {
  // Start confetti
  showConfetti.value = true

  // Fade in content after brief delay
  setTimeout(() => {
    showContent.value = true
  }, 300)

  // Stop confetti after a few seconds
  setTimeout(() => {
    showConfetti.value = false
  }, 3000)
})

function handleComplete() {
  store.closeWizard()
  store.reset()
  emit('complete')
}
</script>

<template>
  <div class="space-y-8 relative">
    <!-- Confetti Animation (CSS-based for simplicity) -->
    <div
      v-if="showConfetti"
      class="absolute inset-0 pointer-events-none overflow-hidden"
    >
      <div
        v-for="i in 50"
        :key="i"
        class="confetti-piece"
        :style="{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
          backgroundColor: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa'][i % 5]
        }"
      />
    </div>

    <!-- Header with animation -->
    <div
      class="text-center transition-all duration-500"
      :class="showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
    >
      <div class="text-5xl mb-4">
        🎉
      </div>
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
        Level Up Complete!
      </h2>
      <p class="mt-4 text-xl text-primary-600 dark:text-primary-400 font-semibold">
        {{ className }} {{ levelUpResult.previous_level }} → {{ className }} {{ levelUpResult.new_level }}
      </p>
    </div>

    <!-- Summary Cards -->
    <div
      class="space-y-4 transition-all duration-500 delay-200"
      :class="showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
    >
      <!-- HP Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon
              name="i-heroicons-heart"
              class="w-6 h-6 text-red-500"
            />
            <span class="font-medium text-gray-900 dark:text-white">Hit Points</span>
          </div>
          <div class="text-right">
            <span class="text-lg font-bold text-success-600 dark:text-success-400">+{{ hpGained }}</span>
            <span class="text-gray-500 dark:text-gray-400 ml-2">(now {{ levelUpResult.new_max_hp }} max)</span>
          </div>
        </div>
      </div>

      <!-- ASI/Feat Card (if applicable) -->
      <div
        v-if="asiChoice || featName"
        class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon
              name="i-heroicons-arrow-trending-up"
              class="w-6 h-6 text-primary-500"
            />
            <span class="font-medium text-gray-900 dark:text-white">
              {{ featName ? 'Feat' : 'Ability Score Increase' }}
            </span>
          </div>
          <span class="font-semibold text-gray-900 dark:text-white">
            {{ featName || asiChoice }}
          </span>
        </div>
      </div>

      <!-- Features Gained Card -->
      <div
        v-if="levelUpResult.features_gained?.length > 0"
        class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center gap-3 mb-3">
          <UIcon
            name="i-heroicons-star"
            class="w-6 h-6 text-yellow-500"
          />
          <span class="font-medium text-gray-900 dark:text-white">New Features</span>
        </div>
        <ul class="space-y-2">
          <li
            v-for="feature in levelUpResult.features_gained"
            :key="feature.id"
            class="pl-4 border-l-2 border-primary-300 dark:border-primary-700"
          >
            <p class="font-medium text-gray-900 dark:text-white">
              {{ feature.name }}
            </p>
            <p
              v-if="feature.description"
              class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2"
            >
              {{ feature.description }}
            </p>
          </li>
        </ul>
      </div>
    </div>

    <!-- Complete Button -->
    <div
      class="flex justify-center pt-4 transition-all duration-500 delay-300"
      :class="showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
    >
      <UButton
        data-testid="view-sheet-button"
        size="lg"
        @click="handleComplete"
      >
        View Character Sheet
      </UButton>
    </div>
  </div>
</template>

<style scoped>
.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  animation: confetti-fall 3s ease-out forwards;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
</style>
