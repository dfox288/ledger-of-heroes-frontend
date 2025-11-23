<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

const canvasContainer = ref<HTMLDivElement | null>(null)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
const dice: THREE.Mesh[] = []
let animationId: number | null = null

// Mouse interaction
let mouseX = 0
let mouseY = 0
let targetRotationX = 0
let targetRotationY = 0
let lastScrollY = 0

// D&D themed colors (from NuxtUI palette - 500 shades)
const DICE_COLORS = [
  { name: 'Arcane', color: 0x8b5cf6 }, // arcane-500
  { name: 'Treasure', color: 0xf59e0b }, // treasure-500
  { name: 'Emerald', color: 0x10b981 }, // emerald-500
  { name: 'Glory', color: 0x3b82f6 }, // glory-500
  { name: 'Danger', color: 0xf97316 }, // danger-500
  { name: 'Lore', color: 0xeab308 } // lore-500
]

type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'

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

function createDie(type: DieType, colorIndex: number, position: THREE.Vector3) {
  const geometry = createDieGeometry(type)

  // More transparent glass-like material
  const material = new THREE.MeshPhysicalMaterial({
    color: DICE_COLORS[colorIndex]!.color,
    transparent: true,
    opacity: 0.25,
    transmission: 0.5, // More glass-like transparency
    thickness: 0.5,
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.copy(position)

  // Much slower random rotation speeds
  mesh.userData.rotationSpeed = new THREE.Vector3(
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02
  )

  // Store original position for mouse interaction
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

function initThreeJS() {
  if (!canvasContainer.value) return

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f0f10) // Dark background

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
    antialias: true,
    alpha: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  canvasContainer.value.appendChild(renderer.domElement)

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight1.position.set(5, 10, 7)
  scene.add(directionalLight1)

  const directionalLight2 = new THREE.DirectionalLight(0x8b5cf6, 0.4)
  directionalLight2.position.set(-5, -5, -7)
  scene.add(directionalLight2)

  // Create dice - one of each type with varied placement, plus extra d20s
  const diceConfig: Array<{ type: DieType, position: THREE.Vector3, colorIndex: number }> = [
    { type: 'd4', position: new THREE.Vector3(-8, 3, -2), colorIndex: 0 }, // Arcane - top left
    { type: 'd6', position: new THREE.Vector3(-3, -2, 1), colorIndex: 1 }, // Treasure - bottom left-center
    { type: 'd8', position: new THREE.Vector3(2, 4, -1), colorIndex: 2 }, // Emerald - top right-center
    { type: 'd10', position: new THREE.Vector3(7, -1, 0), colorIndex: 3 }, // Glory - middle right
    { type: 'd12', position: new THREE.Vector3(-5, -4, 2), colorIndex: 4 }, // Danger - bottom left
    { type: 'd20', position: new THREE.Vector3(4, 1, -2), colorIndex: 5 }, // Lore - center right
    { type: 'd20', position: new THREE.Vector3(-2, 5, 1), colorIndex: 0 }, // Arcane - top center (extra)
    { type: 'd20', position: new THREE.Vector3(8, -4, -1), colorIndex: 4 } // Danger - bottom right (extra)
  ]

  diceConfig.forEach(({ type, position, colorIndex }) => {
    const die = createDie(type, colorIndex, position)
    dice.push(die)
    scene.add(die)
  })

  // Handle window resize
  window.addEventListener('resize', handleResize)

  // Mouse move handler
  window.addEventListener('mousemove', handleMouseMove)

  // Scroll handler
  window.addEventListener('scroll', handleScroll, { passive: true })

  // Start animation
  animate()
}

function handleMouseMove(event: MouseEvent) {
  // Normalize mouse position (-1 to 1)
  mouseX = (event.clientX / window.innerWidth) * 2 - 1
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1

  // Much more subtle camera rotation based on mouse
  targetRotationY = mouseX * 0.1
  targetRotationX = mouseY * 0.05
}

function handleScroll() {
  const currentScrollY = window.scrollY
  const scrollDelta = currentScrollY - lastScrollY
  lastScrollY = currentScrollY

  // Very subtle scroll momentum to dice (individually)
  dice.forEach((die) => {
    const velocity = die.userData.velocity as THREE.Vector3
    // Each die gets slightly different momentum for independent movement
    const individualFactor = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
    velocity.y += scrollDelta * 0.003 * individualFactor
    // Cap velocity to prevent excessive inertia from rapid scrolling
    velocity.y = Math.max(-0.15, Math.min(0.15, velocity.y))
  })
}

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  animationId = requestAnimationFrame(animate)

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
    const mouseWorldX = mouseX * 8
    const mouseWorldY = -mouseY * 5

    const dx = die.position.x - mouseWorldX
    const dy = die.position.y - mouseWorldY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Smaller radius, gentler force
    if (distance < 3) {
      const force = (3 - distance) / 3
      velocity.x += dx * force * 0.01
      velocity.y += dy * force * 0.01
    }
  })

  renderer.render(scene, camera)
}

onMounted(() => {
  initThreeJS()
})

onBeforeUnmount(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('scroll', handleScroll)

  // Clean up Three.js resources
  dice.forEach((die) => {
    die.geometry.dispose()
    if (die.material instanceof THREE.Material) {
      die.material.dispose()
    }
  })
  renderer.dispose()
})

// SEO
useSeoMeta({
  title: '3D Dice Test - D&D 5e Compendium',
  description: 'Testing Three.js 3D dice rendering'
})
</script>

<template>
  <div class="dice-test-page">
    <div
      ref="canvasContainer"
      class="canvas-container"
    />

    <div class="info-overlay">
      <h1 class="text-3xl font-bold mb-4">
        3D Dice Test
      </h1>
      <p class="mb-2">
        Six polyhedral dice rendered with Three.js:
      </p>
      <ul class="list-disc pl-6 space-y-1">
        <li>d4 (Tetrahedron) - Arcane Purple</li>
        <li>d6 (Cube) - Treasure Gold</li>
        <li>d8 (Octahedron) - Emerald Green</li>
        <li>d10 (Pentagonal) - Glory Blue</li>
        <li>d12 (Dodecahedron) - Danger Orange</li>
        <li>d20 (Icosahedron) - Lore Amber</li>
      </ul>
      <p class="mt-4 text-sm opacity-75">
        25% opacity with 50% transmission (very transparent)<br>
        Slow rotation for gentle tumbling effect<br>
        Colors from NuxtUI theme palette (500 shades)
      </p>
      <p class="mt-3 text-sm font-semibold text-purple-400">
        ✨ Dice drift gently like floating particles<br>
        🖱️ Subtle camera rotation on mouse movement<br>
        📜 Gentle bounce on scroll - each die reacts independently<br>
        Cursor creates soft repulsion field
      </p>
      <NuxtLink
        to="/"
        class="inline-block mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
      >
        ← Back to Home
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.dice-test-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #0f0f10;
  color: white;
}

.canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.info-overlay {
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 1rem;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
