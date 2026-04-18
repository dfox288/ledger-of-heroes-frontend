/**
 * Get character summary endpoint - Proxies to Laravel backend
 *
 * Returns character creation status, pending choices count,
 * and completion status for the wizard.
 *
 * @example GET /api/characters/1/summary
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/summary`)
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch character summary',
      data: err.data
    })
  }
})
