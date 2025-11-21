<script setup lang="ts">
interface Props {
  to?: string
  label?: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  to: '/',
  label: 'Back to Home',
  icon: 'i-heroicons-arrow-left'
})
</script>

<template>
  <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
    <NuxtLink :to="to">
      <UButton
        color="neutral"
        variant="soft"
        :icon="icon"
      >
        {{ label }}
      </UButton>
    </NuxtLink>
  </div>
</template>
