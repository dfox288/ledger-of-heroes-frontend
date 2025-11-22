import { describe, it, expect, vi } from 'vitest'

describe('useAnimatedBackground', () => {
  describe('Swirl class', () => {
    it('initializes with random position and velocity', async () => {
      // We'll export Swirl class for testing
      const { Swirl } = await import('~/composables/useAnimatedBackground')

      const swirl = new Swirl(1920, 1080)

      expect(swirl.x).toBeGreaterThanOrEqual(0)
      expect(swirl.x).toBeLessThanOrEqual(1920)
      expect(swirl.y).toBeGreaterThanOrEqual(0)
      expect(swirl.y).toBeLessThanOrEqual(1080)
      expect(swirl.vx).toBeGreaterThanOrEqual(-30)
      expect(swirl.vx).toBeLessThanOrEqual(30)
      expect(swirl.size).toBeGreaterThanOrEqual(20)
      expect(swirl.size).toBeLessThanOrEqual(60)
    })

    it('updates position based on velocity and deltaTime', async () => {
      const { Swirl } = await import('~/composables/useAnimatedBackground')

      const swirl = new Swirl(1920, 1080)
      const initialX = swirl.x
      const initialY = swirl.y

      swirl.update(1000) // 1 second

      // Position should have changed
      expect(swirl.x).not.toBe(initialX)
      expect(swirl.y).not.toBe(initialY)
    })

    it('wraps around screen edges', async () => {
      const { Swirl } = await import('~/composables/useAnimatedBackground')

      const swirl = new Swirl(100, 100)
      swirl.x = 110 // Beyond right edge
      swirl.y = 110 // Beyond bottom edge

      swirl.update(16)

      expect(swirl.x).toBeLessThanOrEqual(100)
      expect(swirl.y).toBeLessThanOrEqual(100)
    })

    it('draws swirl with gradient fill', async () => {
      const { Swirl } = await import('~/composables/useAnimatedBackground')

      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext('2d')!

      const swirl = new Swirl(100, 100)

      // Spy on canvas methods
      const createRadialGradientSpy = vi.spyOn(ctx, 'createRadialGradient')
      const fillSpy = vi.spyOn(ctx, 'fill')

      swirl.draw(ctx, 'rgba(139, 92, 246, OPACITY)')

      // Verify radial gradient was created
      expect(createRadialGradientSpy).toHaveBeenCalled()
      // Verify fill was called (drawing happened)
      expect(fillSpy).toHaveBeenCalled()
    })
  })

  describe('Rune class', () => {
    it('initializes with random position and symbol', async () => {
      const { Rune } = await import('~/composables/useAnimatedBackground')

      const rune = new Rune(1920, 1080)

      expect(rune.x).toBeGreaterThanOrEqual(0)
      expect(rune.x).toBeLessThanOrEqual(1920)
      expect(rune.y).toBeGreaterThanOrEqual(0)
      expect(rune.y).toBeLessThanOrEqual(1080)
      expect(rune.symbol).toBeDefined()
      expect(rune.symbol.length).toBeGreaterThan(0)
      expect(rune.size).toBeGreaterThanOrEqual(40)
      expect(rune.size).toBeLessThanOrEqual(80)
    })

    it('fades in and out over time', async () => {
      const { Rune } = await import('~/composables/useAnimatedBackground')

      const rune = new Rune(100, 100)
      rune.opacity = 0
      rune.fadeDirection = 1 // Fading in

      rune.update(1000) // 1 second

      expect(rune.opacity).toBeGreaterThan(0)
    })

    it('rotates slowly over time', async () => {
      const { Rune } = await import('~/composables/useAnimatedBackground')

      const rune = new Rune(100, 100)
      const initialRotation = rune.rotation

      rune.update(1000) // 1 second

      expect(rune.rotation).not.toBe(initialRotation)
    })

    it('repositions when fully faded out', async () => {
      const { Rune } = await import('~/composables/useAnimatedBackground')

      const rune = new Rune(100, 100)
      rune.opacity = 0
      rune.fadeDirection = -1 // Fading out
      const initialX = rune.x
      const initialY = rune.y

      rune.update(16) // Trigger reposition check

      // When opacity is 0 and fading out, should flip to fading in
      expect(rune.fadeDirection).toBe(1)
    })

    it('draws rune symbol with rotation', async () => {
      const { Rune } = await import('~/composables/useAnimatedBackground')

      const canvas = document.createElement('canvas')
      canvas.width = 200
      canvas.height = 200
      const ctx = canvas.getContext('2d')!

      const rune = new Rune(200, 200)
      rune.opacity = 0.1 // Make visible
      rune.x = 100 // Center position
      rune.y = 100 // Center position

      // Spy on canvas methods
      const fillTextSpy = vi.spyOn(ctx, 'fillText')
      const translateSpy = vi.spyOn(ctx, 'translate')
      const rotateSpy = vi.spyOn(ctx, 'rotate')

      rune.draw(ctx, 'rgba(79, 70, 229, OPACITY)')

      // Verify text was drawn with proper transformations
      expect(translateSpy).toHaveBeenCalledWith(100, 100)
      expect(rotateSpy).toHaveBeenCalled()
      expect(fillTextSpy).toHaveBeenCalledWith(rune.symbol, 0, 0)
    })
  })

  describe('useAnimatedBackground composable', () => {
    it('initializes particles', async () => {
      const { useAnimatedBackground } = await import('~/composables/useAnimatedBackground')

      const canvas = document.createElement('canvas')
      canvas.width = 1920
      canvas.height = 1080
      const ctx = canvas.getContext('2d')!

      const { initialize, getParticleCount } = useAnimatedBackground(canvas, false)
      initialize()

      // Should create particles (we'll add a getter for testing)
      expect(getParticleCount()).toBeGreaterThan(0)
    })

    it('starts animation loop', async () => {
      const { useAnimatedBackground } = await import('~/composables/useAnimatedBackground')

      const canvas = document.createElement('canvas')
      const { initialize, start, isRunning } = useAnimatedBackground(canvas, false)

      initialize()
      start()

      expect(isRunning()).toBe(true)
    })

    it('stops animation loop', async () => {
      const { useAnimatedBackground } = await import('~/composables/useAnimatedBackground')

      const canvas = document.createElement('canvas')
      const { initialize, start, stop, isRunning } = useAnimatedBackground(canvas, false)

      initialize()
      start()
      stop()

      expect(isRunning()).toBe(false)
    })
  })
})
