<script setup lang="ts">
import { computed } from 'vue'

interface Stat {
  icon: string
  label: string
  value: string
  subtext?: string
}

interface Props {
  stats: Stat[]
  columns?: number
}

const props = withDefaults(defineProps<Props>(), {
  columns: 2
})

const gridClass = computed(() => `md:grid-cols-${props.columns}`)
</script>

<template>
  <UCard>
    <div class="grid grid-cols-1 gap-6" :class="gridClass">
      <div v-for="(stat, index) in stats" :key="index" class="flex items-start gap-3">
        <UIcon :name="stat.icon" class="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
        <div>
          <div class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
            {{ stat.label }}
          </div>
          <div class="text-lg text-gray-900 dark:text-gray-100">
            {{ stat.value }}
          </div>
          <div v-if="stat.subtext" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ stat.subtext }}
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
