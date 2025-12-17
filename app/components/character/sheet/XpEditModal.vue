<!-- app/components/character/sheet/XpEditModal.vue -->
<script setup lang="ts">
/**
 * XP Edit Modal
 *
 * Modal for modifying character XP.
 * Accepts signed values: +500 to add XP, -200 to remove, or 8000 to set.
 *
 * Unlike HP which uses deltas, XP emits the NEW total value
 * since the backend expects absolute XP values.
 *
 * @see Issue #653 - XP progress display
 */

const props = defineProps<{
  currentXp: number
  nextLevelXp: number | null
}>()

const open = defineModel<boolean>('open', { default: false })

/** Maximum allowed XP value (sanity cap to prevent typos) */
const MAX_XP = 999999

const emit = defineEmits<{
  apply: [newXp: number]
}>()

/** Input value as string to support +/- signs */
const inputValue = ref('')

/**
 * Format number with comma separators for display
 */
function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

/**
 * Parse input to new XP value
 *
 * Three modes:
 * - "+X" → add X to current (newXp = current + X)
 * - "-X" → remove X from current (newXp = current - X, floored at 0)
 * - "X" (no sign) → set XP to X (newXp = X)
 */
const parsedNewXp = computed(() => {
  const trimmed = String(inputValue.value ?? '').trim()
  if (!trimmed) return null

  // Explicit + sign → add XP
  if (trimmed.startsWith('+')) {
    const value = parseInt(trimmed.slice(1), 10)
    if (isNaN(value)) return null
    return props.currentXp + value
  }

  // Explicit - sign → remove XP (floor at 0)
  if (trimmed.startsWith('-')) {
    const value = parseInt(trimmed, 10)
    if (isNaN(value)) return null
    return Math.max(0, props.currentXp + value)
  }

  // No sign → "set to" mode
  const targetXp = parseInt(trimmed, 10)
  if (isNaN(targetXp)) return null
  return Math.max(0, targetXp)
})

/**
 * Whether apply button should be enabled
 *
 * Blocks when:
 * - Input is empty or invalid
 * - Result exceeds MAX_XP (typo protection)
 */
const canApply = computed(() => {
  if (parsedNewXp.value === null) return false
  if (parsedNewXp.value > MAX_XP) return false
  return true
})

/** Handle apply button click */
function handleApply() {
  if (parsedNewXp.value === null || !canApply.value) return
  emit('apply', parsedNewXp.value)
  open.value = false
}

/** Handle cancel button click */
function handleCancel() {
  open.value = false
}

/** Clear input when modal opens */
watch(open, (isOpen) => {
  if (isOpen) {
    inputValue.value = ''
  }
})
</script>

<template>
  <UModal v-model:open="open">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Edit Experience Points
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Current XP Display -->
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            Current: {{ formatNumber(currentXp) }} XP
          </div>
          <div
            v-if="nextLevelXp"
            class="text-sm text-gray-500 dark:text-gray-400 mt-1"
          >
            Next level at {{ formatNumber(nextLevelXp) }} XP
          </div>
          <div
            v-else
            class="text-sm text-gray-500 dark:text-gray-400 mt-1"
          >
            Max level reached
          </div>
        </div>

        <!-- XP Input -->
        <div class="space-y-2">
          <UInput
            v-model="inputValue"
            data-testid="xp-input"
            type="text"
            inputmode="numeric"
            placeholder="+500, -200, or 8000"
            size="lg"
            class="text-center text-lg"
            autofocus
            @keyup.enter="canApply && handleApply()"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
            Add (+), remove (-), or set XP (no sign)
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
