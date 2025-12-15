/**
 * MSW (Mock Service Worker) Server Setup for Vitest
 *
 * This provides network-level API mocking for integration tests.
 * Unlike vi.mock(), MSW intercepts actual HTTP requests, testing
 * real fetch logic while returning controlled responses.
 *
 * Usage in tests:
 * ```typescript
 * import { server } from '#tests/msw/server'
 * import { http, HttpResponse } from 'msw'
 *
 * // Use default handlers
 * beforeAll(() => server.listen())
 * afterEach(() => server.resetHandlers())
 * afterAll(() => server.close())
 *
 * // Override for specific test
 * it('handles error', () => {
 *   server.use(
 *     http.get('/api/characters/:id', () => {
 *       return HttpResponse.json({ error: 'Not found' }, { status: 404 })
 *     })
 *   )
 * })
 * ```
 */

import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Create the MSW server with default handlers
export const server = setupServer(...handlers)

// Re-export MSW utilities for convenience
export { http, HttpResponse } from 'msw'
