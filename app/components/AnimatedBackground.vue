<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useColorMode } from '#imports'
import { shouldAnimate, useAnimatedBackground } from '~/composables/useAnimatedBackground'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const colorMode = useColorMode()

let cleanup: (() => void) | null = null

// Check if animations should run
const animate = shouldAnimate()

// Handle window resize
function handleResize() {
  if (!canvasRef.value) return

  canvasRef.value.width = window.innerWidth
  canvasRef.value.height = window.innerHeight
}

onMounted(() => {
  if (!animate || !canvasRef.value) return

  // Set initial canvas size
  handleResize()

  // Listen for resize
  window.addEventListener('resize', handleResize)

  // Initialize animation
  const isDark = colorMode.value === 'dark'
  const { initialize, start, cleanup: cleanupFn } = useAnimatedBackground(canvasRef.value, isDark)

  initialize()
  start()
  cleanup = cleanupFn

  // Watch for color mode changes
  watch(() => colorMode.value, (newMode) => {
    if (!canvasRef.value) return

    // Reinitialize with new color mode
    if (cleanup) cleanup()

    const isDark = newMode === 'dark'
    const { initialize, start, cleanup: cleanupFn } = useAnimatedBackground(canvasRef.value, isDark)

    initialize()
    start()
    cleanup = cleanupFn
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (cleanup) cleanup()
})
</script>

<template>
  <canvas
    v-if="animate"
    ref="canvasRef"
    class="fixed inset-0 -z-10 pointer-events-none"
    aria-hidden="true"
  />
</template>
