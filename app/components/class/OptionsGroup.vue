<script setup lang="ts">
import type { OptionalFeatureResource } from '~/types/api/entities'

const props = withDefaults(
  defineProps<{
    title: string
    options: OptionalFeatureResource[]
    defaultOpen?: boolean
    compact?: boolean
  }>(),
  {
    defaultOpen: true,
    compact: true
  }
)

const sortedOptions = computed(() => {
  return [...props.options].sort((a, b) => a.name.localeCompare(b.name))
})
</script>

<template>
  <details
    v-if="options.length > 0"
    :open="defaultOpen"
    class="group"
  >
    <summary class="flex cursor-pointer items-center gap-2 text-lg font-semibold list-none">
      <UIcon
        name="i-heroicons-chevron-right"
        class="h-5 w-5 transition-transform group-open:rotate-90"
      />
      <span>{{ title }}</span>
      <UBadge
        size="md"
        variant="subtle"
      >
        {{ options.length }}
      </UBadge>
    </summary>

    <div class="mt-4 space-y-3">
      <ClassOptionCard
        v-for="option in sortedOptions"
        :key="option.id"
        :option="option"
        :compact="compact"
      />
    </div>
  </details>
</template>
