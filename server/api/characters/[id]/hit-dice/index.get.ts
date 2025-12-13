/**
 * Get hit dice endpoint - Proxies to Laravel backend
 *
 * Returns current hit dice state for a character.
 * Preferred over /stats because it returns fresh data (no caching).
 *
 * @example GET /api/characters/1/hit-dice
 *
 * @returns { data: { hit_dice: { d8: { available, max, spent } }, total: { available, max, spent } } }
 *
 * @see #541 - Use /hit-dice endpoint for HitDice component
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/hit-dice`)
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch hit dice',
      data: err.data
    })
  }
})
