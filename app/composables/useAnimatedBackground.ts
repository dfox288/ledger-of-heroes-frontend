/**
 * Parchment background using image
 * Subtle parallax scroll effect
 */
export class ParchmentBackground {
  private offsetX = 0
  private offsetY = 0
  private scrollOffsetY = 0
  private scrollVelocity = 0
  private image: HTMLImageElement | null = null
  private imageLoaded = false

  constructor(
    private width: number,
    private height: number,
    private isDark: boolean
  ) {
    // Load parchment image
    this.loadImage()
  }

  private loadImage(): void {
    this.image = new Image()
    this.image.onload = () => {
      this.imageLoaded = true
    }
    // Use provided parchment background
    this.image.src = '/background.png'

    // If image fails to load, we'll draw a solid color
    this.image.onerror = () => {
      this.imageLoaded = false
    }
  }

  /**
   * Update scroll inertia
   */
  updateScroll(scrollDelta: number): void {
    // Add scroll velocity with dampening
    this.scrollVelocity += scrollDelta * 0.05
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 1000

    // Very slow diagonal drift (completes full cycle in ~2 minutes)
    this.offsetX += dt * 2
    this.offsetY += dt * 1.5

    // Apply scroll inertia
    this.scrollOffsetY += this.scrollVelocity * dt
    this.scrollVelocity *= 0.95 // Dampen velocity

    // Wrap offsets
    if (this.offsetX > 100) this.offsetX = 0
    if (this.offsetY > 100) this.offsetY = 0
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save()

    // If image loaded, draw it as tiled background
    if (this.imageLoaded && this.image) {
      // Apply grayscale filter to desaturate colors
      ctx.filter = 'grayscale(100%) brightness(1.1)'

      // Draw tiled pattern with parallax offset
      const pattern = ctx.createPattern(this.image, 'repeat')
      if (pattern) {
        ctx.translate(this.offsetX, this.offsetY + this.scrollOffsetY * 0.3)
        ctx.fillStyle = pattern
        // Extremely subtle opacity
        ctx.globalAlpha = this.isDark ? 0.08 : 0.04
        ctx.fillRect(-100, -100, this.width + 200, this.height + 200)
      }
    } else {
      // Fallback: solid color background
      const baseColor = this.isDark
        ? 'rgba(35, 32, 28, 0.08)'  // Dark vellum
        : 'rgba(245, 237, 220, 0.04)' // Aged parchment

      ctx.fillStyle = baseColor
      ctx.fillRect(0, 0, this.width, this.height)
    }

    ctx.restore()
  }
}

/**
 * Magical sparkle particle with mouse interaction
 */
export class MagicParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
  trail: Array<{ x: number; y: number; opacity: number }>
  private width: number
  private height: number
  private pathPhase: number
  private baseVx: number  // Original velocity for restoration
  private baseVy: number

  constructor(width: number, height: number, hue: number = 260) {
    this.width = width
    this.height = height

    // Random position
    this.x = Math.random() * width
    this.y = Math.random() * height

    // Random velocity (slower movement)
    this.vx = (Math.random() - 0.5) * 15
    this.vy = (Math.random() - 0.5) * 15
    this.baseVx = this.vx
    this.baseVy = this.vy

    // Size (wide variety: 3-14px)
    this.size = 3 + Math.random() * 11

    // Opacity (0.2-0.5)
    this.opacity = 0.2 + Math.random() * 0.3

    // Color hue (for variety)
    this.hue = hue + (Math.random() - 0.5) * 40

    // Trail positions
    this.trail = []

    // Path phase for curved movement
    this.pathPhase = Math.random() * Math.PI * 2
  }

  /**
   * Apply mouse repulsion force
   */
  applyMouseForce(mouseX: number, mouseY: number): void {
    const dx = this.x - mouseX
    const dy = this.y - mouseY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Repulsion radius
    const influenceRadius = 150

    if (distance < influenceRadius && distance > 0) {
      // Calculate repulsion force (stronger when closer)
      const force = (influenceRadius - distance) / influenceRadius
      const angle = Math.atan2(dy, dx)

      // Apply force to velocity (slower reaction)
      this.vx += Math.cos(angle) * force * 100
      this.vy += Math.sin(angle) * force * 100
    }
  }

  /**
   * Apply scroll momentum
   */
  applyScrollMomentum(scrollDelta: number): void {
    // Add upward/downward momentum based on scroll (moderate reaction)
    this.vy += scrollDelta * 0.6
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 1000

    // Update path phase for curved movement
    this.pathPhase += dt * 2

    // Gradually restore to base velocity (spring-back effect)
    this.vx += (this.baseVx - this.vx) * 0.02
    this.vy += (this.baseVy - this.vy) * 0.02

    // Update position with sine wave
    this.x += this.vx * dt + Math.sin(this.pathPhase) * 0.5
    this.y += this.vy * dt + Math.cos(this.pathPhase) * 0.5

    // Wrap around edges
    if (this.x > this.width) this.x = 0
    if (this.x < 0) this.x = this.width
    if (this.y > this.height) this.y = 0
    if (this.y < 0) this.y = this.height

    // Update trail
    this.trail.unshift({ x: this.x, y: this.y, opacity: this.opacity })
    if (this.trail.length > 5) this.trail.pop()

    // Fade trail
    for (let i = 0; i < this.trail.length; i++) {
      this.trail[i]!.opacity *= 0.9
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save()

    // Draw trail
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const point = this.trail[i]!
      ctx.fillStyle = `hsla(${this.hue}, 70%, 70%, ${point.opacity * 0.3})`
      ctx.beginPath()
      ctx.arc(point.x, point.y, this.size * (0.3 + i * 0.1), 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw main particle (star shape)
    ctx.fillStyle = `hsla(${this.hue}, 80%, 80%, ${this.opacity})`
    ctx.shadowBlur = 8
    ctx.shadowColor = `hsla(${this.hue}, 80%, 80%, ${this.opacity})`

    // Draw 4-pointed star
    ctx.beginPath()
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 - Math.PI / 2
      const outerX = this.x + Math.cos(angle) * this.size
      const outerY = this.y + Math.sin(angle) * this.size
      const innerAngle = angle + Math.PI / 4
      const innerX = this.x + Math.cos(innerAngle) * this.size * 0.4
      const innerY = this.y + Math.sin(innerAngle) * this.size * 0.4

      if (i === 0) ctx.moveTo(outerX, outerY)
      else ctx.lineTo(outerX, outerY)
      ctx.lineTo(innerX, innerY)
    }
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }
}

