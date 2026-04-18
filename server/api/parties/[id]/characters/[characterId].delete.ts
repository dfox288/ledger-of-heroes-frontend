/**
 * Remove character from party endpoint - Proxies to Laravel backend
 *
 * @example DELETE /api/parties/1/characters/123
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const characterId = getRouterParam(event, 'characterId')

  try {
    const data = await $fetch(`${config.apiBaseServer}/parties/${id}/characters/${characterId}`, {
      method: 'DELETE'
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to remove character from party',
      data: err.data
    })
  }
})
