<!-- app/components/character/sheet/XpBar.vue -->
<script setup lang="ts">
import type { CharacterXpData } from '~/types/character'

const props = defineProps<{
  xpData: CharacterXpData | null
  isPlayMode: boolean
  characterId: string
}>()

const emit = defineEmits<{
  edit: []
}>()

/**
 * Format number with comma separators
 */
function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

/**
 * Current XP formatted for display
 */
const formattedCurrentXp = computed(() => {
  if (!props.xpData?.experience_points && props.xpData?.experience_points !== 0) return '0'
  return formatNumber(props.xpData.experience_points)
})

/**
 * Next level XP threshold formatted for display
 */
const formattedNextLevelXp = computed(() => {
  if (!props.xpData?.next_level_xp) return '0'
  return formatNumber(props.xpData.next_level_xp)
})

/**
 * Progress percentage (clamped between 0-100)
 */
const progressPercent = computed(() => {
  if (!props.xpData?.xp_progress_percent && props.xpData?.xp_progress_percent !== 0) return 0
  return Math.min(100, Math.max(0, props.xpData.xp_progress_percent))
})

/**
 * Whether to show the XP bar (hidden at max level)
 */
const shouldShow = computed(() => {
  return props.xpData && !props.xpData.is_max_level
})

/**
 * Whether the bar can be clicked to edit
 */
const canEdit = computed(() => {
  return props.isPlayMode && shouldShow.value
})

/**
 * Handle click - opens edit modal in play mode
 */
function handleClick() {
  if (canEdit.value) {
    emit('edit')
  }
}

/**
 * Handle keyboard interaction (a11y)
 */
function handleKeydown(event: KeyboardEvent) {
  if (canEdit.value && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    emit('edit')
  }
}
</script>

<template>
  <div
    v-if="shouldShow"
    data-testid="xp-bar-container"
    :role="canEdit ? 'button' : undefined"
    :aria-label="canEdit ? 'Edit experience points' : undefined"
    :tabindex="canEdit ? 0 : -1"
    class="mt-2 max-w-sm transition-all duration-200"
    :class="{
      'cursor-pointer hover:opacity-80': canEdit
    }"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- Progress bar -->
    <div
      data-testid="xp-progress-bar"
      class="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
    >
      <div
        class="h-full rounded-full bg-primary-500 transition-all duration-300"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>

    <!-- XP text -->
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      {{ formattedCurrentXp }} / {{ formattedNextLevelXp }} XP
    </p>
  </div>
</template>
