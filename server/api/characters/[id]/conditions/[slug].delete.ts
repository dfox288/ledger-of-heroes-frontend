/**
 * Remove a condition from a character - Proxies to Laravel backend
 *
 * @example DELETE /api/characters/1/conditions/poisoned
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const slug = getRouterParam(event, 'slug')

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/conditions/${slug}`, {
      method: 'DELETE'
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to remove condition',
      data: err.data
    })
  }
})
