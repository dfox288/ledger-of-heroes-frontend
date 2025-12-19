<!-- app/components/character/sheet/ConcentrationIndicator.vue -->
<script setup lang="ts">
/**
 * ConcentrationIndicator
 *
 * Displays active spell concentration in the stats bar.
 * Shows the concentrated spell name (clickable to view details)
 * and a clear button in play mode.
 *
 * @see Issue #783, #792
 */
import type { ConcentrationState } from '~/stores/characterPlayState'

interface Props {
  concentration: ConcentrationState | null
  canEdit: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  clear: []
  viewSpell: [slug: string]
}>()

function handleSpellClick() {
  if (props.concentration) {
    emit('viewSpell', props.concentration.spellSlug)
  }
}

function handleClear() {
  emit('clear')
}
</script>

<template>
  <div
    v-if="concentration"
    class="flex items-center gap-2"
    data-testid="concentration-indicator"
  >
    <div class="text-center">
      <div class="text-xs text-gray-500 uppercase">
        Concentrating
      </div>
      <button
        data-testid="concentration-spell-link"
        class="text-lg font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
        :aria-label="`View ${concentration.spellName} details`"
        @click="handleSpellClick"
      >
        {{ concentration.spellName }}
      </button>
    </div>
    <button
      v-if="canEdit"
      data-testid="concentration-clear-btn"
      class="p-1 text-gray-400 hover:text-red-500 transition-colors"
      title="End concentration"
      aria-label="End concentration"
      @click="handleClear"
    >
      <UIcon
        name="i-heroicons-x-mark"
        class="w-4 h-4"
      />
    </button>
  </div>
</template>
