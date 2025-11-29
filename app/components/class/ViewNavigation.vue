<script setup lang="ts">
interface Props {
  slug: string
}

const props = defineProps<Props>()
const route = useRoute()

const views = computed(() => [
  {
    path: `/classes/${props.slug}`,
    label: 'Overview',
    icon: 'i-heroicons-squares-2x2'
  },
  {
    path: `/classes/${props.slug}/journey`,
    label: 'Journey',
    icon: 'i-heroicons-map'
  },
  {
    path: `/classes/${props.slug}/reference`,
    label: 'Reference',
    icon: 'i-heroicons-table-cells'
  }
])

/**
 * Check if a path is the current active view
 */
function isActive(path: string): boolean {
  // Exact match for overview (index route)
  if (path === `/classes/${props.slug}`) {
    return route.path === path || route.path === `${path}/`
  }
  // Prefix match for other views
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
    <NuxtLink
      v-for="view in views"
      :key="view.path"
      :to="view.path"
      :class="[
        'px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium',
        isActive(view.path)
          ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
      ]"
    >
      <UIcon
        :name="view.icon"
        class="w-4 h-4"
      />
      {{ view.label }}
    </NuxtLink>
  </nav>
</template>
