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
})