interface ColorPalette {
  particleHue: number
}

const LIGHT_MODE_COLORS: ColorPalette = {
  particleHue: 260 // Purple/violet
}

const DARK_MODE_COLORS: ColorPalette = {
  particleHue: 180 // Cyan
}

export function shouldAnimate(): boolean {
  if (typeof window === 'undefined') return false

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  return !mediaQuery.matches
}

export function useAnimatedBackground(canvas: HTMLCanvasElement, isDark: boolean) {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas context not available')

  const ctx: CanvasRenderingContext2D = context

  let parchment: ParchmentBackground | null = null
  let particles: MagicParticle[] = []
  let animationFrameId: number | null = null
  let lastTime = 0

  // Mouse tracking
  let mouseX = -1000
  let mouseY = -1000
  let lastScrollY = 0

  const colors = isDark ? DARK_MODE_COLORS : LIGHT_MODE_COLORS

  // Mouse move handler
  function handleMouseMove(event: MouseEvent) {
    mouseX = event.clientX
    mouseY = event.clientY
  }

  // Scroll handler
  function handleScroll() {
    const currentScrollY = window.scrollY
    const scrollDelta = currentScrollY - lastScrollY
    lastScrollY = currentScrollY

    // Apply scroll momentum to parchment
    if (parchment) {
      parchment.updateScroll(scrollDelta)
    }

    // Apply scroll momentum to particles
    for (const particle of particles) {
      particle.applyScrollMomentum(scrollDelta)
    }
  }

  // Visibility change handler
  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      stop()
    } else {
      start()
    }
  }

  function initialize() {
    const width = canvas.width
    const height = canvas.height

    // Create parchment background
    parchment = new ParchmentBackground(width, height, isDark)

    // Create 80-120 magic particles (high count for rich atmosphere)
    const particleCount = 80 + Math.floor(Math.random() * 41)
    particles = Array.from({ length: particleCount }, () => new MagicParticle(width, height, colors.particleHue))

    // Listen for events
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
      window.addEventListener('scroll', handleScroll, { passive: true })
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }
  }

  function animate(currentTime: number) {
    animationFrameId = requestAnimationFrame(animate)

    if (!lastTime) lastTime = currentTime
    const deltaTime = currentTime - lastTime

    // Throttle to 30 FPS (33.33ms per frame)
    if (deltaTime < 33) {
      return
    }

    lastTime = currentTime

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Layer 1: Parchment background
    if (parchment) {
      parchment.update(deltaTime)
      parchment.draw(ctx)
    }

    // Layer 2: Magic particles with mouse interaction
    for (const particle of particles) {
      // Apply mouse repulsion
      if (mouseX !== -1000) {
        particle.applyMouseForce(mouseX, mouseY)
      }

      particle.update(deltaTime)
      particle.draw(ctx)
    }
  }

  function start() {
    if (animationFrameId !== null) return
    lastTime = 0
    animationFrameId = requestAnimationFrame(animate)
  }

  function stop() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
      lastTime = 0
    }
  }

  function cleanup() {
    stop()

    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }

    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }

  function isRunning() {
    return animationFrameId !== null
  }

  function getParticleCount() {
    return particles.length + (parchment ? 1 : 0)
  }

  return {
    initialize,
    start,
    stop,
    cleanup,
    isRunning,
    getParticleCount
  }
}
