<!-- app/components/dm-screen/HpBar.vue -->
<script setup lang="ts">
interface Props {
  current: number
  max: number
  temp: number
}

const props = defineProps<Props>()

const percentage = computed(() => {
  if (props.max === 0) return 0
  return Math.min(100, Math.max(0, (props.current / props.max) * 100))
})

const colorClass = computed(() => {
  const pct = percentage.value
  if (pct > 50) return 'bg-emerald-500'
  if (pct > 25) return 'bg-amber-500'
  return 'bg-rose-500'
})
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="flex-1 h-4 bg-neutral-200 dark:bg-neutral-700 rounded overflow-hidden">
      <div
        data-testid="hp-bar-fill"
        :class="['h-full transition-all duration-300', colorClass]"
        :style="{ width: `${percentage}%` }"
      />
    </div>
    <div class="text-sm font-medium whitespace-nowrap min-w-[60px] text-right">
      {{ current }}/{{ max }}
      <span
        v-if="temp > 0"
        class="text-blue-500 ml-1"
      >+{{ temp }}</span>
    </div>
  </div>
</template>
