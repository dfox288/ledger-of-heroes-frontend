<script setup lang="ts">
import { ref, computed } from 'vue'
import { useId } from '#imports'

interface Props {
  label?: string
  defaultOpen?: boolean
  badgeCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Filters',
  defaultOpen: false,
  badgeCount: 0
})

// State
const isOpen = ref(props.defaultOpen)

// Unique ID for accessibility
const contentId = `filter-collapse-${useId()}`

// Computed
const buttonText = computed(() => {
  return isOpen.value ? `Hide ${props.label}` : `Show ${props.label}`
})

const showBadge = computed(() => {
  return props.badgeCount > 0
})

// Methods
const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="space-y-4">
    <!-- Toggle Button -->
    <button
      type="button"
      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
      :aria-expanded="isOpen"
      :aria-controls="contentId"
      @click="toggle"
    >
      <!-- Icon -->
      <svg
        class="w-4 h-4 transition-transform"
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
      <span>{{ buttonText }}</span>

      <!-- Badge -->
      <span
        v-if="showBadge"
        data-testid="filter-badge"
        class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-primary-500 rounded-full"
      >
        {{ badgeCount }}
      </span>
    </button>

    <!-- Collapsible Content -->
    <div
      v-if="isOpen"
      :id="contentId"
      role="region"
      class="space-y-4"
    >
      <slot />
    </div>
  </div>
</template>
