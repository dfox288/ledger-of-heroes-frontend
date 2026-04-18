/**
 * Get pending choices for a character - Proxies to Laravel backend
 *
 * Returns all pending choices that need to be resolved for character creation,
 * optionally filtered by choice type.
 *
 * @example GET /api/characters/1/pending-choices
 * @example GET /api/characters/1/pending-choices?type=proficiency
 * @example GET /api/characters/1/pending-choices?type=spell
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)

  // Build query string for optional type filter
  const queryString = query.type ? `?type=${query.type}` : ''

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/pending-choices${queryString}`)
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch pending choices',
      data: err.data
    })
  }
})
