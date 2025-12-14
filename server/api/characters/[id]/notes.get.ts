/**
 * Get character notes endpoint - Proxies to Laravel backend
 *
 * Returns notes organized by category for the character sheet Notes tab.
 *
 * @example GET /api/characters/1/notes
 * @example GET /api/characters/shadow-warden-q3x9/notes
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/notes`)
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch notes',
      data: err.data
    })
  }
})
