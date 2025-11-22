<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
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
  console.log('[AnimatedBackground] onMounted called')
  console.log('[AnimatedBackground] animate:', animate)
  console.log('[AnimatedBackground] canvasRef.value:', canvasRef.value)

  if (!animate || !canvasRef.value) {
    console.log('[AnimatedBackground] Skipping initialization - animate:', animate, 'canvas:', canvasRef.value)
    return
  }

  // Use nextTick to ensure canvas is in DOM before sizing
  nextTick(() => {
    if (!canvasRef.value) return

    // Set initial canvas size
    handleResize()
    console.log('[AnimatedBackground] Canvas size:', canvasRef.value.width, 'x', canvasRef.value.height)

    // Listen for resize
    window.addEventListener('resize', handleResize)

    // Initialize animation
    const isDark = colorMode.value === 'dark'
    const { initialize, start, cleanup: cleanupFn } = useAnimatedBackground(canvasRef.value, isDark)

    console.log('[AnimatedBackground] Initializing animation engine...')
    initialize()
    console.log('[AnimatedBackground] Starting animation loop...')
    start()
    cleanup = cleanupFn
    console.log('[AnimatedBackground] Animation started successfully!')

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
    class="fixed inset-0 pointer-events-none"
    style="z-index: 9999; border: 5px solid red;"
    aria-hidden="true"
  />
</template>
