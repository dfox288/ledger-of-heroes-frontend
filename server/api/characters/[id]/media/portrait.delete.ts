/**
 * Delete character portrait - Proxies to Laravel backend
 *
 * Removes the portrait from the character.
 *
 * @example DELETE /api/characters/1/media/portrait
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/media/portrait`, {
      method: 'DELETE'
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to delete portrait',
      data: err.data
    })
  }
})
