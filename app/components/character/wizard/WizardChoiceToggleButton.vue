<!-- app/components/character/wizard/WizardChoiceToggleButton.vue -->
<script setup lang="ts">
/**
 * WizardChoiceToggleButton - A toggle button for wizard choice selection
 *
 * Used in language, proficiency, and other simple choice steps.
 * Supports selected/disabled states and optional custom icons.
 */

interface Props {
  /** Display name of the option */
  name: string
  /** Whether this option is currently selected */
  selected: boolean
  /** Whether this option is disabled */
  disabled: boolean
  /** Reason why the option is disabled (shown as helper text) */
  disabledReason?: string
  /** Custom icon to display instead of the standard checkbox */
  customIcon?: string
  /** CSS class for the custom icon */
  customIconClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabledReason: undefined,
  customIcon: undefined,
  customIconClass: undefined
})

const emit = defineEmits<{
  toggle: []
}>()

function handleClick() {
  if (!props.disabled) {
    emit('toggle')
  }
}
</script>

<template>
  <button
    type="button"
    data-testid="choice-toggle-button"
    class="p-3 rounded-lg border text-left transition-all"
    :class="{
      'border-primary bg-primary/10': selected,
      'border-gray-200 dark:border-gray-700 hover:border-primary/50': !selected && !disabled,
      'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed': disabled
    }"
    :disabled="disabled"
    @click="handleClick"
  >
    <div class="flex items-center gap-2">
      <!-- Custom icon (for special states like "already known") -->
      <UIcon
        v-if="customIcon"
        data-testid="toggle-custom-icon"
        :name="customIcon"
        class="w-5 h-5"
        :class="customIconClass"
      />
      <!-- Selected state: check circle -->
      <UIcon
        v-else-if="selected"
        data-testid="toggle-check-icon"
        name="i-heroicons-check-circle-solid"
        class="w-5 h-5 text-primary"
      />
      <!-- Unselected state: empty circle -->
      <span
        v-else
        data-testid="toggle-empty-circle"
        class="w-5 h-5 rounded-full border-2"
        :class="{
          'border-gray-300 dark:border-gray-600': disabled,
          'border-gray-400': !disabled
        }"
      />
      <span
        class="font-medium"
        :class="{ 'text-gray-400 dark:text-gray-500': disabled }"
      >
        {{ name }}
      </span>
    </div>
    <!-- Disabled reason -->
    <p
      v-if="disabledReason"
      data-testid="toggle-disabled-reason"
      class="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-7"
    >
      {{ disabledReason }}
    </p>
    <!-- Subtitle slot for additional info (e.g., script for languages) -->
    <div
      v-else
      class="mt-1 ml-7"
    >
      <slot name="subtitle" />
    </div>
  </button>
</template>
