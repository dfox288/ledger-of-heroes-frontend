<script setup lang="ts">
const props = defineProps<{
  dieSize: number
  triggerRoll?: number // Increment to trigger a new roll
}>()

const emit = defineEmits<{
  'roll-complete': [result: number]
}>()

const displayValue = ref<number | null>(null)
const isRolling = ref(false)

// Animation frames for dice roll effect
const rollFrames = ref(0)
const rollInterval = ref<NodeJS.Timeout | null>(null)

function rollDie() {
  isRolling.value = true
  rollFrames.value = 0

  // Clear any existing interval
  if (rollInterval.value) clearInterval(rollInterval.value)

  // Animate random values for ~1 second
  rollInterval.value = setInterval(() => {
    displayValue.value = Math.floor(Math.random() * props.dieSize) + 1
    rollFrames.value++

    if (rollFrames.value >= 20) {
      // Stop rolling, generate final result
      if (rollInterval.value) clearInterval(rollInterval.value)
      const finalResult = Math.floor(Math.random() * props.dieSize) + 1
      displayValue.value = finalResult
      isRolling.value = false
      emit('roll-complete', finalResult)
    }
  }, 50)
}

// Watch for trigger changes to start rolling
watch(() => props.triggerRoll, (newVal, oldVal) => {
  if (newVal !== undefined && newVal !== oldVal) {
    rollDie()
  }
})

// Expose roll function for parent (keeping for backward compatibility)
defineExpose({ rollDie })

onUnmounted(() => {
  if (rollInterval.value) clearInterval(rollInterval.value)
})
</script>

<template>
  <div
    class="relative w-24 h-24 flex items-center justify-center"
  >
    <!-- Die background -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl shadow-lg"
    />

    <!-- Die value -->
    <span
      class="relative text-3xl font-bold text-white z-10 tabular-nums"
    >
      <template v-if="displayValue !== null">
        {{ displayValue }}
      </template>
      <template v-else>
        d{{ dieSize }}
      </template>
    </span>
  </div>
</template>
