<script setup lang="ts">
/**
 * Parent Class Toggle
 *
 * Toggle to show/hide parent class features in subclass journey view.
 * Only shown when viewing a subclass.
 */

interface Props {
  parentName: string
  modelValue: boolean
}

const props = defineProps<Props>()

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const emit = defineEmits<Emits>()

const isOn = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})
</script>

<template>
  <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    <div class="flex items-center gap-3">
      <UIcon
        name="i-heroicons-eye"
        class="w-5 h-5 text-gray-500 dark:text-gray-400"
      />
      <div>
        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
          Show {{ parentName }} base features
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          View inherited features alongside subclass features
        </p>
      </div>
    </div>

    <UToggle
      v-model="isOn"
      size="lg"
    />
  </div>
</template>
