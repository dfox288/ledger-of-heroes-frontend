<!-- app/components/character/wizard/WizardChoiceGrid.vue -->
<script setup lang="ts">
interface Option {
  id: string
  name: string
  description?: string
}

interface Props {
  /** Array of selectable options */
  options: Option[]
  /** Set of currently selected option IDs */
  selectedIds: Set<string>
  /** Set of disabled option IDs (optional) */
  disabledIds?: Set<string>
  /** Map of disabled option IDs to reason strings (optional) */
  disabledReasons?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  disabledIds: () => new Set(),
  disabledReasons: () => ({})
})

const emit = defineEmits<{
  toggle: [id: string]
}>()

function isSelected(id: string): boolean {
  return props.selectedIds.has(id)
}

function isDisabled(id: string): boolean {
  return props.disabledIds?.has(id) ?? false
}

function getDisabledReason(id: string): string | null {
  return props.disabledReasons?.[id] ?? null
}

function handleClick(id: string) {
  if (!isDisabled(id)) {
    emit('toggle', id)
  }
}
</script>

<template>
  <div
    data-testid="wizard-choice-grid"
    class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
  >
    <button
      v-for="option in options"
      :key="option.id"
      :data-testid="`choice-option-${option.id}`"
      type="button"
      class="p-3 rounded-lg border text-left transition-all"
      :class="{
        'border-primary bg-primary/10': isSelected(option.id),
        'border-gray-200 dark:border-gray-700 hover:border-primary/50': !isSelected(option.id) && !isDisabled(option.id),
        'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed': isDisabled(option.id)
      }"
      :disabled="isDisabled(option.id)"
      @click="handleClick(option.id)"
    >
      <div class="flex items-center gap-2">
        <!-- Selection indicator: check-circle when selected, empty circle when not -->
        <UIcon
          v-if="isSelected(option.id)"
          :data-testid="`choice-icon-${option.id}`"
          name="i-heroicons-check-circle-solid"
          class="w-5 h-5 text-primary"
        />
        <span
          v-else
          :data-testid="`choice-icon-${option.id}`"
          class="w-5 h-5 rounded-full border-2 border-gray-400"
        />
        <span class="font-medium">{{ option.name }}</span>
      </div>
      <p
        v-if="getDisabledReason(option.id)"
        :data-testid="`choice-reason-${option.id}`"
        class="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-7"
      >
        {{ getDisabledReason(option.id) }}
      </p>
    </button>
  </div>
</template>
