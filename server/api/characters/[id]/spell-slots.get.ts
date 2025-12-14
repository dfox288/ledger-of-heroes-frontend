/**
 * Get character spell slots endpoint - Proxies to Laravel backend
 *
 * Returns spell slot information including total, spent, and available counts.
 *
 * @example GET /api/characters/1/spell-slots
 * @see Issue #556 - Spells Tab
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/spell-slots`)
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch spell slots',
      data: err.data
    })
  }
})
