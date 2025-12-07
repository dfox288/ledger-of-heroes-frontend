import { vi, afterEach, beforeEach } from 'vitest'
import { config, enableAutoUnmount, flushPromises } from '@vue/test-utils'
import { h } from 'vue'
import 'vitest-canvas-mock'

// =============================================================================
// BROWSER API MOCKS
// =============================================================================
// Mock browser APIs that aren't available in Node.js test environment.
// The requestAnimationFrame is needed by Nuxt's navigation-repaint.client.js plugin.
// Using vi.stubGlobal ensures the mock is properly available across worker processes.
// =============================================================================

// Mock requestAnimationFrame and cancelAnimationFrame
// Use synchronous execution to prevent pending timers after test teardown
let rafId = 0
vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
  // Execute callback synchronously to avoid lingering timers
  // This prevents "unhandled error after test environment was torn down"
  callback(Date.now())
  return ++rafId
})
vi.stubGlobal('cancelAnimationFrame', vi.fn())

// Mock browser history API for Vue Router
// Vue Router's finalizeNavigation uses history.replaceState
vi.stubGlobal('history', {
  state: {},
  replaceState: vi.fn(),
  pushState: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn()
})

// =============================================================================
// MOCK NUXT UI ICON COMPONENT
// =============================================================================
// Icons fail to load in test environment because the icon provider isn't
// available. Mock the Icon component to render a simple span with the icon name.
// This silences "[Icon] failed to load icon" warnings in test output.
// =============================================================================

// Create mock with explicit name for findComponent({ name: 'UIcon' }) to work
const createMockIcon = (componentName: string) => ({
  name: componentName,
  props: ['name', 'size', 'class'],
  setup(props: { name?: string, class?: string }) {
    // Preserve the class attribute so tests checking for classes like 'animate-spin' still work
    const classes = ['mock-icon', props.class].filter(Boolean).join(' ')
    // Don't render icon name as text content - it adds to wrapper.text() length
    // and breaks tests that check text length (like description truncation tests)
    return () => h('span', { 'class': classes, 'data-icon': props.name })
  }
})

// Register mock as global stub for all tests
// Each stub needs its own component name for findComponent to work
config.global.stubs = {
  ...config.global.stubs,
  Icon: createMockIcon('Icon'),
  UIcon: createMockIcon('UIcon'),
  // Mock RouterLink to prevent "Failed to resolve component: RouterLink" warnings
  // This is needed because NuxtLink internally uses RouterLink
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a :href="to"><slot /></a>'
  }
}

// =============================================================================
// GLOBAL TEST CLEANUP - CRITICAL FOR CPU/MEMORY MANAGEMENT
// =============================================================================
// Without proper cleanup, each mountSuspended() call accumulates in memory.
// With 900+ mounts across the test suite, this causes severe memory pressure
// in Docker, leading to CPU spikes and potential machine crashes.
// =============================================================================

// Enable automatic unmounting of Vue components after each test
// This is the KEY fix - Vue Test Utils will track and unmount all components
enableAutoUnmount(afterEach)

// Additional cleanup after each test - but NOT DOM manipulation
// (enableAutoUnmount handles component cleanup; we just clear mocks)
afterEach(async () => {
  // Flush any pending promises/microtasks
  await flushPromises()

  // Clear mock function call history to prevent memory accumulation
  vi.clearAllMocks()

  // Clear any timers that tests may have created
  vi.clearAllTimers()
})

// Reset mocks before each test to ensure clean state
beforeEach(() => {
  vi.clearAllMocks()
})

// Mock Nuxt's manifest composables to prevent appManifest errors
// These errors occur when Nuxt tries to check prerendered routes and route rules during page mounting
vi.mock('#app/composables/manifest', () => ({
  getAppManifest: vi.fn(() => Promise.resolve({
    id: 'test',
    timestamp: Date.now(),
    prerendered: [], // Array of prerendered routes
    routes: new Map() // Route rules map - must be a Map with .entries() method
  })),
  getRouteRules: vi.fn(() => Promise.resolve({}))
}))

// Mock Nuxt's useRuntimeConfig globally
vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
  public: {
    apiBase: 'http://localhost:8080/api/v1',
    apiDocsUrl: 'http://localhost:8080/docs/api'
  }
})))

