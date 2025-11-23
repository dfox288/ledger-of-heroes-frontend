import * as THREE from 'three'

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
 * 3D Dice Types and Colors
 */
type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'

// D&D themed colors (from NuxtUI palette - 500 shades)
const DICE_COLORS = [
  { name: 'Arcane', color: 0x8b5cf6 },     // arcane-500
  { name: 'Treasure', color: 0xf59e0b },   // treasure-500
  { name: 'Emerald', color: 0x10b981 },    // emerald-500
  { name: 'Glory', color: 0x3b82f6 },      // glory-500
  { name: 'Danger', color: 0xf97316 },     // danger-500
  { name: 'Lore', color: 0xeab308 }        // lore-500
]

/**
 * Texture cache - one texture per die type
 */
const diceTextures: Map<DieType, THREE.Texture> = new Map()

/**
 * Texture rendering settings for decorative appearance
 */
const TEXTURE_SETTINGS = {
  fontSize: 80,
  fontFamily: 'Georgia, serif',
  fontWeight: 'bold',
  color: '#ffffff',
  opacity: 0.35
} as const

/**
 * Create texture for d6 (cube)
 * 6 faces arranged in 3×2 grid
 */
function createD6Texture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Setup text rendering
  const alpha = Math.round(TEXTURE_SETTINGS.opacity * 255).toString(16).padStart(2, '0')
  ctx.fillStyle = `${TEXTURE_SETTINGS.color}${alpha}`
  ctx.font = `${TEXTURE_SETTINGS.fontWeight} ${TEXTURE_SETTINGS.fontSize}px ${TEXTURE_SETTINGS.fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Grid layout: 3 columns × 2 rows
  const cols = 3
  const rows = 2
  const cellWidth = canvas.width / cols
  const cellHeight = canvas.height / rows

  // Draw numbers 1-6
  for (let i = 0; i < 6; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = col * cellWidth + cellWidth / 2
    const y = row * cellHeight + cellHeight / 2

    ctx.fillText((i + 1).toString(), x, y)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/**
 * Create texture for d4 (tetrahedron)
 * 4 faces arranged in 2×2 grid
 */
function createD4Texture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  const alpha = Math.round(TEXTURE_SETTINGS.opacity * 255).toString(16).padStart(2, '0')
  ctx.fillStyle = `${TEXTURE_SETTINGS.color}${alpha}`
  ctx.font = `${TEXTURE_SETTINGS.fontWeight} ${TEXTURE_SETTINGS.fontSize}px ${TEXTURE_SETTINGS.fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const cols = 2
  const rows = 2
  const cellWidth = canvas.width / cols
  const cellHeight = canvas.height / rows

  for (let i = 0; i < 4; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = col * cellWidth + cellWidth / 2
    const y = row * cellHeight + cellHeight / 2

    ctx.fillText((i + 1).toString(), x, y)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/**
 * Create texture for d8 (octahedron)
 * 8 faces arranged in 4×2 grid
 */
function createD8Texture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  const alpha = Math.round(TEXTURE_SETTINGS.opacity * 255).toString(16).padStart(2, '0')
  ctx.fillStyle = `${TEXTURE_SETTINGS.color}${alpha}`
  ctx.font = `${TEXTURE_SETTINGS.fontWeight} ${TEXTURE_SETTINGS.fontSize}px ${TEXTURE_SETTINGS.fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const cols = 4
  const rows = 2
  const cellWidth = canvas.width / cols
  const cellHeight = canvas.height / rows

  for (let i = 0; i < 8; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = col * cellWidth + cellWidth / 2
    const y = row * cellHeight + cellHeight / 2

    ctx.fillText((i + 1).toString(), x, y)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/**
 * Create texture for d10 (pentagonal trapezohedron)
 * 10 faces arranged in 5×2 grid
 * Note: d10 shows 1-9, then 0 (not 10)
 */
function createD10Texture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  const alpha = Math.round(TEXTURE_SETTINGS.opacity * 255).toString(16).padStart(2, '0')
  ctx.fillStyle = `${TEXTURE_SETTINGS.color}${alpha}`
  ctx.font = `${TEXTURE_SETTINGS.fontWeight} ${TEXTURE_SETTINGS.fontSize}px ${TEXTURE_SETTINGS.fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const cols = 5
  const rows = 2
  const cellWidth = canvas.width / cols
  const cellHeight = canvas.height / rows

  for (let i = 0; i < 10; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = col * cellWidth + cellWidth / 2
    const y = row * cellHeight + cellHeight / 2

    // d10 shows 1-9, then 0 (index 9 = 0)
    const number = i === 9 ? 0 : i + 1
    ctx.fillText(number.toString(), x, y)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/**
 * Create texture for d12 (dodecahedron)
 * 12 faces arranged in 4×3 grid
 */
function createD12Texture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  const alpha = Math.round(TEXTURE_SETTINGS.opacity * 255).toString(16).padStart(2, '0')
  ctx.fillStyle = `${TEXTURE_SETTINGS.color}${alpha}`
  ctx.font = `${TEXTURE_SETTINGS.fontWeight} ${TEXTURE_SETTINGS.fontSize}px ${TEXTURE_SETTINGS.fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const cols = 4
  const rows = 3
  const cellWidth = canvas.width / cols
  const cellHeight = canvas.height / rows

  for (let i = 0; i < 12; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = col * cellWidth + cellWidth / 2
    const y = row * cellHeight + cellHeight / 2

    ctx.fillText((i + 1).toString(), x, y)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/**
 * Create texture for d20 (icosahedron)
 * 20 faces arranged in 5×4 grid
 * Uses larger texture for better quality with more faces
 */
function createD20Texture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!

  const alpha = Math.round(TEXTURE_SETTINGS.opacity * 255).toString(16).padStart(2, '0')
  ctx.fillStyle = `${TEXTURE_SETTINGS.color}${alpha}`
  ctx.font = `${TEXTURE_SETTINGS.fontWeight} ${TEXTURE_SETTINGS.fontSize}px ${TEXTURE_SETTINGS.fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const cols = 5
  const rows = 4
  const cellWidth = canvas.width / cols
  const cellHeight = canvas.height / rows

  for (let i = 0; i < 20; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = col * cellWidth + cellWidth / 2
    const y = row * cellHeight + cellHeight / 2

    ctx.fillText((i + 1).toString(), x, y)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/**
 * Get or create texture for a die type
 * Textures are cached after first creation
 */
function createDiceTexture(type: DieType): THREE.Texture {
  // Return cached texture if exists
  if (diceTextures.has(type)) {
    return diceTextures.get(type)!
  }

  // Generate new texture based on type
  let texture: THREE.Texture
  switch (type) {
    case 'd4':
      texture = createD4Texture()
      break
    case 'd6':
      texture = createD6Texture()
      break
    case 'd8':
      texture = createD8Texture()
      break
    case 'd10':
      texture = createD10Texture()
      break
    case 'd12':
      texture = createD12Texture()
      break
    case 'd20':
      texture = createD20Texture()
      break
    default:
      texture = createD20Texture()
  }

  // Cache and return
  diceTextures.set(type, texture)
  return texture
}

/**
 * Create geometry for each die type
 */
function createDieGeometry(type: DieType): THREE.BufferGeometry {
  const size = 1
  switch (type) {
    case 'd4':
      return new THREE.TetrahedronGeometry(size)
    case 'd6':
      return new THREE.BoxGeometry(size, size, size)
    case 'd8':
      return new THREE.OctahedronGeometry(size)
    case 'd12':
      return new THREE.DodecahedronGeometry(size)
    case 'd20':
      return new THREE.IcosahedronGeometry(size)
    case 'd10':
      // d10 uses pentagonal trapezohedron (simplified as d12 for now)
      return new THREE.DodecahedronGeometry(size * 0.9)
    default:
      return new THREE.IcosahedronGeometry(size)
  }
}

/**
 * Create a single die mesh
 */
function createDie(type: DieType, colorIndex: number, position: THREE.Vector3): THREE.Mesh {
  const geometry = createDieGeometry(type)

  // Get texture for this die type
  const texture = createDiceTexture(type)

  // Glass-like material matching dice-test page
  const material = new THREE.MeshPhysicalMaterial({
    color: DICE_COLORS[colorIndex]!.color,
    map: texture, // Add texture map
    transparent: true,
    opacity: 0.25,
    transmission: 0.5,
    thickness: 0.5,
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.copy(position)

  // Slow random rotation speeds
  mesh.userData.rotationSpeed = new THREE.Vector3(
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02
  )

  // Store original position for spring-back
  mesh.userData.originalPosition = position.clone()
  mesh.userData.velocity = new THREE.Vector3(0, 0, 0)

  // Individual drift path (like particles)
  mesh.userData.driftSpeed = new THREE.Vector3(
    (Math.random() - 0.5) * 0.003,
    (Math.random() - 0.5) * 0.003,
    0
  )
  mesh.userData.driftPhase = Math.random() * Math.PI * 2

  // Add wireframe for definition
  const edges = new THREE.EdgesGeometry(geometry)
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    opacity: 0.3,
    transparent: true
  })
  const wireframe = new THREE.LineSegments(edges, lineMaterial)
  mesh.add(wireframe)

  return mesh
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

export function useAnimatedBackground(canvas: HTMLCanvasElement, isDark: boolean, canvas3d?: HTMLCanvasElement) {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas context not available')

  const ctx: CanvasRenderingContext2D = context

  let parchment: ParchmentBackground | null = null
  let particles: MagicParticle[] = []
  let animationFrameId: number | null = null
  let lastTime = 0

  // Mouse tracking (shared between 2D and 3D)
  let mouseX = -1000
  let mouseY = -1000
  let lastScrollY = 0

  // 3D Scene variables (optional)
  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let renderer: THREE.WebGLRenderer | null = null
  let dice: THREE.Mesh[] = []
  let targetRotationX = 0
  let targetRotationY = 0

  // Mouse move handler
  function handleMouseMove(event: MouseEvent) {
    mouseX = event.clientX
    mouseY = event.clientY

    // Update 3D camera rotation targets if 3D scene exists
    if (camera) {
      const normalizedX = (event.clientX / window.innerWidth) * 2 - 1
      const normalizedY = -(event.clientY / window.innerHeight) * 2 + 1
      targetRotationY = normalizedX * 0.1
      targetRotationX = normalizedY * 0.05
    }
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

    // Apply scroll momentum to dice (individually)
    dice.forEach((die) => {
      const velocity = die.userData.velocity as THREE.Vector3
      const individualFactor = 0.8 + Math.random() * 0.4
      velocity.y += scrollDelta * 0.003 * individualFactor
    })
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

    // Initialize 3D scene if canvas3d is provided
    if (canvas3d) {
      initThreeJS()
    }

    // Listen for events
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
      window.addEventListener('scroll', handleScroll, { passive: true })
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }
  }

  function initThreeJS() {
    if (!canvas3d) return

    // Scene
    scene = new THREE.Scene()
    scene.background = null // Transparent

    // Camera
    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 15

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas3d,
      antialias: true,
      alpha: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight1.position.set(5, 10, 7)
    scene.add(directionalLight1)

    const directionalLight2 = new THREE.DirectionalLight(0x8b5cf6, 0.4)
    directionalLight2.position.set(-5, -5, -7)
    scene.add(directionalLight2)

    // Create dice - one of each type plus extra d20s
    const diceConfig: Array<{ type: DieType; position: THREE.Vector3; colorIndex: number }> = [
      { type: 'd4', position: new THREE.Vector3(-8, 3, -2), colorIndex: 0 },      // Arcane
      { type: 'd6', position: new THREE.Vector3(-3, -2, 1), colorIndex: 1 },      // Treasure
      { type: 'd8', position: new THREE.Vector3(2, 4, -1), colorIndex: 2 },       // Emerald
      { type: 'd10', position: new THREE.Vector3(7, -1, 0), colorIndex: 3 },      // Glory
      { type: 'd12', position: new THREE.Vector3(-5, -4, 2), colorIndex: 4 },     // Danger
      { type: 'd20', position: new THREE.Vector3(4, 1, -2), colorIndex: 5 },      // Lore
      { type: 'd20', position: new THREE.Vector3(-2, 5, 1), colorIndex: 0 },      // Arcane (extra)
      { type: 'd20', position: new THREE.Vector3(8, -4, -1), colorIndex: 4 }      // Danger (extra)
    ]

    diceConfig.forEach(({ type, position, colorIndex }) => {
      const die = createDie(type, colorIndex, position)
      dice.push(die)
      scene!.add(die)
    })
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

    // Layer 4: 3D Dice animation (if initialized)
    if (camera && renderer && scene) {
      animateDice()
      renderer.render(scene, camera)
    }
  }

  function animateDice() {
    if (!camera) return

    // Very smooth camera rotation based on mouse
    camera.rotation.y += (targetRotationY - camera.rotation.y) * 0.02
    camera.rotation.x += (targetRotationX - camera.rotation.x) * 0.02

    // Update all dice independently
    dice.forEach((die) => {
      const speed = die.userData.rotationSpeed as THREE.Vector3
      const velocity = die.userData.velocity as THREE.Vector3
      const originalPos = die.userData.originalPosition as THREE.Vector3
      const driftSpeed = die.userData.driftSpeed as THREE.Vector3
      die.userData.driftPhase += 0.01

      // Base rotation
      die.rotation.x += speed.x
      die.rotation.y += speed.y
      die.rotation.z += speed.z

      // Gentle ambient drift (like particles)
      const driftX = Math.sin(die.userData.driftPhase) * 0.01
      const driftY = Math.cos(die.userData.driftPhase) * 0.01

      die.position.x += driftSpeed.x + driftX
      die.position.y += driftSpeed.y + driftY

      // Apply velocity (from scroll)
      die.position.y += velocity.y

      // Dampen velocity
      velocity.y *= 0.95
      velocity.x *= 0.95

      // Gentle spring back to original position
      const diff = originalPos.clone().sub(die.position)
      die.position.add(diff.multiplyScalar(0.01))

      // Very subtle mouse repulsion effect (each die independently)
      if (mouseX !== -1000) {
        const mouseWorldX = ((mouseX / window.innerWidth) * 2 - 1) * 8
        const mouseWorldY = -((mouseY / window.innerHeight) * 2 - 1) * 5

        const dx = die.position.x - mouseWorldX
        const dy = die.position.y - mouseWorldY
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Smaller radius, gentler force
        if (distance < 3) {
          const force = (3 - distance) / 3
          velocity.x += dx * force * 0.01
          velocity.y += dy * force * 0.01
        }
      }
    })
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

    // Clean up Three.js resources
    dice.forEach((die) => {
      die.geometry.dispose()
      if (die.material instanceof THREE.Material) {
        die.material.dispose()
      }
    })
    if (renderer) {
      renderer.dispose()
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
