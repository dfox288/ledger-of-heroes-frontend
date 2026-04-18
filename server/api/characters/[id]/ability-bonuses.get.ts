/**
 * Get character ability bonuses endpoint - Proxies to Laravel backend
 *
 * Returns all ability score bonuses from all sources (race, feats, etc.)
 * with metadata about source and whether the bonus came from a choice.
 *
 * @example GET /api/characters/1/ability-bonuses
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/ability-bonuses`)
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch ability bonuses',
      data: err.data
    })
  }
})
