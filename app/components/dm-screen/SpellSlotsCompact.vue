<!-- app/components/dm-screen/SpellSlotsCompact.vue -->
<script setup lang="ts">
import type { DmScreenSpellSlots } from '~/types/dm-screen'

interface Props {
  slots: DmScreenSpellSlots
}

const props = defineProps<Props>()

function ordinal(n: number): string {
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' }
  const v = n % 100
  const suffix = (v >= 11 && v <= 13) ? 'th' : (suffixes[n % 10] ?? 'th')
  return n + suffix
}

const validSlots = computed(() => {
  if (!props.slots || typeof props.slots !== 'object') return []
  return Object.entries(props.slots)
    .filter(([, slot]) => slot.max > 0)
    .sort(([a], [b]) => Number(a) - Number(b))
})

const hasSlots = computed(() => validSlots.value.length > 0)
</script>

<template>
  <div
    v-if="hasSlots"
    data-testid="spell-slots-container"
    class="flex flex-wrap gap-2 text-xs"
  >
    <div
      v-for="[level, slot] in validSlots"
      :key="level"
      class="flex items-center gap-1"
    >
      <span class="text-neutral-500">{{ ordinal(Number(level)) }}</span>
      <span class="flex gap-0.5">
        <span
          v-for="i in slot.max"
          :key="i"
          class="w-2 h-2 rounded-full"
          :class="i <= slot.current
            ? 'bg-spell-500'
            : 'bg-neutral-300 dark:bg-neutral-600'"
          :data-testid="i <= slot.current ? `slot-filled-${level}-${i}` : `slot-empty-${level}-${i}`"
        />
      </span>
    </div>
  </div>
</template>
