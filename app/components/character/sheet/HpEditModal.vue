<!-- app/components/character/sheet/HpEditModal.vue -->
<script setup lang="ts">
/**
 * HP Edit Modal
 *
 * Modal for modifying character HP via damage or healing.
 * Accepts signed values: -12 for damage, +8 or 8 for healing.
 *
 * D&D rules are NOT enforced here - the parent component handles:
 * - Temp HP absorbing damage first
 * - Healing capping at max HP
 * - HP flooring at 0
 */

const props = defineProps<{
  open: boolean
  currentHp: number
  maxHp: number
  tempHp: number
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'apply': [delta: number]
}>()

/** Input value as string to support +/- signs */
const inputValue = ref('')

/** Parse input to numeric delta */
const parsedDelta = computed(() => {
  const trimmed = inputValue.value.trim()
  if (!trimmed) return null

  // Handle explicit + sign
  const value = trimmed.startsWith('+')
    ? parseInt(trimmed.slice(1), 10)
    : parseInt(trimmed, 10)

  return isNaN(value) ? null : value
})

/** Whether apply button should be enabled */
const canApply = computed(() => parsedDelta.value !== null)

/** Handle apply button click */
function handleApply() {
  if (parsedDelta.value === null) return
  emit('apply', parsedDelta.value)
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
          Modify Hit Points
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Current HP Display -->
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            Current: {{ currentHp }} / {{ maxHp }}
          </div>
          <div
            v-if="tempHp > 0"
            class="text-sm text-success-600 dark:text-success-400 mt-1"
          >
            (Temp HP: {{ tempHp }} — absorbs damage first)
          </div>
        </div>

        <!-- Delta Input -->
        <div class="space-y-2">
          <UInput
            v-model="inputValue"
            data-testid="hp-delta-input"
            type="text"
            inputmode="numeric"
            placeholder="-12 or +8"
            size="lg"
            class="text-center text-lg"
            autofocus
            @keyup.enter="canApply && handleApply()"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
            Enter damage (-) or healing (+)
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
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
    </template>
  </UModal>
</template>
