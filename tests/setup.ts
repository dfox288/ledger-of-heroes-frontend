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
