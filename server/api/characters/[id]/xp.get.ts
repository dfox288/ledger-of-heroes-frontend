/**
 * Get character XP endpoint - Proxies to Laravel backend
 *
 * Returns current XP, level progress, and next level threshold.
 *
 * @example GET /api/characters/1/xp
 *
 * @see #653 - XP progress display
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/xp`)
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch xp',
      data: err.data
    })
  }
})
