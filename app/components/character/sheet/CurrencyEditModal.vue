<!-- app/components/character/sheet/CurrencyEditModal.vue -->
<script setup lang="ts">
/**
 * Currency Edit Modal
 *
 * Modal for modifying character currency (coins).
 * Accepts signed values: -5 for subtract, +10 for add, 25 for set.
 *
 * D&D rules (auto-conversion, insufficient funds) are handled by the backend.
 * This component only handles input parsing and validation.
 *
 * @see Design doc: docs/frontend/plans/2025-12-13-currency-management-design.md
 */

import { CURRENCY_CONFIG } from '~/constants/currency'

export interface CharacterCurrency {
  pp: number
  gp: number
  ep: number
  sp: number
  cp: number
}

export interface CurrencyDelta {
  pp?: string
  gp?: string
  ep?: string
  sp?: string
  cp?: string
}

const props = defineProps<{
  currency: CharacterCurrency | null
  loading?: boolean
  /** Error message to display (e.g., "Insufficient funds") */
  error?: string | null
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  'apply': [payload: CurrencyDelta]
  'clear-error': []
}>()

/** Input values for each currency type (strings to support +/- signs) */
const inputs = reactive({
  pp: '',
  gp: '',
  ep: '',
  sp: '',
  cp: ''
})

/** Valid input pattern: optional +/-, then digits only */
const VALID_INPUT_PATTERN = /^[+-]?\d+$/

/**
 * Check if a single input value is valid
 * Empty strings are valid (they're excluded from payload)
 */
function isValidInput(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed === '') return true
  return VALID_INPUT_PATTERN.test(trimmed)
}

/**
 * Check if all non-empty inputs are valid
 */
const allInputsValid = computed(() => {
  return CURRENCY_CONFIG.every(c => isValidInput(inputs[c.key]))
})

/**
 * Build payload from non-empty inputs
 * Empty inputs are excluded (backend only updates provided fields)
 */
const payload = computed((): CurrencyDelta => {
  const result: CurrencyDelta = {}
  for (const c of CURRENCY_CONFIG) {
    const trimmed = inputs[c.key].trim()
    if (trimmed !== '') {
      result[c.key] = trimmed
    }
  }
  return result
})

/**
 * Whether any input has a value
 */
const hasAnyInput = computed(() => {
  return Object.keys(payload.value).length > 0
})

/**
 * Whether apply button should be enabled
 *
 * Blocks when:
 * - All inputs are empty
 * - Any input is invalid
 * - Loading is true
 */
const canApply = computed(() => {
  if (props.loading) return false
  if (!hasAnyInput.value) return false
  if (!allInputsValid.value) return false
  return true
})

/** Handle apply button click */
function handleApply() {
  if (!canApply.value) return
  emit('apply', payload.value)
  // Note: Do NOT emit update:open here - parent controls close on success/failure
}

/** Handle cancel button click */
function handleCancel() {
  open.value = false
}

/** Handle keydown events for Enter key submission */
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && canApply.value) {
    handleApply()
  }
}

/** Clear all inputs and errors when modal opens */
watch(open, (isOpen) => {
  if (isOpen) {
    inputs.pp = ''
    inputs.gp = ''
    inputs.ep = ''
    inputs.sp = ''
    inputs.cp = ''
    // Clear any previous error when modal opens fresh
    emit('clear-error')
  }
})

/**
 * Format currency value for display
 */
function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return '0'
  return value.toLocaleString()
}

/**
 * Build current currency display string
 */
const currentCurrencyDisplay = computed(() => {
  if (!props.currency) return 'No currency'
  const parts: string[] = []
  if (props.currency.pp > 0) parts.push(`${formatCurrency(props.currency.pp)} PP`)
  if (props.currency.gp > 0) parts.push(`${formatCurrency(props.currency.gp)} GP`)
  if (props.currency.ep > 0) parts.push(`${formatCurrency(props.currency.ep)} EP`)
  if (props.currency.sp > 0) parts.push(`${formatCurrency(props.currency.sp)} SP`)
  if (props.currency.cp > 0) parts.push(`${formatCurrency(props.currency.cp)} CP`)
  return parts.length > 0 ? parts.join(' \u00b7 ') : 'Empty purse'
})
</script>

<template>
  <UModal
    v-model:open="open"
    title="Manage Currency"
    description="Add, subtract, or set currency values"
    @keydown="handleKeydown"
  >
    <template #body>
      <div class="space-y-4">
        <!-- Current Currency Display -->
        <div class="text-center">
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Current
          </div>
          <div class="text-base font-medium text-gray-900 dark:text-white">
            {{ currentCurrencyDisplay }}
          </div>
        </div>

        <!-- Currency Inputs -->
        <div class="space-y-3">
          <div
            v-for="c in CURRENCY_CONFIG"
            :key="c.key"
            class="flex items-center gap-3"
          >
            <span :class="['text-sm font-bold w-8', c.labelText]">
              {{ c.label }}
            </span>
            <UInput
              v-model="inputs[c.key]"
              :data-testid="`currency-input-${c.key}`"
              type="text"
              inputmode="numeric"
              placeholder="-5, +5, or 5"
              size="md"
              class="flex-1"
              :disabled="loading"
              @keydown.enter="handleApply"
            />
          </div>
        </div>

        <!-- Hint Text -->
        <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
          Subtract (-5), add (+5), or set to value (5)
        </p>

        <!-- Error Display -->
        <div
          v-if="error"
          data-testid="currency-error"
          class="mt-3 p-3 bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-800 rounded-lg"
        >
          <p class="text-sm text-error-700 dark:text-error-300 text-center font-medium">
            {{ error }}
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
          :disabled="loading"
          @click="handleCancel"
        >
          Cancel
        </UButton>
        <UButton
          data-testid="apply-btn"
          color="primary"
          :disabled="!canApply"
          :loading="loading"
          @click="handleApply"
        >
          Apply
        </UButton>
      </div>
    </template>
  </UModal>
</template>
