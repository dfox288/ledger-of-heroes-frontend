<!-- app/components/character/sheet/TempHpModal.vue -->
<script setup lang="ts">
/**
 * Temp HP Modal
 *
 * Modal for setting temporary hit points.
 * D&D 5e rule: Temp HP doesn't stack - you keep the higher value.
 *
 * Shows a warning when entered value is lower than current temp HP
 * (would have no effect per D&D rules).
 */

const props = defineProps<{
  open: boolean
  currentTempHp: number
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'apply': [value: number]
  'clear': []
}>()

/** Input value as string */
const inputValue = ref('')

/** Parse input to numeric value (temp HP must be non-negative) */
const parsedValue = computed(() => {
  // UInput with type="number" returns number, so convert to string first
  const trimmed = String(inputValue.value ?? '').trim()
  if (!trimmed) return null

  const value = parseInt(trimmed, 10)

  // Temp HP cannot be negative
  if (isNaN(value) || value < 0) return null

  return value
})

/** Whether the entered value would have any effect (D&D rules: keep higher) */
const wouldHaveEffect = computed(() => {
  if (parsedValue.value === null) return false
  return parsedValue.value > props.currentTempHp
})

/** Whether apply button should be enabled */
const canApply = computed(() => parsedValue.value !== null)

/** Handle apply button click */
function handleApply() {
  if (parsedValue.value === null) return
  emit('apply', parsedValue.value)
  emit('update:open', false)
}

/** Handle clear button click */
function handleClear() {
  emit('clear')
  emit('update:open', false)
}

/** Handle cancel button click */
function handleCancel() {
  emit('update:open', false)
}

/** Clear input when modal opens */
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    inputValue.value = ''
  }
})
</script>

<template>
  <UModal
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Set Temporary Hit Points
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Current Temp HP Display -->
        <div class="text-center">
          <div class="text-lg text-gray-600 dark:text-gray-300">
            Current Temp HP: <span class="font-bold text-success-600 dark:text-success-400">{{ currentTempHp }}</span>
          </div>
        </div>

        <!-- Value Input -->
        <div class="space-y-2">
          <UInput
            v-model="inputValue"
            data-testid="temp-hp-input"
            type="number"
            inputmode="numeric"
            min="0"
            placeholder="Enter temp HP"
            size="lg"
            class="text-center text-lg"
            autofocus
            @keyup.enter="canApply && handleApply()"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
            Temp HP doesn't stack — keeps higher
          </p>
        </div>

        <!-- Warning when value would have no effect -->
        <div
          v-if="parsedValue !== null && !wouldHaveEffect"
          class="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-3"
        >
          <p class="text-sm text-warning-700 dark:text-warning-300 text-center">
            You already have {{ currentTempHp }} temp HP. This would have no effect.
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between w-full">
        <!-- Clear button (left side, only when temp HP exists) -->
        <div>
          <UButton
            v-if="currentTempHp > 0"
            data-testid="clear-btn"
            color="error"
            variant="ghost"
            @click="handleClear"
          >
            Clear Temp HP
          </UButton>
        </div>

        <!-- Cancel/Apply buttons (right side) -->
        <div class="flex gap-3">
          <UButton
            data-testid="cancel-btn"
            color="neutral"
            variant="ghost"
            @click="handleCancel"
          >
            Cancel
          </UButton>
          <UButton
            data-testid="apply-btn"
            color="primary"
            :disabled="!canApply"
            @click="handleApply"
          >
            Apply
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
