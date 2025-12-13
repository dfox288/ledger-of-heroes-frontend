<!-- app/components/character/sheet/StatSpeed.vue -->
<script setup lang="ts">
/**
 * Speed Stat Display
 *
 * Displays walking speed and alternate movement speeds (fly, swim, climb).
 * Reusable across character sheet and DM screen.
 */

interface Speeds {
  walk?: number | null
  fly?: number | null
  swim?: number | null
  climb?: number | null
}

const props = defineProps<{
  speed: number | null
  speeds?: Speeds | null
}>()

/**
 * Get alternate movement speeds (fly, swim, climb) that have values
 * Returns array of { type, speed } for display
 */
const alternateSpeeds = computed(() => {
  if (!props.speeds) return []

  const result: { type: string, speed: number }[] = []

  if (props.speeds.fly) {
    result.push({ type: 'fly', speed: props.speeds.fly })
  }
  if (props.speeds.swim) {
    result.push({ type: 'swim', speed: props.speeds.swim })
  }
  if (props.speeds.climb) {
    result.push({ type: 'climb', speed: props.speeds.climb })
  }

  return result
})
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
      Speed
    </div>
    <div class="text-2xl font-bold text-gray-900 dark:text-white">
      {{ speed ?? '—' }}
      <span
        v-if="speed !== null"
        class="text-sm font-normal"
      >ft</span>
    </div>
    <div
      v-if="alternateSpeeds.length > 0"
      class="text-xs text-gray-500 dark:text-gray-400 mt-1"
    >
      <span
        v-for="(alt, index) in alternateSpeeds"
        :key="alt.type"
      >
        {{ alt.type }} {{ alt.speed }}<span v-if="index < alternateSpeeds.length - 1">, </span>
      </span>
    </div>
  </div>
</template>
