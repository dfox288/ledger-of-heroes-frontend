/**
 * Integration Test Setup Helpers
 *
 * Consolidates MSW server lifecycle and Pinia setup for integration tests.
 * Reduces boilerplate from ~15 lines to 1 function call.
 *
 * Usage:
 * ```typescript
 * import { useIntegrationTestSetup } from '@/tests/helpers/integrationSetup'
 *
 * describe('My Integration Test', () => {
 *   useIntegrationTestSetup()
 *
 *   it('does something', async () => {
 *     // MSW server is running, Pinia is fresh
 *   })
 * })
 * ```
 */
import { beforeAll, afterAll, afterEach, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { server } from '../msw/server'
import { useCharacterWizardStore } from '~/stores/characterWizard'

/**
 * Sets up MSW server and Pinia for integration tests.
 *
 * - beforeAll: Start MSW server with 'warn' on unhandled requests
 * - afterEach: Reset handlers to defaults (removes test-specific overrides)
 * - afterAll: Stop MSW server
 * - beforeEach: Fresh Pinia instance + reset wizard store
 *
 * Call at the top of your describe() block.
 */
export function useIntegrationTestSetup(options?: {
  /** If true, resets the character wizard store in beforeEach. Default: true */
  resetWizardStore?: boolean
  /** Behavior for unhandled requests: 'warn' | 'error' | 'bypass'. Default: 'warn' */
  onUnhandledRequest?: 'warn' | 'error' | 'bypass'
}) {
  const { resetWizardStore = true, onUnhandledRequest = 'warn' } = options ?? {}

  beforeAll(() => {
    server.listen({ onUnhandledRequest })
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  beforeEach(() => {
    setActivePinia(createPinia())
    if (resetWizardStore) {
      const store = useCharacterWizardStore()
      store.reset()
    }
  })
}

/**
 * Helper to add test-specific MSW handlers.
 * Use when you need to override default responses for error testing, etc.
 *
 * Usage:
 * ```typescript
 * import { addTestHandlers } from '@/tests/helpers/integrationSetup'
 * import { http, HttpResponse } from '../msw/server'
 *
 * it('handles API errors', async () => {
 *   addTestHandlers([
 *     http.get('/api/races', () => HttpResponse.json({ error: 'Not found' }, { status: 404 }))
 *   ])
 *
 *   // Now /api/races returns 404
 * })
 * ```
 */
export function addTestHandlers(handlers: Parameters<typeof server.use>) {
  server.use(...handlers)
}

/**
 * Re-export server utilities for convenience.
 * Tests can import everything from one place.
 */
export { server } from '../msw/server'
