/**
 * Get party stats endpoint - Proxies to Laravel backend
 *
 * Returns comprehensive party stats for DM Screen display.
 * @example GET /api/parties/1/stats
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  try {
    const data = await $fetch(`${config.apiBaseServer}/parties/${id}/stats`)
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch party stats',
      data: err.data
    })
  }
})
