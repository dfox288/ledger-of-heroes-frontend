const RUNE_SYMBOLS = [
  'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ',  // Norse runes
  '⚔', '✦', '◈', '⬡', '⬢', '⬣'     // Geometric symbols
]

export class Swirl {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  phase: number
  opacity: number
  private width: number
  private height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height

    // Random position
    this.x = Math.random() * width
    this.y = Math.random() * height

    // Random velocity (-30 to 30 pixels/second)
    this.vx = (Math.random() - 0.5) * 60
    this.vy = (Math.random() - 0.5) * 60

    // Random size (20-60px radius)
    this.size = 20 + Math.random() * 40

    // Random phase for sine wave
    this.phase = Math.random() * Math.PI * 2

    // Random opacity (0.08-0.15)
    this.opacity = 0.08 + Math.random() * 0.07
  }

  update(deltaTime: number): void {
    // Convert deltaTime from milliseconds to seconds
    const dt = deltaTime / 1000

    // Update position based on velocity
    this.x += this.vx * dt
    this.y += this.vy * dt

    // Add sine wave drift for organic movement
    this.phase += dt * 0.5
    this.x += Math.sin(this.phase) * 0.5
    this.y += Math.cos(this.phase) * 0.5

    // Wrap around edges
    if (this.x > this.width) this.x = 0
    if (this.x < 0) this.x = this.width
    if (this.y > this.height) this.y = 0
    if (this.y < 0) this.y = this.height
  }

  draw(ctx: CanvasRenderingContext2D, color: string): void {
    ctx.save()

    // Replace OPACITY placeholder with actual opacity
    const fillColor = color.replace('OPACITY', this.opacity.toString())

    // Create radial gradient for mystical glow effect
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size
    )
    gradient.addColorStop(0, fillColor)
    gradient.addColorStop(1, fillColor.replace(/[\d.]+\)$/, '0)')) // Fade to transparent

    // Draw circle with gradient
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }
}

export class Rune {
  x: number
  y: number
  symbol: string
  size: number
  opacity: number
  rotation: number
  fadeDirection: number
  private fadeSpeed: number
  private rotationSpeed: number
  private width: number
  private height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height

    // Random position
    this.x = Math.random() * width
    this.y = Math.random() * height

    // Random symbol
    this.symbol = RUNE_SYMBOLS[Math.floor(Math.random() * RUNE_SYMBOLS.length)]

    // Random size (40-80px)
    this.size = 40 + Math.random() * 40

    // Start with random opacity (0-0.12)
    this.opacity = Math.random() * 0.12

    // Random initial rotation
    this.rotation = Math.random() * Math.PI * 2

    // Random fade direction (1 = in, -1 = out)
    this.fadeDirection = Math.random() > 0.5 ? 1 : -1

    // Fade speed (0.01-0.015 opacity change per second)
    this.fadeSpeed = 0.01 + Math.random() * 0.005

    // Rotation speed (0.1-0.3 degrees per second)
    this.rotationSpeed = (0.1 + Math.random() * 0.2) * (Math.PI / 180)
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 1000

    // Update rotation
    this.rotation += this.rotationSpeed * dt

    // Update opacity (fade in/out)
    this.opacity += this.fadeDirection * this.fadeSpeed * dt

    // Clamp opacity and reverse direction at limits
    if (this.opacity >= 0.12) {
      this.opacity = 0.12
      this.fadeDirection = -1 // Start fading out
    } else if (this.opacity <= 0) {
      this.opacity = 0
      this.fadeDirection = 1 // Start fading in

      // Reposition when fully faded
      this.x = Math.random() * this.width
      this.y = Math.random() * this.height
      this.symbol = RUNE_SYMBOLS[Math.floor(Math.random() * RUNE_SYMBOLS.length)]
    }
  }

  draw(ctx: CanvasRenderingContext2D, color: string): void {
    if (this.opacity === 0) return // Skip if invisible

    ctx.save()

    // Move to rune position and rotate
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)

    // Replace OPACITY placeholder
    const fillColor = color.replace('OPACITY', this.opacity.toString())

    // Draw rune symbol
    ctx.fillStyle = fillColor
    ctx.font = `${this.size}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.symbol, 0, 0)

    ctx.restore()
  }
}

interface ColorPalette {
  swirlColor: string
  runeColor: string
}

const LIGHT_MODE_COLORS: ColorPalette = {
  swirlColor: 'rgba(139, 92, 246, OPACITY)', // violet-500
  runeColor: 'rgba(79, 70, 229, OPACITY)'     // indigo-600
}

const DARK_MODE_COLORS: ColorPalette = {
  swirlColor: 'rgba(167, 139, 250, OPACITY)', // violet-400
  runeColor: 'rgba(34, 211, 238, OPACITY)'    // cyan-400
}

export function useAnimatedBackground(canvas: HTMLCanvasElement, isDark: boolean) {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')

  let swirls: Swirl[] = []
  let runes: Rune[] = []
  let animationFrameId: number | null = null
  let lastTime = 0

  const colors = isDark ? DARK_MODE_COLORS : LIGHT_MODE_COLORS

  function initialize() {
    const width = canvas.width
    const height = canvas.height

    // Create 40 swirls
    swirls = Array.from({ length: 40 }, () => new Swirl(width, height))

    // Create 6 runes
    runes = Array.from({ length: 6 }, () => new Rune(width, height))
  }

  function animate(currentTime: number) {
    if (!lastTime) lastTime = currentTime
    const deltaTime = currentTime - lastTime
    lastTime = currentTime

    // Throttle to 30 FPS (33.33ms per frame)
    if (deltaTime < 33) {
      animationFrameId = requestAnimationFrame(animate)
      return
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update and draw swirls
    for (const swirl of swirls) {
      swirl.update(deltaTime)
      swirl.draw(ctx, colors.swirlColor)
    }

    // Update and draw runes
    for (const rune of runes) {
      rune.update(deltaTime)
      rune.draw(ctx, colors.runeColor)
    }

    // Continue animation
    animationFrameId = requestAnimationFrame(animate)
  }

  function start() {
    if (animationFrameId !== null) return // Already running
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

  function isRunning() {
    return animationFrameId !== null
  }

  function getParticleCount() {
    return swirls.length + runes.length
  }

  return {
    initialize,
    start,
    stop,
    isRunning,
    getParticleCount
  }
}
