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
