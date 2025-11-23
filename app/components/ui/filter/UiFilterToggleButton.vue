<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isOpen: boolean
  label?: string
  badgeCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Filters',
  badgeCount: 0
})

const emit = defineEmits<{
  toggle: []
}>()

const buttonText = computed(() => {
  return props.isOpen ? `Hide ${props.label}` : `Show ${props.label}`
})

const showBadge = computed(() => {
  return props.badgeCount > 0
})
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-0 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-500"
    :aria-expanded="isOpen"
    @click="emit('toggle')"
  >
    <!-- Icon -->
    <svg
      class="w-3 h-3 transition-transform"
      :class="{ 'rotate-180': isOpen }"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 9l-7 7-7-7"
      />
    </svg>

    <!-- Button Text -->
    <span class="min-w-[120px] text-center">{{ buttonText }}</span>

    <!-- Badge -->
    <span
      v-if="showBadge"
      data-testid="filter-badge"
      class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-primary-500 rounded-full"
    >
      {{ badgeCount }}
    </span>
  </button>
</template>
