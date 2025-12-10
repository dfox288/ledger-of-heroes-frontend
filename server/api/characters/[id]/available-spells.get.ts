/**
 * Get available spells for a character - Proxies to Laravel backend
 *
 * Returns spells that the character can learn based on their class's spell list.
 *
 * @example GET /api/characters/1/available-spells?max_level=1&include_known=true
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)

  // Build query string from all query parameters
  const params = new URLSearchParams()
  if (query.max_level) params.append('max_level', String(query.max_level))
  if (query.include_known) params.append('include_known', String(query.include_known))
  if (query.class) params.append('class', String(query.class))

  const queryString = params.toString() ? `?${params.toString()}` : ''

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/available-spells${queryString}`)
  return data
})
