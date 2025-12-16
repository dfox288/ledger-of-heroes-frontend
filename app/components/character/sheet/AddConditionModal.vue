<!-- app/components/character/sheet/AddConditionModal.vue -->
<script setup lang="ts">
/**
 * Add Condition Modal
 *
 * Modal for adding a condition to a character during play mode.
 * Displays all 15 D&D 5e conditions as clickable chips.
 * Shows level picker (1-6) only when Exhaustion is selected.
 */
import type { Condition } from '~/types'

defineProps<{
  availableConditions: Condition[]
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  add: [payload: { condition: string, source: string, duration: string, level?: number }]
}>()

/** Currently selected condition */
const selectedCondition = ref<Condition | null>(null)

/** Optional source text (e.g., "Giant Spider bite") */
const source = ref('')

/** Optional duration text (e.g., "1 hour") */
const duration = ref('')

/** Exhaustion level (1-6), only used for exhaustion condition */
const level = ref(1)

/**
 * Check if selected condition is Exhaustion
 * Exhaustion is special - it has levels 1-6
 */
const isExhaustion = computed(() => {
  if (!selectedCondition.value) return false
  return selectedCondition.value.slug.includes('exhaustion')
})

/**
 * Whether the Add button should be enabled
 * Requires a condition to be selected
 */
const canAdd = computed(() => {
  return selectedCondition.value !== null
})

/**
 * Select a condition from the grid
 */
function selectCondition(condition: Condition) {
  selectedCondition.value = condition
}

/**
 * Handle Add button click
 */
function handleAdd() {
  if (!selectedCondition.value) return

  emit('add', {
    condition: selectedCondition.value.slug,
    source: source.value,
    duration: duration.value,
    level: isExhaustion.value ? level.value : undefined
  })
  open.value = false
}

/**
 * Handle Cancel button click
 */
function handleCancel() {
  open.value = false
}

/**
 * Reset state when modal opens
 */
watch(open, (isOpen) => {
  if (isOpen) {
    selectedCondition.value = null
    source.value = ''
    duration.value = ''
    level.value = 1
  }
})

/**
 * Condition icons mapping
 */
const conditionIcons: Record<string, string> = {
  blinded: 'i-heroicons-eye-slash',
  charmed: 'i-heroicons-heart',
  deafened: 'i-heroicons-speaker-x-mark',
  frightened: 'i-heroicons-face-frown',
  grappled: 'i-heroicons-hand-raised',
  incapacitated: 'i-heroicons-no-symbol',
  invisible: 'i-heroicons-eye',
  paralyzed: 'i-heroicons-bolt',
  petrified: 'i-heroicons-cube',
  poisoned: 'i-heroicons-beaker',
  prone: 'i-heroicons-arrow-down',
  restrained: 'i-heroicons-link',
  stunned: 'i-heroicons-sparkles',
  unconscious: 'i-heroicons-moon',
  exhaustion: 'i-heroicons-battery-0'
}

/**
 * Get icon for a condition
 */
function getConditionIcon(condition: Condition): string {
  // Extract condition name from slug (e.g., "core:poisoned" -> "poisoned")
  const name = condition.slug.split(':').pop() || ''
  return conditionIcons[name] || 'i-heroicons-exclamation-triangle'
}

/**
 * Check if a condition is selected
 */
function isSelected(condition: Condition): boolean {
  return selectedCondition.value?.id === condition.id
}
</script>

<template>
  <UModal v-model:open="open">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Add Condition
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Condition Grid -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select a condition:
          </label>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="condition in availableConditions"
              :key="condition.id"
              :data-testid="`condition-chip-${condition.slug}`"
              :color="isSelected(condition) ? 'primary' : 'neutral'"
              :variant="isSelected(condition) ? 'solid' : 'outline'"
              size="sm"
              @click="selectCondition(condition)"
            >
              <UIcon
                :name="getConditionIcon(condition)"
                class="w-4 h-4 mr-1"
              />
              {{ condition.name }}
            </UButton>
          </div>
        </div>

        <!-- Exhaustion Level Picker (only for exhaustion) -->
        <div
          v-if="isExhaustion"
          class="space-y-2"
        >
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Exhaustion Level:
          </label>
          <div class="flex gap-2">
            <UButton
              v-for="lvl in 6"
              :key="lvl"
              :data-testid="`exhaustion-level-${lvl}`"
              :color="level === lvl ? 'primary' : 'neutral'"
              :variant="level === lvl ? 'solid' : 'outline'"
              size="sm"
              @click="level = lvl"
            >
              {{ lvl }}
            </UButton>
          </div>
          <p
            v-if="level >= 5"
            class="text-sm"
            :class="level === 6 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-amber-600 dark:text-amber-400'"
          >
            {{ level === 6 ? 'Level 6 exhaustion results in death!' : 'Warning: Level 5+ exhaustion is severe' }}
          </p>
        </div>

        <!-- Source Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Source (optional):
          </label>
          <UInput
            v-model="source"
            data-testid="condition-source"
            placeholder="e.g., Giant Spider bite"
          />
        </div>

        <!-- Duration Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Duration (optional):
          </label>
          <UInput
            v-model="duration"
            data-testid="condition-duration"
            placeholder="e.g., 1 hour, until long rest"
          />
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
          data-testid="add-btn"
          color="primary"
          :disabled="!canAdd"
          @click="handleAdd"
        >
          Add Condition
        </UButton>
      </div>
    </template>
  </UModal>
</template>
