/**
 * Get available feats for a character - Proxies to Laravel backend
 *
 * Returns feats that the character can take based on prerequisites.
 * Use `source=race` for racial feat choices (excludes ability score prerequisite feats).
 * Use `source=asi` for ASI feat choices (checks all prerequisites).
 *
 * @example GET /api/characters/1/available-feats?source=race
 * @example GET /api/characters/1/available-feats?source=asi
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)

  // Build query string from all query parameters
  const params = new URLSearchParams()
  if (query.source) params.append('source', String(query.source))
  if (query.per_page) params.append('per_page', String(query.per_page))
  if (query.page) params.append('page', String(query.page))
  if (query.q) params.append('q', String(query.q))

  const queryString = params.toString() ? `?${params.toString()}` : ''

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/available-feats${queryString}`)
  return data
})
