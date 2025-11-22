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
      // Apply grayscale filter with enhanced contrast
      ctx.filter = 'grayscale(100%) contrast(1.3) brightness(1.05)'

      // Draw tiled pattern with parallax offset
      const pattern = ctx.createPattern(this.image, 'repeat')
      if (pattern) {
        ctx.translate(this.offsetX, this.offsetY + this.scrollOffsetY * 0.2)
        ctx.fillStyle = pattern
        // Reduced opacity for even more subtlety
        ctx.globalAlpha = this.isDark ? 0.05 : 0.03
        ctx.fillRect(-100, -100, this.width + 200, this.height + 200)
      }
    } else {
      // Fallback: solid color background
      const baseColor = this.isDark
        ? 'rgba(35, 32, 28, 0.05)'  // Dark vellum
        : 'rgba(245, 237, 220, 0.03)' // Aged parchment

      ctx.fillStyle = baseColor
      ctx.fillRect(0, 0, this.width, this.height)
    }

    ctx.restore()
  }
}

/**
 * D&D themed color palette with very subtle variations
 * Using even lighter, more pastel shades for gentle atmosphere
 */
const PARTICLE_COLORS = [
  // Arcane (purple) - very light variations
  { h: 258, s: 70, l: 85, name: 'arcane-light', weight: 4 },  // arcane-100 (desaturated)
  { h: 258, s: 75, l: 75, name: 'arcane', weight: 2 },        // arcane-200 (desaturated)
  { h: 258, s: 80, l: 70, name: 'arcane-accent', weight: 1 }, // arcane-300 (desaturated)

  // Treasure (gold) - very light variations
  { h: 43, s: 75, l: 85, name: 'treasure-light', weight: 4 }, // treasure-100 (desaturated)
  { h: 43, s: 80, l: 75, name: 'treasure', weight: 2 },       // treasure-200 (desaturated)
  { h: 43, s: 85, l: 70, name: 'treasure-accent', weight: 1 },// treasure-300 (desaturated)

  // Emerald (green) - very light variations
  { h: 160, s: 65, l: 80, name: 'emerald-light', weight: 4 }, // emerald-200 (desaturated)
  { h: 160, s: 70, l: 70, name: 'emerald', weight: 2 },       // emerald-300 (desaturated)

  // Glory (blue) - very light variations
  { h: 210, s: 75, l: 85, name: 'glory-light', weight: 4 },   // glory-100 (desaturated)
  { h: 210, s: 80, l: 75, name: 'glory', weight: 2 },         // glory-200 (desaturated)
  { h: 210, s: 85, l: 70, name: 'glory-accent', weight: 1 },  // glory-300 (desaturated)

  // Danger (orange) - very light variations
  { h: 24, s: 75, l: 82, name: 'danger-light', weight: 4 },   // danger-200 (desaturated)
  { h: 24, s: 80, l: 72, name: 'danger', weight: 2 }          // danger-300 (desaturated)
]

/**
 * Particle shape types
 */
type ParticleShape = 'star4' | 'circle' | 'diamond' | 'star8' | 'hexagon' | 'cross'

