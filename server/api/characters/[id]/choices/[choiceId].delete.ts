/**
 * Delete character choice endpoint - Proxies to Laravel backend
 *
 * @example DELETE /api/characters/1/choices/abc-123
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const choiceId = getRouterParam(event, 'choiceId')

  try {
    const data = await $fetch(
      `${config.apiBaseServer}/characters/${id}/choices/${choiceId}`,
      {
        method: 'DELETE'
      }
    )
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to undo choice',
      data: err.data
    })
  }
})
