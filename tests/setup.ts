import { vi } from 'vitest'
import 'vitest-canvas-mock'

// Mock Nuxt's useRuntimeConfig globally
global.useRuntimeConfig = vi.fn(() => ({
  public: {
    apiBase: 'http://localhost:8080/api/v1',
    apiDocsUrl: 'http://localhost:8080/docs/api'
  }
}))

// Mock $fetch globally
global.$fetch = vi.fn()

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