const PARTICLE_SHAPES: Array<{ type: ParticleShape; weight: number }> = [
  { type: 'star4', weight: 3 },    // Classic 4-point star (most common)
  { type: 'circle', weight: 3 },   // Simple orb/bubble
  { type: 'diamond', weight: 2 },  // Crystal/gem
  { type: 'hexagon', weight: 1 },  // Spell grid cell
  { type: 'cross', weight: 1 }     // Runic symbol
]

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
  color: { h: number; s: number; l: number; name: string; weight: number }
  shape: ParticleShape
  trail: Array<{ x: number; y: number; opacity: number }>
  private width: number
  private height: number
  private pathPhase: number
  private baseVx: number  // Original velocity for restoration
  private baseVy: number

  constructor(width: number, height: number) {
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

    // Size (reduced max: 3-8px)
    this.size = 3 + Math.random() * 5

    // Opacity (0.2-0.5)
    this.opacity = 0.2 + Math.random() * 0.3

    // Select random D&D themed color using weighted distribution
    this.color = this.selectWeightedColor()

    // Select random shape using weighted distribution
    this.shape = this.selectWeightedShape()

    // Trail positions
    this.trail = []

    // Path phase for curved movement
    this.pathPhase = Math.random() * Math.PI * 2
  }

  /**
   * Select color using weighted random distribution
   */
  private selectWeightedColor() {
    const totalWeight = PARTICLE_COLORS.reduce((sum, color) => sum + color.weight, 0)
    let random = Math.random() * totalWeight

    for (const color of PARTICLE_COLORS) {
      random -= color.weight
      if (random <= 0) return color
    }

    return PARTICLE_COLORS[0]! // Fallback
  }

  /**
   * Select shape using weighted random distribution
   */
  private selectWeightedShape(): ParticleShape {
    const totalWeight = PARTICLE_SHAPES.reduce((sum, shape) => sum + shape.weight, 0)
    let random = Math.random() * totalWeight

    for (const shape of PARTICLE_SHAPES) {
      random -= shape.weight
      if (random <= 0) return shape.type
    }

    return 'star4' // Fallback
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
      ctx.fillStyle = `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l}%, ${point.opacity * 0.3})`
      ctx.beginPath()
      ctx.arc(point.x, point.y, this.size * (0.3 + i * 0.1), 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw main particle
    ctx.fillStyle = `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l}%, ${this.opacity})`
    ctx.shadowBlur = 6
    ctx.shadowColor = `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l}%, ${this.opacity * 0.5})`

    this.drawShape(ctx)

    ctx.restore()
  }

  /**
   * Draw particle shape
   */
  private drawShape(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath()

    switch (this.shape) {
      case 'star4': // 4-pointed star
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
        break

      case 'circle': // Simple circle/orb
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        break

      case 'diamond': // Diamond/rhombus
        ctx.moveTo(this.x, this.y - this.size)
        ctx.lineTo(this.x + this.size, this.y)
        ctx.lineTo(this.x, this.y + this.size)
        ctx.lineTo(this.x - this.size, this.y)
        break

      case 'hexagon': // Hexagon (D&D hex grid)
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2
          const x = this.x + Math.cos(angle) * this.size
          const y = this.y + Math.sin(angle) * this.size
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        break

      case 'cross': // Cross/plus symbol
        const thickness = this.size * 0.3
        ctx.moveTo(this.x - thickness, this.y - this.size)
        ctx.lineTo(this.x + thickness, this.y - this.size)
        ctx.lineTo(this.x + thickness, this.y - thickness)
        ctx.lineTo(this.x + this.size, this.y - thickness)
        ctx.lineTo(this.x + this.size, this.y + thickness)
        ctx.lineTo(this.x + thickness, this.y + thickness)
        ctx.lineTo(this.x + thickness, this.y + this.size)
        ctx.lineTo(this.x - thickness, this.y + this.size)
        ctx.lineTo(this.x - thickness, this.y + thickness)
        ctx.lineTo(this.x - this.size, this.y + thickness)
        ctx.lineTo(this.x - this.size, this.y - thickness)
        ctx.lineTo(this.x - thickness, this.y - thickness)
        break
    }

    ctx.closePath()
    ctx.fill()
  }
}

// No longer need mode-specific colors since particles use themed palette

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
    particles = Array.from({ length: particleCount }, () => new MagicParticle(width, height))

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

    // Layer 2: Draw constellation connections (before particles)
    drawConstellations(ctx, particles)

    // Layer 3: Magic particles with mouse interaction
    for (const particle of particles) {
      // Apply mouse repulsion
      if (mouseX !== -1000) {
        particle.applyMouseForce(mouseX, mouseY)
      }

      particle.update(deltaTime)
      particle.draw(ctx)
    }
  }

  /**
   * Draw constellation lines between nearby particles
   */
  function drawConstellations(ctx: CanvasRenderingContext2D, particles: MagicParticle[]) {
    const maxDistance = 120 // Max distance to draw connection
    const maxConnections = 3 // Max connections per particle

    ctx.save()

    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i]!
      let connectionCount = 0

      for (let j = i + 1; j < particles.length && connectionCount < maxConnections; j++) {
        const p2 = particles[j]!

        // Calculate distance
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Only draw if within range
        if (distance < maxDistance) {
          // High opacity for clear visibility
          const opacity = (1 - distance / maxDistance) * 0.5

          // Draw line with gradient (bright, saturated colors)
          const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
          // Use bright colors (L: 70%, full saturation)
          gradient.addColorStop(0, `hsla(${p1.color.h}, 100%, 70%, ${opacity})`)
          gradient.addColorStop(1, `hsla(${p2.color.h}, 100%, 70%, ${opacity})`)

          ctx.strokeStyle = gradient
          ctx.lineWidth = 1.5 // Thicker strokes for clarity
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()

          connectionCount++
        }
      }
    }

    ctx.restore()
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
