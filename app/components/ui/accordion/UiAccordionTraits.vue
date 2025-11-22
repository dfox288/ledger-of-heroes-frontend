<script setup lang="ts">
interface Trait {
  id?: number
  name: string
  description: string
}

interface Props {
  traits: Trait[]
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Traits'
})

const items = computed(() => {
  if (!props.traits || props.traits.length === 0) return []

  return [{
    label: `${props.title} (${props.traits.length})`,
    defaultOpen: true,
    slot: 'traits'
  }]
})
</script>

<template>
  <UAccordion
    v-if="traits.length > 0"
    :items="items"
    class="[&_.ui-accordion-item]:border [&_.ui-accordion-item]:border-gray-200 dark:[&_.ui-accordion-item]:border-gray-700 [&_.ui-accordion-item]:rounded-lg [&_.ui-accordion-item]:overflow-hidden [&_.ui-accordion-item]:mb-4"
  >
    <template #traits>
      <div class="space-y-4 p-4">
        <div
          v-for="trait in traits"
          :key="trait.id || trait.name"
          class="space-y-1"
        >
          <h4 class="font-semibold text-primary-600 dark:text-primary-400">
            {{ trait.name }}
          </h4>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            {{ trait.description }}
          </p>
        </div>
      </div>
    </template>
  </UAccordion>
</template>
