import { vi, afterEach, beforeEach } from 'vitest'
import { config, enableAutoUnmount, flushPromises } from '@vue/test-utils'
import { h } from 'vue'
import 'vitest-canvas-mock'

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
  setup(props: { name?: string; class?: string }) {
    // Preserve the class attribute so tests checking for classes like 'animate-spin' still work
    const classes = ['mock-icon', props.class].filter(Boolean).join(' ')
    // Don't render icon name as text content - it adds to wrapper.text() length
    // and breaks tests that check text length (like description truncation tests)
    return () => h('span', { class: classes, 'data-icon': props.name })
  }
})

// Register mock as global stub for all tests
// Each stub needs its own component name for findComponent to work
config.global.stubs = {
  ...config.global.stubs,
  Icon: createMockIcon('Icon'),
  UIcon: createMockIcon('UIcon'),
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
      return Promise.resolve({
        data: {
          id: 1,
          name: slug.charAt(0).toUpperCase() + slug.slice(1),
          slug,
          description: `Description of ${slug} background`,
          traits: [
            {
              name: 'Background Trait',
              category: 'Feature',
              description: 'A trait for this background'
            }
          ],
          proficiencies: ['Deception', 'Sleight of Hand'],
          languages: ['Common', 'Thieves\' Cant'],
          equipment: ['Item 1', 'Item 2'],
          sources: [{ name: 'Player\'s Handbook', page: '123' }],
          tags: ['tag1', 'tag2']
        }
      })
    }

    // Race detail
    if (url.includes('/races/')) {
      const slug = url.split('/').pop()
      return Promise.resolve({
        data: {
          id: 1,
          name: slug.charAt(0).toUpperCase() + slug.slice(1),
          slug,
          description: `Description of ${slug} race`,
          conditions: [
            {
              name: 'Darkvision',
              effect_type: 'Sense',
              description: 'You can see in dim light'
            }
          ]
        }
      })
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
