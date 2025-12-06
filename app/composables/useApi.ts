/**
 * API composable that provides a configured fetch client
 * for calling Nitro API proxy routes.
 *
 * All API calls now go through Nitro server routes (e.g., /api/spells)
 * which proxy to the Laravel backend. This eliminates SSR/CSR URL issues.
 *
 * @example
 * const { apiFetch } = useApi()
 * const data = await apiFetch('/spells', { query: { level: 3 } })
 */
/**
 * Normalize an endpoint path from backend format to Nitro format.
 * Backend returns paths like "/api/v1/characters/1/spells" but Nitro expects "/characters/1/spells"
 */
export function normalizeEndpoint(endpoint: string): string {
  // Strip /api/v1 prefix if present
  if (endpoint.startsWith('/api/v1/')) {
    return endpoint.replace('/api/v1/', '/')
  }
  // Strip /api/v1 without trailing slash (edge case)
  if (endpoint.startsWith('/api/v1')) {
    return endpoint.replace('/api/v1', '')
  }
  return endpoint
}

export const useApi = () => {
  /**
   * Create a configured $fetch instance that targets Nitro routes
   * Base URL is '/api' - relative to current origin
   */
  const apiFetch = $fetch.create({
    baseURL: '/api', // Nitro routes (works in both SSR and CSR)
    onRequest() {
      // Add any auth headers here if needed in the future
      // options.headers = {
      //   ...options.headers,
      //   Authorization: `Bearer ${token}`
      // }
    },
    onResponseError({ response }) {
      // Global error handling
      console.error('API Error:', response.status, response.statusText)
    }
  })

  return {
    apiFetch
  }
}