// Helper function to generate mock API responses
const createMockApiResponse = (url) => {
  if (typeof url === 'string') {
    // Background detail
    if (url.includes('/backgrounds/')) {
      const slug = url.split('/').pop()
      const name = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')
      return Promise.resolve({
        data: {
          id: 1,
          name,
          slug,
          // New extracted feature fields (Issue #67)
          feature_name: `${name} Expertise`,
          feature_description: `As a ${slug}, you have a special ability that sets you apart. You can call upon your expertise to gain advantage in relevant situations.`,
          traits: [
            {
              id: 1,
              name: 'Description',
              category: null,
              description: `You have spent your life as a ${slug}. This background provides unique skills and experiences.`,
              sort_order: 0,
              data_tables: []
            },
            {
              id: 3,
              name: 'Suggested Characteristics',
              category: 'characteristics',
              description: 'Use these tables to create your character personality.',
              sort_order: 2,
              data_tables: [
                {
                  id: 1,
                  table_name: 'Personality Trait',
                  dice_type: 'd8',
                  table_type: 'random',
                  description: null,
                  entries: [
                    { id: 1, roll_min: 1, roll_max: 1, result_text: 'I am always calm, no matter the situation.' },
                    { id: 2, roll_min: 2, roll_max: 2, result_text: 'I love a good mystery or puzzle.' }
                  ]
                },
                {
                  id: 2,
                  table_name: 'Ideal',
                  dice_type: 'd6',
                  table_type: 'random',
                  description: null,
                  entries: [
                    { id: 3, roll_min: 1, roll_max: 1, result_text: 'Knowledge. Learning is the greatest pursuit. (Neutral)' },
                    { id: 4, roll_min: 2, roll_max: 2, result_text: 'Justice. The guilty must be punished. (Lawful)' }
                  ]
                },
                {
                  id: 3,
                  table_name: 'Bond',
                  dice_type: 'd6',
                  table_type: 'random',
                  description: null,
                  entries: [
                    { id: 5, roll_min: 1, roll_max: 1, result_text: 'I have a mentor who taught me everything.' }
                  ]
                },
                {
                  id: 4,
                  table_name: 'Flaw',
                  dice_type: 'd6',
                  table_type: 'random',
                  description: null,
                  entries: [
                    { id: 6, roll_min: 1, roll_max: 1, result_text: 'I am easily distracted by shiny objects.' }
                  ]
                }
              ]
            }
          ],
          proficiencies: [
            {
              id: 1,
              proficiency_type: 'skill',
              proficiency_name: 'Investigation',
              skill: { id: 1, name: 'Investigation', slug: 'investigation', ability_score: { id: 4, code: 'INT', name: 'Intelligence' } }
            },
            {
              id: 2,
              proficiency_type: 'skill',
              proficiency_name: 'Insight',
              skill: { id: 2, name: 'Insight', slug: 'insight', ability_score: { id: 5, code: 'WIS', name: 'Wisdom' } }
            }
          ],
          languages: [{ is_choice: true, quantity: 2 }],
          equipment: [
            { id: 1, item_id: 1, quantity: 1, item: { id: 1, name: 'Backpack', slug: 'backpack' } },
            { id: 2, item_id: 201, quantity: 15, item: { id: 201, name: 'Gold (gp)', slug: 'gold-gp' } }
          ],
          sources: [{ code: 'PHB', name: 'Player\'s Handbook', pages: '127' }],
          tags: [{ id: 1, name: 'Scholar', slug: 'scholar' }]
        }
      })
    }

    // Race detail
    if (url.includes('/races/')) {
      const slug = url.split('/').pop()

      // Base race data
      const raceData = {
        id: 1,
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        slug,
        speed: 30,
        description: `Description of ${slug} race`,
        conditions: [
          {
            name: 'Darkvision',
            effect_type: 'Sense',
            description: 'You can see in dim light'
          }
        ]
      }

      // Add special movement speeds for specific races (Issue #26, #65)
      if (slug === 'aarakocra-dmg') {
        raceData.speed = 25
        raceData.fly_speed = 50
      }
      if (slug === 'triton-legacy') {
        raceData.swim_speed = 30
      }
      if (slug === 'tabaxi-legacy') {
        raceData.climb_speed = 20
      }

      return Promise.resolve({ data: raceData })
    }
  }

  // Default empty response
  return Promise.resolve({})
}

// Mock $fetch globally with smart URL-based responses
// This provides realistic mock data for API calls based on the endpoint
const mockFetchFn = vi.fn(createMockApiResponse)

global.$fetch = Object.assign(mockFetchFn, {
  // The create() method must return a function with the same behavior
  create: vi.fn(() => vi.fn(createMockApiResponse))
})

// Mock Nuxt's app manifest fetching to prevent "Cannot read properties of undefined (reading 'then')" errors
global.fetch = vi.fn((url) => {
  // If it's a manifest request, return a resolved promise with empty manifest
  if (typeof url === 'string' && url.includes('_nuxt/builds/meta')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: 'test', timestamp: Date.now() })
    })
  }
  // Default mock for other fetch calls
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  })
})
