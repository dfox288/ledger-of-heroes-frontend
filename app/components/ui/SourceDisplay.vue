<script setup lang="ts">
import type { Source } from '~/types'

interface Props {
  sources?: Source[]
}

defineProps<Props>()
</script>

<template>
  <div
    v-if="sources && sources.length > 0"
    data-testid="source-container"
    class="p-4"
  >
    <div class="flex flex-wrap gap-3">
      <div
        v-for="source in sources"
        :key="source.code"
        class="flex items-center gap-2"
        data-testid="source-badge"
      >
        <UBadge
          color="neutral"
          variant="soft"
        >
          {{ source.name }}
        </UBadge>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          p. {{ source.pages }}
        </span>
      </div>
    </div>
  </div>
</template>
