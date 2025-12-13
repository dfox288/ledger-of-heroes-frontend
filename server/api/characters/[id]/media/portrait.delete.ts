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

    // Re-throw if it's already a H3 error with status code
    if (err.statusCode) {
      throw createError({
        statusCode: err.statusCode,
        statusMessage: err.statusMessage || 'Failed to delete portrait',
        data: err.data
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete portrait'
    })
  }
})
