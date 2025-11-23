<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useColorMode } from '#imports'
import { shouldAnimate, useAnimatedBackground } from '~/composables/useAnimatedBackground'

const canvas2dRef = ref<HTMLCanvasElement | null>(null)
const canvas3dRef = ref<HTMLCanvasElement | null>(null)
const colorMode = useColorMode()

let cleanup: (() => void) | null = null

// Check if animations should run
const animate = shouldAnimate()

// Handle window resize
function handleResize() {
  if (!canvas2dRef.value || !canvas3dRef.value) return

  // Resize 2D canvas
  canvas2dRef.value.width = window.innerWidth
  canvas2dRef.value.height = window.innerHeight

  // Resize 3D canvas
  canvas3dRef.value.width = window.innerWidth
  canvas3dRef.value.height = window.innerHeight

  // Reinitialize animation with new canvas size
  if (cleanup) {
    cleanup()
    const isDark = colorMode.value === 'dark'
    const { initialize, start, cleanup: cleanupFn } = useAnimatedBackground(
      canvas2dRef.value,
      isDark,
      canvas3dRef.value
    )
    initialize()
    start()
    cleanup = cleanupFn
  }
}

onMounted(() => {
  if (!animate || !canvas2dRef.value || !canvas3dRef.value) return

  // Use setTimeout to ensure canvas is fully rendered
  setTimeout(() => {
    if (!canvas2dRef.value || !canvas3dRef.value) return

    // Set initial canvas size
    handleResize()

    // Listen for resize
    window.addEventListener('resize', handleResize)

    // Initialize animation
    const isDark = colorMode.value === 'dark'
    const { initialize, start, cleanup: cleanupFn } = useAnimatedBackground(
      canvas2dRef.value,
      isDark,
      canvas3dRef.value
    )

    initialize()
    start()
    cleanup = cleanupFn

    // Watch for color mode changes
    watch(() => colorMode.value, (newMode) => {
      if (!canvas2dRef.value || !canvas3dRef.value) return

      // Reinitialize with new color mode
      if (cleanup) cleanup()

      const isDark = newMode === 'dark'
      const { initialize, start, cleanup: cleanupFn } = useAnimatedBackground(
        canvas2dRef.value,
        isDark,
        canvas3dRef.value
      )

      initialize()
      start()
      cleanup = cleanupFn
    })
  }, 100) // Wait 100ms for everything to settle
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (cleanup) cleanup()
})
</script>

<template>
  <div v-if="animate">
    <!-- 2D Canvas (parchment + particles + constellations) -->
    <canvas
      ref="canvas2dRef"
      class="pointer-events-none"
      style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1;"
      aria-hidden="true"
    />
    <!-- 3D Canvas (dice) - layered between parchment and particles -->
    <canvas
      ref="canvas3dRef"
      class="pointer-events-none"
      style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 2;"
      aria-hidden="true"
    />
  </div>
</template>
